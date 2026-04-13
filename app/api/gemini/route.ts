import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()
    if (!message) return NextResponse.json({ reply: 'Please send a message! 🦋' })

    // Gemini API calling using Fetch (Works perfectly in Next.js Edge/Serverless)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `System Instruction: You are Emowall AI Web3 🦋 — guardian for TheWall crypto wallet. 
              Supported Chains: 
              1. Earth 🌍 (Ethereum)
              2. Birth ₿ (Bitcoin)
              3. Soul 🌟 (Solana)
              4. Moon 🌙 (Monad)
              5. Orbit 🪐 (Arbitrum)
              6. Base 🏠 (Base Chain)
              
              Role: Help with swaps, gasless transactions via Alchemy, and social login. 
              Tone: Be concise, protective, and professional. 
              Rule: Always end every single message with 🦋.
              
              Context/History: ${JSON.stringify(history || [])}` }]
          },
          {
            role: 'user',
            parts: [{ text: message }]
          }
        ]
      })
    })

    const data = await response.json()
    
    // Extracting the text response from Gemini
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I am here to protect your assets! 🦋'
    
    return NextResponse.json({ reply })

  } catch (err) {
    console.error("Gemini Error:", err)
    return NextResponse.json({ reply: '⚠️ Emowall AI is temporarily unavailable. Stay safe! 🦋' })
  }
}
