const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_MY_NETWORK!

export const FREE_FEE_PCT = 1.0
export const PREMIUM_FEE_PCT = 0.3

export async function getFeeTier(walletAddress?: string | null): Promise<{ isPremium: boolean; feePercent: number }> {
  if (!walletAddress) return { isPremium: false, feePercent: FREE_FEE_PCT }
  try {
    const wallet = walletAddress.toLowerCase()
    const res = await fetch(`${SUPABASE_URL}/rest/v1/wallet_emo_coins?wallet_address=eq.${wallet}&select=is_premium,premium_expires_at`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    })
    const rows = await res.json()
    const row = rows?.[0]
    const isPremium = !!(row?.is_premium && row?.premium_expires_at && new Date(row.premium_expires_at).getTime() > Date.now())
    return { isPremium, feePercent: isPremium ? PREMIUM_FEE_PCT : FREE_FEE_PCT }
  } catch {
    return { isPremium: false, feePercent: FREE_FEE_PCT }
  }
}
