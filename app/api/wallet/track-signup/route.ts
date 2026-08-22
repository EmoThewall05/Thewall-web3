import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json()
    if (!address || typeof address !== 'string') {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
    }
    const supabase = getSupabaseAdmin()
    await supabase
      .from('smart_wallet_signups')
      .upsert({ wallet_address: address.toLowerCase() }, { onConflict: 'wallet_address' })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 })
  }
}
