'use client'

import { useEffect } from 'react'
import { useUser, useAuthModal, useSmartAccountClient } from '@account-kit/react'

export default function SmartWalletConnect({ onConnect }: { onConnect: (address: string, email?: string) => void }) {
  const user = useUser()
  const { openAuthModal } = useAuthModal()
  const { client } = useSmartAccountClient({})

  useEffect(() => {
    if (user && client?.account?.address) {
      onConnect(client.account.address, user.email)
    }
  }, [user, client])

  return (
    <button
      onClick={openAuthModal}
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
