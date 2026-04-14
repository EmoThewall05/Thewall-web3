import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { WalletProvider } from './context/wallet'
import SWRegister from './sw-register'
import EmowallAIChatWrapper from '@/components/EmowallAIChatWrapper'

export const metadata: Metadata = {
  title: '⬡ THE WALL',
  description: '5-Chain Gasless Web3 Wallet — No Seed Phrase • Emowall AI Guardian',
  manifest: '/manifest.json',
  themeColor: '#07080B',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TheWall',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#07080B" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body className="bg-[#07080B] text-white">
        <WalletProvider>
          <SWRegister />
          <main className="min-h-screen">
            {children}
          </main>
          <EmowallAIChatWrapper />
          <SpeedInsights />
          <Analytics />
        </WalletProvider>
      </body>
    </html>
  )
}
