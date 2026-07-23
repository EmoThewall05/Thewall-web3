import sys

FILE = "app/context/wallet.tsx"
with open(FILE) as f:
    c = f.read()

old = """  const mainnetChains = Object.keys(allNetworks)
    .filter(k => k !== 'AVAILABLE_NAMESPACES' && typeof (allNetworks as any)[k] === 'object' && (allNetworks as any)[k] !== null && !TEST_PATTERN.test(k))
    .map(k => (allNetworks as any)[k])"""

if old not in c:
    print("SKIP: mainnetChains block not found — aborting, no changes made")
    sys.exit(1)

new = """  const mainnetChains = Object.keys(allNetworks)
    .filter(k => k !== 'AVAILABLE_NAMESPACES' && typeof (allNetworks as any)[k] === 'object' && (allNetworks as any)[k] !== null && !TEST_PATTERN.test(k))
    .map(k => (allNetworks as any)[k])
    .filter((net: any) => !net.chainNamespace || net.chainNamespace === 'eip155')"""

c = c.replace(old, new, 1)
with open(FILE, 'w') as f:
    f.write(c)
print("DONE: wallet.tsx filtered to EVM-only chains")
