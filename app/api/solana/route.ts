import { NextResponse } from 'next/server';

const SOLANA_ADDRESS = '5auZoWJxJodSU8dwgKmAfmphv5Z9Su3HAzEdLz1EUZs7';

const RPC_URLS = [
  process.env.THEWALL_SOL_KEY ? `https://solana-mainnet.g.alchemy.com/v2/${process.env.THEWALL_SOL_KEY}` : null,
  process.env.NEXT_PUBLIC_HELIUS_URL || null,
  'https://api.mainnet-beta.solana.com',
  'https://solana-api.projectserum.com',
].filter(Boolean) as string[];

async function tryRPC(url: string) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1,
      method: 'getBalance',
      params: [SOLANA_ADDRESS]
    }),
    signal: AbortSignal.timeout(5000)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data;
}

export async function GET() {
  for (const url of RPC_URLS) {
    try {
      const data = await tryRPC(url);
      const lamports = data?.result?.value ?? 0;
      const solBalance = lamports / 1e9;
      return NextResponse.json({
        status: 'success',
        address: SOLANA_ADDRESS,
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
