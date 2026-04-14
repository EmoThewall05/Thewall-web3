/**
 * TheWall Web3 Ecosystem - Token API Script
 * Built by Divin (Dwin) | Dubai, UAE
 * Multi-chain Balance Checker (EVM + Solana)
 */

const apiKeyAlchemy = process.env.ALCHEMY_API_KEY || "demo";
const apiKeyHelius = process.env.NEXT_PUBLIC_HELIUS_KEY;

// വാലറ്റ് അഡ്രസ്സുകൾ
const SOUL_ADDRESS = "5auZoWJxJodSU8dwgKmAfmphv5Z9Su3HAzEdLz1EUZs7"; // നിന്റെ സോളാന അഡ്രസ്സ്
const MAIN_WALLET = "0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be";    // നിന്റെ മെയിൻ ETH വാലറ്റ്

// API URLs
const baseURLAlchemy = `https://eth-mainnet.g.alchemy.com/v2/${apiKeyAlchemy}`;
const baseURLHelius = `https://mainnet.helius-rpc.com/?api-key=${apiKeyHelius}`;

async function getBalances() {
  console.log("🦋 Fetching TheWall Portfolio Data...\n");

  try {
    // --- 1. സോളാന ബാലൻസ് (HELIUS) ---
    const solResponse = await fetch(baseURLHelius, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: "2.0", id: 1,
        method: "getBalance",
        params: [SOUL_ADDRESS]
      })
    });
    const solData = await solResponse.json();
    const solBalance = solData.result ? solData.result.value / 1e9 : 0;

    // --- 2. ETH/EVM ടോക്കൺ ബാലൻസ് (ALCHEMY) ---
    const ethTokenResponse = await fetch(baseURLAlchemy, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "alchemy_getTokenBalances",
        params: [MAIN_WALLET],
        id: 1
      })
    });
    const ethTokenData = await ethTokenResponse.json();

    // --- 3. ഡിസ്പ്ലേ ഔട്ട്പുട്ട് ---
    console.log("-----------------------------------------");
    console.log(`🌟 Soul Wallet (SOL): ${solBalance.toFixed(4)} SOL`);
    console.log(`🌍 Main Wallet (ETH): ${MAIN_WALLET.slice(0, 6)}...${MAIN_WALLET.slice(-4)}`);
    
    if (ethTokenData.result && ethTokenData.result.tokenBalances) {
      console.log("\n📦 ERC-20 Tokens (Top Assets):");
      // ആദ്യത്തെ 3 ടോക്കണുകൾ മാത്രം കാണിക്കുന്നു
      ethTokenData.result.tokenBalances.slice(0, 3).forEach((token, index) => {
        console.log(`${index + 1}. Contract: ${token.contractAddress} | Raw Bal: ${token.tokenBalance}`);
      });
    }
    console.log("-----------------------------------------");
    console.log("✅ Data sync complete.");

  } catch (error) {
    console.error("❌ Error fetching data:", error.message);
  }
}

// സ്ക്രിപ്റ്റ് റൺ ചെയ്യുന്നു
getBalances();
