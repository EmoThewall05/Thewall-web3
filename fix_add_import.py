path = 'app/page.tsx'
with open(path) as f:
    content = f.read()

if "SmartWalletConnect" in content and "import SmartWalletConnect" not in content:
    content = content.replace(
        "import styles from './page.module.css'",
        "import styles from './page.module.css'\nimport SmartWalletConnect from '@/components/SmartWalletConnect'"
    )
    with open(path, 'w') as f:
        f.write(content)
    print('[OK] added missing import')
else:
    print('[SKIP] check manually')
