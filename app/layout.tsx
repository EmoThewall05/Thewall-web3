import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { WalletProvider } from './context/wallet'
import SWRegister from './sw-register'
import EmowallButterfly from '@/components/EmowallButterfly' // ← ADD

export const metadata: Metadata = {
  title: '⬡ THE WALL',
  description: '6-Chain Gasless Web3 Wallet — No Seed Phrase • Emowall AI Guardian',
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
        {/* AssistLoop removed — replaced by EmowallButterfly */}
      </head>
      <body className="bg-[#07080B]">
        <WalletProvider>
          <SWRegister />
          {children}
          <EmowallButterfly /> {/* ← ADD: butterfly on every page */}
          <SpeedInsights />
          <Analytics />
        </WalletProvider>
      </body>
    </html>
  )
}
