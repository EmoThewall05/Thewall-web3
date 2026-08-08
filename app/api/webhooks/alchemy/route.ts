import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log("Alchemy Webhook Hit:", body)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const activities = body.event?.activity || [body.event || body]

    for (const act of activities) {
      await supabase.from('transactions').insert({
        from_address: act.fromAddress || act.from,
        to_address: act.toAddress || act.to,
        amount: act.value?.toString() || act.amount,
        tx_hash: act.hash || act.txHash,
        chain: body.event?.network || 'SOLANA',
        asset: act.asset,
        status: 'success',
        raw_log: body,
        created_at: new Date().toISOString()
      })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
