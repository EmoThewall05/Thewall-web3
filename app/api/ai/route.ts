import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()
    if (!message) return NextResponse.json({ reply: 'Please send a message! 🦋' })

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ASSIST_LOOP_API}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 300,
        messages: [
          { role: 'system', content: 'You are Emowall AI Web3 🦋 — assistant for TheWall crypto wallet. Help with ETH, SOL, BTC, ARB, MON, swaps, gasless transactions. Be concise. Always end with 🦋' },
          ...(history||[]).map((m:any)=>({ role: m.role==='user'?'user':'assistant', content: m.content })),
          { role: 'user', content: message }
        ]
      })
    })

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || 'I am here to help! 🦋'
    return NextResponse.json({ reply })

  } catch (err) {
    return NextResponse.json({ reply: '⚠️ Emowall AI unavailable. Try again! 🦋' })
  }
}
