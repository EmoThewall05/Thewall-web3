import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()

    const res = await fetch('https://thewall-butterfly.meradivin.workers.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    })

    const data = await res.json()
    return NextResponse.json({ reply: data.reply })

  } catch (err: any) {
    return NextResponse.json({ reply: `🦋 Error: ${err.message}` })
  }
}
