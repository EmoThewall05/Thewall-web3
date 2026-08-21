'use client'

import { AlchemyAccountProvider } from '@account-kit/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { accountKitConfig, queryClient } from '@/lib/accountKitConfig'
import type { ReactNode } from 'react'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AlchemyAccountProvider config={accountKitConfig} queryClient={queryClient}>
        {children}
      </AlchemyAccountProvider>
    </QueryClientProvider>
  )
}
