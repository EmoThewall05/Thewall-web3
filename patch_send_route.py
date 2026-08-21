#!/usr/bin/env python3
"""
TheWall Web3 - Wire approval check into send route
Run this from ~/Thewall-web3
"""
import re

path = 'app/api/send/route.ts'

with open(path) as f:
    content = f.read()

# 1. Add import for supabase admin client
if "getSupabaseAdmin" not in content:
    content = content.replace(
        "import { getUsdValue } from '@/lib/priceFeed'",
        "import { getUsdValue } from '@/lib/priceFeed'\nimport { getSupabaseAdmin } from '@/lib/supabase'"
    )

# 2. Extract txId from body
content = content.replace(
    "const { action, chain, to, amount, from, signedTx } = body",
    "const { action, chain, to, amount, from, signedTx, txId } = body"
)

# 3. Insert approval check right before the broadcast block
old_broadcast = """    if (action === 'broadcast') {
      if (!signedTx) throw new Error('signedTx required')
      const txHash = (chain === 'SOL') ? await broadcastSolTx(signedTx) : await broadcastEthTx(signedTx)
      return NextResponse.json({ success: true, chain, txHash, explorerUrl: chain === 'SOL' ? `https://solscan.io/tx/${txHash}` : `https://etherscan.io/tx/${txHash}` })
    }"""

new_broadcast = """    if (action === 'broadcast') {
      if (!signedTx) throw new Error('signedTx required')

      // ── Require an approved transaction_approvals record before broadcasting ──
      if (!txId) throw new Error('txId required - transaction must be approved before broadcast')

      const supabase = getSupabaseAdmin()
      const { data: approval, error: approvalErr } = await supabase
        .from('transaction_approvals')
        .select('status, expires_at')
        .eq('id', txId)
        .single()

      if (approvalErr || !approval) throw new Error('Approval record not found')
      if (approval.status !== 'approved') throw new Error(`Transaction not approved (status: ${approval.status})`)
      if (new Date(approval.expires_at).getTime() < Date.now()) throw new Error('Approval expired')

      const txHash = (chain === 'SOL') ? await broadcastSolTx(signedTx) : await broadcastEthTx(signedTx)

      // Mark approval as consumed so it can't be replayed for a second broadcast
      await supabase.from('transaction_approvals').update({ status: 'broadcasted' }).eq('id', txId)

      return NextResponse.json({ success: true, chain, txHash, explorerUrl: chain === 'SOL' ? `https://solscan.io/tx/${txHash}` : `https://etherscan.io/tx/${txHash}` })
    }"""

if old_broadcast not in content:
    print("[WARN] Exact broadcast block not found - manual check needed, no changes made to broadcast logic")
else:
    content = content.replace(old_broadcast, new_broadcast)
    print("[OK] wired approval check into broadcast action")

with open(path, 'w') as f:
    f.write(content)

print("[OK] patched app/api/send/route.ts")
print("\nFlow ippol ith pole aanu:")
print("1. prepare -> user tx details kaanunnu")
print("2. approve/route.ts POST action=create -> txId kittum")
print("3. Frontend approve/route.ts GET poll cheyyum (or push notification) -> user approve/deny cheyyum")
print("4. approved aayal mathram -> send/route.ts POST action=broadcast (txId koodi pass cheyyanam)")
print("5. broadcast success aayal approval status 'broadcasted' aayi mark cheyyum (replay prevent cheyyaan)")
