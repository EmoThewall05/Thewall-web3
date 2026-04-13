import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()
    if (!message) return NextResponse.json({ reply: 'Please send a message! 🦋' })

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `System Instruction: You are Emowall AI Web3 🦋 — guardian for TheWall crypto wallet. 
              Supported Chains: Earth🌍, Birth₿, Soul🌟, Moon🌙, Orbit🪐, Base🏠.
              Role: Help with swaps, gasless transactions, and safety. 
              Tone: Concise and protective. Always end with 🦋.
              History: ${JSON.stringify(history || [])}` }]
          },
          {
            role: 'user',
            parts: [{ text: message }]
          }
        ]
      })
    })

    const data = await response.json()
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I am here to protect your assets! 🦋'
    
    return NextResponse.json({ reply })
  } catch (err) {
    return NextResponse.json({ reply: '⚠️ Emowall AI is temporarily unavailable. 🦋' })
  }
}
