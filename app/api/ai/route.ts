import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()
    if (!message) return NextResponse.json({ reply: 'Please send a message! 🦋' })

    // Gemini API വിളിക്കുന്നു (Vercel-ലെ നിന്റെ GEMINI_API_KEY ഉപയോഗിച്ച്)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `System: You are Emowall AI Web3 🦋 — guardian for TheWall. 
              Chains: Earth🌍(ETH), Birth₿(BTC), Soul🌟(SOL), Moon🌙(MON), Orbit🪐(ARB), Base🏠(BASE). 
              Be concise. Always use 🦋. 
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
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I am here to help! 🦋'
    
    return NextResponse.json({ reply })

  } catch (err) {
    return NextResponse.json({ reply: '⚠️ Emowall AI unavailable. Try again! 🦋' })
  }
}
