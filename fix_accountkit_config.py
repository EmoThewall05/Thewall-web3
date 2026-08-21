path = 'lib/accountKitConfig.ts'
with open(path) as f:
    content = f.read()

if 'QueryClient' not in content:
    content = content.replace(
        "import { AlchemyAccountsUIConfig, createConfig } from '@account-kit/react'",
        "import { AlchemyAccountsUIConfig, createConfig } from '@account-kit/react'\nimport { QueryClient } from '@tanstack/react-query'"
    )
    content = content.rstrip() + "\n\nexport const queryClient = new QueryClient()\n"
    with open(path, 'w') as f:
        f.write(content)
    print('[OK] added queryClient export')
else:
    print('[SKIP] already has QueryClient')
