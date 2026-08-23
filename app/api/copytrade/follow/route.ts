import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { follower_address, leader_address, allocation_pct } = await req.json()

    if (!follower_address || !leader_address) {
      return NextResponse.json({ error: 'follower_address and leader_address required' }, { status: 400 })
    }

    const follower = follower_address.toLowerCase()
    const leader = leader_address.toLowerCase()
    const pct = Math.min(100, Math.max(1, Number(allocation_pct) || 10))

    if (follower === leader) {
      return NextResponse.json({ error: "You can't follow yourself" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { data: existing } = await supabase
      .from('copy_follows')
      .select('id, status')
      .eq('follower_address', follower)
      .eq('leader_address', leader)
      .maybeSingle()

    if (existing) {
      if (existing.status === 'active') {
        return NextResponse.json({ already_following: true })
      }
      // reactivate a previously paused/stopped follow with new allocation
      const { data, error } = await supabase
        .from('copy_follows')
        .update({ status: 'active', allocation_pct: pct, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ follow: data, reactivated: true })
    }

    const { data, error } = await supabase
      .from('copy_follows')
      .insert({
        follower_address: follower,
        leader_address: leader,
        allocation_pct: pct,
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ follow: data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 })
  }
}
