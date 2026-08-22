path = 'app/page.tsx'
with open(path) as f:
    content = f.read()

old = "<SmartWalletConnect onConnect={(address, email) => { setUser({address, type: 'smart', email}); setScreen('dashboard') }} />"
new = "<SmartWalletConnect onConnect={(address, email) => { setUser({address, type: 'smart', email}); fetchBalance(address); fetchEmoBalance(address); setScreen('dashboard') }} />"

if old not in content:
    print('[WARN] target block not found - manual check needed')
elif new in content:
    print('[SKIP] already patched')
else:
    content = content.replace(old, new)
    with open(path, 'w') as f:
        f.write(content)
    print('[OK] fetchEmoBalance + fetchBalance added to SmartWalletConnect onConnect')
