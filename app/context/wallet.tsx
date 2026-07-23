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
  const mainnetChains = Object.keys(allNetworks)
    .filter(k => k !== 'AVAILABLE_NAMESPACES' && typeof (allNetworks as any)[k] === 'object' && (allNetworks as any)[k] !== null && !TEST_PATTERN.test(k))
    .map(k => (allNetworks as any)[k])
  const networks = mainnetChains.length > 0 ? mainnetChains : [allNetworks.mainnet, allNetworks.arbitrum]
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
