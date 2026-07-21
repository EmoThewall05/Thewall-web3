import { NextRequest, NextResponse } from 'next/server';

const KEY = process.env.THEWALL_EARTH_MAIN_KEY;
const RPC: Record<string, string> = {
  'eth-mainnet':     `https://eth-mainnet.g.alchemy.com/v2/${KEY}`,
  'base-mainnet':    `https://base-mainnet.g.alchemy.com/v2/${KEY}`,
  'polygon-mainnet': `https://polygon-mainnet.g.alchemy.com/v2/${KEY}`,
  'bnb-mainnet':     `https://bnb-mainnet.g.alchemy.com/v2/${KEY}`,
  'arb-mainnet':     `https://arb-mainnet.g.alchemy.com/v2/${KEY}`,
};

async function alchemyPost(url: string, method: string, params: unknown[]) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  return res.json();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');
  const network = searchParams.get('network') || 'eth-mainnet';
  if (!address) return NextResponse.json({ error: 'Address required' }, { status: 400 });

  const url = RPC[network] || RPC['eth-mainnet'];
  const ZERO = '0x' + '0'.repeat(64);

  try {
    const balData = await alchemyPost(url, 'alchemy_getTokenBalances', [address, 'erc20']);
    const all = balData.result?.tokenBalances || [];
    const nonZero = all.filter((t: any) => t.tokenBalance !== ZERO).slice(0, 20);
    if (!nonZero.length) return NextResponse.json({ tokens: [] });

    const tokens = await Promise.all(nonZero.map(async (t: any) => {
      try {
        const meta = (await alchemyPost(url, 'alchemy_getTokenMetadata', [t.contractAddress])).result || {};
        const dec = meta.decimals || 18;
        const raw = BigInt(t.tokenBalance);
        const div = BigInt(10) ** BigInt(dec);
        const bal = Number(raw / div) + Number(raw % div) / Math.pow(10, dec);
        return {
          address: t.contractAddress,
          symbol: meta.symbol || '???',
          name: meta.name || 'Unknown',
          logo: meta.logo || null,
          balance: bal < 0.0001 ? bal.toExponential(2) : bal.toFixed(4),
        };
      } catch { return null; }
    }));

    return NextResponse.json({ tokens: tokens.filter(Boolean) });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
