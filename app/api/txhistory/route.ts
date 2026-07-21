export const runtime = 'edge'

import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const address = searchParams.get('address')
    const key     = process.env.THEWALL_EARTH_MAIN_KEY

    if (!address || !key) return NextResponse.json({ txs: [] })

    const url = `https://eth-mainnet.g.alchemy.com/v2/${key}`

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'alchemy_getAssetTransfers',
        params: [{
          fromBlock: '0x0',
          toAddress: address,
          category: ['external', 'erc20', 'internal'],
          order: 'desc',
          maxCount: '0x14',
          withMetadata: true,
        }],
      }),
      next: { revalidate: 60 },
    })
    const data = await res.json()

    const txs = (data.result?.transfers || []).map((tx: {
      hash: string
      from: string
      to: string
      value: number | null
      metadata: { blockTimestamp: string }
      category: string
      asset: string | null
    }) => ({
      hash:      tx.hash,
      from:      tx.from,
      to:        tx.to,
      value:     tx.value?.toFixed(6) ?? '0.000000',
      time:      new Date(tx.metadata.blockTimestamp).toLocaleDateString(),
      gas:       '—',
      status:    'success',
      method:    tx.category === 'external' ? 'Transfer' : tx.category,
    }))

    return NextResponse.json({ txs })
  } catch {
    return NextResponse.json({ txs: [] })
  }
}
