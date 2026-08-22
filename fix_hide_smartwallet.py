path = 'app/page.tsx'
with open(path) as f:
    content = f.read()

old = '''          <button onClick={handleConnectWallet} style={{width:'100%',padding:'12px',marginBottom:8,background:'linear-gradient(135deg,#ffd700,#b8860b)',border:'none',borderRadius:10,color:'#1a1200',fontFamily:'var(--font-mono)',fontSize:'0.9rem',fontWeight:700,letterSpacing:'0.05em',cursor:'pointer',boxShadow:'0 0 20px rgba(255,215,0,0.25)'}}>SIGN UP / LOGIN</button>
          <div style={{marginBottom:8}}>
            <SmartWalletConnect onConnect={(address, email) => { setUser({address, type: 'smart', email}); setScreen('dashboard') }} />
          </div>'''

new = '''          <button onClick={handleConnectWallet} style={{width:'100%',padding:'12px',marginBottom:8,background:'linear-gradient(135deg,#ffd700,#b8860b)',border:'none',borderRadius:10,color:'#1a1200',fontFamily:'var(--font-mono)',fontSize:'0.9rem',fontWeight:700,letterSpacing:'0.05em',cursor:'pointer',boxShadow:'0 0 20px rgba(255,215,0,0.25)'}}>🔗 CONNECT WALLET (MetaMask, Trust, etc.)</button>
          <div style={{textAlign:'center',fontSize:'0.62rem',color:'rgba(232,244,253,0.4)',fontFamily:'var(--font-mono)',marginBottom:8,padding:'6px'}}>✨ Smart Wallet (Email/Passkey) — Coming Soon</div>'''

if old not in content:
    print('[FAIL] block not found')
else:
    content = content.replace(old, new)
    with open(path, 'w') as f:
        f.write(content)
    print('[OK] smart wallet hidden, connect wallet button promoted')
