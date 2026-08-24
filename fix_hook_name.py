path = "components/SmartWalletConnect.tsx"
with open(path) as f:
    content = f.read()

old = "import { useSolanaWallets } from '@privy-io/react-auth/solana'"
new = "import { useStandardWallets } from '@privy-io/react-auth/solana'"

if new in content:
    print("[SKIP] already updated")
elif old not in content:
    print("[WARN] anchor not found")
else:
    content = content.replace(old, new, 1)
    content = content.replace("useSolanaWallets()", "useStandardWallets()")
    with open(path, "w") as f:
        f.write(content)
    print("[OK] hook renamed to useStandardWallets")
