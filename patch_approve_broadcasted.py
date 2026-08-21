#!/usr/bin/env python3
"""
TheWall Web3 - Add 'broadcasted' action to approve route
Run this from ~/Thewall-web3
"""

path = 'app/api/auth/approve/route.ts'

with open(path) as f:
    content = f.read()

old_block = """    if (action === 'approved' || action === 'rejected') {"""
new_block = """    if (action === 'broadcasted') {
      if (!txId) return NextResponse.json({ error: 'txId required' }, { status: 400 })
      const { error: bErr } = await supabase
        .from('transaction_approvals')
        .update({ status: 'broadcasted', responded_at: new Date().toISOString() })
        .eq('id', txId)
      if (bErr) return NextResponse.json({ error: bErr.message }, { status: 500 })
      return NextResponse.json({ success: true, txId, status: 'broadcasted' })
    }

    if (action === 'approved' || action === 'rejected') {"""

if old_block not in content:
    print("[WARN] target block not found - no changes made, check file manually")
elif "action === 'broadcasted'" in content:
    print("[SKIP] 'broadcasted' action already present")
else:
    content = content.replace(old_block, new_block)
    with open(path, 'w') as f:
        f.write(content)
    print("[OK] added 'broadcasted' action handler to approve/route.ts")
