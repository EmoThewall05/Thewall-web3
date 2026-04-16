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
      model: 'gemini-2.5-flash',   // Stable and recommended for free tier
    });

    // Prepare history in Gemini format
    const chatHistory = history.map((h: any) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content || '' }]
    }));

    // Create chat session with system instruction
    const chat = model.startChat({
      history: chatHistory,
      systemInstruction: `You are Emowall AI 🦋, the Web3 guardian of TheWall Wallet. 
Be futuristic, concise, and helpful. You support ETH, SOL, BTC, ARB, MON, BASE. 
End every response with 🦋.`,
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text() || '🦋 Listening...';

    return NextResponse.json({ reply });

  } catch (err: any) {
    console.error('Gemini API Error:', err);

    // Full detailed error for debugging (as per your earlier request)
    const errorMsg = err?.message || JSON.stringify(err) || 'Unknown error';
    return NextResponse.json({ 
      reply: `🦋 Error: ${errorMsg}` 
    });
  }
}
