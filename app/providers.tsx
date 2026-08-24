'use client'

import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'

const PrivyProvider = dynamic(
  () => import('@privy-io/react-auth').then((mod) => mod.PrivyProvider),
  { ssr: false }
)

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
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
          solana: {
            createOnLogin: 'users-without-wallets',
          },
        },
        solanaClusters: [
          {
            name: 'mainnet-beta',
            rpcUrl: `https://solana-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_SOLANA_KEY}`,
          },
        ],
      }}
    >
      {children}
    </PrivyProvider>
  )
}
