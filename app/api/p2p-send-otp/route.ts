import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch('https://emowall-guardian.meradivin.workers.dev/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Guard-Key': process.env.THEWALL_P2P_GUARD_KEY as string,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
