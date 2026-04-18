import { NextRequest, NextResponse } from 'next/server';

const ALCHEMY_SOL_URL = `https://solana-mainnet.g.alchemy.com/v2/${process.env.THEWALL_SOL_KEY}`;
const SOLANA_ADDRESS = '5auZoWJxJodSU8dwgKmAfmphv5Z9Su3HAzEdLz1EUZs7';

export async function GET() {
  if (!process.env.THEWALL_SOL_KEY) {
    return NextResponse.json({
      status: 'error',
      message: 'Alchemy Solana key missing in environment variables'
    }, { status: 500 });
  }

  try {
    const res = await fetch(ALCHEMY_SOL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getAccountInfo',
        params: [
          SOLANA_ADDRESS,
          { encoding: 'base58' }
        ]
      })
    });

    if (!res.ok) {
      throw new Error(`Alchemy error: ${res.status}`);
    }

    const data = await res.json();

    return NextResponse.json({
      status: 'success',
      address: SOLANA_ADDRESS,
      solanaData: data?.result,
      note: 'Fetched from Alchemy Solana RPC'
    });

  } catch (error: any) {
    console.error('Alchemy Solana fetch error:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message || 'Failed to fetch Solana data'
    }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ status: 'ok', message: 'POST route active' });
}
