# ⬡ THE WALL — Web3 Wallet
**Protect your invisible valuable currencies.**

Web3 · 6 Chains · Gasless · No Seed Phrase

Built by **Thewin (Dwin 05)** · India 🇮🇳 → Dubai 🇦🇪  
Built entirely on phone using **Termux + Acode**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org)
[![Alchemy](https://img.shields.io/badge/Alchemy-RPC%20%2B%20Gas-purple)](https://www.alchemy.com)
[![WalletConnect](https://img.shields.io/badge/WalletConnect-Reown-2e3338?logo=walletconnect)](https://walletconnect.com)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 🌍 Live Demo

🚀 **[thewall.e-mobies.com](https://thewall-web3-iie7.vercel.app**

---

## ⚡ Features

| Feature | Description |
|---------|-------------|
| 🔐 **No Seed Phrase** | Email + Google Auth (TOTP) login |
| ⚡ **Gasless** | Zero gas fees via Alchemy Gas Manager |
| 🦋 **Emowall AI** | Grok-powered Web3 guardian |
| 📊 **Charts** | CoinGecko candlestick 1D/7D/1M/3M/1Y |
| 📰 **News** | CoinDesk live RSS feed |
| 🔔 **Alerts** | Browser price notifications |
| 🌐 **DApps** | Uniswap, OpenSea, Aave, 1inch, Raydium |
| 🔄 **Swap** | UniSwap V3 integration |
| ❄️ **Freeze** | Emergency PIN wallet lock |
| 🔗 **Connect** | WalletConnect 530+ wallets |

---

## ⛓️ Supported Chains

| Name | Symbol | Network | RPC |
|------|--------|---------|-----|
| 🌍 Earth | ETH | Ethereum | Alchemy |
| 🌟 Soul | SOL | Solana | Helius |
| 🌙 Moon | MON | Monad | Alchemy |
| 🪐 Orbit | ARB | Arbitrum | Alchemy |
| ₿ Birth | BTC | Bitcoin | Alchemy |
| 🔵 Base | BASE | Base | Alchemy |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 + React 19 |
| **Language** | TypeScript 5.0 |
| **RPC + Gas** | Alchemy (all 6 chains) |
| **Wallet Connect** | Reown AppKit (530+ wallets) |
| **Market Data** | CoinGecko + CoinDesk RSS |
| **AI Guardian** | Emo-key |
| **Database** | NileDB (Postgres) |
| **Deployment** | Vercel |
| **Styling** | TailwindCSS |

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
```

### Environment Variables

Create `.env.local`:

```env
# Alchemy (All chains RPC + Gas Manager)
ALCHEMY_API_KEY=your_alchemy_api_key
ALCHEMY_GAS_POLICY_ID=your_gas_policy_id

# WalletConnect (Reown)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Solana (Helius)
HELIUS_API_KEY=your_helius_api_key

# AI Guardian (Grok)
GROK_API_KEY=your_grok_api_key

# Blockchain Explorers
ETHERSCAN_API_KEY=your_etherscan_key

# Database
NILEDB_POSTGRES_URL=your_postgres_url

# Security
TOTP_SECRET=your_totp_secret
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

---

## 🔐 Security Features

- ✅ **CodeQL Advanced** — Automated security scanning
- ✅ **Snyk** — Vulnerability detection
- ✅ **Semgrep** — Static analysis
- ✅ **PIN-Based Freeze** — Emergency wallet lock
- ✅ **Biometric 2FA** — Face/Fingerprint support
- ✅ **Alchemy Webhooks** — Real-time monitoring

---

## 🦋 Emowall AI — Web3 Guardian

AI-powered Web3 guardian built with **Anthropic**.

Watches your wallet 24/7:
- Ask about swaps, chains, gas fees
- Get security alerts
- Price monitoring
- Transaction insights

**Always watching** 🦋

---

## 🏆 Backed By

- **Alchemy Ecosystem Fund**
- Personal credits from **Mike Garland** (Head of Product, Solana @ Alchemy)

---

## 📱 Part of Dwin Universe

| Project | Description |
|---------|-------------|
| 📱 **Emobies** | Mobile repair platform (Play Store) |
| 🦋 **Emowall AI 2.0** | Multi-generational AI safety (Play Store) |
| 🧱 **TheWall** | Web3 wallet (this) — Live |
| 🤖 **Emo Robos** | Robotics & automation |
| 🧠 **Emo AI Pro** | Advanced emotional AI platform |
| 🔑 **Emo-Key API** | Ecosystem key generator |

---

## 📊 API Reference

### Authentication

```bash
POST /api/auth/login
POST /api/auth/register
POST /api/auth/verify-totp
```

### Wallet

```bash
GET /api/wallet/balance/:address/:chain
GET /api/wallet/transactions/:address/:chain
POST /api/wallet/send
```

### Market Data

```bash
GET /api/market/price/:token
GET /api/market/chart/:token/:period
GET /api/market/news
```

### AI Guardian

```bash
POST /api/ai/chat
GET /api/ai/alerts
```

---

## 🎯 Roadmap

- [ ] Mobile app (Flutter)
- [ ] Multi-sig wallets
- [ ] Advanced portfolio analytics
- [ ] DeFi yield farming
- [ ] NFT marketplace integration
- [ ] Hardware wallet support

---

## 👤 Creator

**Thewin (Emobies05)**

- 🇮🇳 India → 🇦🇪 Dubai
- Self-taught developer
- Built entirely on phone using **Termux + Acode**
- **Journey:** 0 coding knowledge → 3.5 months → Production Web3 wallet

**GitHub:** [@EmoThewall05](https://github.com/EmoThewall05)

---

## 📄 License

MIT License — Built with ❤️

---

**Follow the flow** 🦋
