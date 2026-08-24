'use client'

import { useEffect, useState } from 'react'

export let appkitModal: any = null

const TEST_PATTERN = /test|sepolia|goerli|devnet|kovan|rinkeby|mumbai|fuji|chapel|preview|staging/i

export async function initAppKit() {
  if (appkitModal) return appkitModal
  const { createAppKit } = await import('@reown/appkit/react')
  const allNetworks = await import('@reown/appkit/networks')
  const { EthersAdapter } = await import('@reown/appkit-adapter-ethers')
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 
                    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || ''
  if (!projectId) { console.error('No WC ProjectId!'); return null }
  const supportedKeys = ['mainnet', 'arbitrum', 'base', 'monad']
  const networks = supportedKeys
    .map(k => (allNetworks as any)[k])
    .filter((net: any) => net && (!net.chainNamespace || net.chainNamespace === 'eip155'))
  const ethersAdapter = new EthersAdapter()
  appkitModal = createAppKit({
    adapters: [ethersAdapter] as any[],
    networks: networks as any,
    projectId,
    metadata: {
      name: 'TheWall',
      description: 'Gasless Web3 Wallet • Emowall AI 2.0',
      url: 'https://thewall.e-mobies.com',
      icons: ['https://thewall.e-mobies.com/icon-512.png'],
    },
    themeMode: 'dark',
    themeVariables: { '--w3m-accent': '#FF5500' },
    features: {
      email: true,
      socials: ['google', 'x', 'discord', 'github', 'apple'],
      emailShowWallets: true,
    },
  })
  return appkitModal
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { 
    setMounted(true)
    initAppKit().then(m => { if(m) console.log('AppKit ready!') })
  }, [])
  if (!mounted) return <>{children}</>
  return <>{children}</>
}
