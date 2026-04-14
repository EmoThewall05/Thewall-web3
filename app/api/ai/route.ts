import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ reply: 'Emowall AI: API Key missing! 🦋' })
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: "System: You are Emowall AI 🦋, the guardian of TheWall Wallet. You are smart, protective, and concise. Chains: Birth (BTC), Earth (ETH), Soul (SOL), Moon (MON), Orbit (ARB). End every reply with 🦋." }]
          },
          ...(history || []).map((h: any) => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content || h.text || '' }]
          })),
          {
            role: 'user',
            parts: [{ text: message }]
          }
        ]
      })
    })

    const data = await response.json()
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm watching over your assets! Ask me anything. 🦋"
    
    return NextResponse.json({ reply })

  } catch (err) {
    console.error("AI Error:", err)
    return NextResponse.json({ reply: 'Shields are recalibrating. Try again! 🦋' })
  }
}
