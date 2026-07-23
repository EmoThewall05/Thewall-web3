import sys

FILE = "app/context/wallet.tsx"
with open(FILE) as f:
    c = f.read()

old = """export async function initAppKit() {
  if (appkitModal) return appkitModal
  const { createAppKit } = await import('@reown/appkit/react')
  const { mainnet, arbitrum } = await import('@reown/appkit/networks')
  const { EthersAdapter } = await import('@reown/appkit-adapter-ethers')
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 
                    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || ''
  if (!projectId) { console.error('No WC ProjectId!'); return null }
  const ethersAdapter = new EthersAdapter()
  appkitModal = createAppKit({
    adapters: [ethersAdapter] as any[],
    networks: [mainnet, arbitrum],
    projectId,"""

if old not in c:
    print("SKIP: initAppKit block not found — aborting, no changes made")
    sys.exit(1)

new = """const TEST_PATTERN = /test|sepolia|goerli|devnet|kovan|rinkeby|mumbai|fuji|chapel|preview|staging/i

export async function initAppKit() {
  if (appkitModal) return appkitModal
  const { createAppKit } = await import('@reown/appkit/react')
  const allNetworks = await import('@reown/appkit/networks')
  const { EthersAdapter } = await import('@reown/appkit-adapter-ethers')
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 
                    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || ''
  if (!projectId) { console.error('No WC ProjectId!'); return null }
  const mainnetChains = Object.keys(allNetworks)
    .filter(k => k !== 'AVAILABLE_NAMESPACES' && typeof (allNetworks as any)[k] === 'object' && (allNetworks as any)[k] !== null && !TEST_PATTERN.test(k))
    .map(k => (allNetworks as any)[k])
  const networks = mainnetChains.length > 0 ? mainnetChains : [allNetworks.mainnet, allNetworks.arbitrum]
  const ethersAdapter = new EthersAdapter()
  appkitModal = createAppKit({
    adapters: [ethersAdapter] as any[],
    networks: networks as any,
    projectId,"""

c = c.replace(old, new, 1)
with open(FILE, 'w') as f:
    f.write(c)
print("DONE: wallet.tsx updated with all mainnet networks")
