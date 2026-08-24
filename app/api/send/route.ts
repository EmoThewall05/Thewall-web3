export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getFeeTier } from '@/lib/feeTier'
import { getUsdValue } from '@/lib/priceFeed'
import { getSupabaseAdmin } from '@/lib/supabase'

async function broadcastEthTx(signedTx: string): Promise<string> {
  const alchemyKey = process.env.ALCHEMY_API_KEY
  const rpcUrl = `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`
  const res = await fetch(rpcUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_sendRawTransaction', params: [signedTx] }) })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.result
}

async function simulateEthTx(from: string, to: string, amount: string) {
  const alchemyKey = process.env.ALCHEMY_API_KEY
  const rpcUrl = `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`
  const valueWei = '0x' + BigInt(Math.floor(parseFloat(amount) * 1e18)).toString(16)
  const res = await fetch(rpcUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'alchemy_simulateAssetChanges', params: [{ from, to, value: valueWei }] }) })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.result
}

async function broadcastSolTx(signedTx: string): Promise<string> {
  const heliusKey = process.env.NEXT_PUBLIC_HELIUS_KEY
  const rpcUrl = `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`
  const res = await fetch(rpcUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'sendTransaction', params: [signedTx, { encoding: 'base64', skipPreflight: true }] }) })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.result
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, chain, to, amount, from, signedTx, txId } = body
    if (!action) return NextResponse.json({ error: 'Action required' }, { status: 400 })

    if (action === 'prepare' && chain === 'SOL') {
      const heliusKey = process.env.NEXT_PUBLIC_HELIUS_KEY
      const rpcUrl = `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`
      const blockhashRes = await fetch(rpcUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getLatestBlockhash', params: [{ commitment: 'finalized' }] }) })
      const blockhashData = await blockhashRes.json()
      const blockhash = blockhashData.result?.value?.blockhash
      const lamports = Math.floor(parseFloat(amount) * 1e9)
      const usdValue = await getUsdValue('SOL', amount)
      const { feePercent, isPremium } = await getFeeTier(from, usdValue)
      const feeLamports = Math.floor(lamports * (feePercent / 100))
      return NextResponse.json({
        success: true, action: 'prepare', chain: 'SOL',
        tx: { from, to, lamports, blockhash },
        fee: { lamports: feeLamports, amount: (feeLamports / 1e9).toFixed(8), treasury: 'HkQNve2SA7jwvrRUrAty4EnpYo4VHzPb1pBVq2FdGTQo', feePercent, isPremium, note: 'Send this as a second transaction after the main transfer confirms' },
      })
    }

    if (action === 'prepare' && chain === 'ETH') {
      const alchemyKey = process.env.ALCHEMY_API_KEY
      const rpcUrl = `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`
      const [nonceRes, gasPriceRes, gasLimitRes] = await Promise.all([
        fetch(rpcUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount', params: [from, 'pending'] }) }),
        fetch(rpcUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_gasPrice', params: [] }) }),
        fetch(rpcUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_estimateGas', params: [{ from, to, value: '0x' + BigInt(Math.floor(parseFloat(amount) * 1e18)).toString(16) }] }) }),
      ])
      const nonceData = await nonceRes.json()
      const gasPriceData = await gasPriceRes.json()
      const gasLimitData = await gasLimitRes.json()
      const usdValue = await getUsdValue('ETH', amount)
      const { feePercent, isPremium } = await getFeeTier(from, usdValue)
      const feeAmount = parseFloat(amount) * (feePercent / 100)
      const feeWei = '0x' + BigInt(Math.floor(feeAmount * 1e18)).toString(16)
      return NextResponse.json({
        success: true, action: 'prepare', chain: 'ETH',
        tx: { from, to, value: '0x' + BigInt(Math.floor(parseFloat(amount) * 1e18)).toString(16), nonce: nonceData.result, gasPrice: gasPriceData.result, gasLimit: gasLimitData.result },
        fee: { amount: feeAmount.toFixed(8), valueWei: feeWei, treasury: '0x36F0C4Ce3ed7DbfeF2037b6275BFB3096B5e699F', feePercent, isPremium, note: 'Send this as a second transaction after the main transfer confirms' },
      })
    }

    if (action === 'simulate' && chain === 'ETH') {
      const result = await simulateEthTx(from, to, amount)
      const changes = (result?.changes || []).map((ch: any) => ({
        type: ch.assetType === 'NATIVE' ? (ch.from?.toLowerCase() === from?.toLowerCase() ? 'SEND' : 'RECEIVE') : ch.assetType,
        amount: ch.amount ? `${(parseInt(ch.amount, 16) / 1e18).toFixed(6)} ETH` : amount,
      }))
      return NextResponse.json({ success: true, changes, gasEstimate: { gasUsed: result?.gasUsed } })
    }

    if (action === 'broadcast') {
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
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
