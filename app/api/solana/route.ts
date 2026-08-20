export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server';

const RPC_URLS = [
  process.env.THEWALL_SOUL_KEY ? `https://solana-mainnet.g.alchemy.com/v2/${process.env.THEWALL_SOUL_KEY}` : null,
  process.env.NEXT_PUBLIC_HELIUS_URL || null,
  'https://rpc.ankr.com/solana',
  'https://solana-mainnet.rpc.extrnode.com',
  'https://api.mainnet-beta.solana.com',
].filter(Boolean) as string[];

async function tryRPC(url: string, address: string) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1,
      method: 'getBalance',
      params: [address]
    }),
    signal: AbortSignal.timeout(5000)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ status: 'error', solBalance: 0, message: 'No Solana address provided' }, { status: 400 })
  }

  for (const url of RPC_URLS) {
    try {
      const data = await tryRPC(url, address);
      const lamports = data?.result?.value ?? 0;
      const solBalance = lamports / 1e9;
      return NextResponse.json({
        status: 'success',
        address,
        solBalance,
        lamports,
        rpc: url.includes('alchemy') ? 'alchemy' : url.includes('helius') ? 'helius' : 'public'
      });
    } catch (e) {
      continue;
    }
  }
  return NextResponse.json({ status: 'error', solBalance: 0, message: 'All RPCs failed' }, { status: 500 });
}

export async function POST() {
  return NextResponse.json({ status: 'ok' });
}
