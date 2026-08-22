path = 'app/page.tsx'
with open(path) as f:
    content = f.read()

old = '''          <div style={{padding:'6px 10px',marginBottom:6,borderRadius:10,border:'1px solid #ffd70044',background:'rgba(255,215,0,0.03)',maxWidth:'94%',marginLeft:'auto',marginRight:'auto'}}>
            <div style={{textAlign:'center',marginBottom:4}}>
              <span style={{fontSize:'0.85rem'}}>👑</span>
              <div style={{fontSize:'0.7rem',fontWeight:700,color:'#ffd700',fontFamily:'var(--font-mono)',letterSpacing:'0.04em',marginTop:1}}>PREMIUM SUBSCRIPTION</div>
              <div style={{fontSize:'0.58rem',color:'rgba(232,244,253,0.6)',marginTop:2,lineHeight:1.15}}>Unlock exclusive perks, priority support, and advanced features.</div>
            </div>
            <div style={{display:'flex',justifyContent:'space-around',fontSize:'0.58rem',color:'rgba(232,244,253,0.7)',fontFamily:'var(--font-mono)',textAlign:'center'}}>
              <div>⭐<br/>EXCLUSIVE<br/>ACCESS</div>
              <div>🛡️<br/>PRIORITY<br/>SUPPORT</div>
              <div>💎<br/>ENHANCED<br/>YIELDS</div>
            </div>
          </div>
          <div style={{padding:'6px 10px',borderRadius:10,border:'1px solid #ffd70033',background:'rgba(0,0,0,0.3)',maxWidth:'94%',marginLeft:'auto',marginRight:'auto'}}>
            <div style={{textAlign:'center',fontSize:'0.72rem',fontWeight:700,color:'#ffd700',fontFamily:'var(--font-mono)',marginBottom:2}}>🛡️ BANK-GRADE SECURITY</div>
            <div style={{textAlign:'center',fontSize:'0.54rem',color:'rgba(232,244,253,0.5)',marginBottom:4}}>256-BIT ENCRYPTION · MULTI-SIG PROTECTION · AUDITED SYSTEMS</div>
            <div style={{display:'flex',justifyContent:'space-around',fontSize:'0.56rem',color:'rgba(232,244,253,0.6)',fontFamily:'var(--font-mono)',textAlign:'center'}}>
              <div>🔒<br/>SOC 2<br/>TYPE II</div>
              <div>🌐<br/>ISO 27001<br/>CERTIFIED</div>
              <div>✅<br/>CCSS<br/>COMPLIANT</div>
            </div>
          </div>'''

new = '''          <div style={{display:'flex',gap:6,maxWidth:'94%',marginLeft:'auto',marginRight:'auto'}}>
            <div style={{flex:1,padding:'5px 6px',borderRadius:8,border:'1px solid #ffd70044',background:'rgba(255,215,0,0.03)',textAlign:'center'}}>
              <div style={{fontSize:'0.6rem',fontWeight:700,color:'#ffd700',fontFamily:'var(--font-mono)'}}>👑 PREMIUM</div>
              <div style={{fontSize:'0.5rem',color:'rgba(232,244,253,0.6)',fontFamily:'var(--font-mono)',marginTop:1}}>⭐ 🛡️ 💎</div>
            </div>
            <div style={{flex:1,padding:'5px 6px',borderRadius:8,border:'1px solid #ffd70033',background:'rgba(0,0,0,0.3)',textAlign:'center'}}>
              <div style={{fontSize:'0.6rem',fontWeight:700,color:'#ffd700',fontFamily:'var(--font-mono)'}}>🛡️ SECURITY</div>
              <div style={{fontSize:'0.5rem',color:'rgba(232,244,253,0.6)',fontFamily:'var(--font-mono)',marginTop:1}}>🔒 🌐 ✅</div>
            </div>
          </div>'''

if old not in content:
    print('[WARN] target block not found - manual check needed')
elif new in content:
    print('[SKIP] already patched')
else:
    content = content.replace(old, new)
    with open(path, 'w') as f:
        f.write(content)
    print('[OK] shrunk premium + security sections into compact side-by-side row')
