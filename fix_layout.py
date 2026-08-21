path = 'app/layout.tsx'
with open(path) as f:
    content = f.read()

if "from './providers'" not in content:
    content = content.replace(
        "import { WalletProvider } from './context/wallet'",
        "import { WalletProvider } from './context/wallet'\nimport Providers from './providers'"
    )
    content = content.replace(
        "        <WalletProvider>\n          <SWRegister />\n          {children}\n          <EmowallAIChatWrapper />\n        </WalletProvider>",
        "        <Providers>\n          <WalletProvider>\n            <SWRegister />\n            {children}\n            <EmowallAIChatWrapper />\n          </WalletProvider>\n        </Providers>"
    )
    with open(path, 'w') as f:
        f.write(content)
    print('[OK] wrapped layout with Providers')
else:
    print('[SKIP] already wrapped')
