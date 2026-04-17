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
        content: 'You are Emowall AI 🦋, the professional guardian of TheWall Wallet. Futuristic and concise. You support BTC, ETH, SOL, MON, ARB, BASE. End every response with 🦋.'
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
