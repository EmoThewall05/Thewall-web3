export const runtime = 'edge'

import { NextResponse } from 'next/server'

// Chains priced directly via CoinGecko (chain id -> CoinGecko id)
const COINGECKO_IDS: Record<string, string> = {
  ETH:  'ethereum',
  BNB:  'binancecoin',
  USDC: 'usd-coin',
  USDT: 'tether',
  SOL:  'solana',
  BTC:  'bitcoin',
  ARB:  'arbitrum',
  MON:  'monad',
  MATIC: 'polygon-ecosystem-token',
  CELO:  'celo',
  CRONOS: 'crypto-com-chain',
  BERA:   'berachain-bera',
  APE:    'apecoin',
  FRAX:   'frax-ether',
  XLAYER: 'okb',
  HYPERLIQUID: 'hyperliquid',
  ANIME: 'anime',
  GENSYN: 'gensyn',
  DATA: 'story-2', // rebranded from Story(IP) to Data Network(DATA)
  PLASMA: 'plasma',
}

// Chains that share another chain's native-token price (gas token = ETH/BNB etc.)
const DERIVED_FROM: Record<string, string> = {
  BASE: 'ETH', OP: 'ETH', ZORA: 'ETH', SONEIUM: 'ETH',
  INK: 'ETH', BOBA: 'ETH', UNICHAIN: 'ETH', SHAPE: 'ETH', MEGAETH: 'ETH',
  OPBNB: 'BNB',
}

// EDGE — CoinGecko id not confirmed (chain identity uncertain, see lib/evmChains.ts). Left out to avoid showing a wrong price.

const PLACEHOLDER_PRICES: Record<string, { price: number; change24h: number }> = {
  EMC: { price: 0.01, change24h: 0 },
}

export async function GET() {
  try {
    const ids = Object.values(COINGECKO_IDS).join(',')
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      { next: { revalidate: 60 } }
    )
    const data = await response.json()

    const prices: Record<string, { price: number; change24h: number }> = {}

    for (const [symbol, geckoId] of Object.entries(COINGECKO_IDS)) {
      if (data[geckoId]) {
        prices[symbol] = {
          price: data[geckoId].usd || 0,
          change24h: data[geckoId].usd_24h_change || 0,
        }
      }
    }

    for (const [symbol, priceData] of Object.entries(PLACEHOLDER_PRICES)) {
      prices[symbol] = priceData
    }

    // Derived chains — reuse their native gas token's price
    for (const [chainId, sourceSymbol] of Object.entries(DERIVED_FROM)) {
      if (prices[sourceSymbol]) prices[chainId] = prices[sourceSymbol]
    }

    return NextResponse.json({ prices })
  } catch {
    return NextResponse.json({
      prices: {
        ...PLACEHOLDER_PRICES,
      }
    })
  }
}
