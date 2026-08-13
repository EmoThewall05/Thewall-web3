import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { referrerAddress, referredAddress } = await req.json();

    if (!referrerAddress || !referredAddress) {
      return NextResponse.json({ error: 'Missing addresses' }, { status: 400 });
    }

    if (referrerAddress.toLowerCase() === referredAddress.toLowerCase()) {
      return NextResponse.json({ error: 'Cannot refer yourself' }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('wallet_referrals')
      .select('id')
      .eq('referred_address', referredAddress.toLowerCase())
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Already referred' }, { status: 409 });
    }

    const { error } = await supabase.from('wallet_referrals').insert({
      referrer_address: referrerAddress.toLowerCase(),
      referred_address: referredAddress.toLowerCase(),
      rewarded: false,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
