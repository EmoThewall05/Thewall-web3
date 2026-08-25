export const runtime = "edge"

import { NextRequest, NextResponse } from 'next/server'
import { getFeeTier } from '@/lib/feeTier'
import { getUsdValue } from '@/lib/priceFeed'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getChain } from '@/lib/evmChains'

const EXPLORERS: Record<string, string> = {
  ETH: 'https://etherscan.io/tx/', ARB: 'https://arbiscan.io/tx/', OP: 'https://optimistic.etherscan.io/tx/',
  BASE: 'https://basescan.org/tx/', MATIC: 'https://polygonscan.com/tx/', MON: 'https://explorer.monad.xyz/tx/',
  BNB: 'https://bscscan.com/tx/', OPBNB: 'https://opbnbscan.com/tx/', ZORA: 'https://explorer.zora.energy/tx/',
  CELO: 'https://celoscan.io/tx/', CRONOS: 'https://cronoscan.com/tx/', BERA: 'https://berascan.com/tx/',
  APE: 'https://apescan.io/tx/', SONEIUM: 'https://soneium.blockscout.com/tx/', FRAX: 'https://fraxscan.com/tx/',
  INK: 'https://explorer.inkonchain.com/tx/', BOBA: 'https://bobascan.com/tx/', XLAYER: 'https://www.oklink.com/xlayer/tx/',
  UNICHAIN: 'https://uniscan.xyz/tx/', SHAPE: 'https://shapescan.xyz/tx/', ANIME: 'https://explorer.anime.xyz/tx/',
  MEGAETH: 'https://megaexplorer.xyz/tx/', GENSYN: 'https://explorer.gensyn.ai/tx/', STORY: 'https://storyscan.xyz/tx/',
  HYPERLIQUID: 'https://hyperliquid.cloud.blockscout.com/tx/', PLASMA: 'https://explorer.plasma.to/tx/', EDGE: 'https://explorer.edge.network/tx/',
}
function explorerFor(chain: string, txHash: string) {
  return chain === 'SOL' ? `https://solscan.io/tx/${txHash}` : `${EXPLORERS[chain] || 'https://etherscan.io/tx/'}${txHash}`
}

async function broadcastEvmTx(chain: string, signedTx: string): Promise<string> {
  const network = getChain(chain)?.alchemyNetwork || 'eth-mainnet'
  const alchemyKey = process.env.ALCHEMY_API_KEY
  const rpcUrl = `https://${network}.g.alchemy.com/v2/${alchemyKey}`
  const res = await fetch(rpcUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_sendRawTransaction', params: [signedTx] }) })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.result
}

async function simulateEvmTxFrom(chain: string, from: string, to: string, amount: string) {
  const network = getChain(chain)?.alchemyNetwork || 'eth-mainnet'
  const alchemyKey = process.env.ALCHEMY_API_KEY
  const rpcUrl = `https://${network}.g.alchemy.com/v2/${alchemyKey}`
  const valueWei = '0x' + BigInt(Math.floor(parseFloat(amount) * 1e18)).toString(16)
  const res = await fetch(rpcUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'alchemy_simulateAssetChanges', params: [{ from, to, value: valueWei }] }) })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.result
}

async function broadcastSolTx(signedTx: string): Promise<string> {
  const solanaKey = process.env.THEWALL_SOUL_KEY
  const rpcUrl = `https://solana-mainnet.g.alchemy.com/v2/${solanaKey}`
  const res = await fetch(rpcUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'sendTransaction', params: [signedTx, { encoding: 'base64', skipPreflight: true }] }) })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.result
}

// Requests Alchemy Gas Manager to sponsor fee + set feePayer on an unsigned Solana tx.
// Returns a base64 serialized tx that already contains the fee-payer signature.
async function requestSolFeePayer(serializedTxBase64: string): Promise<string> {
  const solanaKey = process.env.THEWALL_SOUL_KEY
  const policyId = process.env.NEXT_PUBLIC_SOLANA_GAS_POLICY_ID
  const rpcUrl = `https://solana-mainnet.g.alchemy.com/v2/${solanaKey}`
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'alchemy_requestFeePayer',
      params: [{ policyId, serializedTransaction: serializedTxBase64 }],
    }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message || 'Fee payer sponsorship failed')
  const sponsoredTx = data.result?.serializedTransaction
  if (!sponsoredTx) throw new Error('No sponsored transaction returned')
  return sponsoredTx
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, chain, to, amount, from, signedTx, txId, serializedTransaction } = body
    if (!action) return NextResponse.json({ error: 'Action required' }, { status: 400 })

    if (action === 'prepare' && chain === 'SOL') {
      const solanaKey = process.env.THEWALL_SOUL_KEY
      const rpcUrl = `https://solana-mainnet.g.alchemy.com/v2/${solanaKey}`
      const blockhashRes = await fetch(rpcUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getLatestBlockhash', params: [{ commitment: 'finalized' }] }) })
      const blockhashData = await blockhashRes.json()
      const blockhash = blockhashData.result?.value?.blockhash
      const lamports = Math.floor(parseFloat(amount) * 1e9)
      const usdValue = await getUsdValue('SOL', amount)
      const { feePercent, isPremium } = await getFeeTier(from, usdValue)
      const feeLamports = Math.floor(lamports * (feePercent / 100))
      return NextResponse.json({
        success: true, action: 'prepare', chain: 'SOL',
        tx: { from, to, amount, blockhash },
        fee: { lamports: feeLamports, amount: (feeLamports / 1e9).toFixed(8), treasury: 'HkQNve2SA7jwvrRUrAty4EnpYo4VHzPb1pBVq2FdGTQo', feePercent, isPremium, note: 'Send this as a second transaction after the main transfer confirms' },
      })
    }

    // Sponsor: sets feePayer + adds Gas Manager's fee-payer signature to an unsigned Solana tx.
    if (action === 'sponsor' && chain === 'SOL') {
      if (!serializedTransaction) throw new Error('serializedTransaction required')
      const sponsoredTx = await requestSolFeePayer(serializedTransaction)
      return NextResponse.json({ success: true, serializedTransaction: sponsoredTx })
    }

    // Generic EVM prepare — works for ETH, ARB, OP, BASE, MATIC, and every chain in evmChains.ts
    if (action === 'prepare' && chain !== 'SOL') {
      const chainCfg = getChain(chain)
      const network = chainCfg?.alchemyNetwork || 'eth-mainnet'
      const symbol = chainCfg?.symbol || 'ETH'
      const alchemyKey = process.env.ALCHEMY_API_KEY
      const rpcUrl = `https://${network}.g.alchemy.com/v2/${alchemyKey}`
      const [nonceRes, gasPriceRes, gasLimitRes] = await Promise.all([
        fetch(rpcUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount', params: [from, 'pending'] }) }),
        fetch(rpcUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_gasPrice', params: [] }) }),
        fetch(rpcUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_estimateGas', params: [{ from, to, value: '0x' + BigInt(Math.floor(parseFloat(amount) * 1e18)).toString(16) }] }) }),
      ])
      const nonceData = await nonceRes.json()
      const gasPriceData = await gasPriceRes.json()
      const gasLimitData = await gasLimitRes.json()
      const usdValue = await getUsdValue(symbol, amount)
      const { feePercent, isPremium } = await getFeeTier(from, usdValue)
      const feeAmount = parseFloat(amount) * (feePercent / 100)
      const feeWei = '0x' + BigInt(Math.floor(feeAmount * 1e18)).toString(16)

      return NextResponse.json({
        success: true, action: 'prepare', chain,
        tx: { from, to, value: '0x' + BigInt(Math.floor(parseFloat(amount) * 1e18)).toString(16), nonce: nonceData.result, gasPrice: gasPriceData.result, gasLimit: gasLimitData.result },
        fee: { amount: feeAmount.toFixed(8), feeWei, treasury: '0x36F0C4Ce3ed7DbfeF2037b6275BFB3096B5e699F', feePercent, isPremium, note: 'Send this as a second transaction after the main transfer confirms' }
      })
    }

    // Generic EVM simulate
    if (action === 'simulate' && chain !== 'SOL') {
      const symbol = getChain(chain)?.symbol || 'ETH'
      const result = await simulateEvmTxFrom(chain, from, to, amount)
      const changes = (result?.changes || []).map((ch: any) => ({
        type: ch.assetType === 'NATIVE' ? (ch.from?.toLowerCase() === from?.toLowerCase() ? 'SEND' : 'RECEIVE') : ch.assetType,
        amount: ch.amount ? `${(parseInt(ch.amount, 16) / 1e18).toFixed(6)} ${symbol}` : amount,
      }))
      return NextResponse.json({ success: true, changes, gasEstimate: { gasUsed: result?.gasUsed } })
    }

    if (action === 'broadcast') {
      if (!signedTx) throw new Error('signedTx required')
      // — Require an approved transaction-approvals record before broadcasting —
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

      const txHash = (chain === 'SOL') ? await broadcastSolTx(signedTx) : await broadcastEvmTx(chain, signedTx)

      // Mark approval as consumed so it can't be replayed for a second broadcast
      await supabase.from('transaction_approvals').update({ status: 'broadcasted' }).eq('id', txId)

      return NextResponse.json({ success: true, chain, txHash, explorerUrl: explorerFor(chain, txHash) })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
