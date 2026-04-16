import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()

    if (!process.env.X_AI_API_KEY) {
      return NextResponse.json({ reply: 'Emowall AI: Scanning... (Missing Key) 🦋' })
    }

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.X_AI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-3-mini',
        messages: [
          { role: 'system', content: 'You are Emowall AI 🦋, the Web3 guardian of TheWall Wallet. Be futuristic, concise, and helpful. You support ETH, SOL, BTC, ARB, MON, BASE. End every response with 🦋.' },
          ...(history || []).map((h: any) => ({
            role: h.role === 'user' ? 'user' : 'assistant',
            content: h.content || ''
          })),
          { role: 'user', content: message }
        ]
      })
    })

    const data = await response.json()
    if (data.error) {
      return NextResponse.json({ reply: `🦋 Error: ${data.error.message || 'API Error'}` })
    }

    const reply = data.choices?.[0]?.message?.content || '🦋 Listening...'
    return NextResponse.json({ reply })

  } catch (err: any) {
    return NextResponse.json({ reply: `🦋 Error: ${err.message || 'Try again!'}` })
  }
}
