path = "components/SmartWalletConnect.tsx"
with open(path) as f:
    content = f.read()

old = """import { usePrivy, useWallets } from '@privy-io/react-auth'

export default function SmartWalletConnect({ onConnect }: { onConnect: (address: string, email?: string) => void }) {
  const { ready, authenticated, user, login } = usePrivy()
  const { wallets } = useWallets()

  useEffect(() => {
    if (ready && authenticated && wallets.length > 0) {
      const embeddedWallet = wallets.find(w => w.walletClientType === 'privy') || wallets[0]
      if (embeddedWallet?.address) {
        fetch('/api/wallet/track-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: embeddedWallet.address }),
        }).catch(() => {})
        onConnect(embeddedWallet.address, user?.email?.address)
      }
    }
  }, [ready, authenticated, wallets, user])"""

new = """import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useSolanaWallets } from '@privy-io/react-auth/solana'

export default function SmartWalletConnect({ onConnect }: { onConnect: (address: string, email?: string, solanaAddress?: string) => void }) {
  const { ready, authenticated, user, login } = usePrivy()
  const { wallets } = useWallets()
  const { wallets: solanaWallets } = useSolanaWallets()

  useEffect(() => {
    if (ready && authenticated && wallets.length > 0) {
      const embeddedWallet = wallets.find(w => w.walletClientType === 'privy') || wallets[0]
      const solanaWallet = solanaWallets.find(w => w.walletClientType === 'privy') || solanaWallets[0]
      if (embeddedWallet?.address) {
        fetch('/api/wallet/track-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: embeddedWallet.address }),
        }).catch(() => {})
        onConnect(embeddedWallet.address, user?.email?.address, solanaWallet?.address)
      }
    }
  }, [ready, authenticated, wallets, solanaWallets, user])"""

if "useSolanaWallets" in content:
    print("[SKIP] already updated")
elif old not in content:
    print("[WARN] anchor not found")
else:
    content = content.replace(old, new, 1)
    with open(path, "w") as f:
        f.write(content)
    print("[OK] SmartWalletConnect updated with Solana wallet")
