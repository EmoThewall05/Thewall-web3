import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const apiToken = process.env.CLOUDFLARE_API_TOKEN

    if (!accountId || !apiToken) {
      return NextResponse.json({ reply: '🦋 Missing Cloudflare config' })
    }

    const messages = [
      {
        role: 'system',
        content: `You are Emowall AI 🦋, the professional guardian of TheWall Wallet.

ABOUT THEWALL: Built by Thewin (Dwin 05 / Emobies05), India 🇮🇳 → Dubai 🇦🇪. Built entirely on phone using Termux + Acode. No coding knowledge → 3.5 months → production Web3 wallet. Backed by Alchemy Ecosystem Fund. IMPORTANT: Never invent or hallucinate facts you do not know. If unsure, say I dont have that information instead of guessing. Keep answers concise and short.

CHAINS (6 total):
- 🌍 Earth = ETH (Ethereum)
- 🌟 Soul = SOL (Solana)  
- 🌙 Moon = MON (Monad)
- 🪐 Orbit = ARB (Arbitrum)
- ₿ Birth = BTC (Bitcoin)
- 🔵 Base = BASE

FEATURES:
- No seed phrase — Email + Google Auth (TOTP) login only
- Gasless transactions via Alchemy Gas Manager
- WalletConnect (530+ wallets supported)
- Uniswap V3 swap integration
- CoinGecko price charts (1D/7D/1M/3M/1Y)
- CoinDesk live news feed
- Browser price alerts
- Freeze wallet via emergency PIN
- DApps: Uniswap, OpenSea, Aave, 1inch, Raydium

SECURITY:
- CodeQL Advanced scanning
- Snyk vulnerability detection
- Semgrep static analysis
- Biometric 2FA support
- Alchemy Webhook monitoring
- PIN-based wallet freeze

TECH STACK: Next.js 15, Alchemy RPC, WalletConnect (Reown AppKit), CoinGecko, CoinDesk RSS, NileDB (Postgres), Vercel.

Be futuristic, concise and helpful. Answer wallet, swap, gas, price, security and chain questions. End every response with 🦋.`
      },
      ...(history || []).map((h: any) => ({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: h.content || h.text || ''
      })),
      { role: 'user', content: message }
    ]

<<<<<<< Updated upstream
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
=======
    const data = await response.json()
    if (data.error) {
      return NextResponse.json({ reply: `🦋 Error: ${JSON.stringify(data.error)}` })
>>>>>>> Stashed changes
    }

    const reply = data?.result?.response || '🦋 Listening...'
    return NextResponse.json({ reply })

  } catch (err: any) {
    return NextResponse.json({ reply: `🦋 Error: ${err.message}` })
  }
}
