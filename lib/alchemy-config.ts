export const ALCHEMY_CONFIG = {
  eth: {
    apiKey: process.env.ALCHEMY_API_KEY || '',
    network: 'eth-mainnet',
  },
  sol: {
    apiKey: process.env.ALCHEMY_SOL_API_KEY || '',
    network: 'solana-mainnet',
  },
}

export const WALLETS = {
  main:     process.env.MAIN_WALLET_ADDRESS || '',
  treasury: process.env.TREASURY_WALLET_ADDRESS || '',
  solana:   process.env.SOLANA_WALLET_ADDRESS || '',
  soul:     process.env.SOUL_WALLET_ADDRESS || '',
}

export function maskWallet(address: string, visibleChars = 5): string {
  if (!address || address.length < visibleChars * 2) return '••••••••'
  return `${address.slice(0, visibleChars)}...${address.slice(-visibleChars)}`
}

export const SOUL_WALLET_DISPLAY = maskWallet(
  process.env.SOUL_WALLET_ADDRESS || ''
)
