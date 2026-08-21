path = 'app/context/wallet.tsx'
with open(path) as f:
    content = f.read()

old = ".filter(k => k !== 'AVAILABLE_NAMESPACES' && typeof (allNetworks as any)[k] === 'object' && (allNetworks as any)[k] !== null && !TEST_PATTERN.test(k))"
new = ".filter(k => k !== 'AVAILABLE_NAMESPACES' && typeof (allNetworks as any)[k] === 'object' && (allNetworks as any)[k] !== null && !TEST_PATTERN.test(k) && !TEST_PATTERN.test((allNetworks as any)[k]?.name || ''))"

if old not in content:
    print('[WARN] target line not found - no changes made')
elif new in content:
    print('[SKIP] already patched')
else:
    content = content.replace(old, new)
    with open(path, 'w') as f:
        f.write(content)
    print('[OK] testnet filter now also checks network display name')
