import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_MY_NETWORK!
const PREMIUM_COST = 500
const PREMIUM_DURATION_MS = 30 * 24 * 60 * 60 * 1000

async function sbFetch(path: string, init?: RequestInit) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init?.headers || {})
    }
  })
}

export async function POST(req: NextRequest) {
  const { address } = await req.json()
  if (!address) return NextResponse.json({ error: 'address required' }, { status: 400 })
  const wallet = address.toLowerCase()

  const res = await sbFetch(`wallet_emo_coins?wallet_address=eq.${wallet}&select=*`)
  const rows = await res.json()

  if (rows.length === 0) {
    return NextResponse.json({ error: 'wallet_not_found' }, { status: 404 })
  }

  const row = rows[0]

  if (row.balance < PREMIUM_COST) {
    return NextResponse.json(
      { error: 'insufficient_balance', required: PREMIUM_COST, balance: row.balance },
      { status: 400 }
    )
  }

  const now = new Date()
  const currentExpiry = row.premium_expires_at ? new Date(row.premium_expires_at) : null
  const base = currentExpiry && currentExpiry.getTime() > now.getTime() ? currentExpiry : now
  const newExpiry = new Date(base.getTime() + PREMIUM_DURATION_MS)
  const newBalance = row.balance - PREMIUM_COST

  await sbFetch(`wallet_emo_coins?wallet_address=eq.${wallet}`, {
    method: 'PATCH',
    body: JSON.stringify({
      balance: newBalance,
      is_premium: true,
      premium_expires_at: newExpiry.toISOString()
    })
  })

  return NextResponse.json({
    success: true,
    balance: newBalance,
    isPremium: true,
    premiumExpiresAt: newExpiry.toISOString()
  })
}

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address')
  if (!address) return NextResponse.json({ error: 'address required' }, { status: 400 })
  const wallet = address.toLowerCase()

  const res = await sbFetch(`wallet_emo_coins?wallet_address=eq.${wallet}&select=*`)
  const rows = await res.json()

  if (rows.length === 0) {
    return NextResponse.json({ isPremium: false, premiumExpiresAt: null })
  }

  const row = rows[0]
  const isActive = row.is_premium && row.premium_expires_at && new Date(row.premium_expires_at).getTime() > Date.now()

  return NextResponse.json({ isPremium: !!isActive, premiumExpiresAt: row.premium_expires_at })
}
