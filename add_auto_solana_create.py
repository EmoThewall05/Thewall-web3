path = "components/SmartWalletConnect.tsx"
with open(path) as f:
    content = f.read()

old_import = "import { useStandardWallets } from '@privy-io/react-auth/solana'"
new_import = "import { useStandardWallets, useCreateWallet } from '@privy-io/react-auth/solana'"

old_hook = "  const { wallets: solanaWallets } = useStandardWallets()"
new_hook = """  const { wallets: solanaWallets } = useStandardWallets()
  const { createWallet: createSolanaWallet } = useCreateWallet()"""

old_effect_start = "  useEffect(() => {\n    if (ready && authenticated && wallets.length > 0) {"
new_effect_start = """  useEffect(() => {
    if (ready && authenticated && wallets.length > 0 && solanaWallets.length === 0) {
      createSolanaWallet().catch(() => {})
    }
    if (ready && authenticated && wallets.length > 0) {"""

if "useCreateWallet" in content and "createSolanaWallet" in content:
    print("[SKIP] already updated")
else:
    changed = False
    if old_import in content:
        content = content.replace(old_import, new_import, 1)
        changed = True
    if old_hook in content:
        content = content.replace(old_hook, new_hook, 1)
        changed = True
    if old_effect_start in content:
        content = content.replace(old_effect_start, new_effect_start, 1)
        changed = True
    if changed:
        with open(path, "w") as f:
            f.write(content)
        print("[OK] auto-create solana wallet for existing users added")
    else:
        print("[WARN] anchors not found")
