import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

// 1. Vercel Speed Insights ഇംപോർട്ട് ചെയ്യുന്നു
import { SpeedInsights } from "@vercel/speed-insights/next"
// 2. Vercel Analytics (Optional - ഇത് ഫ്രീ ആണ്, യൂസർമാർ വരുന്നത് അറിയാൻ സഹായിക്കും)
import { Analytics } from "@vercel/analytics/react"

import { WalletProvider } from './context/wallet'
import SWRegister from './sw-register'
import EmowallAIChatWrapper from '@/components/EmowallAIChatWrapper'

export const metadata: Metadata = {
  title: '⬡ THE WALL',
  description: '5-Chain Gasless Web3 Wallet — No Seed Phrase • Emowall AI Guardian',
  manifest: '/manifest.json',
  // തീം കളർ നിന്റെ വാലറ്റിന്റെ ഡാർക്ക് ലുക്കിന് അനുയോജ്യമായി മാറ്റി (#07080B)
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
        {/* PWA ശരിയായി വർക്ക് ചെയ്യാൻ ഹെഡറിൽ ഈ ലിങ്കുകൾ അത്യാവശ്യമാണ് */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#07080B" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="TheWall" />
        
        {/* Viewport സ്പെസിഫിക്കേഷൻ - ഗൂഗിൾ ലൈറ്റ്ഹൗസ് സ്കോർ വർദ്ധിപ്പിക്കാൻ */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body className="bg-[#07080B] text-white antialiased selection:bg-[#FF5500]/30">
        <WalletProvider>
          {/* സർവീസ് വർക്കർ രജിസ്ട്രേഷൻ (PWA പച്ച കത്തിക്കാൻ) */}
          <SWRegister />
          
          <main className="min-h-screen">
            {children}
          </main>

          {/* Emowall AI Chat 🦋 (ബാക്ക്ഗ്രൗണ്ടിൽ കീസ്റ്റോൺ കീ ആക്ടീവ് ആണെന്ന് ഉറപ്പാക്കുക) */}
          <EmowallAIChatWrapper />
          
          {/* Vercel Insights & Analytics 🚀 */}
          <SpeedInsights />
          <Analytics />
        </WalletProvider>
      </body>
    </html>
  )
}
