const COINGECKO_IDS: Record<string, string> = {
  ETH: 'ethereum',
  SOL: 'solana',
}

export async function getUsdPrice(symbol: string): Promise<number> {
  const id = COINGECKO_IDS[symbol]
  if (!id) return 0
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`)
    const data = await res.json()
    return data?.[id]?.usd || 0
  } catch {
    return 0
  }
}

export async function getUsdValue(symbol: string, amount: string | number): Promise<number> {
  const price = await getUsdPrice(symbol)
  return price * parseFloat(String(amount))
}
