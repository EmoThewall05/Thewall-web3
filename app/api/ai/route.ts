import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ reply: 'Emowall AI: Scanning... (Missing Key) 🦋' })
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: "System: You are Emowall AI 🦋, the professional guardian of TheWall Wallet. Your tone is futuristic and concise. You support BTC, ETH, SOL, MON, ARB. End every response with 🦋." }]
          },
          ...(history || []).map((h: any) => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content || h.text || '' }]
          })),
          { role: 'user', parts: [{ text: message }] }
        ]
      })
    })

    const data = await response.json()
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "🦋 Listening..."
    return NextResponse.json({ reply })

  } catch (err) {
    return NextResponse.json({ reply: 'Scanning the perimeter... Try again! 🦋' })
  }
}
