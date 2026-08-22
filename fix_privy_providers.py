path = 'app/providers.tsx'
new_content = '''\'use client\'

import { PrivyProvider } from '@privy-io/react-auth'
import type { ReactNode } from 'react'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ['email', 'passkey'],
        appearance: {
          theme: 'dark',
          accentColor: '#00e5ff',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      {children}
    </PrivyProvider>
  )
}
'''

with open(path, 'w') as f:
    f.write(new_content)
print('[OK] providers.tsx rewritten for Privy')
