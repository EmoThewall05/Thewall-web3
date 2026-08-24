path = "app/page.tsx"
with open(path) as f:
    content = f.read()

old = """            <SmartWalletConnect onConnect={(address, email) => { setUser({address, type: 'smart', email}); fetchBalance(address); fetchEmoBalance(address); setScreen('dashboard') }} />"""

new = """            <SmartWalletConnect onConnect={(address, email, solanaAddress) => { setUser({address, type: 'smart', email, solAddress: solanaAddress}); fetchBalance(address); fetchEmoBalance(address); setScreen('dashboard') }} />"""

if "solAddress: solanaAddress" in content:
    print("[SKIP] already wired")
elif old not in content:
    print("[WARN] anchor not found")
else:
    content = content.replace(old, new, 1)
    with open(path, "w") as f:
        f.write(content)
    print("[OK] solAddress wired into setUser")
