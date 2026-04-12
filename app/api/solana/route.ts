import { NextRequest, NextResponse } from 'next/server';

const SOLSCAN_API_KEY = process.env.NEXT_PUBLIC_SOLSCAN_API_KEY || '';
const SOLANA_ADDRESS = '5auZoWJxJodSU8dwgKmAfmphv5Z9Su3HAzEdLz1EUZs7'; // Ninte Soul wallet

export async function GET() {
  if (!SOLSCAN_API_KEY) {
    return NextResponse.json({
      status: 'error',
      message: 'Solscan API key missing in Vercel Environment Variables'
    }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://public-api.solscan.io/v2.0/account?address=${SOLANA_ADDRESS}`,
      {
        headers: {
          'accept': 'application/json',
          'x-api-key': SOLSCAN_API_KEY,
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Solscan error: ${res.status}`);
    }

    const data = await res.json();

    return NextResponse.json({
      status: 'success',
      address: SOLANA_ADDRESS,
      solanaData: data,
      note: 'Fetched from Solscan API'
    });

  } catch (error: any) {
    console.error('Solscan fetch error:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message || 'Failed to fetch Solana data'
    }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ status: 'ok', message: 'POST route active' });
}
