import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { WalletProvider } from './context/wallet'
import SWRegister from './sw-register'

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
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            const script = document.createElement('script');
            script.src = 'https://assistloop.ai/assistloop-widget.js';
            script.onload = function() {
              AssistLoopWidget.init({
                agentId: "69f323f3-6a36-4979-bd51-af1845fe4e50"
              });
            };
            document.head.appendChild(script);
          })();
        `}} />
      </head>
      <body className="bg-[#07080B]">
        <WalletProvider>
          <SWRegister />
          {children}
          <SpeedInsights />
          <Analytics />
        </WalletProvider>
      </body>
    </html>
  )
}
