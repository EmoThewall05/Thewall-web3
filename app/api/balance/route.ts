export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { EVM_CHAINS } from '@/lib/evmChains'

const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY
const HELIUS_KEY  = process.env.HELIUS_API_KEY
const SOUL_KEY    = process.env.THEWALL_SOUL_KEY || process.env.ALCHEMY_API_KEY
const EARTH_KEY   = process.env.THEWALL_EARTH_MAIN_KEY || process.env.ALCHEMY_API_KEY

// Extended chains not yet in lib/evmChains.ts — kept as-is
const EXTRA_RPC = {
  scroll:   `https://scroll-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  sonic:    `https://sonic-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  sei:      `https://sei-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  abstract: `https://abstract-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  crossfi:  `https://crossfi-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  metis:    `https://metis-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  stable:   `https://stable-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  btc:      `https://btc-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  ethFree:  'https://eth.llamarpc.com',
  arbFree:  'https://arb1.arbitrum.io/rpc',
}

function evmRpcUrl(chainId: string): string {
  const chain = EVM_CHAINS.find(c => c.id === chainId)
  const network = chain?.alchemyNetwork || 'eth-mainnet'
  if (chainId === 'ETH' && !ALCHEMY_KEY) return EXTRA_RPC.ethFree
  if (chainId === 'ARB' && !ALCHEMY_KEY) return EXTRA_RPC.arbFree
  const key = chainId === 'ETH' ? EARTH_KEY : ALCHEMY_KEY
  return `https://${network}.g.alchemy.com/v2/${key}`
}

async function getEvmBalance(rpcUrl: string, address: string): Promise<number> {
  try {
    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getBalance', params: [address, 'latest'] }),
      signal: AbortSignal.timeout(8000),
    })
    const data = await res.json()
    return data.result ? parseInt(data.result, 16) / 1e18 : 0
  } catch { return 0 }
}

async function getTokenBalances(address: string) {
  try {
    const res = await fetch(evmRpcUrl('ETH'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'alchemy_getTokenBalances', params: [address, 'erc20'] }),
    })
    const data = await res.json()
    return data.result?.tokenBalances || []
  } catch { return [] }
}

async function getSolBalance(address: string): Promise<number> {
  try {
    const url = HELIUS_KEY
      ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_KEY}`
      : `https://solana-mainnet.g.alchemy.com/v2/${SOUL_KEY}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getBalance', params: [address] }),
    })
    const data = await res.json()
    return data.result?.value !== undefined ? data.result.value / 1e9 : 0
  } catch { return 0 }
}

async function getBtcBalance(address: string): Promise<number> {
  try {
    if (!ALCHEMY_KEY) return 0
    const res = await fetch(EXTRA_RPC.btc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getaddressinfo', params: [address] }),
      signal: AbortSignal.timeout(8000),
    })
    const data = await res.json()
    if (data.result?.balance !== undefined) return data.result.balance / 1e8
    return 0
  } catch { return 0 }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const address    = searchParams.get('address')
    const btcAddress = searchParams.get('btcAddress') || ''
    const solAddress = searchParams.get('solAddress') || ''

    if (!address) return NextResponse.json({ error: 'Address required' }, { status: 400 })

    // Generic: all 27 EVM_CHAINS in parallel
    const evmResults = await Promise.all(
      EVM_CHAINS.map(c => getEvmBalance(evmRpcUrl(c.id), address))
    )
    const balances: Record<string, number> = {}
    EVM_CHAINS.forEach((c, i) => { balances[c.id] = evmResults[i] })

    const [
      scrollBalance, sonicBalance, seiBalance,
      abstractBalance, crossfiBalance, metisBalance, stableBalance,
      solBalance, tokenBalances, btcBalance,
    ] = await Promise.all([
      getEvmBalance(EXTRA_RPC.scroll, address),
      getEvmBalance(EXTRA_RPC.sonic, address),
      getEvmBalance(EXTRA_RPC.sei, address),
      getEvmBalance(EXTRA_RPC.abstract, address),
      getEvmBalance(EXTRA_RPC.crossfi, address),
      getEvmBalance(EXTRA_RPC.metis, address),
      getEvmBalance(EXTRA_RPC.stable, address),
      solAddress ? getSolBalance(solAddress) : Promise.resolve(0),
      getTokenBalances(address),
      btcAddress ? getBtcBalance(btcAddress) : Promise.resolve(0),
    ])

    return NextResponse.json({
      address,
      // ✅ TheWall 5 main chains — backward-compat named fields
      ethBalance: balances.ETH || 0,
      solBalance,
      arbBalance: balances.ARB || 0,
      monadBalance: balances.MON || 0,
      btcBalance,
      // Extended chains (legacy)
      polygonBalance: balances.MATIC || 0,
      opBalance: balances.OP || 0,
      baseBalance: balances.BASE || 0,
      scrollBalance,
      sonicBalance,
      seiBalance,
      opBnbBalance: balances.OPBNB || 0,
      animeBalance: balances.ANIME || 0,
      soneiumBalance: balances.SONEIUM || 0,
      abstractBalance,
      crossfiBalance,
      metisBalance,
      stableBalance,
      // Generic — every EVM_CHAINS balance by chain id (ETH, ARB, OP, BASE, MATIC, MON, BNB, OPBNB, ZORA, CELO, CRONOS, BERA, APE, SONEIUM, FRAX, INK, BOBA, XLAYER, UNICHAIN, SHAPE, ANIME, MEGAETH, GENSYN, STORY, HYPERLIQUID, PLASMA, EDGE)
      balances,
      // Tokens
      tokenBalances,
      // Meta
      powered: 'Alchemy 140 Networks + BTC 🔷₿',
      timestamp: Date.now(),
    })
  } catch (e) {
    return NextResponse.json({
      error: String(e),
      ethBalance: 0, solBalance: 0,
      arbBalance: 0, btcBalance: 0,
      balances: {}, tokenBalances: [],
    }, { status: 500 })
  }
}
