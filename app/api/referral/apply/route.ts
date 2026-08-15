import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_MY_NETWORK!;

async function sbFetch(path: string, init?: RequestInit) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation', ...(init?.headers || {}) },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { referrerAddress, referredAddress } = await req.json();
    if (!referrerAddress || !referredAddress) return NextResponse.json({ error: 'Missing addresses' }, { status: 400 });
    if (referrerAddress.toLowerCase() === referredAddress.toLowerCase()) return NextResponse.json({ error: 'Cannot refer yourself' }, { status: 400 });

    const referrer = referrerAddress.toLowerCase();
    const referred = referredAddress.toLowerCase();

    const existingRes = await sbFetch(`wallet_referrals?referred_address=eq.${referred}&select=id`);
    const existingRows = await existingRes.json();
    if (existingRows?.[0]) return NextResponse.json({ error: 'Already referred' }, { status: 409 });

    const referrerRes = await sbFetch(`wallet_emo_coins?wallet_address=eq.${referrer}&select=balance,is_premium,premium_expires_at`);
    const referrerRows = await referrerRes.json();
    const referrerRow = referrerRows?.[0];
    const referrerIsPremium = !!(referrerRow?.is_premium && referrerRow?.premium_expires_at && new Date(referrerRow.premium_expires_at).getTime() > Date.now());

    const referrerBonus = referrerIsPremium ? 50 : 20;
    const referredBonus = referrerIsPremium ? 20 : 10;

    const insertRes = await sbFetch(`wallet_referrals`, { method: 'POST', body: JSON.stringify({ referrer_address: referrer, referred_address: referred, rewarded: false }) });
    if (!insertRes.ok) {
      const errData = await insertRes.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to insert referral');
    }

    if (referrerRow) {
      await sbFetch(`wallet_emo_coins?wallet_address=eq.${referrer}`, { method: 'PATCH', body: JSON.stringify({ balance: (referrerRow.balance || 0) + referrerBonus }) });
    } else {
      await sbFetch(`wallet_emo_coins`, { method: 'POST', body: JSON.stringify({ wallet_address: referrer, balance: referrerBonus }) });
    }

    const referredRes = await sbFetch(`wallet_emo_coins?wallet_address=eq.${referred}&select=balance`);
    const referredRows = await referredRes.json();
    const referredRow = referredRows?.[0];

    if (referredRow) {
      await sbFetch(`wallet_emo_coins?wallet_address=eq.${referred}`, { method: 'PATCH', body: JSON.stringify({ balance: (referredRow.balance || 0) + referredBonus }) });
    } else {
      await sbFetch(`wallet_emo_coins`, { method: 'POST', body: JSON.stringify({ wallet_address: referred, balance: referredBonus }) });
    }

    await sbFetch(`wallet_referrals?referred_address=eq.${referred}`, { method: 'PATCH', body: JSON.stringify({ rewarded: true }) });

    return NextResponse.json({ success: true, referrerBonus, referredBonus, referrerIsPremium });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
