#!/usr/bin/env python3
"""
TheWall Web3 - Transaction Approval System Patch
Run this from ~/Thewall-web3
"""
import os
import re

ROOT = os.getcwd()

def write_file(rel_path, content):
    full_path = os.path.join(ROOT, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w') as f:
        f.write(content)
    print(f"[OK] wrote {rel_path}")

# ── 1. Fix .env.local ──
env_path = os.path.join(ROOT, '.env.local')
env_content = ""
if os.path.exists(env_path):
    with open(env_path) as f:
        env_content = f.read()

# Replace old SUPABASE_URL, add missing keys
env_content = re.sub(
    r'SUPABASE_URL="https://havmduragglvstlxrgag\.supabase\.co"',
    'SUPABASE_URL="https://kwciyiwdyotebdgyjxgt.supabase.co"',
    env_content
)

additions = []
if 'NEXT_PUBLIC_SUPABASE_URL' not in env_content:
    additions.append('NEXT_PUBLIC_SUPABASE_URL="https://kwciyiwdyotebdgyjxgt.supabase.co"')
if 'NEXT_PUBLIC_SUPABASE_ANON_KEY' not in env_content:
    additions.append('NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3Y2l5aXdkeW90ZWJkZ3lqeGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5OTQ0MjUsImV4cCI6MjEwMjU3MDQyNX0.cSxsDwEz-Lfy9YLFfQ5mSK15Ne0O3vbxJBz8IABmF08"')
if 'SUPABASE_SERVICE_ROLE_KEY' not in env_content:
    additions.append('SUPABASE_SERVICE_ROLE_KEY="PASTE_YOUR_SERVICE_ROLE_KEY_HERE"')

if additions:
    env_content = env_content.rstrip() + '\n\n# Added by transaction approval patch\n' + '\n'.join(additions) + '\n'

with open(env_path, 'w') as f:
    f.write(env_content)
print("[OK] patched .env.local")
if 'PASTE_YOUR_SERVICE_ROLE_KEY_HERE' in env_content:
    print("[ACTION NEEDED] .env.local -il SUPABASE_SERVICE_ROLE_KEY manual aayi paste cheyyanam (Supabase dashboard -> Settings -> API)")

# ── 2. lib/supabase.ts ──
write_file('lib/supabase.ts', '''import { createClient } from '@supabase/supabase-js'

// Server-side admin client (service role) - use only in API routes
export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
''')

# ── 3. app/api/auth/approve/route.ts - Supabase-backed ──
write_file('app/api/auth/approve/route.ts', '''export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Alchemy Gas Manager sponsorship check (unchanged, unrelated to approvals)
    if (body.userOperation || body.entryPoint) {
      return NextResponse.json({
        sponsorshipPolicyId: process.env.ALCHEMY_GAS_POLICY_ID,
      })
    }

    const { txId, action, walletAddress, email, amount, token, to, chain, transactionType, rawTxData } = body
    const supabase = getSupabaseAdmin()

    // ── Create a new pending approval ──
    if (action === 'create') {
      if (!walletAddress) return NextResponse.json({ error: 'walletAddress required' }, { status: 400 })

      const { data, error } = await supabase
        .from('transaction_approvals')
        .insert({
          wallet_address: walletAddress,
          email: email || null,
          transaction_type: transactionType || 'send',
          amount: String(amount ?? ''),
          token: token || 'ETH',
          recipient_address: to || null,
          chain: chain || 'ETH',
          status: 'pending',
          raw_tx_data: rawTxData || null,
        })
        .select('id')
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, txId: data.id, status: 'pending' })
    }

    // ── Approve / reject an existing approval ──
    if (action === 'approved' || action === 'rejected') {
      if (!txId) return NextResponse.json({ error: 'txId required' }, { status: 400 })

      const { data: existing, error: fetchErr } = await supabase
        .from('transaction_approvals')
        .select('*')
        .eq('id', txId)
        .single()

      if (fetchErr || !existing) return NextResponse.json({ error: 'TX not found' }, { status: 404 })

      if (existing.status !== 'pending') {
        return NextResponse.json({ error: `TX already ${existing.status}` }, { status: 400 })
      }

      if (new Date(existing.expires_at).getTime() < Date.now()) {
        await supabase.from('transaction_approvals').update({ status: 'expired' }).eq('id', txId)
        return NextResponse.json({ error: 'TX expired' }, { status: 400 })
      }

      const { error: updateErr } = await supabase
        .from('transaction_approvals')
        .update({ status: action, responded_at: new Date().toISOString() })
        .eq('id', txId)

      if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })
      return NextResponse.json({ success: true, txId, status: action })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Invalid request' }, { status: 400 })
  }
}

// Poll for approval status
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const txId = searchParams.get('txId')
  if (!txId) return NextResponse.json({ error: 'txId required' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  const { data: approval, error } = await supabase
    .from('transaction_approvals')
    .select('*')
    .eq('id', txId)
    .single()

  if (error || !approval) return NextResponse.json({ status: 'not_found' })

  if (approval.status === 'pending' && new Date(approval.expires_at).getTime() < Date.now()) {
    await supabase.from('transaction_approvals').update({ status: 'expired' }).eq('id', txId)
    return NextResponse.json({ status: 'expired' })
  }

  return NextResponse.json({ txId, ...approval })
}
''')

print("\\n[DONE] Patch applied. Ini ee steps cheyyanam:")
print("1. .env.local -il SUPABASE_SERVICE_ROLE_KEY paste cheyyuka (already marked ACTION NEEDED)")
print("2. app/api/send/route.ts -il approval check wire cheyyendathundu - adutha message-il varum")
print("3. npm run build cheythu test cheyyuka")
