import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json();

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

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });

    // System prompt as the first user message (most stable approach)
    const systemPrompt = `You are Emowall AI 🦋, the Web3 guardian of TheWall Wallet. 
Be futuristic, concise, and helpful. You support ETH, SOL, BTC, ARB, MON, BASE. 
End every response with 🦋.`;

    // Build contents array
    const contents: any[] = [
      { role: 'user', parts: [{ text: systemPrompt }] },   // System prompt first
      ...history.map((h: any) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content || '' }]
      })),
      { role: 'user', parts: [{ text: message }] }         // Current user message
    ];

    const result = await model.generateContent(contents);
    const reply = result.response.text() || '🦋 Listening...';

    return NextResponse.json({ reply });

  } catch (err: any) {
    console.error('Gemini API Error:', err);

    // Full detailed error for debugging
    const errorMsg = err?.message || JSON.stringify(err) || 'Unknown error';
    return NextResponse.json({ 
      reply: `🦋 Error: ${errorMsg}` 
    });
  }
}
