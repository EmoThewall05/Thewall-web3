path = "components/SmartWalletConnect.tsx"
with open(path) as f:
    content = f.read()

old = "const solanaWallet = solanaWallets[0]"
new = "const solanaWallet = solanaWallets[0]\n      const solanaAddress = solanaWallet?.accounts?.[0]?.address"

if "solanaWallet?.accounts" in content:
    print("[SKIP] already updated")
elif old not in content:
    print("[WARN] anchor not found")
else:
    content = content.replace(old, new, 1)
    content = content.replace("solanaWallet?.address)", "solanaAddress)")
    with open(path, "w") as f:
        f.write(content)
    print("[OK] using accounts[0].address for solana wallet")
