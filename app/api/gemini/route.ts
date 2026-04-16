import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()

    const res = await fetch('https://assistloop.ai/api/v1/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: '69f323f3-6a36-4979-bd51-af1845fe4e50',
        message,
        conversationHistory: (history || []).map((h: any) => ({
          role: h.role === 'user' ? 'user' : 'assistant',
          content: h.content || h.text || ''
        }))
      })
    })

    const data = await res.json()
    const reply = data?.message || data?.reply || data?.response || '🦋 Listening...'
    return NextResponse.json({ reply })

  } catch (err: any) {
    return NextResponse.json({ reply: `🦋 Error: ${err.message}` })
  }
}
