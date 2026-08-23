import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { wallet_address: raw_address, display_name } = await req.json()

    if (!raw_address) {
      return NextResponse.json({ error: 'wallet_address required' }, { status: 400 })
    }
    const wallet_address = raw_address.toLowerCase()

    const supabase = getSupabaseAdmin()

    const { data: existing } = await supabase
      .from('copy_leaders')
      .select('wallet_address')
      .eq('wallet_address', wallet_address)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ already_leader: true })
    }

    const { data, error } = await supabase
      .from('copy_leaders')
      .insert({
        wallet_address,
        display_name: display_name || null,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ leader: data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 })
  }
}
