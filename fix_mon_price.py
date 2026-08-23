path = 'app/api/prices/route.ts'
with open(path) as f:
    content = f.read()

old1 = """const COINGECKO_IDS: Record<string, string> = {
  ETH:  'ethereum',
  BNB:  'binancecoin',
  USDC: 'usd-coin',
  USDT: 'tether',
  SOL:  'solana',
  BTC:  'bitcoin',
  ARB:  'arbitrum',
}"""

new1 = """const COINGECKO_IDS: Record<string, string> = {
  ETH:  'ethereum',
  BNB:  'binancecoin',
  USDC: 'usd-coin',
  USDT: 'tether',
  SOL:  'solana',
  BTC:  'bitcoin',
  ARB:  'arbitrum',
  MON:  'monad',
}"""

old2 = """// MON (Monad) — mainnet not launched yet, using placeholder
const PLACEHOLDER_PRICES: Record<string, { price: number; change24h: number }> = {
  MON: { price: 0.00, change24h: 0 },
  EMC: { price: 0.01, change24h: 0 },
}"""

new2 = """const PLACEHOLDER_PRICES: Record<string, { price: number; change24h: number }> = {
  EMC: { price: 0.01, change24h: 0 },
}"""

changes = []

if old1 in content:
    content = content.replace(old1, new1)
    changes.append('[OK] MON added to COINGECKO_IDS (id: monad)')
elif new1 in content:
    changes.append('[SKIP] COINGECKO_IDS already patched')
else:
    changes.append('[WARN] COINGECKO_IDS block not found')

if old2 in content:
    content = content.replace(old2, new2)
    changes.append('[OK] MON removed from PLACEHOLDER_PRICES')
elif new2 in content:
    changes.append('[SKIP] PLACEHOLDER_PRICES already patched')
else:
    changes.append('[WARN] PLACEHOLDER_PRICES block not found')

with open(path, 'w') as f:
    f.write(content)

for c in changes:
    print(c)
