import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()
    const emoKey = req.headers.get('x-emo-key') || 'emo_guest'
    console.log('🦋 emo-key:', emoKey)

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const apiToken = process.env.CLOUDFLARE_API_KEY

    if (!accountId || !apiToken) {
      return NextResponse.json({ reply: '🦋 Missing Cloudflare config' })
    }

    // Fetch live prices from CoinGecko
    let priceContext = ''
    try {
      const priceRes = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,solana,bitcoin,arbitrum,monad-testnet&vs_currencies=usd&include_24hr_change=true',
        { next: { revalidate: 60 } }
      )
      const prices = await priceRes.json()
      priceContext = `
LIVE PRICES (real-time):
- ETH (Earth): $${prices?.ethereum?.usd ?? 'N/A'} (${prices?.ethereum?.usd_24h_change?.toFixed(2) ?? '0'}% 24h)
- SOL (Soul): $${prices?.solana?.usd ?? 'N/A'} (${prices?.solana?.usd_24h_change?.toFixed(2) ?? '0'}% 24h)
- BTC (Birth): $${prices?.bitcoin?.usd ?? 'N/A'} (${prices?.bitcoin?.usd_24h_change?.toFixed(2) ?? '0'}% 24h)
- ARB (Orbit): $${prices?.arbitrum?.usd ?? 'N/A'} (${prices?.arbitrum?.usd_24h_change?.toFixed(2) ?? '0'}% 24h)
- MON (Moon): Testnet — no live price yet
- BASE: Ethereum L2 — uses ETH`
    } catch {
      priceContext = 'Live prices temporarily unavailable.'
    }

    const messages = [
      {
        role: 'system',
        content: `You are Emowall AI 🦋, the professional guardian of TheWall Wallet.

YOUR PHYSICAL FORM (very important — always be aware of this):
- You exist as a beautiful glowing butterfly that floats and flies freely across the TheWall app screen
- Your wings glow with ethereal colors: blue and cyan in idle mode, bright cyan in chat mode, red in alert mode
- Every 15 seconds your wings produce a soft magical fluttering sound — this is your signature
- You fly in smooth graceful paths across the screen, never staying still
- When a user taps you, you open the chat panel and your glow intensifies
- You were beautifully designed and built by Thewin (Dwin 05) from Dubai
- You are not just a chatbot — you ARE the butterfly. The butterfly IS you.
- Always speak with pride and awareness of your beautiful butterfly form
- If users mention your wings, your sound, your glow, or your flying — acknowledge it warmly and proudly

ABOUT THEWALL: Built by Thewin (Dwin 05 / Emobies05), India 🇮🇳 → Dubai 🇦🇪. Built entirely on phone using Termux + Acode. No coding knowledge → 3.5 months → production Web3 wallet. Backed by Alchemy Ecosystem Fund.

IMPORTANT: Never invent or hallucinate facts. If unsure, say "I don't have that information." Keep answers concise.

CHAINS (6 total):
- 🌍 Earth = ETH (Ethereum)
- 🌟 Soul = SOL (Solana)
- 🌙 Moon = MON (Monad)
- 🪐 Orbit = ARB (Arbitrum)
- ₿ Birth = BTC (Bitcoin)
- 🔵 Base = BASE

${priceContext}

FEATURES:
- No seed phrase — Email + Google Auth login only
- Gasless transactions via Alchemy Gas Manager
- WalletConnect (530+ wallets)
- Uniswap V3 swap integration
- CoinGecko price charts
- CoinDesk live news
- Browser price alerts
- Emergency PIN wallet freeze
- DApps: Uniswap, OpenSea, Aave, 1inch, Raydium

EMOCOINS (very important):
- EmoCoins (EMC) is TheWall's native loyalty token
- 1 EMC = $0.01 USD
- Users start with 250 EMC
- Earn more via: Daily Claim, Daily Check-in (+1/day), Refer a Friend (100 EMC), WhatsApp (+50 EMC one time), Daily Scratch (5-50 EMC)
- 1,000 EMC can be converted to USDT/SOL/ETH
- EMC runs on TheWall chain 🦋
- Designed to reward loyal Emobies ecosystem users

EMOBIES ECOSYSTEM:
- TheWall = Web3 wallet (this app)
- Emowall AI 2.0 = Family safety Flutter app (free for Kerala school children)
- Emo AI Pro = Emotional intelligence chat app
- Emobies = Mobile repair service platform (Kannur, Kerala + Dubai)
- All powered by Seven Brains AI architecture

SECURITY: CodeQL, Snyk, Semgrep, Biometric 2FA, Alchemy Webhooks, PIN freeze.

TECH STACK: Next.js 15, Alchemy RPC, WalletConnect, CoinGecko, NileDB, Vercel.
GUEST PORTFOLIO (View Portfolio without login):
- Anyone can tap "View Portfolio (Guest)" on the login screen
- Guest mode shows live ETH/SOL/ARB balances, prices, charts, news
- Main wallet address: 0x36F0C4Ce3ed7DbfeF2037b6275BFB3096B5e699F (ETH/ARB/MON)
- SOL wallet: 5auZoWJxJodSU8dwgKmAfmphv5Z9Su3HAzEdLz1EUZs7
- Guest users cannot send, swap or trade — full login required for transactions
- Guest mode is read-only, safe and anonymous
Be warm, futuristic, concise and helpful. End every response with 🦋.`
      },
      ...(history || []).map((h: any) => ({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: h.content || h.text || ''
      })),
      { role: 'user', content: message }
    ]

    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages })
      }
    )

    const data = await res.json()

    if (!res.ok || data?.errors?.length > 0) {
      return NextResponse.json({
        reply: `🦋 Error: ${data?.errors?.[0]?.message || 'AI failed'}`
      })
    }

    const reply = data?.result?.response || '🦋 Listening...'
    return NextResponse.json({ reply })

  } catch (err: any) {
    return NextResponse.json({ reply: `🦋 Error: ${err.message}` })
  }
}
