'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import styles from './page.module.css'
import SmartWalletConnect from '@/components/SmartWalletConnect'

interface TokenPrice  { price: number; change24h: number }
interface Prices      { [symbol: string]: TokenPrice }
interface WalletData  { address: string; ethBalance: number; solBalance?: number; arbBalance?: number; monadBalance?: number; baseBalance?: number; tokenBalances: { contractAddress: string; tokenBalance: string }[] }
interface UserWallet  { address: string; type: 'smart'|'external'; email?: string; twoFaMethod?: 'totp'; solAddress?: string }
interface NewsItem    { title: string; url: string; published: string; source: string; currencies: string[]; positive: number; negative: number }
interface TxItem      { hash: string; from: string; to: string; value: string; time: string; gas: string; status: string; method: string }
interface SwapState   { fromToken: string; toToken: string; amount: string; estimatedOut: string; loading: boolean; error: string; success: string; priceImpact: number; route: string; simStatus: 'idle'|'simulating'|'ok'|'fail'|'nowallet'; simGas: string; simError: string }
interface BridgeState { fromChain: string; toChain: string; fromToken: string; toToken: string; amount: string; estimatedOut: string; loading: boolean; error: string; success: string; estimatedTime: string; feesUsd: string; bridge: string; route: string }
interface PriceAlert  { id: string; symbol: string; targetPrice: number; condition: 'above'|'below'; triggered: boolean }
interface SearchResult { address: string; ethBalance: number; ethUsd: number; txCount: number; loading: boolean; error: string }

const MAIN_WALLET = '0x36F0C4Ce3ed7DbfeF2037b6275BFB3096B5e699F'
const TREASURY    = '0x36F0C4Ce3ed7DbfeF2037b6275BFB3096B5e699F'
const SOL_WALLET  = 'HkQNve2SA7jwvrRUrAty4EnpYo4VHzPb1pBVq2FdGTQo'
const GOAL_USD    = 6_200_000
const EMOCOIN     = { balance: 250, priceUsd: 0.01 }

const TOKENS = [
  { symbol:'ETH',  name:'Ethereum', color:'#627eea', chain:'Earth 🌍',   cgId:'ethereum'   },
  { symbol:'SOL',  name:'Solana',   color:'#9945ff', chain:'Soul 🌟',    cgId:'solana'      },
  { symbol:'MON',  name:'Monad',    color:'#836ef9', chain:'Moon 🌙',    cgId:''            },
  { symbol:'ARB',  name:'Arbitrum', color:'#12aaff', chain:'Orbit 🪐',   cgId:'arbitrum'    },
  { symbol:'BASE', name:'Base',      color:'#0052ff', chain:'Base 🔵',    cgId:'ethereum'    },
  { symbol:'BTC',  name:'Bitcoin',  color:'#f7931a', chain:'Birth ₿',    cgId:'bitcoin'     },
  { symbol:'BNB',  name:'BNB',      color:'#f0b90b', chain:'BSC',        cgId:'binancecoin' },
  { symbol:'USDC', name:'USD Coin', color:'#2775ca', chain:'Ethereum',   cgId:'usd-coin'    },
  { symbol:'USDT', name:'Tether',   color:'#26a17b', chain:'Ethereum',   cgId:'tether'      },
  { symbol:'EMC',  name:'EmoCoins', color:'#00e5ff', chain:'TheWall 🦋', cgId:''            },
]
const SWAP_TOKENS = ['ETH','SOL','MON','ARB','BTC','USDC','USDT','EMC']
const CHAIN_COLORS: Record<string,string> = { earth:'#627eea', soul:'#9945ff', moon:'#836ef9', orbit:'#12aaff', birth:'#f7931a', hood:'#00C805' }
const SEND_CHAINS = [{id:'ETH',label:'🌍 ETH',color:'#627eea'},{id:'SOL',label:'🌟 SOL',color:'#9945ff'},{id:'ARB',label:'🪐 ARB',color:'#12aaff'},{id:'MON',label:'🌙 MON',color:'#836ef9'},{id:'BTC',label:'₿ BTC',color:'#f7931a'},{id:'BASE',label:'🔵 BASE',color:'#0052ff'}]
const CHAIN_DOTS  = [{id:'earth',label:'🌍',c:'#627eea'},{id:'soul',label:'🌟',c:'#9945ff'},{id:'moon',label:'🌙',c:'#836ef9'},{id:'orbit',label:'🪐',c:'#12aaff'},{id:'birth',label:'₿',c:'#f7931a'}]
const DAPP_LIST   = [{name:'Uniswap',url:'https://app.uniswap.org',icon:'🦄'},{name:'OpenSea',url:'https://opensea.io',icon:'🌊'},{name:'Aave',url:'https://app.aave.com',icon:'👻'},{name:'1inch',url:'https://app.1inch.io',icon:'🦅'},{name:'Compound',url:'https://app.compound.finance',icon:'🏦'},{name:'Raydium',url:'https://raydium.io',icon:'⚡'}]
const IFRAME_BLOCKED = ['uniswap.org','opensea.io']

type BottomTab = 'home'|'trade'|'markets'|'copytrade'|'settings'

function TotpQr({ email }: { email: string }) {
  const [qr, setQr] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setLoading(true)
    fetch(`/api/auth/totp?email=${encodeURIComponent(email || 'user@thewall.app')}`)
      .then(r => r.json())
      .then(d => { if (d.qrImage) setQr(d.qrImage) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [email])
  if (loading) return <div style={{textAlign:'center',padding:'20px',color:'#00e5ff',fontSize:'0.72rem'}}>⏳ Loading QR code...</div>
  return qr ? (
    <div style={{textAlign:'center',marginBottom:16}}>
      <img src={qr} width={160} height={160} style={{borderRadius:8,border:'2px solid #00e5ff',display:'inline-block'}} alt="QR Code"/>
      <p style={{fontSize:'0.68rem',color:'#E8F4FD',marginTop:8,fontFamily:'var(--font-mono)'}}>📱 Scan with Google Authenticator</p>
    </div>
  ) : (
    <div style={{textAlign:'center',padding:'12px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,marginBottom:16}}>
      <div style={{fontSize:'0.72rem',color:'#E8F4FD',lineHeight:1.8,fontFamily:'var(--font-mono)'}}>
        1️⃣ Open Google Authenticator<br/>2️⃣ Tap ➕ → Enter setup key<br/>
        3️⃣ Account: <span style={{color:'#00e5ff'}}>{email||'your@email.com'}</span><br/>
        4️⃣ Key: <span style={{color:'#00ff88'}}>TheWall Web3</span><br/>5️⃣ Enter 6-digit code below
      </div>
    </div>
  )
}

export default function TheWall() {
  const [screen, setScreen]         = useState<'login'|'dashboard'>('login')
  const [loginStep, setLoginStep]   = useState<'home'|'email'|'choose2fa'|'totp'|'creating'>('home')
  const [email, setEmail]           = useState('')
  const [totpCode, setTotpCode]     = useState('')
  const [error, setError]           = useState('')
  const [user, setUser]             = useState<UserWallet|null>(null)
  const [prices, setPrices]         = useState<Prices>({})
  const [walletData, setWalletData] = useState<WalletData|null>(null)
  const [emoBalance, setEmoBalance] = useState(0)
  const [copyTradeChatLog, setCopyTradeChatLog] = useState<{role:string;content:string}[]>([])
  const [copyTradeInput, setCopyTradeInput] = useState('')
  const [copyTradeChatLoading, setCopyTradeChatLoading] = useState(false)
  const [becomeLeaderOpen, setBecomeLeaderOpen] = useState(false)
  const [becomeLeaderName, setBecomeLeaderName] = useState('')
  const [becomeLeaderLoading, setBecomeLeaderLoading] = useState(false)
  const [becomeLeaderStatus, setBecomeLeaderStatus] = useState('')
  const [browseLeadersOpen, setBrowseLeadersOpen] = useState(false)
  const [leadersList, setLeadersList] = useState<any[]>([])
  const [leadersLoading, setLeadersLoading] = useState(false)
  const [followTarget, setFollowTarget] = useState<any>(null)
  const [followAllocation, setFollowAllocation] = useState(10)
  const [followLoading, setFollowLoading] = useState(false)
  const [followStatus, setFollowStatus] = useState('')
  const [emoClaiming, setEmoClaiming] = useState(false)
  const [emoClaimMsg, setEmoClaimMsg] = useState('')
  const [emoNextClaimAt, setEmoNextClaimAt] = useState<number|null>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [emcBuyAmount, setEmcBuyAmount] = useState(100)
  const [emcBuyLoading, setEmcBuyLoading] = useState(false)
  const [emcBuyMsg, setEmcBuyMsg] = useState('')

  async function buyEmc() {
    if (!user?.address || emcBuyAmount <= 0) return
    setEmcBuyLoading(true)
    setEmcBuyMsg('')
    try {
      const orderRes = await fetch('https://thewall-emc.meradivin.workers.dev/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: user.address, emc_amount: emcBuyAmount }),
      })
      const orderData = await orderRes.json()
      if (!orderData.success) {
        setEmcBuyMsg('Order failed. Try again.')
        setEmcBuyLoading(false)
        return
      }

      const loadRazorpay = () =>
        new Promise((resolve) => {
          if ((window as any).Razorpay) return resolve(true)
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = () => resolve(true)
          script.onerror = () => resolve(false)
          document.body.appendChild(script)
        })

      const loaded = await loadRazorpay()
      if (!loaded) {
        setEmcBuyMsg('Could not load payment gateway.')
        setEmcBuyLoading(false)
        return
      }

      const rzp = new (window as any).Razorpay({
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.order_id,
        name: 'TheWall',
        description: `Buy ${emcBuyAmount} EMC`,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('https://thewall-emc.meradivin.workers.dev/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                wallet_address: user.address,
                emc_amount: emcBuyAmount,
              }),
            })
            const verifyData = await verifyRes.json()
            if (verifyData.success) {
              setEmcBuyMsg(`✅ ${emcBuyAmount} EMC added! New balance: ${verifyData.new_balance}`)
            } else {
              setEmcBuyMsg('Payment verification failed. Contact support.')
            }
          } catch {
            setEmcBuyMsg('Verification error. Contact support.')
          }
          setEmcBuyLoading(false)
        },
        modal: {
          ondismiss: function () {
            setEmcBuyLoading(false)
          },
        },
        theme: { color: '#ff3d3d' },
      })
      rzp.open()
    } catch {
      setEmcBuyMsg('Something went wrong.')
      setEmcBuyLoading(false)
    }
  }
  const [premiumExpiresAt, setPremiumExpiresAt] = useState<string|null>(null)
  const [premiumLoading, setPremiumLoading] = useState(false)
  const [premiumMsg, setPremiumMsg] = useState('')
  const [bottomTab, setBottomTab]   = useState<BottomTab>('home')
  const [refreshing, setRefreshing] = useState(false)
  const [searchOpen, setSearchOpen]     = useState(false)
  const [searchQuery, setSearchQuery]   = useState('')
  const [searchResult, setSearchResult] = useState<SearchResult|null>(null)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [sendOpen, setSendOpen]       = useState(false)
  const [sendTab, setSendTab]         = useState<'send'|'receive'>('send')
  const [sendChain, setSendChain]     = useState<'ETH'|'SOL'|'ARB'|'MON'|'BTC'>('ETH')
  const [sendTo, setSendTo]           = useState('')
  const [solAddrInput, setSolAddrInput] = useState('')
  const [sendAmount, setSendAmount]   = useState('')
  const [sendLoading, setSendLoading] = useState(false)
  const [sendError, setSendError]     = useState('')
  const [sendSuccess, setSendSuccess] = useState('')
  // FIX 1: Address book state - loads from localStorage correctly
  const [addressBook, setAddressBook] = useState<{name:string;address:string}[]>([])
  const [swap, setSwap] = useState<SwapState>({ fromToken:'ETH', toToken:'SOL', amount:'', estimatedOut:'', loading:false, error:'', success:'', priceImpact:0, route:'', simStatus:'idle', simGas:'', simError:'' })
  const [bridge, setBridge] = useState<BridgeState>({ fromChain:'ETH', toChain:'ARB', fromToken:'ETH', toToken:'ETH', amount:'', estimatedOut:'', loading:false, error:'', success:'', estimatedTime:'', feesUsd:'', bridge:'', route:'' })
  const [tradeTab, setTradeTab] = useState<'swap'|'bridge'>('swap')
  const [chainStatus, setChainStatus] = useState<Record<string,'online'|'offline'|'checking'>>({ earth:'checking', soul:'checking', moon:'checking', orbit:'checking', birth:'checking' })
  const [chartToken, setChartToken]   = useState('ETH')
  const [chartDays, setChartDays]     = useState('7')
  const [chartData, setChartData]     = useState<[number,number][]>([])
  const [chartLoading, setChartLoading] = useState(false)
  const [news, setNews]               = useState<NewsItem[]>([])
  const [newsLoading, setNewsLoading] = useState(false)
  const [alerts, setAlerts]           = useState<PriceAlert[]>([])
  const [alertSymbol, setAlertSymbol] = useState('ETH')
  const [alertPrice, setAlertPrice]   = useState('')
  const [alertCondition, setAlertCondition] = useState<'above'|'below'>('above')
  const [marketsTab, setMarketsTab]   = useState<'charts'|'news'|'alerts'>('charts')
  const [settingsTab, setSettingsTab] = useState<'profile'|'security'|'history'|'assets'|'dapps'>('profile')
  const [txHistory, setTxHistory]     = useState<TxItem[]>([])
  const [txLoading, setTxLoading]     = useState(false)
  const [tokenBalances, setTokenBalances] = useState<any[]>([])
  const [tokensLoading, setTokensLoading] = useState(false)
  const [nfts, setNfts] = useState<any[]>([])
  const [nftsLoading, setNftsLoading] = useState(false)
  const [selectedNft, setSelectedNft] = useState<any>(null)
  const [dappUrl, setDappUrl]         = useState('')
  const [dappOpen, setDappOpen]       = useState(false)
  const [iframeError, setIframeError] = useState(false)
  const [dappLoaded, setDappLoaded] = useState(false)
  const [frozen, setFrozen]           = useState(false)
  const [pin, setPin]                 = useState('')
  const [pinSet, setPinSet]           = useState(false)
  const [pinInput, setPinInput]       = useState('')
  const [pinError, setPinError]       = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const fetchBalance = useCallback(async (address: string) => {
    try {
      const savedSolAddr = typeof window!=='undefined' ? localStorage.getItem('solAddress') : null
      const [er,sr,ar] = await Promise.all([fetch('/api/balance?address='+address),savedSolAddr?fetch('/api/solana?address='+savedSolAddr):Promise.resolve({json:async()=>({solBalance:0})} as Response),fetch('https://arb1.arbitrum.io/rpc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'eth_getBalance',params:[address,'latest']})})])
      const [ed,sd,ad] = await Promise.all([er.json(),sr.json(),ar.json()])
      setWalletData({...ed,solBalance:sd.solBalance||0,arbBalance:ad.result?parseInt(ad.result,16)/1e18:0,monadBalance:ed.monadBalance||0,baseBalance:ed.baseBalance||0})
    } catch {}
  }, [])

  // Capture ?ref= param on load and store pending referral
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref && ref.length === 42 && ref.startsWith('0x') && !localStorage.getItem('referralApplied')) {
      localStorage.setItem('pendingReferral', ref)
    }
  }, [])

  // Auto-apply pending referral once wallet connects
  useEffect(() => {
    if (!user?.address) return
    const pending = localStorage.getItem('pendingReferral')
    const applied = localStorage.getItem('referralApplied')
    if (!pending || applied) return
    if (pending.toLowerCase() === user.address.toLowerCase()) {
      localStorage.removeItem('pendingReferral')
      return
    }
    fetch('/api/referral/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referrerAddress: pending, referredAddress: user.address })
    }).then(r => r.json()).then(() => {
      localStorage.setItem('referralApplied', 'true')
      localStorage.removeItem('pendingReferral')
    }).catch(() => {})
  }, [user?.address])

  useEffect(() => {
    const checkExistingConnection = async () => {
      const {initAppKit} = await import('@/app/context/wallet')
      const modal = await initAppKit()
      if (!modal) return
      const account = modal.getAccount()
      if (account?.isConnected && account?.address) {
        const savedSol = typeof window!=='undefined' ? localStorage.getItem('solAddress') : null
        setUser({address: account.address, type: 'external', solAddress: savedSol || undefined})
        fetchBalance(account.address)
        fetchEmoBalance(account.address)
        setScreen('dashboard')
      }
      modal.subscribeAccount((acc: any) => {
        if (acc?.isConnected && acc?.address) {
          const savedSol = typeof window!=='undefined' ? localStorage.getItem('solAddress') : null
          setUser({address: acc.address, type: 'external', solAddress: savedSol || undefined})
          fetchBalance(acc.address)
        fetchEmoBalance(acc.address)
          setScreen('dashboard')
        } else if (!acc?.isConnected) {
          setUser(null)
          setWalletData(null)
          setScreen('login')
        }
      })
    }
    checkExistingConnection()
  }, [fetchBalance])

  useEffect(() => {
    checkChainStatus()
    // FIX 2: Properly load address book from localStorage
    try {
      const saved = localStorage.getItem('tw_ab')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) setAddressBook(parsed)
      }
    } catch(e) { console.log('AB load error', e) }
  }, [])

  // FIX 3: Save address book with error handling
  useEffect(() => {
    try { localStorage.setItem('tw_ab', JSON.stringify(addressBook)) } catch(e) {}
  }, [addressBook])

  const checkChainStatus = async () => {
    for (const c of [{id:'earth',url:'https://cloudflare-eth.com'},{id:'orbit',url:'https://arb1.arbitrum.io/rpc'},{id:'moon',url:'https://rpc.monad.xyz'},{id:'hood',url:'https://rpc.mainnet.chain.robinhood.com'}]) {
      try { const r = await fetch(c.url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'eth_blockNumber',params:[]}),signal:AbortSignal.timeout(5000)}); setChainStatus(p=>({...p,[c.id]:r.ok?'online':'offline'})) } catch { setChainStatus(p=>({...p,[c.id]:'offline'})) }
    }
    try { const r = await fetch('/api/solana',{signal:AbortSignal.timeout(8000)}); const d = await r.json(); setChainStatus(p=>({...p,soul:d.status==='success'?'online':'offline'})) } catch { setChainStatus(p=>({...p,soul:'offline'})) }
    try { const r = await fetch('https://mempool.space/api/blocks/tip/height',{signal:AbortSignal.timeout(5000)}); setChainStatus(p=>({...p,birth:r.ok?'online':'offline'})) } catch { setChainStatus(p=>({...p,birth:'offline'})) }
  }

  const fetchPrices = useCallback(async () => { try { const r=await fetch('/api/prices'); const d=await r.json(); if(d.prices&&Object.keys(d.prices).length>0) setPrices(d.prices) } catch {} }, [])
  const fetchChart = useCallback(async (symbol: string, days: string) => {
    const token = TOKENS.find(t=>t.symbol===symbol)
    if (!token?.cgId) { setChartData([]); return }
    setChartLoading(true)
    try { const r=await fetch(`/api/chart?coin=${token.cgId}&days=${days}`); const d=await r.json(); setChartData(d.prices||[]) } catch { setChartData([]) }
    setChartLoading(false)
  }, [])

  const fetchNews = useCallback(async () => {
    setNewsLoading(true)
    try { const r=await fetch('/api/news'); const d=await r.json(); setNews(d.news||[]) } catch { setNews([]) }
    setNewsLoading(false)
  }, [])

  const becomeLeader = useCallback(async () => {
    if (!user?.address || becomeLeaderLoading) return
    setBecomeLeaderLoading(true)
    setBecomeLeaderStatus('')
    try {
      const r = await fetch('/api/copytrade/become-leader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: user.address, display_name: becomeLeaderName.trim() || null }),
      })
      const d = await r.json()
      if (d.error) {
        setBecomeLeaderStatus('❌ ' + d.error)
      } else if (d.already_leader) {
        setBecomeLeaderStatus('👑 You are already a Leader!')
      } else {
        setBecomeLeaderStatus('✅ You are now a Copy Trading Leader!')
      }
    } catch {
      setBecomeLeaderStatus('❌ Something went wrong. Try again.')
    }
    setBecomeLeaderLoading(false)
  }, [user, becomeLeaderName, becomeLeaderLoading])

  const fetchLeaders = useCallback(async () => {
    setLeadersLoading(true)
    try {
      const r = await fetch('/api/copytrade/leaders')
      const d = await r.json()
      setLeadersList(d.leaders || [])
    } catch {
      setLeadersList([])
    }
    setLeadersLoading(false)
  }, [])

  const followLeader = useCallback(async () => {
    if (!user?.address || !followTarget || followLoading) return
    setFollowLoading(true)
    setFollowStatus('')
    try {
      const r = await fetch('/api/copytrade/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          follower_address: user.address,
          leader_address: followTarget.wallet_address,
          allocation_pct: followAllocation,
        }),
      })
      const d = await r.json()
      if (d.error) {
        setFollowStatus('❌ ' + d.error)
      } else if (d.already_following) {
        setFollowStatus('🦋 You are already following this leader!')
      } else {
        setFollowStatus('✅ Now following! Allocation: ' + followAllocation + '%')
        fetchLeaders()
      }
    } catch {
      setFollowStatus('❌ Something went wrong. Try again.')
    }
    setFollowLoading(false)
  }, [user, followTarget, followAllocation, followLoading, fetchLeaders])

  const sendCopyTradeMessage = useCallback(async () => {
    const text = copyTradeInput.trim()
    if (!text || copyTradeChatLoading) return
    const newLog = [...copyTradeChatLog, { role: 'user', content: text }]
    setCopyTradeChatLog(newLog)
    setCopyTradeInput('')
    setCopyTradeChatLoading(true)
    try {
      const res = await fetch('https://thewall-copytrading.meradivin.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: newLog }),
      })
      const data = await res.json()
      setCopyTradeChatLog(prev => [...prev, { role: 'assistant', content: data.reply || "\ud83e\udd8b I'm here \u2014 ask me anything about copy trading!" }])
    } catch {
      setCopyTradeChatLog(prev => [...prev, { role: 'assistant', content: '\ud83e\udd8b My wings are resting for a moment. Please try again!' }])
    }
    setCopyTradeChatLoading(false)
  }, [copyTradeInput, copyTradeChatLog, copyTradeChatLoading])

  const fetchEmoBalance = useCallback(async (address: string) => {
    try {
      const res = await fetch('/api/emocoin/claim?address=' + address)
      const data = await res.json()
      if (typeof data.balance === 'number') setEmoBalance(data.balance)
      const cooldownMs = data.isPremium ? 6*60*60*1000 : 24*60*60*1000
      if (data.lastClaimAt) {
        const next = new Date(data.lastClaimAt).getTime() + cooldownMs
        setEmoNextClaimAt(next > Date.now() ? next : null)
      } else {
        setEmoNextClaimAt(null)
      }
      setIsPremium(!!data.isPremium)
      setPremiumExpiresAt(data.premiumExpiresAt || null)
    } catch (e) {}
  }, [])

  const claimEmoCoin = useCallback(async () => {
    if (!user?.address || emoClaiming) return
    setEmoClaiming(true)
    setEmoClaimMsg('')
    try {
      const res = await fetch('/api/emocoin/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: user.address })
      })
      const data = await res.json()
      if (res.status === 429) {
        setEmoClaimMsg('Already claimed today')
        setEmoNextClaimAt(Date.now() + data.remainingMs)
        if (typeof data.balance === 'number') setEmoBalance(data.balance)
      } else if (typeof data.balance === 'number') {
        setEmoBalance(data.balance)
        setEmoClaimMsg('+10 EMC claimed!')
        setEmoNextClaimAt(Date.now() + 24*60*60*1000)
      }
    } catch (e) {
      setEmoClaimMsg('Claim failed')
    }
    setEmoClaiming(false)
  }, [user, emoClaiming])

  const buyPremium = useCallback(async () => {
    if (!user?.address || premiumLoading) return
    setPremiumLoading(true)
    setPremiumMsg('')
    try {
      const orderRes = await fetch('https://thewall-emc.meradivin.workers.dev/create-premium-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: user.address })
      })
      const orderData = await orderRes.json()
      if (!orderData.success) {
        setPremiumMsg('Order failed. Try again.')
        setPremiumLoading(false)
        return
      }

      const loadRazorpay = () =>
        new Promise((resolve) => {
          if ((window as any).Razorpay) return resolve(true)
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = () => resolve(true)
          script.onerror = () => resolve(false)
          document.body.appendChild(script)
        })

      const loaded = await loadRazorpay()
      if (!loaded) {
        setPremiumMsg('Could not load payment gateway.')
        setPremiumLoading(false)
        return
      }

      const rzp = new (window as any).Razorpay({
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.order_id,
        name: 'TheWall',
        description: 'Upgrade to Premium \u2014 \u20b9210/month',
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('https://thewall-emc.meradivin.workers.dev/verify-premium-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                wallet_address: user.address,
              }),
            })
            const verifyData = await verifyRes.json()
            if (verifyData.success) {
              setIsPremium(true)
              setPremiumExpiresAt(verifyData.premiumExpiresAt)
              setPremiumMsg('Premium activated! \u2b50')
            } else {
              setPremiumMsg('Payment verification failed. Contact support.')
            }
          } catch {
            setPremiumMsg('Verification error. Contact support.')
          }
          setPremiumLoading(false)
        },
        modal: {
          ondismiss: function () {
            setPremiumLoading(false)
          }
        },
        theme: { color: '#00ff88' }
      })
      rzp.open()
    } catch (e) {
      setPremiumMsg('Upgrade failed')
      setPremiumLoading(false)
    }
  }, [user, premiumLoading])

  const fetchTxHistory = useCallback(async (address: string) => {
    setTxLoading(true)
    try { const r=await fetch('/api/txhistory?address='+address); const d=await r.json(); setTxHistory(d.txs||[]) } catch { setTxHistory([]) }
    setTxLoading(false)
  }, [])

  const fetchTokenBalances = useCallback(async (address: string) => {
    setTokensLoading(true)
    try { const r=await fetch('/api/tokenbalances?address='+address); const d=await r.json(); setTokenBalances(d.tokens||[]) } catch { setTokenBalances([]) }
    setTokensLoading(false)
  }, [])

  const fetchNfts = useCallback(async (address: string) => {
    setNftsLoading(true)
    try { const r=await fetch('/api/nfts?address='+address); const d=await r.json(); setNfts(d.nfts||[]) } catch { setNfts([]) }
    setNftsLoading(false)
  }, [])

  useEffect(() => {
    alerts.forEach(alert => {
      if (alert.triggered) return
      const p = prices[alert.symbol]?.price
      if (!p) return
      if (alert.condition==='above'?p>=alert.targetPrice:p<=alert.targetPrice) {
        setAlerts(prev=>prev.map(a=>a.id===alert.id?{...a,triggered:true}:a))
        if ('Notification' in window && Notification.permission==='granted') new Notification('TheWall Alert 🔔',{body:`${alert.symbol} ${alert.condition} $${alert.targetPrice}! Now: $${p.toFixed(2)}`})
      }
    })
  }, [prices, alerts])

  useEffect(() => {
    if (!canvasRef.current||!chartData.length) return
    const canvas=canvasRef.current, ctx=canvas.getContext('2d')
    if (!ctx) return
    const W=canvas.width, H=canvas.height
    ctx.clearRect(0,0,W,H)
    const ps=chartData.map(d=>d[1]), min=Math.min(...ps), max=Math.max(...ps), range=max-min||1
    const color=TOKENS.find(t=>t.symbol===chartToken)?.color||'#00e5ff'
    ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=1
    for(let i=0;i<=4;i++){const y=H*i/4;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
    const grad=ctx.createLinearGradient(0,0,0,H); grad.addColorStop(0,color+'44'); grad.addColorStop(1,color+'00')
    ctx.beginPath()
    chartData.forEach((d,i)=>{const x=(i/(chartData.length-1))*W,y=H-((d[1]-min)/range)*H*0.85-H*0.05;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)})
    ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.fillStyle=grad;ctx.fill()
    ctx.beginPath()
    chartData.forEach((d,i)=>{const x=(i/(chartData.length-1))*W,y=H-((d[1]-min)/range)*H*0.85-H*0.05;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)})
    ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke()
    ctx.fillStyle='rgba(232,244,253,0.5)';ctx.font='10px monospace';ctx.textAlign='right'
    ctx.fillText('$'+max.toLocaleString('en',{maximumFractionDigits:0}),W-4,14)
    ctx.fillText('$'+min.toLocaleString('en',{maximumFractionDigits:0}),W-4,H-4)
  }, [chartData,chartToken])

  useEffect(()=>{fetchPrices();const i=setInterval(fetchPrices,60_000);return()=>clearInterval(i)},[fetchPrices])
  useEffect(()=>{if(bottomTab==='markets'&&marketsTab==='charts')fetchChart(chartToken,chartDays)},[bottomTab,marketsTab,chartToken,chartDays,fetchChart])
  useEffect(()=>{if(bottomTab==='markets'&&marketsTab==='news'&&!news.length)fetchNews()},[bottomTab,marketsTab,fetchNews,news.length])
  useEffect(()=>{if(bottomTab==='settings'&&settingsTab==='history'&&user?.address&&!txHistory.length)fetchTxHistory(user.address)},[bottomTab,settingsTab,user,txHistory.length,fetchTxHistory])
  useEffect(()=>{if(bottomTab==='settings'&&settingsTab==='assets'&&user?.address&&!tokenBalances.length)fetchTokenBalances(user.address)},[bottomTab,settingsTab,user,tokenBalances.length,fetchTokenBalances])
  useEffect(()=>{if(bottomTab==='settings'&&settingsTab==='assets'&&user?.address&&!nfts.length)fetchNfts(user.address)},[bottomTab,settingsTab,user,nfts.length,fetchNfts])
  useEffect(()=>{if(!dappOpen)return;const isBlocked=IFRAME_BLOCKED.some(d=>dappUrl.includes(d));if(isBlocked){setIframeError(true);setDappLoaded(false);return}setIframeError(false);setDappLoaded(false);const timer=setTimeout(()=>{setDappLoaded(loaded=>{if(!loaded)setIframeError(true);return loaded})},2500);return ()=>clearTimeout(timer)},[dappOpen,dappUrl])

  const estimateSwap = useCallback((amount:string,from:string,to:string)=>{
    if(!amount||parseFloat(amount)<=0)return
    const fp=prices[from]?.price||0,tp=prices[to]?.price||0
    if(!fp||!tp)return
    setSwap(p=>({...p,estimatedOut:((parseFloat(amount)*fp)/tp).toFixed(6),priceImpact:Math.random()*0.5+0.1,route:`${from} → UniSwap V3 → ${to}`}))
  },[prices])
  useEffect(()=>{if(swap.amount)estimateSwap(swap.amount,swap.fromToken,swap.toToken)},[swap.amount,swap.fromToken,swap.toToken,estimateSwap])

  const handleSwap = async()=>{
    if(!swap.amount)return
    setSwap(p=>({...p,loading:true,error:'',success:'',simStatus:'idle',simError:''}))
    try {
      const qRes = await fetch('/api/swap', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ action:'quote', fromToken:swap.fromToken, toToken:swap.toToken, amount:swap.amount }) })
      const qData = await qRes.json()
      if(!qData.success) throw new Error(qData.error||'Quote failed')
      const q = qData.quote
      setSwap(p=>({...p, loading:false, estimatedOut:q.toAmount, priceImpact:q.priceImpact, route:q.route, success:`OK ${swap.amount} ${swap.fromToken} to ${q.toAmount} ${swap.toToken}`}))
      if(!user?.address){ setSwap(p=>({...p,simStatus:'nowallet'})); return }
      setSwap(p=>({...p,simStatus:'simulating'}))
      try {
        const sRes = await fetch('/api/swap', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ action:'simulate', fromToken:swap.fromToken, toToken:swap.toToken, amount:swap.amount, fromAddress:user.address }) })
        const sData = await sRes.json()
        if(sData.simOk) setSwap(p=>({...p,simStatus:'ok',simGas:sData.gas||'',simError:''}))
        else setSwap(p=>({...p,simStatus:'fail',simError:sData.simError||sData.error||'Simulation failed'}))
      } catch(e:any) { setSwap(p=>({...p,simStatus:'fail',simError:e.message||'Simulation failed'})) }
    } catch(e:any) { setSwap(p=>({...p,loading:false,error:e.message||'Swap failed'})) }
  }

  const handleBridgeQuote = async()=>{
    if(!bridge.amount)return
    setBridge(p=>({...p,loading:true,error:'',success:''}))
    try {
      const res = await fetch('/api/bridge', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ action:'quote', fromChain:bridge.fromChain, toChain:bridge.toChain, fromToken:bridge.fromToken, toToken:bridge.toToken, amount:bridge.amount }) })
      const data = await res.json()
      if(!data.success) throw new Error(data.error||'Bridge quote failed')
      const q = data.quote
      setBridge(p=>({...p, loading:false, estimatedOut:q.toAmount, estimatedTime:q.estimatedTime, feesUsd:q.feesUsd, bridge:q.bridge, route:q.route, success:`OK ${q.toAmount} ${bridge.toToken} via ${q.bridge} | ${q.estimatedTime} | $${q.feesUsd}`}))
    } catch(e:any) { setBridge(p=>({...p,loading:false,error:e.message||'Bridge failed'})) }
  }

  const searchWallet = async(addr:string)=>{
    const address=addr.trim(); if(!address||address.length<10)return
    setSearchResult({address,ethBalance:0,ethUsd:0,txCount:0,loading:true,error:''})
    setSearchHistory(p=>[address,...p.filter(a=>a!==address)].slice(0,5))
    try {
      let ethBalance=0,txCount=0
      if(address.startsWith('0x')){
        const [b,t]=await Promise.all([fetch('https://cloudflare-eth.com',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'eth_getBalance',params:[address,'latest']})}),fetch('https://cloudflare-eth.com',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:2,method:'eth_getTransactionCount',params:[address,'latest']})})])
        const [bd,td]=await Promise.all([b.json(),t.json()])
        if(bd.result)ethBalance=parseInt(bd.result,16)/1e18
        if(td.result)txCount=parseInt(td.result,16)
      }
      setSearchResult({address,ethBalance,ethUsd:ethBalance*(prices.ETH?.price||0),txCount,loading:false,error:''})
    } catch { setSearchResult(p=>p?{...p,loading:false,error:'Failed'}:null) }
  }

  const handleSend=async()=>{
    if(!sendTo||!sendAmount)return
    setSendLoading(true);setSendError('');setSendSuccess('')
    try {
      const r=await fetch('/api/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'prepare',chain:sendChain,to:sendTo,amount:sendAmount,from:user?.address||''})})
      const d=await r.json()
      if(d.success){setSendSuccess(`✅ ${sendAmount} ${sendChain} → ${sendTo.slice(0,8)}... · FREE ⚡`);setSendAmount('');setSendTo('')}
      else setSendError(d.error||'Send failed')
    } catch { setSendError('Network error.') }
    setSendLoading(false)
  }

  const addAlert=()=>{
    if(!alertPrice||parseFloat(alertPrice)<=0)return
    setAlerts(p=>[...p,{id:Date.now().toString(),symbol:alertSymbol,targetPrice:parseFloat(alertPrice),condition:alertCondition,triggered:false}])
    if('Notification' in window)Notification.requestPermission()
    setAlertPrice('')
  }

  const handleConnectWallet=async()=>{
    const {initAppKit}=await import('@/app/context/wallet')
    const modal=await initAppKit()
    if(!modal)return
    modal.open()
    modal.subscribeAccount((account:any)=>{
      if(account.isConnected&&account.address){
        const savedSol = typeof window!=='undefined' ? localStorage.getItem('solAddress') : null
        setUser({address:account.address,type:'external',solAddress:savedSol||undefined})
        fetchBalance(account.address)
        setScreen('dashboard')
      }
    })
  }
  const handleGuestView=()=>{setUser({address:'',type:'external'});setScreen('dashboard')}
  const handleRefresh=async()=>{setRefreshing(true);await Promise.all([fetchPrices(),fetchBalance(user?.address||''),checkChainStatus()]);setRefreshing(false)}

  const portfolioTotal=(walletData?.ethBalance||0)*(prices.ETH?.price||0)+(walletData?.arbBalance||0)*(prices.ARB?.price||0)+(walletData?.monadBalance||0)*(prices.MON?.price||0)+(walletData?.baseBalance||0)*(prices.ETH?.price||0)+emoBalance*EMOCOIN.priceUsd
  const goalPct=Math.min((portfolioTotal/GOAL_USD)*100,100)
  const fmt=(n:number)=>n>=1000?'$'+(n/1000).toFixed(1)+'K':'$'+n.toFixed(2)
  const fmtAddr=(a:string)=>a.slice(0,8)+'...'+a.slice(-6)
  const walletLabel=user?.type==='smart'?'SMART WALLET 🔢':'MAIN WALLET'
  const s = { card:{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,padding:16,marginBottom:12} as const, mono:{fontFamily:'var(--font-mono)'} as const, muted:{color:'var(--text-muted)'} as const, cyan:{color:'var(--cyan)'} as const, label:{fontSize:'0.62rem',letterSpacing:'0.1em',color:'var(--text-muted)',marginBottom:6} as const }

  if(frozen) return (
    <div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{fontSize:'3rem',marginBottom:16}}>❄️</div>
      <div style={{fontSize:'1.2rem',...s.mono,...s.cyan,marginBottom:8}}>WALLET FROZEN</div>
      <div style={{fontSize:'0.75rem',...s.muted,textAlign:'center',marginBottom:24}}>Enter PIN to unfreeze.</div>
      <input type="password" maxLength={6} placeholder="Enter PIN" value={pinInput} onChange={e=>setPinInput(e.target.value.replace(/\D/g,'').slice(0,6))} style={{padding:'12px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',...s.mono,fontSize:'1.2rem',letterSpacing:'0.3em',textAlign:'center',marginBottom:12,width:'100%',maxWidth:200}}/>
      {pinError&&<div style={{color:'#ff4466',fontSize:'0.72rem',marginBottom:8}}>{pinError}</div>}
      <button onClick={()=>{if(pinInput===pin){setFrozen(false);setPinInput('');setPinError('')}else setPinError('Wrong PIN')}} style={{padding:'12px 24px',background:'var(--cyan-glow)',border:'1px solid var(--cyan)',borderRadius:8,...s.mono,...s.cyan,cursor:'pointer'}}>Unfreeze Wallet</button>
    </div>
  )

  
const ChainIcon = ({ id }: { id: string }) => {
  const s: React.CSSProperties = { width: 20, height: 20, flexShrink: 0 };
  switch (id) {
    case 'birth': // Bitcoin
      return (
        <svg style={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#f7931a"/><path fill="#fff" d="M21.9 14.3c.3-2-1.2-3-3.3-3.7l.7-2.7-1.6-.4-.7 2.6c-.4-.1-.9-.2-1.3-.3l.7-2.7-1.6-.4-.7 2.7c-.4-.1-.7-.2-1-.2v-.1l-2.3-.6-.4 1.7s1.2.3 1.2.3c.7.2.8.6.8.9l-.8 3.2c0 0 .1 0 .2.1h-.2l-1.1 4.5c-.1.2-.3.5-.8.4 0 0-1.2-.3-1.2-.3l-.8 1.8 2.2.6c.4.1.8.2 1.2.3l-.7 2.8 1.6.4.7-2.7c.4.1.9.2 1.3.3l-.7 2.7 1.6.4.7-2.8c2.8.5 4.9.3 5.8-2.2.7-2-.03-3.2-1.5-3.9 1.1-.2 1.9-1 2.1-2.5zm-3.7 5.3c-.5 2-3.9.9-5 .6l.9-3.6c1.1.3 4.6.8 4.1 3zm.5-5.3c-.5 1.8-3.3.9-4.2.7l.8-3.3c.9.2 3.9.6 3.4 2.6z"/></svg>
      );
    case 'earth': // Ethereum
      return (
        <svg style={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#627eea"/><path fill="#fff" fillOpacity=".8" d="M16.5 4v8.9l7.5 3.4z"/><path fill="#fff" d="M16.5 4 9 16.3l7.5-3.4z"/><path fill="#fff" fillOpacity=".8" d="M16.5 21.9v6.1l7.5-10.4z"/><path fill="#fff" d="M16.5 28v-6.1L9 17.6z"/><path fill="#fff" fillOpacity=".6" d="M16.5 20.5 24 16.3l-7.5-3.4z"/><path fill="#fff" fillOpacity=".9" d="M9 16.3l7.5 4.2v-7.6z"/></svg>
      );
    case 'soul': // Solana
      return (
        <svg style={s} viewBox="0 0 32 32"><defs><linearGradient id="solg" x1="0" y1="0" x2="32" y2="32"><stop offset="0" stopColor="#00ffa3"/><stop offset="1" stopColor="#dc1fff"/></linearGradient></defs><circle cx="16" cy="16" r="16" fill="#0a0a0a"/><path fill="url(#solg)" d="M9.3 20.1c.2-.2.5-.3.8-.3h13.4c.4 0 .6.5.3.8l-2.7 2.7c-.2.2-.5.3-.8.3H6.9c-.4 0-.6-.5-.3-.8l2.7-2.7z"/><path fill="url(#solg)" d="M9.3 8.9c.2-.2.5-.3.8-.3h13.4c.4 0 .6.5.3.8l-2.7 2.7c-.2.2-.5.3-.8.3H6.9c-.4 0-.6-.5-.3-.8l2.7-2.7z"/><path fill="url(#solg)" d="M22.7 14.5c-.2-.2-.5-.3-.8-.3H8.5c-.4 0-.6.5-.3.8l2.7 2.7c.2.2.5.3.8.3h13.4c.4 0 .6-.5.3-.8l-2.7-2.7z"/></svg>
      );
    case 'orbit': // Arbitrum
      return (
        <svg style={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#213147"/><path fill="#12aaff" d="M12.5 21.5 16 14.2l3.5 7.3h2.4L16 8.5l-5.9 13z"/><path fill="#fff" d="m14.7 18.3 1.3-3 1.3 3z"/><path fill="#9dcced" d="M9.3 21.5h2l.9-2h2.1l-1.9-4.2z"/></svg>
      );
    case 'moon': // Monad
      return (
        <svg style={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#200052"/><path fill="#836ef9" d="M16 7c-3.5 0-9 4-9 9s5.5 9 9 9 9-4 9-9-5.5-9-9-9zm0 15.5c-2 0-4.5-3.3-4.5-6.5S14 9.5 16 9.5s4.5 3.3 4.5 6.5-2.5 6.5-4.5 6.5z"/></svg>
      );
    case 'base': // Base
      return (
        <svg style={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#0052ff"/><path fill="#fff" d="M16 24.5c4.7 0 8.5-3.8 8.5-8.5S20.7 7.5 16 7.5c-4.4 0-8.1 3.4-8.5 7.7h11.6v1.6H7.5c.4 4.3 4.1 7.7 8.5 7.7z"/></svg>
      );
    default:
      return null;
  }
};

  if(screen==='login') return (
    <div className={styles.loginWrap}>
      <div className={styles.loginCard}>
        <div className={styles.logo+' fade-up'}>
          <img src="/butterfly.jpg" className={styles.hexLogo} alt="The Wall"/>
          <div><div className={styles.logoTitle}>THE WALL</div><div className={styles.logoSub}>Web3 · IND → DXB · 6 Chains</div></div>
        </div>

        {loginStep==='home'&&<div className="fade-up-1">
          <div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'center',marginBottom:8}}>
            {[{icon:'👑',label:'PREMIUM ACCESS',color:'#ffd700'},{icon:'🛡️',label:'BANK-GRADE SECURITY',color:'#00ff88'},{icon:'⚡',label:'GASLESS & SEAMLESS',color:'#ffd700'}].map(f=>(
              <div key={f.label} style={{display:'flex',alignItems:'center',gap:4,padding:'5px 10px',border:`1px solid ${f.color}55`,borderRadius:20,background:`${f.color}11`,fontSize:'0.65rem',fontFamily:'var(--font-mono)',color:f.color,whiteSpace:'nowrap'}}><span>{f.icon}</span><span style={{fontWeight:700}}>{f.label}</span></div>
            ))}
          </div>
          <div style={{textAlign:'center',fontSize:'0.62rem',letterSpacing:'0.15em',color:'#ffd70099',fontFamily:'var(--font-mono)',marginBottom:6}}>— SELECT CHAIN —</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:8}}>
            {[
              {id:'birth',label:'BIRTH',sub:'Bitcoin (BTC)',color:'#f7931a'},
              {id:'earth',label:'EARTH',sub:'Ethereum (ETH)',color:'#627eea'},
              {id:'soul',label:'SOUL',sub:'Solana (SOL)',color:'#9945ff'},
              {id:'orbit',label:'ORBIT',sub:'Arbitrum (ARB)',color:'#12aaff'},
              {id:'moon',label:'MOON',sub:'Monad (MON)',color:'#836ef9'},
              {id:'base',label:'BASE',sub:'Base',color:'#0052ff'},
            ].map(c=>(
              <div key={c.id} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:10,border:'1px solid #ffd70033',background:'#0a0a0a',position:'relative'}}>
                <ChainIcon id={c.id}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:'0.7rem',fontWeight:700,color:'#ffd700',fontFamily:'var(--font-mono)',letterSpacing:'0.03em'}}>{c.label}</div>
                  <div style={{fontSize:'0.58rem',color:'rgba(232,244,253,0.5)',fontFamily:'var(--font-mono)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{c.sub}</div>
                </div>
                <span style={{width:5,height:5,borderRadius:'50%',background:chainStatus[c.id]==='online'?'#00ff88':chainStatus[c.id]==='offline'?'#ff4466':c.color,flexShrink:0}}/>
              </div>
            ))}
          </div>
          <div style={{border:'1px solid #ffd70044',borderRadius:14,padding:8,marginBottom:6,background:'linear-gradient(160deg, rgba(255,215,0,0.04), rgba(0,0,0,0.2))'}}>
          <button onClick={handleConnectWallet} style={{width:'100%',padding:'10px',marginBottom:6,background:'linear-gradient(135deg,#ffd700,#b8860b)',border:'none',borderRadius:10,color:'#1a1200',fontFamily:'var(--font-mono)',fontSize:'0.85rem',fontWeight:700,letterSpacing:'0.05em',cursor:'pointer',boxShadow:'0 0 20px rgba(255,215,0,0.25)'}}>SIGN UP / LOGIN</button>
          <div style={{marginBottom:6,padding:'4px',borderRadius:10,border:'none',background:'linear-gradient(135deg,#00ff88,#00b368)',boxShadow:'0 0 20px rgba(0,255,136,0.25)'}}>
            <SmartWalletConnect onConnect={(address, email, solanaAddress) => { setUser({address, type: 'smart', email, solAddress: solanaAddress}); fetchBalance(address); fetchEmoBalance(address); setScreen('dashboard') }} />
          </div>
          <div style={{display:'flex',gap:6,maxWidth:'94%',marginLeft:'auto',marginRight:'auto'}}>
            <div style={{flex:1,padding:'3px 6px',borderRadius:8,border:'1px solid #ffd70044',background:'rgba(255,215,0,0.03)',textAlign:'center'}}>
              <div style={{fontSize:'0.6rem',fontWeight:700,color:'#ffd700',fontFamily:'var(--font-mono)'}}>👑 PREMIUM</div>
              <div style={{fontSize:'0.5rem',color:'rgba(232,244,253,0.6)',fontFamily:'var(--font-mono)',marginTop:1}}>⭐ 🛡️ 💎</div>
            </div>
            <div style={{flex:1,padding:'3px 6px',borderRadius:8,border:'1px solid #ffd70033',background:'rgba(0,0,0,0.3)',textAlign:'center'}}>
              <div style={{fontSize:'0.6rem',fontWeight:700,color:'#ffd700',fontFamily:'var(--font-mono)'}}>🛡️ SECURITY</div>
              <div style={{fontSize:'0.5rem',color:'rgba(232,244,253,0.6)',fontFamily:'var(--font-mono)',marginTop:1}}>🔒 🌐 ✅</div>
            </div>
          </div>
        </div>
        </div>}

      </div>
      <div className={styles.loginFooter}>⬡ THE WALL · DWIN · 2026 · IND → DXB · 🇮🇳🇦🇪</div>
    </div>
  )

  return (
    <div className={styles.dashWrap} style={{paddingBottom:70}}>
      <header className={styles.header+' fade-up'}>
        <div className={styles.headerLeft}><span className={styles.hexSmall}>⬡</span><span className={styles.headerTitle}>THE WALL</span></div>
        <div className={styles.headerRight}><button className={styles.searchIconBtn} onClick={()=>setSearchOpen(true)}>🔍</button><button className={styles.refreshBtn} onClick={handleRefresh} disabled={refreshing}><span style={{display:'inline-block',animation:refreshing?'spin 0.8s linear infinite':'none'}}>↻</span></button><button className={styles.logoutBtn} onClick={async()=>{const {appkitModal}=await import('@/app/context/wallet');if(appkitModal)await appkitModal.disconnect();setUser(null);setWalletData(null);setScreen('login')}}>⏻</button></div>
      </header>

      {searchOpen&&<div className={styles.searchOverlay} onClick={()=>setSearchOpen(false)}><div className={styles.searchModal} onClick={e=>e.stopPropagation()}>
        <div className={styles.searchHeader}><span className={styles.searchTitle}>🔍 Wallet Search</span><button className={styles.searchClose} onClick={()=>{setSearchOpen(false);setSearchResult(null);setSearchQuery('')}}>✕</button></div>
        <div className={styles.searchInputRow}><input className={styles.searchInput} placeholder="ETH/SOL/ARB address..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchWallet(searchQuery)} autoFocus/><button className={styles.searchBtn} onClick={()=>searchWallet(searchQuery)}>→</button></div>
        {!searchResult&&searchHistory.length>0&&<div className={styles.searchHistory}><div className={styles.searchHistoryLabel}>Recent</div>{searchHistory.map(a=><div key={a} className={styles.searchHistoryItem} onClick={()=>{setSearchQuery(a);searchWallet(a)}}><span className={styles.historyIcon}>⬡</span><span className={styles.historyAddr}>{a.slice(0,10)}...{a.slice(-8)}</span></div>)}</div>}
        {searchResult&&<div className={styles.searchResult}>{searchResult.loading?<div className={styles.searchLoading}><div className={styles.spinner}/><span>Fetching...</span></div>:searchResult.error?<div className={styles.searchError}>⚠ {searchResult.error}</div>:<><div className={styles.searchAddr}>{searchResult.address.slice(0,10)}...{searchResult.address.slice(-8)}<button className={styles.copyBtn} onClick={()=>navigator.clipboard.writeText(searchResult.address)}>📋</button></div><div className={styles.searchCards}><div className={styles.searchCard}><div className={styles.searchCardLabel}>ETH</div><div className={styles.searchCardValue} style={{color:'#627eea'}}>{searchResult.ethBalance.toFixed(4)}</div><div className={styles.searchCardUsd}>${searchResult.ethUsd.toFixed(2)}</div></div><div className={styles.searchCard}><div className={styles.searchCardLabel}>Txns</div><div className={styles.searchCardValue}>{searchResult.txCount}</div><div className={styles.searchCardUsd}>total</div></div></div><button className={styles.searchViewBtn} onClick={()=>{setUser({address:searchResult.address,type:'external'});fetchBalance(searchResult.address);setSearchOpen(false);setSearchResult(null)}}>View Portfolio →</button></>}</div>}
      </div></div>}

      {sendOpen&&<div className={styles.searchOverlay} onClick={()=>setSendOpen(false)}><div className={styles.searchModal} onClick={e=>e.stopPropagation()}>
        <div className={styles.searchHeader}><span className={styles.searchTitle}>{sendTab==='send'?'📤 Send':'📥 Receive'}</span><button className={styles.searchClose} onClick={()=>{setSendOpen(false);setSendError('');setSendSuccess('')}}>✕</button></div>
        <div style={{display:'flex',gap:8,marginBottom:16}}>{(['send','receive']as const).map(t=><button key={t} onClick={()=>setSendTab(t)} style={{flex:1,padding:'10px',border:'1px solid',borderColor:sendTab===t?'var(--cyan)':'var(--border)',borderRadius:8,background:sendTab===t?'var(--cyan-glow)':'transparent',color:sendTab===t?'var(--cyan)':'var(--text-muted)',...s.mono,fontSize:'0.8rem',cursor:'pointer'}}>{t==='send'?'📤 Send':'📥 Receive'}</button>)}</div>
        {sendTab==='send'&&<div>
          <div style={{marginBottom:12}}><div style={s.label}>SELECT CHAIN</div><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{SEND_CHAINS.map(c=><button key={c.id} onClick={()=>setSendChain(c.id as typeof sendChain)} style={{padding:'8px 12px',border:'1px solid',borderColor:sendChain===c.id?c.color:'var(--border)',borderRadius:8,background:sendChain===c.id?`${c.color}15`:'var(--bg3)',color:sendChain===c.id?c.color:'var(--text-muted)',...s.mono,fontSize:'0.75rem',fontWeight:700,cursor:'pointer'}}>{c.label}</button>)}</div></div>
          <div style={{marginBottom:12}}><div style={s.label}>TO ADDRESS</div><input className={styles.searchInput} placeholder={sendChain==='SOL'?'SOL...':sendChain==='BTC'?'BTC...':'0x...'} value={sendTo} onChange={e=>setSendTo(e.target.value)}/></div>
          <div style={{marginBottom:16}}><div style={s.label}>AMOUNT</div><div style={{position:'relative'}}><input className={styles.searchInput} placeholder="0.00" type="number" value={sendAmount} onChange={e=>setSendAmount(e.target.value)} style={{width:'100%',paddingRight:60}}/><span style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',fontSize:'0.75rem',color:SEND_CHAINS.find(c=>c.id===sendChain)?.color,...s.mono,fontWeight:700}}>{sendChain}</span></div>{sendAmount&&prices[sendChain]&&<div style={{fontSize:'0.68rem',...s.muted,marginTop:4}}>≈ ${(parseFloat(sendAmount||'0')*(prices[sendChain]?.price||0)).toFixed(2)} · FREE ⚡</div>}</div>

          {/* FIX 4: Address book with label + delete button */}
          {addressBook.length>0&&<div style={{marginBottom:12}}>
            <div style={{fontSize:'0.62rem',color:'var(--text-muted)',marginBottom:6,fontFamily:'var(--font-mono)',letterSpacing:'0.08em'}}>── ADDRESS BOOK ──</div>
            {addressBook.map((e,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 12px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,marginBottom:6}}>
                <div onClick={()=>setSendTo(e.address)} style={{cursor:'pointer',flex:1,display:'flex',alignItems:'center',gap:10}}>
                  <span>👤</span>
                  <div>
                    <div style={{fontSize:'0.75rem',color:'var(--text)'}}>{e.name}</div>
                    <div style={{fontSize:'0.65rem',...s.muted,fontFamily:'var(--font-mono)'}}>{e.address.slice(0,12)}...{e.address.slice(-6)}</div>
                  </div>
                </div>
                <button onClick={(ev)=>{ev.stopPropagation();setAddressBook(p=>p.filter((_,idx)=>idx!==i))}} style={{padding:'4px 8px',background:'rgba(255,68,102,0.1)',border:'1px solid rgba(255,68,102,0.2)',borderRadius:6,color:'#ff4466',fontSize:'0.65rem',cursor:'pointer',marginLeft:8}}>✕</button>
              </div>
            ))}
          </div>}

          {/* FIX 5: Save button - fixed closing brackets */}
          <button onClick={()=>{
            if(!sendTo.trim()){ setSendError('Enter address first to save!'); return }
            const n=prompt('Contact name:')
            if(n?.trim()) setAddressBook(p=>[...p,{name:n.trim(),address:sendTo.trim()}])
          }} style={{background:'none',border:'1px dashed var(--border)',borderRadius:8,color:'var(--text-muted)',fontFamily:'var(--font-mono)',fontSize:'0.72rem',padding:'8px',cursor:'pointer',width:'100%',marginBottom:12}}>+ Save to Address Book</button>

          {sendError&&<div style={{padding:'10px',background:'rgba(255,68,102,0.08)',border:'1px solid rgba(255,68,102,0.2)',borderRadius:8,color:'#ff4466',fontSize:'0.75rem',marginBottom:12}}>⚠ {sendError}</div>}
          {sendSuccess&&<div style={{padding:'10px',background:'rgba(0,255,136,0.05)',border:'1px solid rgba(0,255,136,0.2)',borderRadius:8,color:'#00ff88',fontSize:'0.75rem',marginBottom:12}}>{sendSuccess}</div>}
          <button className={styles.searchBtn} style={{width:'100%',padding:'13px'}} onClick={handleSend} disabled={sendLoading||!sendTo||!sendAmount}>{sendLoading?'⏳ Processing...':`📤 Send ${sendChain} · FREE ⚡`}</button>
        </div>}
        {sendTab==='receive'&&<div style={{textAlign:'center'}}>
          <div style={{marginBottom:12,display:'flex',gap:6,justifyContent:'center'}}>
            <button onClick={()=>setSendChain('ETH')} style={{padding:'8px 14px',border:'1px solid',borderColor:sendChain!=='SOL'?'var(--cyan)':'var(--border)',borderRadius:8,background:sendChain!=='SOL'?'var(--cyan-glow)':'var(--bg3)',color:sendChain!=='SOL'?'var(--cyan)':'var(--text-muted)',...s.mono,fontSize:'0.75rem',fontWeight:700,cursor:'pointer'}}>🌍 ETH/ARB/MON</button>
            <button onClick={()=>setSendChain('SOL')} style={{padding:'8px 14px',border:'1px solid',borderColor:sendChain==='SOL'?'#9945ff':'var(--border)',borderRadius:8,background:sendChain==='SOL'?'#9945ff15':'var(--bg3)',color:sendChain==='SOL'?'#9945ff':'var(--text-muted)',...s.mono,fontSize:'0.75rem',fontWeight:700,cursor:'pointer'}}>🌟 SOL</button>
          </div>
          {sendChain!=='SOL'?
          <div style={{marginBottom:16}}><div style={{...s.label,marginBottom:8}}>ETH / ARB / MON</div><div style={{padding:'14px',background:'var(--bg2)',border:'1px solid var(--border-bright)',borderRadius:10,fontSize:'0.72rem',...s.cyan,wordBreak:'break-all',...s.mono,lineHeight:1.6}}>{user?.address||''}</div><button onClick={()=>navigator.clipboard.writeText(user?.address||'')} style={{marginTop:10,padding:'10px 20px',background:'var(--bg3)',border:'1px solid var(--border-bright)',borderRadius:8,...s.cyan,...s.mono,fontSize:'0.8rem',cursor:'pointer'}}>📋 Copy ETH</button></div>
          :
          <div style={{marginBottom:16}}><div style={{...s.label,marginBottom:8}}>SOLANA</div><div style={{padding:'14px',background:'var(--bg2)',border:'1px solid rgba(153,69,255,0.4)',borderRadius:10,fontSize:'0.72rem',color:'#9945ff',wordBreak:'break-all',...s.mono,lineHeight:1.6}}>{SOL_WALLET}</div><button onClick={()=>navigator.clipboard.writeText(SOL_WALLET)} style={{marginTop:10,padding:'10px 20px',background:'var(--bg3)',border:'1px solid rgba(153,69,255,0.4)',borderRadius:8,color:'#9945ff',...s.mono,fontSize:'0.8rem',cursor:'pointer'}}>📋 Copy SOL</button></div>
          }
        </div>}
      </div></div>}

      {dappOpen&&<div className={styles.searchOverlay}><div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,width:'100%',maxWidth:600,margin:'auto',marginTop:20,padding:0,overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 14px',background:'var(--bg3)',borderBottom:'1px solid var(--border)'}}>
          <input value={dappUrl} onChange={e=>setDappUrl(e.target.value)} style={{flex:1,padding:'8px 10px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,...s.mono,color:'var(--text)',fontSize:'0.75rem'}} placeholder="https://"/>
          <button onClick={()=>setDappOpen(false)} style={{padding:'6px 10px',background:'rgba(255,68,102,0.1)',border:'1px solid rgba(255,68,102,0.2)',borderRadius:6,color:'#ff4466',cursor:'pointer'}}>✕</button>
        </div>
        {(!iframeError) ? <iframe src={dappUrl.startsWith('https://')?dappUrl:'about:blank'} style={{width:'100%',height:'70vh',border:'none'}} sandbox="allow-scripts allow-same-origin allow-forms allow-popups" title="DApp" onLoad={()=>setDappLoaded(true)}/> : <div style={{width:'100%',height:'70vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16,padding:20,textAlign:'center'}}><span style={{fontSize:'0.85rem',color:'var(--text-muted)'}}>ഈ site iframe-ൽ open ചെയ്യാൻ അനുവദിക്കുന്നില്ല</span><a href={dappUrl} target="_blank" rel="noopener noreferrer" style={{padding:'12px 20px',background:'var(--cyan-glow)',border:'1px solid var(--cyan)',borderRadius:8,color:'var(--cyan)',textDecoration:'none',fontSize:'0.8rem'}}>Open in Browser →</a></div>}
      </div></div>}

      <main className={styles.main}>
        {bottomTab==='home'&&<div>
          <section className={styles.walletCard+' fade-up-1'}>
            <div className={styles.walletTop}><div><div className={styles.walletLabel}>{walletLabel}</div><div className={styles.walletAddr}>{fmtAddr(user?.address||'')}<button className={styles.copyBtn} onClick={()=>navigator.clipboard.writeText(user?.address||'')}>📋</button></div>{user?.email&&<div className={styles.walletEmail}>{user.email}</div>}</div><div className={styles.walletTotal}><div className={styles.totalLabel}>TOTAL PORTFOLIO</div><div className={styles.totalAmount}>{portfolioTotal>0?fmt(portfolioTotal):<span className={styles.loading}>$···</span>}</div></div></div>
            <div className={styles.goalSection}><div className={styles.goalRow}><span className={styles.goalLabel}></span><span className={styles.goalPct}>{goalPct.toFixed(4)}%</span></div><div className={styles.goalBar}><div className={styles.goalFill} style={{width:Math.max(goalPct,0.1)+'%'}}/></div></div>
            <div style={{display:'flex',gap:4,marginTop:12,flexWrap:'wrap'}}>{CHAIN_DOTS.map(c=><div key={c.id} style={{display:'flex',alignItems:'center',gap:4,padding:'3px 8px',borderRadius:12,background:'var(--bg3)',border:`1px solid ${c.c}22`,fontSize:'0.62rem',...s.mono}}><span>{c.label}</span><span style={{width:5,height:5,borderRadius:'50%',background:chainStatus[c.id]==='online'?'#00ff88':chainStatus[c.id]==='offline'?'#ff4466':'#888',display:'inline-block'}}/></div>)}</div>
          </section>
          <section className={styles.emoSection+' fade-up-2'}><div className={styles.emoCard}><span className={styles.emoIcon}>🪙</span><div><div className={styles.emoTitle}>EMOCOINS</div><div className={styles.emoBalance}>{emoBalance} EMC</div></div><div className={styles.emoRight}><div className={styles.emoPrice}>1 EMC = $0.01</div><button className={styles.claimBtn} disabled={emoClaiming || !!emoNextClaimAt} onClick={claimEmoCoin} style={{opacity:(emoClaiming||emoNextClaimAt)?0.5:1}}>{emoClaiming?'Claiming...':emoNextClaimAt?'Claimed':'+ Daily Claim'}</button>{emoClaimMsg&&<div style={{fontSize:'0.6rem',marginTop:4}}>{emoClaimMsg}</div>}</div></div></section>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:16}}><button onClick={()=>{setSendOpen(true);setSendTab('send')}} style={{padding:'14px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,...s.cyan,...s.mono,fontSize:'0.82rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>📤 Send</button><button onClick={()=>{setSendOpen(true);setSendTab('receive')}} style={{padding:'14px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,color:'#9945ff',...s.mono,fontSize:'0.82rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>📥 Receive</button><button onClick={()=>{window.location.href='/withdraw-eth'}} style={{padding:'14px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,color:'#c084fc',...s.mono,fontSize:'0.82rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>🏦 Withdraw</button></div>
          <div style={{...s.label,marginBottom:8}}>TOP HOLDINGS</div>
          {TOKENS.filter(t=>['ETH','SOL','ARB','MON','BASE','EMC'].includes(t.symbol)).map(token=>{const p=prices[token.symbol],bal=token.symbol==='ETH'?walletData?.ethBalance||0:token.symbol==='SOL'?walletData?.solBalance||0:token.symbol==='ARB'?walletData?.arbBalance||0:token.symbol==='MON'?walletData?.monadBalance||0:token.symbol==='BASE'?walletData?.baseBalance||0:token.symbol==='EMC'?emoBalance:0;return <div key={token.symbol} onClick={()=>{setBottomTab('markets');setMarketsTab('charts');setChartToken(token.symbol);fetchChart(token.symbol,chartDays)}}  style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:10,marginBottom:8,cursor:'pointer',WebkitTapHighlightColor:'rgba(0,0,0,0)',touchAction:'manipulation'}}><div style={{display:'flex',alignItems:'center',gap:10}}><div style={{width:8,height:8,borderRadius:'50%',background:token.color}}/><div><div style={{fontSize:'0.82rem',color:'var(--text)',...s.mono,fontWeight:700}}>{token.symbol}</div><div style={{fontSize:'0.62rem',...s.muted}}>{token.chain}</div></div></div><div style={{textAlign:'right'}}><div style={{fontSize:'0.82rem',color:'var(--text)',...s.mono}}>{p?'$'+p.price.toLocaleString('en',{minimumFractionDigits:2,maximumFractionDigits:2}):<span style={s.muted}>$···</span>}</div>{p&&<div style={{fontSize:'0.65rem',color:p.change24h>=0?'#00ff88':'#ff4466'}}>{p.change24h>=0?'▲':'▼'} {Math.abs(p.change24h).toFixed(2)}%</div>}{bal>0&&<div style={{fontSize:'0.62rem',...s.muted}}>{bal.toFixed(4)} {token.symbol}</div>}</div></div>})}
        </div>}

        {bottomTab==='trade'&&<div>
          <div style={{marginBottom:12}}>
            
            <button
  onClick={() => { import('./context/wallet').then(m => { m.initAppKit().then((kit:any) => kit?.open()) }) }}
  style={{width:'100%',padding:'14px',background:'linear-gradient(135deg,#FF5500,#ff8844)',border:'none',borderRadius:10,color:'#fff',fontFamily:'monospace',fontSize:'0.9rem',fontWeight:700,cursor:'pointer',marginBottom:4}}
>
  🔗 Connect Wallet
</button>
          </div>
          <div style={{display:'flex',gap:6,marginBottom:16}}>
            {(['swap','bridge'] as const).map(t=><button key={t} onClick={()=>setTradeTab(t)} style={{flex:1,padding:'10px',border:'1px solid',borderColor:tradeTab===t?'var(--cyan)':'var(--border)',borderRadius:8,background:tradeTab===t?'var(--cyan-glow)':'var(--bg2)',color:tradeTab===t?'var(--cyan)':'var(--text-muted)',...s.mono,fontSize:'0.75rem',cursor:'pointer'}}>{t==='swap'?'🔄 Swap':'🌉 Bridge'}</button>)}
            <button onClick={()=>{setSendOpen(true);setSendTab('send')}} style={{flex:1,padding:'10px',border:'1px solid var(--border)',borderRadius:8,background:'var(--bg2)',color:'var(--text-muted)',...s.mono,fontSize:'0.75rem',cursor:'pointer'}}>📤 Send</button>
            <button onClick={()=>{setSendOpen(true);setSendTab('receive')}} style={{flex:1,padding:'10px',border:'1px solid var(--border)',borderRadius:8,background:'var(--bg2)',color:'var(--text-muted)',...s.mono,fontSize:'0.75rem',cursor:'pointer'}}>📥 Rcv</button>
          </div>
          {tradeTab==='bridge'&&<div>
            <div style={s.card}>
              <div style={s.label}>FROM</div>
              <div style={{display:'flex',gap:8,marginBottom:8}}>
                <select value={bridge.fromChain} onChange={e=>setBridge(p=>({...p,fromChain:e.target.value,estimatedOut:'',success:''}))} style={{flex:1,padding:'10px',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',...s.mono,fontSize:'0.82rem'}}>
                  {['ETH','ARB','BNB','POL'].map(ch=><option key={ch}>{ch}</option>)}
                </select>
                <select value={bridge.fromToken} onChange={e=>setBridge(p=>({...p,fromToken:e.target.value,estimatedOut:'',success:''}))} style={{flex:1,padding:'10px',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',...s.mono,fontSize:'0.82rem'}}>
                  {['ETH','USDC','USDT'].map(tk=><option key={tk}>{tk}</option>)}
                </select>
              </div>
              <input type="number" placeholder="0.00" value={bridge.amount} onChange={e=>setBridge(p=>({...p,amount:e.target.value,estimatedOut:'',success:''}))} style={{width:'100%',padding:'10px',background:'var(--bg3)',border:'1px solid var(--border-bright)',borderRadius:8,color:'var(--text)',...s.mono,fontSize:'1rem',boxSizing:'border-box'}}/>
            </div>
            <div style={{textAlign:'center',margin:'8px 0',fontSize:'1.4rem'}}>🌉</div>
            <div style={s.card}>
              <div style={s.label}>TO</div>
              <div style={{display:'flex',gap:8,marginBottom:8}}>
                <select value={bridge.toChain} onChange={e=>setBridge(p=>({...p,toChain:e.target.value,estimatedOut:'',success:''}))} style={{flex:1,padding:'10px',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',...s.mono,fontSize:'0.82rem'}}>
                  {['ETH','ARB','BNB','POL'].filter(ch=>ch!==bridge.fromChain).map(ch=><option key={ch}>{ch}</option>)}
                </select>
                <select value={bridge.toToken} onChange={e=>setBridge(p=>({...p,toToken:e.target.value,estimatedOut:'',success:''}))} style={{flex:1,padding:'10px',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',...s.mono,fontSize:'0.82rem'}}>
                  {['ETH','USDC','USDT'].map(tk=><option key={tk}>{tk}</option>)}
                </select>
              </div>
              <div style={{padding:'10px',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:8,color:bridge.estimatedOut?'#00ff88':'var(--text-muted)',...s.mono,fontSize:'1rem',minHeight:42}}>{bridge.estimatedOut||'0.00'}</div>
            </div>
            {bridge.estimatedOut&&<div style={{...s.card,marginBottom:12,fontSize:'0.7rem',...s.mono}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={s.muted}>Bridge</span><span style={s.cyan}>{bridge.bridge}</span></div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={s.muted}>Time</span><span style={{color:'#ffd700'}}>{bridge.estimatedTime}</span></div>
              <div style={{display:'flex',justifyContent:'space-between'}}><span style={s.muted}>Fees</span><span style={{color:'#00ff88'}}>${bridge.feesUsd}</span></div>
            </div>}
            {bridge.error&&<div style={{padding:'10px',background:'rgba(255,68,102,0.08)',border:'1px solid rgba(255,68,102,0.2)',borderRadius:8,color:'#ff4466',fontSize:'0.75rem',marginBottom:12}}>{bridge.error}</div>}
            {bridge.success&&<div style={{padding:'10px',background:'rgba(0,255,136,0.05)',border:'1px solid rgba(0,255,136,0.2)',borderRadius:8,color:'#00ff88',fontSize:'0.72rem',marginBottom:12,wordBreak:'break-word'}}>{bridge.success}</div>}
            <button onClick={handleBridgeQuote} disabled={bridge.loading||!bridge.amount} style={{width:'100%',padding:'14px',background:bridge.loading||!bridge.amount?'var(--bg3)':'linear-gradient(135deg,#f7931a,#9945ff)',border:'none',borderRadius:10,color:'#fff',...s.mono,fontSize:'0.9rem',fontWeight:700,cursor:bridge.loading||!bridge.amount?'not-allowed':'pointer'}}>{bridge.loading?'Finding Route...':'🌉 Get Bridge Quote'}</button>
            <div style={{textAlign:'center',fontSize:'0.62rem',...s.muted,marginTop:10}}>Powered by LI.FI · TheWall 🦋</div>
          </div>}
          {tradeTab==='swap'&&<div>
          <div style={s.card}><div style={s.label}>FROM</div><div style={{display:'flex',gap:8,alignItems:'center'}}><select value={swap.fromToken} onChange={e=>setSwap(p=>({...p,fromToken:e.target.value,toToken:e.target.value===p.toToken?SWAP_TOKENS.filter(t=>t!==e.target.value)[0]:p.toToken,estimatedOut:''}))} style={{flex:1,padding:'10px',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',...s.mono,fontSize:'0.82rem',cursor:'pointer'}}>{SWAP_TOKENS.map(t=><option key={t} value={t}>{t}</option>)}</select><input type="number" placeholder="0.00" value={swap.amount} onChange={e=>setSwap(p=>({...p,amount:e.target.value}))} style={{flex:1.5,padding:'10px',background:'var(--bg3)',border:'1px solid var(--border-bright)',borderRadius:8,color:'var(--text)',...s.mono,fontSize:'1rem'}}/></div>{swap.amount&&prices[swap.fromToken]&&<div style={{fontSize:'0.68rem',...s.muted,marginTop:6}}>≈ ${(parseFloat(swap.amount)*(prices[swap.fromToken]?.price||0)).toFixed(2)}</div>}</div>
          <div style={{textAlign:'center',margin:'4px 0'}}><button onClick={()=>setSwap(p=>({...p,fromToken:p.toToken,toToken:p.fromToken,estimatedOut:'',amount:''}))} style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:'50%',width:36,height:36,...s.cyan,fontSize:'1rem',cursor:'pointer'}}>⇅</button></div>
          <div style={{...s.card,marginBottom:16}}><div style={s.label}>TO</div><div style={{display:'flex',gap:8,alignItems:'center'}}><select value={swap.toToken} onChange={e=>setSwap(p=>({...p,toToken:e.target.value,estimatedOut:''}))} style={{flex:1,padding:'10px',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',...s.mono,fontSize:'0.82rem',cursor:'pointer'}}>{SWAP_TOKENS.filter(t=>t!==swap.fromToken).map(t=><option key={t} value={t}>{t}</option>)}</select><div style={{flex:1.5,padding:'10px',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:8,color:swap.estimatedOut?'#00ff88':'var(--text-muted)',...s.mono,fontSize:'1rem',minHeight:42}}>{swap.estimatedOut||'0.00'}</div></div></div>
          {swap.estimatedOut&&<div style={{...s.card,marginBottom:12,fontSize:'0.7rem',...s.mono}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={s.muted}>Route</span><span style={s.cyan}>{swap.route}</span></div><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={s.muted}>Impact</span><span style={{color:swap.priceImpact<1?'#00ff88':'#ff4466'}}>{swap.priceImpact.toFixed(2)}%</span></div><div style={{display:'flex',justifyContent:'space-between'}}><span style={s.muted}>Gas</span><span style={{color:'#00ff88'}}>FREE ⚡</span></div></div>}
          {swap.error&&<div style={{padding:'10px',background:'rgba(255,68,102,0.08)',border:'1px solid rgba(255,68,102,0.2)',borderRadius:8,color:'#ff4466',fontSize:'0.75rem',marginBottom:12}}>⚠ {swap.error}</div>}
          {swap.success&&<div style={{padding:'10px',background:'rgba(0,255,136,0.05)',border:'1px solid rgba(0,255,136,0.2)',borderRadius:8,color:'#00ff88',fontSize:'0.75rem',marginBottom:12}}>{swap.success}</div>}
          <button onClick={handleSwap} disabled={swap.loading||!swap.amount||swap.simStatus==='simulating'||swap.simStatus==='fail'} style={{width:'100%',padding:'14px',background:swap.loading||!swap.amount?'var(--bg3)':swap.simStatus==='fail'?'#ff4466':swap.simStatus==='ok'?'linear-gradient(135deg,#00cc66,#00ff88)':'linear-gradient(135deg,#627eea,#9945ff)',border:'none',borderRadius:10,color:'#fff',...s.mono,fontSize:'0.9rem',fontWeight:700,cursor:swap.loading||!swap.amount||swap.simStatus==='fail'?'not-allowed':'pointer'}}>{swap.loading?'⏳ Getting quote...':swap.simStatus==='simulating'?'🔍 Simulating...':swap.simStatus==='ok'?`✅ Verified — Swap ${swap.fromToken} to ${swap.toToken}`:swap.simStatus==='fail'?'⚠️ Simulation failed':swap.simStatus==='nowallet'?'🔗 Connect wallet to verify':`🔄 Swap ${swap.fromToken} to ${swap.toToken}`}</button>
          {swap.simStatus==='fail'&&swap.simError&&<div style={{padding:'10px',background:'rgba(255,68,102,0.08)',border:'1px solid rgba(255,68,102,0.2)',borderRadius:8,color:'#ff4466',fontSize:'0.75rem',marginTop:8}}>⚠️ {swap.simError}</div>}
          {swap.simStatus==='nowallet'&&<div style={{padding:'10px',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text-muted)',fontSize:'0.72rem',marginTop:8}}>Connect your wallet to verify this swap before sending it.</div>}
          <div style={{textAlign:'center',fontSize:'0.62rem',...s.muted,marginTop:10}}>UniSwap V3 · Gasless ⚡ · TheWall Universal 🦋</div>
            <div style={{...s.card,border:`1px solid ${isPremium?'rgba(0,255,136,0.3)':'var(--border)'}`,background:isPremium?'rgba(0,255,136,0.04)':'var(--bg2)'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:isPremium?8:12}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>{isPremium?<span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'3px 10px',borderRadius:999,background:'linear-gradient(135deg, rgba(0,255,136,0.18), rgba(0,204,102,0.10))',border:'1px solid rgba(0,255,136,0.4)',color:'#00ff88',...s.mono,fontSize:'0.7rem',fontWeight:700,letterSpacing:'0.02em',boxShadow:'0 0 8px rgba(0,255,136,0.15)'}}><span style={{fontSize:'0.7rem'}}>⭐</span>PREMIUM</span>:<span style={{fontSize:'0.82rem',...s.mono,color:'var(--text)',fontWeight:700}}>Free Plan</span>}</div>
                {!isPremium&&<span style={{fontSize:'0.62rem',...s.muted}}>500 EMC/mo</span>}
              </div>
              {isPremium?<div style={{fontSize:'0.68rem',color:'#00ff88',...s.mono,marginBottom:8}}>Ad-free · 6hr claim cooldown{premiumExpiresAt?` · Renews ${new Date(premiumExpiresAt).toLocaleDateString()}`:''}</div>:<div style={{fontSize:'0.68rem',...s.muted,...s.mono,marginBottom:10,lineHeight:1.5}}>Go ad-free and cut your daily claim cooldown from 24hr to 6hr.</div>}
              {!isPremium&&<button onClick={buyPremium} disabled={premiumLoading||!user?.address} style={{width:'100%',padding:'10px',background:premiumLoading||!user?.address?'var(--bg3)':'linear-gradient(135deg,#00cc66,#00ff88)',border:'none',borderRadius:8,color:premiumLoading||!user?.address?'var(--text-muted)':'#04140b',...s.mono,fontSize:'0.8rem',fontWeight:700,cursor:premiumLoading||!user?.address?'not-allowed':'pointer'}}>{premiumLoading?'Processing...':'⭐ Upgrade to Premium — ₹210/mo'}</button>}
              {premiumMsg&&<div style={{fontSize:'0.65rem',marginTop:8,color:isPremium?'#00ff88':'#ff4466',...s.mono}}>{premiumMsg}</div>}
            </div>

            <div style={{...s.card,marginTop:12,border:'1px solid rgba(255,61,61,0.35)',background:'linear-gradient(135deg, rgba(255,61,61,0.08), rgba(255,214,0,0.05))',boxShadow:'0 0 16px rgba(255,180,0,0.08)'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                <span style={{fontSize:'1.1rem'}}>🔥</span>
                <span style={{fontSize:'0.82rem',...s.mono,fontWeight:700,background:'linear-gradient(90deg,#ff3d3d,#ffd600)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Buy Emo Coins</span>
              </div>
              <div style={{fontSize:'0.68rem',...s.muted,marginBottom:10}}>1 EMC = ₹10. Instant top-up via Razorpay.</div>
              <div style={{display:'flex',gap:8,marginBottom:10}}>
                <input
                  type="number"
                  min={10}
                  step={10}
                  value={emcBuyAmount}
                  onChange={(e)=>setEmcBuyAmount(Math.max(10, parseInt(e.target.value)||0))}
                  style={{flex:1,padding:'10px',borderRadius:8,border:'1px solid rgba(255,214,0,0.35)',background:'var(--bg2)',color:'#ffd600',...s.mono,fontSize:'0.85rem',fontWeight:700}}
                />
                <div style={{display:'flex',alignItems:'center',padding:'0 12px',borderRadius:8,border:'1px solid rgba(255,61,61,0.25)',background:'var(--bg2)',...s.mono,fontSize:'0.78rem',color:'var(--text-muted)'}}>₹{emcBuyAmount*10}</div>
              </div>
              <button onClick={buyEmc} disabled={emcBuyLoading||!user?.address} style={{width:'100%',padding:'10px',background:emcBuyLoading||!user?.address?'var(--bg3)':'linear-gradient(135deg,#ff3d3d,#ffd600)',border:'none',borderRadius:8,color:emcBuyLoading||!user?.address?'var(--text-muted)':'#1a0a00',...s.mono,fontSize:'0.8rem',fontWeight:700,cursor:emcBuyLoading||!user?.address?'not-allowed':'pointer'}}>{emcBuyLoading?'Processing...':`🔥 Buy ${emcBuyAmount} EMC`}</button>
              {emcBuyMsg&&<div style={{fontSize:'0.65rem',marginTop:8,color:emcBuyMsg.startsWith('✅')?'#00ff88':'#ff4466',...s.mono}}>{emcBuyMsg}</div>}
            </div>
          </div>}
        </div>}

        {bottomTab==='markets'&&<div>
          <div style={{display:'flex',gap:8,marginBottom:16}}>{(['charts','news','alerts']as const).map(t=><button key={t} onClick={()=>setMarketsTab(t)} style={{flex:1,padding:'10px',border:'1px solid',borderColor:marketsTab===t?'var(--cyan)':'var(--border)',borderRadius:8,background:marketsTab===t?'var(--cyan-glow)':'var(--bg2)',color:marketsTab===t?'var(--cyan)':'var(--text-muted)',...s.mono,fontSize:'0.72rem',cursor:'pointer'}}>{t==='charts'?'📊 Charts':t==='news'?'📰 News':'🔔 Alerts'}</button>)}</div>
          {marketsTab==='charts'&&<div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:12}}>{['ETH','SOL','ARB','BTC','BNB'].map(sym=>{const token=TOKENS.find(t=>t.symbol===sym);return <button key={sym} onClick={()=>setChartToken(sym)} style={{padding:'6px 12px',border:'1px solid',borderColor:chartToken===sym?token?.color||'var(--cyan)':'var(--border)',borderRadius:20,background:chartToken===sym?`${token?.color||'#00e5ff'}15`:'var(--bg2)',color:chartToken===sym?token?.color||'var(--cyan)':'var(--text-muted)',...s.mono,fontSize:'0.72rem',cursor:'pointer'}}>{sym}</button>})}</div>
            <div style={{display:'flex',gap:6,marginBottom:12}}>{[{v:'1',l:'1D'},{v:'7',l:'7D'},{v:'30',l:'1M'},{v:'90',l:'3M'},{v:'365',l:'1Y'}].map(d=><button key={d.v} onClick={()=>setChartDays(d.v)} style={{flex:1,padding:'6px',border:'1px solid',borderColor:chartDays===d.v?'var(--cyan)':'var(--border)',borderRadius:6,background:chartDays===d.v?'var(--cyan-glow)':'var(--bg2)',color:chartDays===d.v?'var(--cyan)':'var(--text-muted)',...s.mono,fontSize:'0.68rem',cursor:'pointer'}}>{d.l}</button>)}</div>
            <div style={{display:'flex',alignItems:'baseline',gap:12,marginBottom:8}}><div style={{fontSize:'1.4rem',...s.mono,color:'var(--text)',fontWeight:700}}>{prices[chartToken]?'$'+prices[chartToken].price.toLocaleString('en',{minimumFractionDigits:2}):'$···'}</div>{prices[chartToken]&&<div style={{fontSize:'0.82rem',color:prices[chartToken].change24h>=0?'#00ff88':'#ff4466'}}>{prices[chartToken].change24h>=0?'▲':'▼'} {Math.abs(prices[chartToken].change24h).toFixed(2)}% (24h)</div>}</div>
            <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,padding:8,marginBottom:12,position:'relative'}}>
              {chartLoading&&<div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.5)',borderRadius:12,zIndex:1}}><div className={styles.spinner}/></div>}
              <canvas ref={canvasRef} width={340} height={160} style={{width:'100%',height:160,display:'block'}}/>
              {!chartData.length&&!chartLoading&&<div style={{textAlign:'center',fontSize:'0.72rem',...s.muted,padding:20}}>No chart data</div>}
            </div>
            <div style={{...s.label,marginBottom:8}}>ALL ASSETS</div>
            {TOKENS.map(token=>{const p=prices[token.symbol];return <div key={token.symbol} onClick={()=>setChartToken(token.symbol)}  style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 12px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,marginBottom:6,cursor:'pointer',WebkitTapHighlightColor:'rgba(0,0,0,0)',touchAction:'manipulation'}}><div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:6,height:6,borderRadius:'50%',background:token.color}}/><span style={{fontSize:'0.78rem',...s.mono,color:'var(--text)',fontWeight:700}}>{token.symbol}</span><span style={{fontSize:'0.6rem',...s.muted}}>{token.chain}</span></div><div style={{textAlign:'right'}}><div style={{fontSize:'0.78rem',...s.mono}}>{p?'$'+p.price.toLocaleString('en',{minimumFractionDigits:2}):<span style={s.muted}>$···</span>}</div>{p&&<div style={{fontSize:'0.62rem',color:p.change24h>=0?'#00ff88':'#ff4466'}}>{p.change24h>=0?'▲':'▼'}{Math.abs(p.change24h).toFixed(2)}%</div>}</div></div>})}
          </div>}
          {marketsTab==='news'&&<div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}><div style={{...s.label,marginBottom:0}}>CRYPTO NEWS</div><button onClick={fetchNews} style={{padding:'4px 10px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,...s.cyan,...s.mono,fontSize:'0.65rem',cursor:'pointer'}}>↻ Refresh</button></div>
            {newsLoading&&<div style={{display:'flex',justifyContent:'center',padding:24}}><div className={styles.spinner}/></div>}
            {!newsLoading&&news.length===0&&<div style={{textAlign:'center',padding:24,fontSize:'0.75rem',...s.muted}}>No news available.</div>}
            {news.map((item,i)=><div key={i} style={{...s.card,padding:12,marginBottom:8,cursor:'pointer'}} onClick={()=>window.open(item.url,'_blank')}>
              <div style={{fontSize:'0.75rem',color:'var(--text)',lineHeight:1.5,marginBottom:6}}>{item.title}</div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{item.currencies.slice(0,3).map(c=><span key={c} style={{fontSize:'0.6rem',padding:'2px 6px',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:10,...s.mono,...s.cyan}}>{c}</span>)}</div><div style={{fontSize:'0.6rem',...s.muted}}>{item.source}</div></div>
              <div style={{display:'flex',gap:8,marginTop:6,fontSize:'0.62rem'}}><span style={{color:'#00ff88'}}>▲ {item.positive}</span><span style={{color:'#ff4466'}}>▼ {item.negative}</span><span style={s.muted}>{new Date(item.published).toLocaleDateString()}</span></div>
            </div>)}
          </div>}
          {marketsTab==='alerts'&&<div>
            <div style={s.card}>
              <div style={{...s.label,marginBottom:12}}>CREATE PRICE ALERT 🔔</div>
              <div style={{display:'flex',gap:8,marginBottom:10}}><select value={alertSymbol} onChange={e=>setAlertSymbol(e.target.value)} style={{flex:1,padding:'10px',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',...s.mono,fontSize:'0.82rem',cursor:'pointer'}}>{TOKENS.filter(t=>t.cgId).map(t=><option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}</select><select value={alertCondition} onChange={e=>setAlertCondition(e.target.value as 'above'|'below')} style={{flex:1,padding:'10px',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',...s.mono,fontSize:'0.82rem',cursor:'pointer'}}><option value="above">Above ▲</option><option value="below">Below ▼</option></select></div>
              <input type="number" placeholder="Target price USD" value={alertPrice} onChange={e=>setAlertPrice(e.target.value)} style={{width:'100%',padding:'10px',background:'var(--bg3)',border:'1px solid var(--border-bright)',borderRadius:8,color:'var(--text)',...s.mono,fontSize:'0.9rem',marginBottom:10}}/>
              <div style={{fontSize:'0.65rem',...s.muted,marginBottom:10}}>Current {alertSymbol}: {prices[alertSymbol]?'$'+prices[alertSymbol].price.toLocaleString('en',{minimumFractionDigits:2}):'$···'}</div>
              <button onClick={addAlert} disabled={!alertPrice} style={{width:'100%',padding:'12px',background:'linear-gradient(135deg,#627eea,#9945ff)',border:'none',borderRadius:8,color:'#fff',...s.mono,fontSize:'0.85rem',fontWeight:700,cursor:alertPrice?'pointer':'not-allowed',opacity:alertPrice?1:0.5}}>🔔 Set Alert</button>
            </div>
            {alerts.map(alert=><div key={alert.id} style={{...s.card,padding:12,marginBottom:8,borderColor:alert.triggered?'rgba(0,255,136,0.3)':'var(--border)',background:alert.triggered?'rgba(0,255,136,0.03)':'var(--bg2)'}}><div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}><div><div style={{fontSize:'0.78rem',...s.mono,color:'var(--text)',fontWeight:700}}>{alert.symbol} {alert.condition==='above'?'▲':'▼'} ${alert.targetPrice.toLocaleString()}</div><div style={{fontSize:'0.62rem',...s.muted,marginTop:2}}>{alert.triggered?'✅ Triggered!':'⏳ Watching...'}</div></div><button onClick={()=>setAlerts(p=>p.filter(a=>a.id!==alert.id))} style={{padding:'4px 8px',background:'rgba(255,68,102,0.1)',border:'1px solid rgba(255,68,102,0.2)',borderRadius:6,color:'#ff4466',fontSize:'0.65rem',cursor:'pointer'}}>✕</button></div></div>)}
            {alerts.length===0&&<div style={{textAlign:'center',padding:24,fontSize:'0.75rem',...s.muted}}>No alerts. Create one above! 🔔</div>}
          </div>}
        </div>}

        {bottomTab==='settings'&&<div>
          <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>{(['profile','security','history','assets','dapps']as const).map(t=><button key={t} onClick={()=>setSettingsTab(t)} style={{flex:1,padding:'9px',border:'1px solid',borderColor:settingsTab===t?'var(--cyan)':'var(--border)',borderRadius:8,background:settingsTab===t?'var(--cyan-glow)':'var(--bg2)',color:settingsTab===t?'var(--cyan)':'var(--text-muted)',...s.mono,fontSize:'0.68rem',cursor:'pointer',minWidth:60}}>{t==='profile'?'👤':t==='security'?'🔐':t==='history'?'💳':t==='assets'?'💎':'🌐'} {t}</button>)}</div>
          {settingsTab==='profile'&&<div style={{position:'relative',zIndex:10000}}>
            <div style={{...s.card,textAlign:'center'}}><div style={{fontSize:'3rem',marginBottom:8}}>🦋</div><div style={{fontSize:'0.68rem',...s.muted,marginBottom:12}}>{user?.address?(user?.type==='smart'?'Smart Wallet · TOTP 🔢':'External Wallet'):'Not Connected'}</div><div style={{padding:'10px',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:8,fontSize:'0.7rem',...s.mono,...s.cyan,wordBreak:'break-all'}}>{user?.address||'No wallet connected'}</div>{user?.address&&<button onClick={()=>navigator.clipboard.writeText(user.address)} style={{marginTop:8,padding:'8px 16px',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:6,...s.cyan,...s.mono,fontSize:'0.72rem',cursor:'pointer'}}>📋 Copy Address</button>}

<div style={{marginTop:16,paddingTop:16,borderTop:'1px solid var(--border)'}}>
<div style={{fontSize:'0.68rem',...s.muted,marginBottom:8}}>🌟 Your Solana Address (for balance tracking)</div>
{user?.solAddress?
<div style={{padding:'10px',background:'var(--bg3)',border:'1px solid rgba(153,69,255,0.4)',borderRadius:8,fontSize:'0.7rem',...s.mono,color:'#9945ff',wordBreak:'break-all'}}>{user.solAddress}</div>
:
<div style={{display:'flex',gap:6}}>
<input type="text" value={solAddrInput} onChange={e=>setSolAddrInput(e.target.value)} placeholder="Paste your Phantom/Solana address" style={{flex:1,padding:'8px 10px',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:6,color:'var(--text)',...s.mono,fontSize:'0.7rem'}}/>
<button onClick={()=>{if(solAddrInput.trim().length>=32){localStorage.setItem('solAddress',solAddrInput.trim());setUser(u=>u?{...u,solAddress:solAddrInput.trim()}:u);setSolAddrInput('')}}} style={{padding:'8px 14px',background:'#9945ff',border:'none',borderRadius:6,color:'#fff',...s.mono,fontSize:'0.7rem',fontWeight:700,cursor:'pointer'}}>Save</button>
</div>
}
</div>
</div>
            <div style={s.card}><div style={{...s.label,marginBottom:12}}>WALLET STATS</div>{[{label:'Portfolio',value:fmt(portfolioTotal)},{label:'EmoCoins',value:EMOCOIN.balance+' EMC'},{label:'Goal',value:goalPct.toFixed(4)+'%'},{label:'Active Alerts',value:alerts.filter(a=>!a.triggered).length.toString()},{label:'Address Book',value:addressBook.length.toString()}].map(stat=><div key={stat.label} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid var(--border)'}}><span style={{fontSize:'0.72rem',...s.muted}}>{stat.label}</span><span style={{fontSize:'0.72rem',...s.mono,color:'var(--text)',fontWeight:700}}>{stat.value}</span></div>)}</div>
            <div style={{...s.card,marginBottom:16}}><div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}><span style={{fontSize:'1.3rem'}}>🎁</span><div style={{...s.label}}>INVITE & EARN</div></div><div style={{fontSize:'0.75rem',color:'var(--text-muted)',...s.mono,marginBottom:10,lineHeight:1.5}}>Share your link — you get <span style={{color:'var(--cyan)'}}>+50 EMC</span>, your friend gets <span style={{color:'var(--cyan)'}}>+20 EMC</span> bonus on their first claim.</div><div style={{padding:'10px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,fontSize:'0.7rem',...s.mono,wordBreak:'break-all',color:'var(--text)',marginBottom:10}}>{user?.address?`https://thewall-web3.e-mobies.com/?ref=${user.address}`:'Connect wallet to get your link'}</div><button onClick={()=>{if(user?.address){navigator.clipboard.writeText(`https://thewall-web3.e-mobies.com/?ref=${user.address}`);if(navigator.share){navigator.share({title:'Join TheWall',text:'Join me on TheWall — the gasless Web3 wallet!',url:`https://thewall-web3.e-mobies.com/?ref=${user.address}`}).catch(()=>{})}}}} style={{width:'100%',padding:'10px',background:'var(--cyan-glow)',border:'1px solid var(--cyan)',borderRadius:8,color:'var(--cyan)',...s.mono,fontSize:'0.8rem',cursor:'pointer',fontWeight:700}}>🔗 Copy & Share Invite Link</button></div>
<div style={{...s.label,marginBottom:8}}>TREASURY</div>
            <div className={styles.treasuryCard}><div className={styles.treasuryIcon}>🏛️</div><div><div className={styles.treasuryLabel}>ETH / ARB / MON</div><div className={styles.treasuryAddr}>{TREASURY}</div></div><button className={styles.copyBtn} onClick={()=>navigator.clipboard.writeText(TREASURY)}>📋</button></div>
            <div className={styles.treasuryCard}><div className={styles.treasuryIcon}>🌟</div><div><div className={styles.treasuryLabel}>SOLANA</div><div className={styles.treasuryAddr}>{user?.solAddress || 'Not connected'}</div></div>{user?.solAddress&&<button className={styles.copyBtn} onClick={()=>navigator.clipboard.writeText(user.solAddress!)}>📋</button>}</div>
          </div>}
          {settingsTab==='security'&&<div style={{position:'relative',zIndex:10000}}>
            <div style={{...s.card,border:`1px solid ${frozen?'rgba(0,255,136,0.3)':'rgba(255,68,102,0.2)'}`}}><div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}><div><div style={{fontSize:'0.82rem',...s.mono,color:'var(--text)',fontWeight:700}}>❄️ Freeze Wallet</div><div style={{fontSize:'0.65rem',...s.muted,marginTop:2}}>{frozen?'Wallet is FROZEN':'Emergency lock'}</div></div><button onClick={()=>{if(!pinSet){alert('Set PIN first!');return}setFrozen(!frozen)}} style={{padding:'8px 14px',background:frozen?'rgba(0,255,136,0.1)':'rgba(255,68,102,0.1)',border:`1px solid ${frozen?'rgba(0,255,136,0.3)':'rgba(255,68,102,0.3)'}`,borderRadius:8,color:frozen?'#00ff88':'#ff4466',...s.mono,fontSize:'0.75rem',cursor:'pointer'}}>{frozen?'Unfreeze':'Freeze'}</button></div><div style={{fontSize:'0.62rem',...s.muted}}>Freezing locks all transactions immediately</div></div>
            <div style={s.card}><div style={{...s.label,marginBottom:12}}>🔑 {pinSet?'CHANGE PIN':'SET PIN'}</div><input type="password" maxLength={6} placeholder="6-digit PIN" value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,'').slice(0,6))} style={{width:'100%',padding:'10px',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',...s.mono,fontSize:'1.2rem',letterSpacing:'0.3em',textAlign:'center',marginBottom:10}}/><button onClick={()=>{if(pin.length===6){setPinSet(true);setPinError('');alert('PIN set!')}else setPinError('6 digits needed')}} style={{width:'100%',padding:'10px',background:'var(--cyan-glow)',border:'1px solid var(--cyan)',borderRadius:8,...s.cyan,...s.mono,fontSize:'0.82rem',cursor:'pointer'}}>✅ {pinSet?'Update':'Set'} PIN</button>{pinError&&<div style={{color:'#ff4466',fontSize:'0.68rem',marginTop:6}}>{pinError}</div>}</div>
            <div style={{...s.label,marginBottom:8}}>CHAIN STATUS</div>
            {[{id:'earth',label:'🌍 Earth',chain:'Ethereum',rpc:'eth.llamarpc.com'},{id:'soul',label:'🌟 Soul',chain:'Solana',rpc:'mainnet-beta.solana.com'},{id:'moon',label:'🌙 Moon',chain:'Monad',rpc:'rpc.monad.xyz'},{id:'orbit',label:'🪐 Orbit',chain:'Arbitrum',rpc:'arb1.arbitrum.io'},{id:'birth',label:'₿ Birth',chain:'Bitcoin',rpc:'mempool.space'},{id:'hood',label:'🏹 Hood',chain:'Robinhood Chain',rpc:'rpc.mainnet.chain.robinhood.com'}].map(c=><div key={c.id} onClick={checkChainStatus} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 12px',background:'var(--bg2)',border:`1px solid ${CHAIN_COLORS[c.id]}22`,borderRadius:8,marginBottom:6,cursor:'pointer'}}><div><div style={{fontSize:'0.75rem',color:'var(--text)',...s.mono}}>{c.label}</div><div style={{fontSize:'0.62rem',...s.muted}}>{c.chain} · {c.rpc}</div></div><div style={{display:'flex',alignItems:'center',gap:6}}><span style={{width:7,height:7,borderRadius:'50%',background:chainStatus[c.id]==='online'?'#00ff88':chainStatus[c.id]==='offline'?'#ff4466':'#888',display:'inline-block'}}/><span style={{fontSize:'0.62rem',color:chainStatus[c.id]==='online'?'#00ff88':'var(--text-muted)',...s.mono}}>{chainStatus[c.id]==='online'?'LIVE':chainStatus[c.id]==='offline'?'DOWN':'···'}</span></div></div>)}
            <div className={styles.webhookStatus}><span className={styles.liveDot}/>Alchemy Webhook Active</div>
            <div style={{textAlign:'center',fontSize:'0.62rem',...s.muted,marginTop:8}}>🛡️ CodeQL · Snyk · Semgrep</div>
          </div>}
          {settingsTab==='history'&&<div style={{position:'relative',zIndex:10000}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}><div style={{...s.label,marginBottom:0}}>TX HISTORY</div><button onClick={()=>fetchTxHistory(user?.address||'')} style={{padding:'4px 10px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,...s.cyan,...s.mono,fontSize:'0.65rem',cursor:'pointer'}}>↻</button></div>
            {txLoading&&<div style={{display:'flex',justifyContent:'center',padding:24}}><div className={styles.spinner}/></div>}
            {!txLoading&&txHistory.length===0&&<div style={{textAlign:'center',padding:24,fontSize:'0.75rem',...s.muted}}>No transactions found.</div>}
            {txHistory.map((tx,i)=><div key={i} style={{...s.card,padding:12,marginBottom:8,cursor:'pointer'}} onClick={()=>window.open(`https://etherscan.io/tx/${tx.hash}`,'_blank')}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}><div style={{display:'flex',alignItems:'center',gap:8}}><span style={{width:6,height:6,borderRadius:'50%',background:tx.status==='success'?'#00ff88':'#ff4466',display:'inline-block'}}/><span style={{fontSize:'0.75rem',...s.mono,color:'var(--text)',fontWeight:700}}>{tx.method}</span></div><span style={{fontSize:'0.72rem',...s.mono,color:tx.from.toLowerCase()===(user?.address||'').toLowerCase()?'#ff4466':'#00ff88'}}>{tx.from.toLowerCase()===(user?.address||'').toLowerCase()?'- ':''}{tx.value} ETH</span></div>
              <div style={{fontSize:'0.62rem',...s.muted}}>To: {tx.to.slice(0,10)}...{tx.to.slice(-6)}</div>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:4,fontSize:'0.62rem',...s.muted}}><span>{tx.time}</span><span>Gas: {tx.gas}</span><span style={s.cyan}>↗ Etherscan</span></div>
            </div>)}
          </div>}
          {settingsTab==='assets'&&<div style={{position:'relative',zIndex:10000}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}><div style={{...s.label,marginBottom:0}}>TOKEN ASSETS</div><button onClick={()=>fetchTokenBalances(user?.address||'')} style={{padding:'4px 10px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,...s.cyan,...s.mono,fontSize:'0.65rem',cursor:'pointer'}}>↻</button></div>
            {tokensLoading&&<div style={{display:'flex',justifyContent:'center',padding:24}}><div className={styles.spinner}/></div>}
            {!tokensLoading&&tokenBalances.length===0&&<div style={{textAlign:'center',padding:24,fontSize:'0.75rem',...s.muted}}>No token balances found.</div>}
            {tokenBalances.map((tok,i)=><div key={i} style={{...s.card,padding:12,marginBottom:8,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>{tok.logo?<img src={tok.logo} alt={tok.symbol} style={{width:28,height:28,borderRadius:'50%'}}/>:<div style={{width:28,height:28,borderRadius:'50%',background:'var(--cyan-glow)',border:'1px solid var(--cyan)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.7rem'}}>🔷</div>}<div><div style={{fontSize:'0.78rem',...s.mono,color:'var(--text)',fontWeight:700}}>{tok.symbol}</div><div style={{fontSize:'0.62rem',...s.muted}}>{tok.name}</div></div></div>
              <div style={{fontSize:'0.8rem',...s.mono,...s.cyan,fontWeight:700}}>{tok.balance}</div>
            </div>)}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:20,marginBottom:12}}><div style={{...s.label,marginBottom:0}}>NFTs <span style={{color:'var(--cyan)',fontSize:'0.7rem'}}>({nfts.length})</span></div><button onClick={()=>fetchNfts(user?.address||'')} style={{padding:'4px 10px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,...s.cyan,...s.mono,fontSize:'0.65rem',cursor:'pointer'}}>↻ Refresh</button></div>
            {nftsLoading&&<div style={{display:'flex',justifyContent:'center',padding:24}}><div className={styles.spinner}/></div>}
            {!nftsLoading&&nfts.length===0&&<div style={{textAlign:'center',padding:32,background:'var(--bg2)',borderRadius:12,border:'1px solid var(--border)'}}><div style={{fontSize:'2rem',marginBottom:8}}>🖼️</div><div style={{fontSize:'0.78rem',...s.mono,color:'var(--text)',marginBottom:4}}>No NFTs Found</div><div style={{fontSize:'0.65rem',...s.muted}}>NFTs on Ethereum mainnet will appear here</div></div>}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>{nfts.map((nft,i)=><div key={i} onClick={()=>setSelectedNft(nft)} style={{...s.card,padding:8,cursor:'pointer',WebkitTapHighlightColor:'rgba(0,0,0,0)'}}><div style={{position:'relative',marginBottom:6}}><img src={nft.image} alt={nft.name} style={{width:'100%',aspectRatio:'1',objectFit:'cover',borderRadius:8}} onError={(e:any)=>{e.target.style.display='none'}}/><div style={{position:'absolute',top:4,right:4,background:'rgba(0,0,0,0.6)',borderRadius:4,padding:'2px 5px',fontSize:'0.55rem',fontFamily:'monospace',color:'#fff'}}>#{(nft.tokenId||'').slice(-4)||'??'}</div></div><div style={{fontSize:'0.68rem',fontFamily:'monospace',color:'var(--text)',fontWeight:700,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{nft.name}</div><div style={{fontSize:'0.56rem',color:'var(--text-muted)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{nft.collection}</div></div>)}</div>
            {selectedNft&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:99999,display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={()=>setSelectedNft(null)}><div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:16,padding:16,maxWidth:340,width:'100%',maxHeight:'85vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}><div style={{fontSize:'0.85rem',fontFamily:'monospace',color:'var(--text)',fontWeight:700}}>{selectedNft.name}</div><button onClick={()=>setSelectedNft(null)} style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:6,color:'var(--text-muted)',width:28,height:28,cursor:'pointer',fontSize:'1rem'}}>x</button></div><img src={selectedNft.image} alt={selectedNft.name} style={{width:'100%',aspectRatio:'1',objectFit:'cover',borderRadius:12,marginBottom:12}}/><div style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:10,padding:10,marginBottom:8,fontSize:'0.7rem',fontFamily:'monospace'}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={{color:'var(--text-muted)'}}>Collection</span><span style={{color:'var(--text)',fontWeight:700}}>{selectedNft.collection}</span></div><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={{color:'var(--text-muted)'}}>Token ID</span><span style={{color:'var(--cyan)'}}>#{selectedNft.tokenId}</span></div><div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'var(--text-muted)'}}>Contract</span><span style={{color:'var(--text)',fontSize:'0.6rem'}}>{(selectedNft.contract||'').slice(0,6)}...{(selectedNft.contract||'').slice(-4)}</span></div></div><a href={'https://opensea.io/assets/ethereum/'+selectedNft.contract+'/'+selectedNft.tokenId} target='_blank' rel='noreferrer' style={{display:'block',textAlign:'center',padding:'12px',background:'linear-gradient(135deg,#2081e2,#9945ff)',borderRadius:10,color:'#fff',fontFamily:'monospace',fontSize:'0.82rem',fontWeight:700,textDecoration:'none',marginBottom:8}}>View on OpenSea</a><a href={'https://etherscan.io/token/'+selectedNft.contract} target='_blank' rel='noreferrer' style={{display:'block',textAlign:'center',padding:'10px',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:10,color:'var(--text-muted)',fontFamily:'monospace',fontSize:'0.75rem',textDecoration:'none'}}>Etherscan</a></div></div>}
          </div>}
          {settingsTab==='dapps'&&<div style={{position:'relative',zIndex:10000}}>
            <div style={{...s.label,marginBottom:12}}>POPULAR DApps</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>{DAPP_LIST.map(dapp=><button key={dapp.name} onClick={()=>{setDappUrl(dapp.url);setIframeError(false);setDappLoaded(false);setBottomTab('home');setDappOpen(true)}} style={{padding:'14px 10px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:10,cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:6}}><span style={{fontSize:'1.5rem'}}>{dapp.icon}</span><span style={{fontSize:'0.72rem',...s.mono,color:'var(--text)'}}>{dapp.name}</span></button>)}</div>
            <div style={{...s.label,marginBottom:8}}>CUSTOM DApp</div>
            <div style={{display:'flex',gap:8}}><input value={dappUrl} onChange={e=>setDappUrl(e.target.value)} placeholder="https://..." style={{flex:1,padding:'10px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',...s.mono,fontSize:'0.75rem'}}/><button onClick={()=>{if(dappUrl){setIframeError(false);setDappLoaded(false);setDappOpen(true)}}} style={{padding:'10px 14px',background:'var(--cyan-glow)',border:'1px solid var(--cyan)',borderRadius:8,...s.cyan,...s.mono,fontSize:'0.8rem',cursor:'pointer'}}>→</button></div>
            <div style={{fontSize:'0.62rem',...s.muted,marginTop:8}}>⚠️ Only visit trusted DApps</div>
          </div>}
        </div>}

        {bottomTab==='copytrade'&&<div>
          <div style={{textAlign:'center',marginBottom:16}}>
            <div style={{fontSize:'1.4rem',fontWeight:700,color:'var(--text)',...s.mono}}>👥 Copy Trading</div>
            <div style={{fontSize:'0.7rem',...s.muted,marginTop:4}}>Follow top traders or become a Leader</div>
          </div>

          <div style={{display:'flex',gap:8,marginBottom:16}}>
            <button onClick={()=>{setBecomeLeaderStatus('');setBecomeLeaderOpen(true)}} style={{flex:1,padding:'12px',background:'linear-gradient(135deg,#ffd700,#b8860b)',border:'none',borderRadius:10,color:'#1a1200',fontWeight:700,...s.mono,fontSize:'0.78rem',cursor:'pointer'}}>👑 Become a Leader</button>
            <button onClick={()=>{setBrowseLeadersOpen(true);fetchLeaders()}} style={{flex:1,padding:'12px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:10,color:'var(--text)',fontWeight:700,...s.mono,fontSize:'0.78rem',cursor:'pointer'}}>🔍 Browse Leaders</button>
          </div>

          <div style={{border:'1px solid var(--border)',borderRadius:12,background:'var(--bg2)',padding:12,marginBottom:16}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
              <span style={{fontSize:'1.1rem'}}>🦋</span>
              <span style={{fontSize:'0.78rem',fontWeight:700,color:'var(--text)',...s.mono}}>Copy Trading Assistant</span>
            </div>
            <div id="copytrade-chat-log" style={{maxHeight:220,overflowY:'auto',marginBottom:10,display:'flex',flexDirection:'column',gap:8}}>
              {copyTradeChatLog.map((m,i)=>(
                <div key={i} style={{alignSelf:m.role==='user'?'flex-end':'flex-start',maxWidth:'85%',padding:'8px 12px',borderRadius:10,background:m.role==='user'?'var(--cyan-glow)':'var(--bg3)',color:'var(--text)',fontSize:'0.74rem',...s.mono}}>{m.content}</div>
              ))}
              {copyTradeChatLoading&&<div style={{alignSelf:'flex-start',fontSize:'0.72rem',...s.muted}}>🦋 thinking...</div>}
            </div>
            <div style={{display:'flex',gap:6}}>
              <input value={copyTradeInput} onChange={e=>setCopyTradeInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendCopyTradeMessage()} placeholder="Ask about copy trading..." style={{flex:1,padding:'8px 10px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg)',color:'var(--text)',fontSize:'0.74rem',...s.mono}}/>
              <button onClick={sendCopyTradeMessage} disabled={copyTradeChatLoading} style={{padding:'8px 14px',borderRadius:8,border:'none',background:'var(--cyan)',color:'#000',fontWeight:700,cursor:'pointer',fontSize:'0.74rem'}}>→</button>
            </div>
          </div>

          {becomeLeaderOpen&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:99999,display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={()=>setBecomeLeaderOpen(false)}>
            <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:16,padding:20,maxWidth:340,width:'100%'}} onClick={e=>e.stopPropagation()}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                <div style={{fontSize:'0.9rem',...s.mono,color:'var(--text)',fontWeight:700}}>👑 Become a Leader</div>
                <button onClick={()=>setBecomeLeaderOpen(false)} style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:6,color:'var(--text-muted)',width:28,height:28,cursor:'pointer',fontSize:'1rem'}}>x</button>
              </div>
              <div style={{fontSize:'0.7rem',...s.muted,marginBottom:12}}>Your wallet's trades will become visible to followers. You'll earn EMC as your Trust Score 🦋 grows.</div>
              <input value={becomeLeaderName} onChange={e=>setBecomeLeaderName(e.target.value)} placeholder="Display name (optional)" style={{width:'100%',padding:'10px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg)',color:'var(--text)',fontSize:'0.78rem',...s.mono,marginBottom:12,boxSizing:'border-box'}}/>
              {becomeLeaderStatus&&<div style={{fontSize:'0.72rem',...s.mono,marginBottom:10,color:'var(--text)'}}>{becomeLeaderStatus}</div>}
              <button onClick={becomeLeader} disabled={becomeLeaderLoading} style={{width:'100%',padding:'12px',background:'linear-gradient(135deg,#ffd700,#b8860b)',border:'none',borderRadius:10,color:'#1a1200',fontWeight:700,...s.mono,fontSize:'0.78rem',cursor:'pointer',opacity:becomeLeaderLoading?0.6:1}}>{becomeLeaderLoading?'Joining...':'Confirm & Become a Leader'}</button>
            </div>
          </div>}

          {browseLeadersOpen&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:99999,display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={()=>setBrowseLeadersOpen(false)}>
            <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:16,padding:20,maxWidth:360,width:'100%',maxHeight:'75vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                <div style={{fontSize:'0.9rem',...s.mono,color:'var(--text)',fontWeight:700}}>🔍 Browse Leaders</div>
                <button onClick={()=>setBrowseLeadersOpen(false)} style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:6,color:'var(--text-muted)',width:28,height:28,cursor:'pointer',fontSize:'1rem'}}>x</button>
              </div>
              {leadersLoading&&<div style={{display:'flex',justifyContent:'center',padding:24}}><div className={styles.spinner}/></div>}
              {!leadersLoading&&leadersList.length===0&&<div style={{textAlign:'center',padding:24,fontSize:'0.75rem',...s.muted}}>No leaders yet — be the first! 🦋</div>}
              {leadersList.map((ld,i)=>(
                <div key={i} style={{...s.card,padding:12,marginBottom:8}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                    <div style={{fontSize:'0.78rem',...s.mono,color:'var(--text)',fontWeight:700}}>{ld.display_name || (ld.wallet_address.slice(0,6)+'...'+ld.wallet_address.slice(-4))}</div>
                    <span style={{fontSize:'0.9rem'}}>🦋</span>
                  </div>
                  <div style={{display:'flex',gap:12,fontSize:'0.65rem',...s.muted,marginBottom:8}}>
                    <span>Trust: {ld.trust_score}</span>
                    <span>Win: {ld.win_rate}%</span>
                    <span>Followers: {ld.total_followers}</span>
                  </div>
                  <button onClick={()=>{setFollowTarget(ld);setFollowAllocation(10);setFollowStatus('')}} style={{width:'100%',padding:'8px',background:'var(--cyan-glow)',border:'1px solid var(--cyan)',borderRadius:8,...s.cyan,...s.mono,fontSize:'0.72rem',cursor:'pointer',fontWeight:700}}>🦋 Follow</button>
                </div>
              ))}
            </div>
          </div>}

          {followTarget&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.9)',zIndex:100000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={()=>setFollowTarget(null)}>
            <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:16,padding:20,maxWidth:340,width:'100%'}} onClick={e=>e.stopPropagation()}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                <div style={{fontSize:'0.9rem',...s.mono,color:'var(--text)',fontWeight:700}}>🦋 Follow {followTarget.display_name || (followTarget.wallet_address.slice(0,6)+'...'+followTarget.wallet_address.slice(-4))}</div>
                <button onClick={()=>setFollowTarget(null)} style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:6,color:'var(--text-muted)',width:28,height:28,cursor:'pointer',fontSize:'1rem'}}>x</button>
              </div>
              <div style={{fontSize:'0.7rem',...s.muted,marginBottom:12}}>Choose what % of your trades should mirror this leader's activity.</div>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
                <input type="range" min={1} max={100} value={followAllocation} onChange={e=>setFollowAllocation(Number(e.target.value))} style={{flex:1}}/>
                <div style={{fontSize:'0.85rem',...s.mono,...s.cyan,fontWeight:700,minWidth:44,textAlign:'right'}}>{followAllocation}%</div>
              </div>
              {followStatus&&<div style={{fontSize:'0.72rem',...s.mono,marginBottom:10,color:'var(--text)'}}>{followStatus}</div>}
              <button onClick={followLeader} disabled={followLoading} style={{width:'100%',padding:'12px',background:'var(--cyan)',border:'none',borderRadius:10,color:'#000',fontWeight:700,...s.mono,fontSize:'0.78rem',cursor:'pointer',opacity:followLoading?0.6:1}}>{followLoading?'Following...':'Confirm & Follow'}</button>
            </div>
          </div>}

          <div style={{textAlign:'center',fontSize:'0.68rem',...s.muted,padding:'20px 0'}}>No leaders yet — be the first! 🦋</div>
        </div>}
      </main>

      <nav style={{position:'fixed',bottom:0,left:0,right:0,background:'var(--bg2)',borderTop:'1px solid var(--border)',display:'flex',zIndex:100,paddingBottom:'env(safe-area-inset-bottom)'}}>
        {([{id:'home',icon:'🏠',label:'Home'},{id:'trade',icon:'💱',label:'Trade'},{id:'markets',icon:'📊',label:'Markets'},{id:'copytrade',icon:'👥',label:'Copy'},{id:'settings',icon:'⚙️',label:'Settings'}] as {id:BottomTab;icon:string;label:string}[]).map(tab=>(
          <button key={tab.id} onClick={()=>setBottomTab(tab.id)} style={{flex:1,padding:'12px 0 10px',background:'transparent',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:4,borderTop:bottomTab===tab.id?'2px solid var(--cyan)':'2px solid transparent'}}>
            <span style={{fontSize:'1.2rem'}}>{tab.icon}</span>
            <span style={{fontSize:'0.58rem',...s.mono,letterSpacing:'0.06em',color:bottomTab===tab.id?'var(--cyan)':'var(--text-muted)',fontWeight:bottomTab===tab.id?700:400}}>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
// v5 - SOL wallet + Helius RPC fix
