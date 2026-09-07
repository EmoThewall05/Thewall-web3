export default function PrivacyPolicy() {
  return (
    <div style={{maxWidth: 800, margin: '0 auto', padding: '40px 20px', color: '#E8F4FD', background: '#07080B', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', lineHeight: 1.7}}>
      <h1 style={{fontSize: '1.8rem', marginBottom: 8}}>Privacy Policy</h1>
      <p style={{color: 'rgba(232,244,253,0.5)', marginBottom: 30}}>Last updated: September 2026</p>

      <p>TheWall ("we", "our", "the App") is a non-custodial, gasless Web3 wallet built by Dwin 05 / Emobies. This Privacy Policy explains what information we collect, how we use it, and your choices.</p>

      <h2 style={{marginTop: 30, fontSize: '1.2rem'}}>1. Non-Custodial by Design</h2>
      <p>TheWall never stores your private keys or seed phrase on our servers. Wallet access is provided through Reown AppKit (WalletConnect) using email, social login, or passkey/biometric authentication. We do not have access to, and cannot recover, your funds.</p>

      <h2 style={{marginTop: 30, fontSize: '1.2rem'}}>2. Information We Collect</h2>
      <ul>
        <li><strong>Wallet address</strong> — used to display balances, transaction history, and EmoCoins (EMC) rewards.</li>
        <li><strong>Email address</strong> (if you sign up via email/social login) — used for authentication only.</li>
        <li><strong>Transaction data</strong> — swap, send, and bridge activity, used to calculate fees and rewards.</li>
        <li><strong>Chat messages with Emowall AI</strong> — sent to our AI providers to generate responses; not used for advertising.</li>
        <li><strong>Device/usage data</strong> — basic analytics (app version, crash logs) to improve stability.</li>
      </ul>

      <h2 style={{marginTop: 30, fontSize: '1.2rem'}}>3. Third-Party Services</h2>
      <p>We use trusted infrastructure providers to operate TheWall:</p>
      <ul>
        <li><strong>Reown AppKit / WalletConnect</strong> — wallet connection and authentication</li>
        <li><strong>Alchemy</strong> — blockchain data, gas sponsorship, NFT and token balances</li>
        <li><strong>Supabase</strong> — EmoCoins balance, premium status, referral records</li>
        <li><strong>Google Gemini & Cloudflare Workers AI</strong> — powers the Emowall AI chat assistant</li>
        <li><strong>CoinGecko / CoinDesk</strong> — live price and news data</li>
        <li><strong>1inch, LI.FI</strong> — swap and bridge routing</li>
      </ul>
      <p>These providers process data under their own privacy policies. We only share the minimum data required for each service to function.</p>

      <h2 style={{marginTop: 30, fontSize: '1.2rem'}}>4. Data We Do Not Collect</h2>
      <p>We do not collect your seed phrase, private keys, government ID, or precise location. We do not sell your data to advertisers or third parties.</p>

      <h2 style={{marginTop: 30, fontSize: '1.2rem'}}>5. Security</h2>
      <p>TheWall uses Biometric 2FA/Passkeys, WebAuthn server-side verification, approval-gated transaction broadcasting, transaction simulation, and emergency PIN wallet freeze. Our code is scanned with CodeQL, Snyk, and Semgrep.</p>

      <h2 style={{marginTop: 30, fontSize: '1.2rem'}}>6. Your Choices</h2>
      <p>You may use Guest Mode to browse read-only wallet data without logging in. You can disconnect your wallet at any time. You may request deletion of your account data by contacting us below.</p>

      <h2 style={{marginTop: 30, fontSize: '1.2rem'}}>7. Children's Privacy</h2>
      <p>TheWall is not directed at children under 13. We do not knowingly collect data from children.</p>

      <h2 style={{marginTop: 30, fontSize: '1.2rem'}}>8. Changes to This Policy</h2>
      <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date.</p>

      <h2 style={{marginTop: 30, fontSize: '1.2rem'}}>9. Contact Us</h2>
      <p>For privacy questions or data deletion requests, contact us at: <a href="mailto:support@e-mobies.com" style={{color: '#627eea'}}>support@e-mobies.com</a></p>
    </div>
  )
}
