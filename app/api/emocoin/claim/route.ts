import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_MY_NETWORK!
const DAY_MS = 24 * 60 * 60 * 1000
const REFERRER_BONUS = 50
const REFERRED_BONUS = 20

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

async function creditWallet(wallet: string, amount: number) {
  const res = await sbFetch(`wallet_emo_coins?wallet_address=eq.${wallet}&select=*`)
  const rows = await res.json()

  if (rows.length === 0) {
    await sbFetch('wallet_emo_coins', {
      method: 'POST',
      body: JSON.stringify({ wallet_address: wallet, balance: amount, last_claim_at: null })
    })
    return
  }

  const newBalance = rows[0].balance + amount
  await sbFetch(`wallet_emo_coins?wallet_address=eq.${wallet}`, {
    method: 'PATCH',
    body: JSON.stringify({ balance: newBalance })
  })
}

async function processReferralReward(wallet: string) {
  const res = await sbFetch(
    `wallet_referrals?referred_address=eq.${wallet}&rewarded=eq.false&select=*`
  )
  const rows = await res.json()
  if (rows.length === 0) return

  const referral = rows[0]

  await creditWallet(referral.referrer_address, REFERRER_BONUS)
  await creditWallet(wallet, REFERRED_BONUS)

  await sbFetch(`wallet_referrals?id=eq.${referral.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ rewarded: true })
  })
}

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address')
  if (!address) return NextResponse.json({ error: 'address required' }, { status: 400 })
  const wallet = address.toLowerCase()

  const res = await sbFetch(`wallet_emo_coins?wallet_address=eq.${wallet}&select=*`)
  const rows = await res.json()

  if (rows.length === 0) {
    const insertRes = await sbFetch('wallet_emo_coins', {
      method: 'POST',
      body: JSON.stringify({ wallet_address: wallet, balance: 0, last_claim_at: null })
    })
    const inserted = await insertRes.json()
    return NextResponse.json({ balance: inserted[0]?.balance ?? 0, lastClaimAt: null })
  }

  return NextResponse.json({ balance: rows[0].balance, lastClaimAt: rows[0].last_claim_at })
}

export async function POST(req: NextRequest) {
  const { address } = await req.json()
  if (!address) return NextResponse.json({ error: 'address required' }, { status: 400 })
  const wallet = address.toLowerCase()

  const res = await sbFetch(`wallet_emo_coins?wallet_address=eq.${wallet}&select=*`)
  const rows = await res.json()
  const now = new Date()

  if (rows.length === 0) {
    const insertRes = await sbFetch('wallet_emo_coins', {
      method: 'POST',
      body: JSON.stringify({ wallet_address: wallet, balance: 10, last_claim_at: now.toISOString() })
    })
    const inserted = await insertRes.json()

    await processReferralReward(wallet)

    const finalRes = await sbFetch(`wallet_emo_coins?wallet_address=eq.${wallet}&select=*`)
    const finalRows = await finalRes.json()

    return NextResponse.json({ balance: finalRows[0]?.balance ?? inserted[0]?.balance ?? 10, claimed: true })
  }

  const row = rows[0]
  const lastClaim = row.last_claim_at ? new Date(row.last_claim_at) : null

  if (lastClaim && now.getTime() - lastClaim.getTime() < DAY_MS) {
    const remainingMs = DAY_MS - (now.getTime() - lastClaim.getTime())
    return NextResponse.json(
      { error: 'already_claimed', remainingMs, balance: row.balance },
      { status: 429 }
    )
  }

  const newBalance = row.balance + 10
  await sbFetch(`wallet_emo_coins?wallet_address=eq.${wallet}`, {
    method: 'PATCH',
    body: JSON.stringify({ balance: newBalance, last_claim_at: now.toISOString() })
  })

  await processReferralReward(wallet)

  const finalRes = await sbFetch(`wallet_emo_coins?wallet_address=eq.${wallet}&select=*`)
  const finalRows = await finalRes.json()

  return NextResponse.json({ balance: finalRows[0]?.balance ?? newBalance, claimed: true })
}
