'use client'

import { useEffect } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'

export default function SmartWalletConnect({ onConnect }: { onConnect: (address: string, email?: string) => void }) {
  const { ready, authenticated, user, login } = usePrivy()
  const { wallets } = useWallets()

  useEffect(() => {
    if (ready && authenticated && wallets.length > 0) {
      const embeddedWallet = wallets.find(w => w.walletClientType === 'privy') || wallets[0]
      if (embeddedWallet?.address) {
        fetch('/api/wallet/track-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: embeddedWallet.address }),
        }).catch(() => {})
        onConnect(embeddedWallet.address, user?.email?.address)
      }
    }
  }, [ready, authenticated, wallets, user])

  return (
    <button
      onClick={() => {
        try {
          login()
        } catch (e: any) {
          alert('Smart Wallet Error: ' + (e?.message || String(e)))
        }
      }}
      style={{
        width: '100%',
        padding: '14px',
        borderRadius: 12,
        fontWeight: 700,
        border: '1px solid #00ff8855',
        background: '#00ff8811',
        color: '#00ff88',
        cursor: 'pointer',
        marginTop: 10,
        fontFamily: 'var(--font-mono)',
        fontSize: '0.82rem'
      }}
    >
      🔢 Create Smart Wallet (Email/Passkey · Gasless)
    </button>
  )
}
