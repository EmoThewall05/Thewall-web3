# ⬡ THE WALL — Web3 Wallet

> **Protect your invisible valuable currencies.**



![Web3](https://img.shields.io/badge/Web3-Wallet-blueviolet?style=flat-square)




![Chains](https://img.shields.io/badge/Chains-37-cyan?style=flat-square)




![Gasless](https://img.shields.io/badge/Gasless-✓-green?style=flat-square)




![No Seed Phrase](https://img.shields.io/badge/No%20Seed%20Phrase-✓-orange?style=flat-square)




![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square)




![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square)




![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)



Built by **Thewin (Dwin 05)** · India 🇮🇳 → Dubai 🇦🇪
Built entirely on phone using **Termux + Acode**

---

## 🌍 Live Demo

🚀 **[thewall-web3.e-mobies.com](https://thewall-web3.e-mobies.com)**

---

## ⚡ Features

| Feature | Description |
|---|---|
| 🔐 No Seed Phrase | Email + Google Auth, Passkey & Smart Wallet login (Reown AppKit) |
| 🪐 Smart Wallet | Create a gasless Smart Wallet via Email/Passkey — no browser extension needed |
| ⚡ Gasless | Zero gas fees via Alchemy Gas Manager across supported chains |
| 🌌 37 Chains | Constellation/orbit-style chain selector — SOL, BTC + 35 EVM chains |
| 👑 Premium | Subscription tier — lower fees, higher claim limits, priority perks |
| 👥 Copy Trading | Follow top traders or become a Leader — mirror trades automatically |
| 💰 Token Balances | Real-time multi-chain token balance tracking |
| 🖼️ NFT Display | View your NFTs across all supported chains |
| 🔄 Token Swap | 1inch DEX aggregator — best rates across chains |
| 🌉 Cross-chain Bridge | LI.FI protocol — bridge assets across chains |
| 🧪 Tx Simulation | Simulate transactions before sending — zero risk |
| 🦋 Emowall AI | AI-powered Web3 guardian |
| 📊 Charts | CoinGecko candlestick 1D/7D/1M/3M/1Y |
| 📰 News | CoinDesk live RSS feed |
| 🔔 Alerts | Browser price notifications |
| 🌐 DApps | Uniswap, OpenSea, Aave, 1inch, Raydium |
| ❄️ Freeze | Emergency PIN wallet lock |
| 🔗 Connect | WalletConnect 530+ wallets |
| 🎨 Redesigned Login | New login screen — chain preview grid, Sign Up/Login, Smart Wallet create in one view |

---

## ⛓️ Supported Chains (37)

Gasless-eligible chains use Alchemy's Gas Manager where policy support is enabled per chain.

**Core**

| Name | Symbol | Network | RPC |
|---|---|---|---|
| 🌍 Earth | ETH | Ethereum | Alchemy |
| 🌟 Soul | SOL | Solana | Alchemy / Helius |
| 🌙 Moon | MON | Monad | Alchemy |
| 🪐 Orbit | ARB | Arbitrum | Alchemy |
| ₿ Birth | BTC | Bitcoin | Alchemy |
| 🔵 Base | BASE | Base | Alchemy |

**Extended EVM chains**

OP Mainnet · Polygon PoS · BNB Chain · opBNB · Zora · Celo · Cronos · Berachain · ApeChain · Soneium · Fraxtal · Ink · Boba Network · X Layer · Unichain · Shape · Anime · MegaETH · Gensyn · DATA Network (Story) · Hyperliquid · Plasma · Edge · Mythos · Scroll · Sonic · Sei · Abstract · CrossFi · Metis · Stable

All EVM chains route through a single unified config (`lib/evmChains.ts`) — chain ID, Alchemy network slug, symbol, and color per chain — so new chains can be added without touching send/balance/price logic individually.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 + React 19 |
| Language | TypeScript 5.0 |
| RPC + Gas | Alchemy (37 chains, unified config) |
| Wallet Connect | Reown AppKit — email, social, Passkey, Smart Wallet, 530+ wallets |
| Token Swap | 1inch DEX Aggregator |
| Cross-chain Bridge | LI.FI Protocol |
| Tx Simulation | Pre-flight transaction simulation |
| Market Data | CoinGecko + CoinDesk RSS |
| AI Guardian | Emo-key |
| Database | Supabase (Postgres) |
| Deployment | Vercel |
| Styling | TailwindCSS |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Clone & Install
```bash
git clone https://github.com/EmoThewall05/Thewall-web3.git
cd Thewall-web3
npm install

# Alchemy (All chains RPC + Gas Manager)
ALCHEMY_API_KEY=your_alchemy_api_key
ALCHEMY_GAS_POLICY_ID=your_gas_policy_id

# WalletConnect (Reown)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Solana (Alchemy / Helius)
THEWALL_SOUL_KEY=your_solana_alchemy_key
HELIUS_API_KEY=your_helius_api_key
NEXT_PUBLIC_SOLANA_GAS_POLICY_ID=your_solana_gas_policy_id

# 1inch (Token Swap)
ONEINCH_API_KEY=your_1inch_api_key

# LI.FI (Cross-chain Bridge)
LIFI_API_KEY=your_lifi_api_key

# AI Guardian
GROK_API_KEY=your_grok_api_key

# Blockchain Explorers
ETHERSCAN_API_KEY=your_etherscan_key

# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Security
TOTP_SECRET=your_totp_secret

npm run dev

npm run build
npm start

🔐 Security Features
✅ CodeQL Advanced — Automated security scanning
✅ Snyk — Vulnerability detection
✅ Semgrep — Static analysis
✅ PIN-Based Freeze — Emergency wallet lock
✅ Biometric 2FA / Passkey — Face/Fingerprint & Passkey support
✅ Alchemy Webhooks — Real-time monitoring
✅ Tx Simulation — Preview transactions before execution
✅ WebAuthn Server-Side Verification — Transaction approvals verified server-side, not client-only
✅ Approval-Gated Broadcast — Every transaction requires an approved record before it can be broadcast
👑 Premium
TheWall Premium unlocks:
Lower swap/send fees (0.3% vs 1.0% standard)
Higher EmoCoin claim limits (50 EMC/6hr vs 10 EMC/24hr)
First 5 free transactions/month (≤ $100 USD)
Priority perks across the Dwin Universe
👥 Copy Trading
Follow top traders or become a Leader:
Mirror trades from top-performing wallets automatically
Leaderboard of top Leaders by performance
Become a Leader and earn from followers copying your trades
🦋 Emowall AI — Web3 Guardian
AI-powered Web3 guardian built with Anthropic.
Watches your wallet 24/7:
Ask about swaps, chains, gas fees
Get security alerts
Price monitoring
Transaction insights
Always watching 🦋
🪙 EmoCoins (EMC)
TheWall is the central hub for EmoCoins — the unified currency of the Dwin Universe.
Earn EMC across all Dwin Universe apps
Redeem EMC exclusively through TheWall
Use EMC for swap fee discounts, premium features, and rewards
Referral system — 50 EMC for referrer, 20 EMC for referred (Premium rates higher)
📺 Ddott.TV × TheWall Integration
TheWall is natively connected to Ddott.TV — the Malayalam OTT & creator platform of the Dwin Universe.
🪙 Earn EmoCoins by watching content on Ddott.TV
🔄 Convert Ddott coins → EMC → redeem via TheWall
🏆 Leaderboard rewards paid out in EMC
📡 Live wallet balance visible inside the Ddott.TV app
🎬 Creator tips and payments routed through TheWall
Watch. Earn. Own. — Powered by EmoCoins 🪙
🏆 Backed By
Alchemy Ecosystem Fund
Personal credits from Mike Garland (Head of Product, Solana @ Alchemy)
📱 Dwin Universe
TheWall is one piece of a unified ecosystem. All apps share the EmoCoins (EMC) currency.
Project
Description
Link
📺 Ddott.TV
Malayalam OTT & creator platform
ddott.live
📱 Emobies
Mobile repair platform
web.e-mobies.com
🦋 Emowall AI 2.0
Multi-generational family safety AI · Free for Kerala 💚
emowall-ai-2.0.emothewall.online
🧱 TheWall
Web3 wallet · EMC hub (this)
thewall-web3.e-mobies.com
🤖 Emo Robos
Robotics & automation
Coming Soon
🧠 Emo AI Pro
Advanced emotional AI platform
Coming Soon
🔑 Emo-Key API
Ecosystem key generator
Internal
📊 API Reference
Authentication

POST /api/auth/login
POST /api/auth/register
POST /api/auth/verify-totp
POST /api/auth/webauthn-verify

GET  /api/wallet/balance/:address/:chain
GET  /api/wallet/transactions/:address/:chain
POST /api/send                   ← prepare / sponsor / simulate / broadcast (all chains)
GET  /api/balance                ← multi-chain balances
GET  /api/prices                 ← multi-chain USD prices

GET  /api/nft/:address/:chain
GET  /api/nft/:address/:chain/:tokenId

GET  /api/swap/quote             ← 1inch
POST /api/swap/execute
GET  /api/bridge/quote           ← LI.FI
POST /api/bridge/execute

GET /api/market/price/:token
GET /api/market/chart/:token/:period
GET /api/market/news

POST /api/emocoin/premium
POST /api/emocoin/claim
POST /api/referral/apply

POST /api/ai/chat
GET  /api/ai/alerts

🎯 Roadmap
[ ] Mobile app (Flutter)
[ ] Multi-sig wallets
[ ] Advanced portfolio analytics
[ ] DeFi yield farming
[ ] NFT marketplace integration
[ ] Hardware wallet support
[ ] Ddott.TV deep integration — in-app wallet widget
[ ] EmoCoins staking
[ ] Expand gas sponsorship to all supported chains
[ ] Copy Trading performance analytics
👤 Creator
Thewin (Emobies05)
🇮🇳 India → 🇦🇪 Dubai
Self-taught developer
Built entirely on phone using Termux + Acode
Journey: 0 coding knowledge → Production Web3 wallet with 37-chain gasless support
GitHub: @EmoThewall05
📄 License
MIT License — Built with ❤️
Follow the flow 🦋
