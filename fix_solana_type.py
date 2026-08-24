path = "components/SmartWalletConnect.tsx"
with open(path) as f:
    content = f.read()

old = "const solanaWallet = solanaWallets.find(w => w.walletClientType === 'privy') || solanaWallets[0]"
new = "const solanaWallet = solanaWallets[0]"

if new in content and old not in content:
    print("[SKIP] already updated")
elif old not in content:
    print("[WARN] anchor not found")
else:
    content = content.replace(old, new, 1)
    with open(path, "w") as f:
        f.write(content)
    print("[OK] simplified solana wallet selection")
