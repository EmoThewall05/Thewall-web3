path = 'app/api/prices/route.ts'
with open(path) as f:
    content = f.read()

old = """    // Placeholder prices (MON, EMC)
    for (const [symbol, priceData] of Object.entries(PLACEHOLDER_PRICES)) {
      prices[symbol] = priceData
    }"""

new = """    // Placeholder prices (MON, EMC)
    for (const [symbol, priceData] of Object.entries(PLACEHOLDER_PRICES)) {
      prices[symbol] = priceData
    }

    // BASE uses ETH price (native gas token on Base chain)
    if (prices.ETH) {
      prices.BASE = prices.ETH
    }"""

if old not in content:
    print('[WARN] target block not found - manual check needed')
elif new in content:
    print('[SKIP] already patched')
else:
    content = content.replace(old, new)
    with open(path, 'w') as f:
        f.write(content)
    print('[OK] BASE price mapped to ETH price')
