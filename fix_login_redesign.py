import re

path = 'app/page.tsx'
with open(path) as f:
    content = f.read()

start_marker = "{loginStep==='home'&&<div className=\"fade-up-1\">"
end_marker = "<div className={styles.gasNote}>✅ Gas FREE · 🛡️ CodeQL + Snyk + Semgrep</div>\n        </div>}"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print(f'[FAIL] markers not found. start={start_idx} end={end_idx}')
else:
    end_idx_full = end_idx + len(end_marker)
    old_block = content[start_idx:end_idx_full]

    new_block = '''{loginStep==='home'&&<div className="fade-up-1">
          <div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'center',marginBottom:14}}>
            {[{icon:'👑',label:'PREMIUM ACCESS',color:'#ffd700'},{icon:'🛡️',label:'BANK-GRADE SECURITY',color:'#00ff88'},{icon:'⚡',label:'GASLESS & SEAMLESS',color:'#ffd700'}].map(f=>(
              <div key={f.label} style={{display:'flex',alignItems:'center',gap:4,padding:'5px 10px',border:`1px solid ${f.color}55`,borderRadius:20,background:`${f.color}11`,fontSize:'0.65rem',fontFamily:'var(--font-mono)',color:f.color,whiteSpace:'nowrap'}}><span>{f.icon}</span><span style={{fontWeight:700}}>{f.label}</span></div>
            ))}
          </div>
          <div style={{textAlign:'center',fontSize:'0.62rem',letterSpacing:'0.15em',color:'#ffd70099',fontFamily:'var(--font-mono)',marginBottom:8}}>— SELECT CHAIN —</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
            {[
              {id:'birth',label:'BIRTH',sub:'Bitcoin (BTC)',icon:'₿',color:'#f7931a'},
              {id:'earth',label:'EARTH',sub:'Ethereum (ETH)',icon:'🌍',color:'#627eea'},
              {id:'soul',label:'SOUL',sub:'Solana (SOL)',icon:'🌟',color:'#9945ff'},
              {id:'orbit',label:'ORBIT',sub:'Arbitrum (ARB)',icon:'🪐',color:'#12aaff'},
              {id:'moon',label:'MOON',sub:'Monad (MON)',icon:'🌙',color:'#836ef9'},
              {id:'base',label:'BASE',sub:'Base',icon:'🔵',color:'#0052ff'},
            ].map(c=>(
              <div key={c.id} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 12px',borderRadius:10,border:'1px solid #ffd70033',background:'#0a0a0a',position:'relative'}}>
                <span style={{fontSize:'1.1rem'}}>{c.icon}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:'0.7rem',fontWeight:700,color:'#ffd700',fontFamily:'var(--font-mono)',letterSpacing:'0.03em'}}>{c.label}</div>
                  <div style={{fontSize:'0.58rem',color:'rgba(232,244,253,0.5)',fontFamily:'var(--font-mono)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{c.sub}</div>
                </div>
                <span style={{width:5,height:5,borderRadius:'50%',background:chainStatus[c.id]==='online'?'#00ff88':chainStatus[c.id]==='offline'?'#ff4466':c.color,flexShrink:0}}/>
              </div>
            ))}
          </div>
          <button onClick={handleConnectWallet} style={{width:'100%',padding:'14px',marginBottom:10,background:'linear-gradient(135deg,#ffd700,#b8860b)',border:'none',borderRadius:10,color:'#1a1200',fontFamily:'var(--font-mono)',fontSize:'0.9rem',fontWeight:700,letterSpacing:'0.05em',cursor:'pointer',boxShadow:'0 0 20px rgba(255,215,0,0.25)'}}>SIGN UP / LOGIN</button>
          <div style={{marginBottom:10}}>
            <SmartWalletConnect onConnect={(address, email) => { setUser({address, type: 'smart', email}); setScreen('dashboard') }} />
          </div>
          <div style={{padding:'14px',marginBottom:12,borderRadius:10,border:'1px solid #ffd70044',background:'rgba(255,215,0,0.03)'}}>
            <div style={{textAlign:'center',marginBottom:8}}>
              <span style={{fontSize:'1rem'}}>👑</span>
              <div style={{fontSize:'0.78rem',fontWeight:700,color:'#ffd700',fontFamily:'var(--font-mono)',letterSpacing:'0.04em',marginTop:2}}>PREMIUM SUBSCRIPTION</div>
              <div style={{fontSize:'0.62rem',color:'rgba(232,244,253,0.6)',marginTop:4,lineHeight:1.4}}>Unlock exclusive perks, priority support, and advanced features.</div>
            </div>
            <div style={{display:'flex',justifyContent:'space-around',fontSize:'0.58rem',color:'rgba(232,244,253,0.7)',fontFamily:'var(--font-mono)',textAlign:'center'}}>
              <div>⭐<br/>EXCLUSIVE<br/>ACCESS</div>
              <div>🛡️<br/>PRIORITY<br/>SUPPORT</div>
              <div>💎<br/>ENHANCED<br/>YIELDS</div>
            </div>
          </div>
          <div style={{padding:'12px',borderRadius:10,border:'1px solid #ffd70033',background:'rgba(0,0,0,0.3)'}}>
            <div style={{textAlign:'center',fontSize:'0.72rem',fontWeight:700,color:'#ffd700',fontFamily:'var(--font-mono)',marginBottom:2}}>🛡️ BANK-GRADE SECURITY</div>
            <div style={{textAlign:'center',fontSize:'0.58rem',color:'rgba(232,244,253,0.5)',marginBottom:8}}>256-BIT ENCRYPTION · MULTI-SIG PROTECTION · AUDITED SYSTEMS</div>
            <div style={{display:'flex',justifyContent:'space-around',fontSize:'0.56rem',color:'rgba(232,244,253,0.6)',fontFamily:'var(--font-mono)',textAlign:'center'}}>
              <div>🔒<br/>SOC 2<br/>TYPE II</div>
              <div>🌐<br/>ISO 27001<br/>CERTIFIED</div>
              <div>✅<br/>CCSS<br/>COMPLIANT</div>
            </div>
          </div>
        </div>}'''

    content = content[:start_idx] + new_block + content[end_idx_full:]
    with open(path, 'w') as f:
        f.write(content)
    print(f'[OK] replaced {len(old_block)} chars with {len(new_block)} chars')
