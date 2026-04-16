import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ 
        reply: 'Emowall AI: Scanning... (No message provided) 🦋' 
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        reply: 'Emowall AI: Scanning... (Missing Gemini Key) 🦋' 
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Build conversation history for Gemini
    const contents: any[] = [];

    // Add previous history
    (history || []).forEach((h: any) => {
      contents.push({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content || '' }]
      });
    });

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',   // Recommended free-tier model (fast & capable)
      systemInstruction: `You are Emowall AI 🦋, the Web3 guardian of TheWall Wallet. 
Be futuristic, concise, and helpful. You support ETH, SOL, BTC, ARB, MON, BASE. 
End every response with 🦋.`
    });

    const result = await model.generateContent(contents);
    const reply = result.response.text() || '🦋 Listening...';

    return NextResponse.json({ reply });

  } catch (err: any) {
    console.error('Gemini API Error:', err);
    
    // Full error logging (as you requested earlier)
    const errorMessage = err?.message || JSON.stringify(err) || 'Try again!';
    return NextResponse.json({ 
      reply: `🦋 Error: ${errorMessage}` 
    });
  }
}
