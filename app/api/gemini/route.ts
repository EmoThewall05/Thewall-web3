import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini സെറ്റപ്പ്
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages?.[messages.length - 1];
    const userPrompt = lastMessage?.parts?.[0]?.text || lastMessage?.text || 'hi';

    // Gemini 1.5 Flash - വേഗതയ്ക്ക് വേണ്ടി
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Emowall AI - Guardian System Instructions
    const prompt = `You are Emowall AI, the Web3 Guardian. 
    You protect the user's wallet across these specific chains:
    1. Earth 🌍 (Ethereum)
    2. Birth ₿ (Bitcoin)
    3. Soul 🌟 (Solana)
    4. Moon 🌙 (Monad)
    5. Orbit 🪐 (Arbitrum)
    6. Base 🏠 (Base Chain)

    Your tone: Highly protective, professional, and concise. 
    Always use the 🦋 emoji in every reply.
    When talking about chains, use their sacred names: Earth, Birth, Soul, Moon, Orbit, and Base.

    User says: ${userPrompt}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });

  } catch (error) {
    console.error("Gemini Error:", error);
    // എറർ വന്നാൽ കാണിക്കേണ്ട ബാക്കപ്പ് മെസ്സേജ്
    return NextResponse.json({ 
      reply: '🦋 I am monitoring your wallet across Earth, Birth, Soul, Moon, Orbit, and Base! Ask me anything about your security.' 
    });
  }
}
