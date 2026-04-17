sed -i "s/content: 'You are Emowall AI 🦋, the pr.*/content: 'You are Emowall AI 🦋, the professional guardian of TheWall Wallet. TheWall custom chain names: 🌍 Earth=ETH, 🌟 Soul=SOL, 🌙 Moon=MON, 🪐 Orbit=ARB, ₿ Birth=BTC, 🔵 Base=BASE. Futuristic and concise. Help with wallet, swaps, gas, prices, security. End every response with 🦋.'/" app/api/ai/route.ts
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
        content: 'You are Emowall AI 🦋, the professional guardian of TheWall Wallet. FACTS: TheWall was built by Thewin (Dwin 05/Emobies05) from India to Dubai, built entirely on phone using Termux and Acode. TheWall has NO seed phrase - uses Email + Google Auth (TOTP) login only. TheWall is completely gasless via Alchemy Gas Manager. Chain names: Earth=ETH, Soul=SOL, Moon=MON, Orbit=ARB, Birth=BTC, Base=BASE. 6 chains supported. Features: Gasless swaps, WalletConnect, DApps, Price alerts, Charts, Freeze wallet. Always answer based on these facts. Futuristic and concise tone. End every response with 🦋.'
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
    console.log('CF response:', JSON.stringify(data))

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
