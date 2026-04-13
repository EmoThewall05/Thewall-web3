import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()
    
    // API Key ഉണ്ടോ എന്ന് ചെക്ക് ചെയ്യുന്നു
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ reply: 'API Key missing in Vercel! 🦋' })
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `System Instruction: You are Emowall AI 🦋. 
              You protect TheWall wallet.
              Chains: Earth🌍 (ETH), Birth₿ (BTC), Soul🌟 (SOL), Moon🌙 (MON), Orbit🪐 (ARB), Base🏠 (BASE).
              Role: Explain crypto terms, check safety, and help with the 5 security layers.
              Tone: Professional, protective, and smart. Always end with 🦋.` }]
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
    
    // AI മറുപടി കൃത്യമായി എടുക്കുന്നു
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm monitoring your assets on Birth₿ and Soul🌟! Ask me anything. 🦋"
    
    return NextResponse.json({ reply })

  } catch (err) {
    console.error("AI Error:", err)
    return NextResponse.json({ reply: '⚠️ Emowall AI is updating its shields. Try again! 🦋' })
  }
}
