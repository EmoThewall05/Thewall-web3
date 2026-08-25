// lib/evmChains.ts
// Unified EVM chain config — constellation/orbit theme
// chainId: 0 aayittullath verify cheyyendath (puthiya/less-common chains, official docs nokkanam)

export interface EvmChain {
  id: string
  label: string
  symbol: string
  color: string
  chainId: number
  alchemyNetwork: string   // Alchemy network slug (RPC path)
  emoji: string
}

export const EVM_CHAINS: EvmChain[] = [
  { id: 'ETH',        label: 'Ethereum',      symbol: 'ETH',   color: '#627eea', chainId: 1,        alchemyNetwork: 'eth-mainnet',        emoji: '🌍' },
  { id: 'ARB',        label: 'Arbitrum',      symbol: 'ETH',   color: '#12aaff', chainId: 42161,     alchemyNetwork: 'arb-mainnet',        emoji: '🪐' },
  { id: 'OP',         label: 'OP Mainnet',    symbol: 'ETH',   color: '#ff0420', chainId: 10,        alchemyNetwork: 'opt-mainnet',        emoji: '🔴' },
  { id: 'BASE',       label: 'Base',          symbol: 'ETH',   color: '#0052ff', chainId: 8453,      alchemyNetwork: 'base-mainnet',       emoji: '🔵' },
  { id: 'MATIC',      label: 'Polygon PoS',   symbol: 'POL',   color: '#8247e5', chainId: 137,       alchemyNetwork: 'polygon-mainnet',    emoji: '🟣' },
  { id: 'MON',        label: 'Monad',         symbol: 'MON',   color: '#836ef9', chainId: 143,       alchemyNetwork: 'monad-mainnet',      emoji: '🌙' },
  { id: 'BNB',        label: 'BNB Chain',     symbol: 'BNB',   color: '#f0b90b', chainId: 56,        alchemyNetwork: 'bnb-mainnet',        emoji: '☄️' },
  { id: 'OPBNB',      label: 'opBNB',         symbol: 'BNB',   color: '#f0b90b', chainId: 204,       alchemyNetwork: 'opbnb-mainnet',      emoji: '💫' },
  { id: 'ZORA',       label: 'Zora',          symbol: 'ETH',   color: '#5a6ee0', chainId: 7777777,   alchemyNetwork: 'zora-mainnet',       emoji: '✨' },
  { id: 'CELO',       label: 'Celo',          symbol: 'CELO',  color: '#35d07f', chainId: 42220,     alchemyNetwork: 'celo-mainnet',       emoji: '🟢' },
  { id: 'CRONOS',     label: 'Cronos',        symbol: 'CRO',   color: '#002d74', chainId: 25,        alchemyNetwork: 'cronos-mainnet',     emoji: '🌑' },
  { id: 'BERA',       label: 'Berachain',     symbol: 'BERA',  color: '#814625', chainId: 80094,     alchemyNetwork: 'berachain-mainnet',  emoji: '🪨' },
  { id: 'APE',        label: 'ApeChain',      symbol: 'APE',   color: '#0054fa', chainId: 33139,     alchemyNetwork: 'apechain-mainnet',   emoji: '🌌' },
  { id: 'SONEIUM',    label: 'Soneium',       symbol: 'ETH',   color: '#ffffff', chainId: 1868,      alchemyNetwork: 'soneium-mainnet',    emoji: '⚪' },
  { id: 'FRAX',       label: 'Fraxtal',       symbol: 'frxETH',color: '#000000', chainId: 252,       alchemyNetwork: 'frax-mainnet',       emoji: '⚫' },
  { id: 'INK',        label: 'Ink',           symbol: 'ETH',   color: '#5028ff', chainId: 57073,     alchemyNetwork: 'ink-mainnet',        emoji: '🔷' },
  { id: 'BOBA',       label: 'Boba Network',  symbol: 'ETH',   color: '#00e0b8', chainId: 288,       alchemyNetwork: 'boba-mainnet',       emoji: '🧊' },
  { id: 'XLAYER',     label: 'X Layer',       symbol: 'OKB',   color: '#000000', chainId: 196,       alchemyNetwork: 'xlayer-mainnet',     emoji: '✳️' },
  { id: 'UNICHAIN',   label: 'Unichain',      symbol: 'ETH',   color: '#ff37c7', chainId: 130,       alchemyNetwork: 'unichain-mainnet',   emoji: '🦄' },
  { id: 'SHAPE',      label: 'Shape',         symbol: 'ETH',   color: '#000000', chainId: 360,       alchemyNetwork: 'shape-mainnet',      emoji: '🔺' },
  { id: 'ANIME',      label: 'Anime',         symbol: 'ANIME', color: '#ff2d55', chainId: 69000,     alchemyNetwork: 'anime-mainnet',      emoji: '🎴' },
  { id: 'MEGAETH',    label: 'MegaETH',       symbol: 'ETH',   color: '#8a8a8a', chainId: 4326,      alchemyNetwork: 'megaeth-mainnet',    emoji: '⚡' },
  { id: 'GENSYN',     label: 'Gensyn',        symbol: 'AI',color: '#ffb0a0', chainId: 685689,    alchemyNetwork: 'gensyn-mainnet',     emoji: '🧠' },
  { id: 'STORY',      label: 'DATA Network',  symbol: 'DATA', /* rebranded from Story/IP to Data Network */    color: '#ffffff', chainId: 1514,      alchemyNetwork: 'story-mainnet',      emoji: '📡' },
  { id: 'HYPERLIQUID',label: 'Hyperliquid',   symbol: 'HYPE',  color: '#4dd6c0', chainId: 999,       alchemyNetwork: 'hyperliquid-mainnet',emoji: '🌊' },
  { id: 'PLASMA',     label: 'Plasma',        symbol: 'XPL',   color: '#00e08f', chainId: 9745,      alchemyNetwork: 'plasma-mainnet',     emoji: '🌈' },
  { id: 'EDGE',       label: 'Edge',          symbol: 'EDGE',  color: '#00c853', chainId: 4207,      alchemyNetwork: 'edge-mainnet' /* verify: matched via LayerEdge/EDGEN — confirm same as Alchemy's Edge */,       emoji: '🌠' },
  { id: 'MYTHOS',     label: 'Mythos',        symbol: 'MYTH',  color: '#ff2222', chainId: 42018,     alchemyNetwork: 'mythos-mainnet',    emoji: '🎮' },
  { id: 'SCROLL',     label: 'Scroll',        symbol: 'ETH',   color: '#ffeeda', chainId: 534352,    alchemyNetwork: 'scroll-mainnet',    emoji: '📜' },
  { id: 'SONIC',      label: 'Sonic',         symbol: 'S',     color: '#fe9a4d', chainId: 146,       alchemyNetwork: 'sonic-mainnet',     emoji: '💨' },
  { id: 'SEI',        label: 'Sei',           symbol: 'SEI',   color: '#8b1e3f', chainId: 1329,      alchemyNetwork: 'sei-mainnet',       emoji: '🌊' },
  { id: 'ABSTRACT',   label: 'Abstract',      symbol: 'ETH',   color: '#00ff7f', chainId: 2741,      alchemyNetwork: 'abstract-mainnet',  emoji: '🎨' },
  { id: 'CROSSFI',    label: 'CrossFi',       symbol: 'XFI',   color: '#2b5cff', chainId: 4158,      alchemyNetwork: 'crossfi-mainnet',   emoji: '💱' },
  { id: 'METIS',      label: 'Metis',         symbol: 'METIS', color: '#00d4c8', chainId: 1088,      alchemyNetwork: 'metis-mainnet',     emoji: '🗿' },
  { id: 'STABLE',     label: 'Stable',        symbol: 'USDT0', color: '#00b386', chainId: 988,       alchemyNetwork: 'stable-mainnet',    emoji: '⚓' },
]

export function getChain(id: string): EvmChain | undefined {
  return EVM_CHAINS.find(c => c.id === id)
}
