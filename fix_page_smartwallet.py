path = 'app/page.tsx'
with open(path) as f:
    content = f.read()

if "SmartWalletConnect" not in content:
    content = content.replace(
        "import { useRouter } from 'next/navigation'",
        "import { useRouter } from 'next/navigation'\nimport SmartWalletConnect from '@/components/SmartWalletConnect'"
    )
    content = content.replace(
        "<button className={styles.btnPrimary} onClick={handleConnectWallet}>Sign Up / Login</button>",
        "<button className={styles.btnPrimary} onClick={handleConnectWallet}>Sign Up / Login</button>\n          <SmartWalletConnect onConnect={(address, email) => { setUser({address, type: 'smart', email}); setScreen('dashboard') }} />"
    )
    with open(path, 'w') as f:
        f.write(content)
    print('[OK] added SmartWalletConnect button to login screen')
else:
    print('[SKIP] already added')
