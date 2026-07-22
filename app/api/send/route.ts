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

// ── ETH: Prepare unsigned tx (nonce, gas, chainId) ──
async function prepareEthTx(from: string, to: string, amount: string) {
  const alchemyKey = process.env.ALCHEMY_API_KEY
  const rpcUrl = `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`

  const rpcCall = async (method: string, params: any[]) => {
    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    })
    const data = await res.json()
    if (data.error) throw new Error(data.error.message)
    return data.result
  }

  const valueWei = '0x' + BigInt(Math.floor(parseFloat(amount) * 1e18)).toString(16)

  const [nonce, gasPrice, chainIdHex] = await Promise.all([
    rpcCall('eth_getTransactionCount', [from, 'latest']),
    rpcCall('eth_gasPrice', []),
    rpcCall('eth_chainId', []),
  ])

  const gasLimit = await rpcCall('eth_estimateGas', [{ from, to, value: valueWei }])

  return {
    from, to,
    value: valueWei,
    nonce,
    gasPrice,
    gasLimit,
    chainId: chainIdHex,
  }
}

// ── ETH: Simulate asset changes before send ──
async function simulateEthTx(from: string, to: string, amount: string) {
  const alchemyKey = process.env.ALCHEMY_API_KEY
  const rpcUrl = `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`

  const valueWei = '0x' + BigInt(Math.floor(parseFloat(amount) * 1e18)).toString(16)

  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1,
      method: 'alchemy_simulateAssetChanges',
      params: [{ from, to, value: valueWei }],
    }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.result // { changes: [...], gasUsed, error }
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

    // ETH PREPARE
    if (action === 'prepare' && chain === 'ETH') {
      const tx = await prepareEthTx(from, to, amount)
      return NextResponse.json({ success: true, action: 'prepare', chain: 'ETH', tx })
    }

    // ETH SIMULATE (asset-changes preview)
    if (action === 'simulate' && chain === 'ETH') {
      const result = await simulateEthTx(from, to, amount)
      return NextResponse.json({ success: true, action: 'simulate', chain: 'ETH', result })
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
