import { NextResponse } from 'next/server'

// നിന്റെ പൈസയുള്ള ആ സോളാന ട്രഷറി അഡ്രസ്സ് ഇതാ ഇവിടെ കൊടുക്കുന്നു
const SOUL_WALLET = '5auZoWJxJod5U8dwgKnaFaphySZ9Su3Az8dLz1EUZs7'
const MAIN_WALLET_ETH = '0xba24d47ef3f4e1000000000000000000f3f4e1'
const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY || ''

export async function GET() {
  try {
    // 1. ETH/Base/Polygon ബാലൻസ് എടുക്കുന്നു
    const ethRes = await fetch(
      `https://api.g.alchemy.com/data/v1/${ALCHEMY_KEY}/assets/tokens/by-address`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addresses: [{ address: MAIN_WALLET_ETH, networks: ['eth-mainnet', 'base-mainnet', 'matic-mainnet'] }]
        })
      }
    )
    const ethData = await ethRes.json()

    // 2. SOLANA ബാലൻസ് എടുക്കാൻ (Alchemy-യുടെ സോളാന എൻഡ്‌പോയിന്റ്)
    const solRes = await fetch(`https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1,
        method: 'getBalance',
        params: [SOUL_WALLET]
      })
    })
    const solData = await solRes.json()

    // രണ്ടും കൂടി ചേർത്ത് റിട്ടേൺ ചെയ്യുന്നു
    return NextResponse.json({
      evm: ethData,
      solana: {
        address: SOUL_WALLET,
        balance: solData.result?.value ? (solData.result.value / 1e9).toFixed(4) : "0"
      }
    })
  } catch (e) {
    return NextResponse.json({ error: 'Portfolio fetch failed' }, { status: 500 })
  }
}
