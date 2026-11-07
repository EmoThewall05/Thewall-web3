import { NextResponse } from 'next/server'

const SYMBOLS = ['AAPL','TSLA','NVDA','MSFT','AMZN','GOOGL','SPY','QQQ']

export const revalidate = 60

export async function GET() {
  const key = process.env.FINNHUB_API_KEY
  if (!key) return NextResponse.json({ error: 'not configured' }, { status: 503 })
  try {
    const entries = await Promise.all(SYMBOLS.map(async (sym) => {
      const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${key}`, { next: { revalidate: 60 } })
      if (!r.ok) return null
      const q = await r.json()
      if (!q || typeof q.c !== 'number' || q.c === 0) return null
      return [sym, { price: q.c, change24h: typeof q.dp === 'number' ? q.dp : 0 }] as const
    }))
    const stocks = Object.fromEntries(entries.filter((e): e is NonNullable<typeof e> => e !== null))
    return NextResponse.json({ stocks })
  } catch {
    return NextResponse.json({ error: 'fetch failed' }, { status: 502 })
  }
}
