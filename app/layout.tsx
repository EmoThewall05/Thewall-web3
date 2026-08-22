import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import '@account-kit/react/styles.css'

import { WalletProvider } from './context/wallet'
import Providers from './providers'
import SWRegister from './sw-register'
import EmowallAIChatWrapper from '@/components/EmowallAIChatWrapper'

export const metadata: Metadata = {
  title: '⬡ THE WALL',
  description: '5-Chain Gasless Web3 Wallet — No Seed Phrase • Emowall AI Guardian',
  manifest: '/manifest.json',
  themeColor: '#FF5500',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TheWall',
  },
  icons: { icon: '/icon-192.png', apple: '/icon-192.png' },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FF5500" />
      </head>
      <body className="bg-[#07080B]">
        <Providers>
          <WalletProvider>
            <SWRegister />
            {children}
            <EmowallAIChatWrapper />
          </WalletProvider>
        </Providers>
      </body>
    </html>
  )
}
