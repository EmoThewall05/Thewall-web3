export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'

// ── ETH Transaction via Alchemy ──
async function broadcastEthTx(signedTx: string): Promise<string> {
  const alchemyKey = process.env.ALCHEMY_API_KEY
  const rpcUrl = `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`

  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1,
      method: 'eth_sendRawTransaction',
      params: [signedTx],
    }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.result
}

// ── SOL Transaction via Helius ──
async function broadcastSolTx(signedTx: string): Promise<string> {
  const heliusKey = process.env.NEXT_PUBLIC_HELIUS_KEY 
  const rpcUrl = `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`

  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1,
      method: 'sendTransaction',
      params: [signedTx, { encoding: 'base64', skipPreflight: true }],
    }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.result
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, chain, to, amount, from, signedTx } = body

    if (!action) return NextResponse.json({ error: 'Action required' }, { status: 400 })

    // SOLANA PREPARE
    if (action === 'prepare' && chain === 'SOL') {
      const heliusKey = process.env.NEXT_PUBLIC_HELIUS_KEY
      const rpcUrl = `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`

      const blockhashRes = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0', id: 1,
          method: 'getLatestBlockhash',
          params: [{ commitment: 'finalized' }],
        }),
      })
      const blockhashData = await blockhashRes.json()
      const blockhash = blockhashData.result?.value?.blockhash
      const lamports = Math.floor(parseFloat(amount) * 1e9)

      return NextResponse.json({
        success: true,
        action: 'prepare',
        chain: 'SOL',
        tx: { from, to, lamports, blockhash },
      })
    }

    // BROADCAST LOGIC
    if (action === 'broadcast') {
      if (!signedTx) throw new Error('signedTx required')
      const txHash = (chain === 'SOL') ? await broadcastSolTx(signedTx) : await broadcastEthTx(signedTx)
      
      return NextResponse.json({
        success: true,
        chain,
        txHash,
        explorerUrl: chain === 'SOL' ? `https://solscan.io/tx/${txHash}` : `https://etherscan.io/tx/${txHash}`,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
