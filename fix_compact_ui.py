path = 'app/page.tsx'
with open(path, 'r') as f:
    content = f.read()

changes = []

def safe_replace(old, new, label):
    global content
    c = content.count(old)
    if c == 1:
        content = content.replace(old, new, 1)
        changes.append(f"[OK] {label}")
    else:
        changes.append(f"[SKIP] {label} (found {c} times, expected 1)")

# 1. Smart Wallet wrapper -> tighter, button-like
safe_replace(
    "<div style={{marginBottom:8,padding:2,borderRadius:10,border:'1px solid rgba(0,255,136,0.35)',background:'rgba(0,255,136,0.05)'}}>",
    "<div style={{marginBottom:6,padding:1,borderRadius:10,border:'1px solid rgba(0,255,136,0.35)',background:'rgba(0,255,136,0.05)'}}>",
    "Smart Wallet wrapper compact"
)

# 2. Premium box -> smaller padding/margins
safe_replace(
    "<div style={{padding:'10px',marginBottom:8,borderRadius:10,border:'1px solid #ffd70044',background:'rgba(255,215,0,0.03)',maxWidth:'94%',marginLeft:'auto',marginRight:'auto'}}>",
    "<div style={{padding:'6px 10px',marginBottom:6,borderRadius:10,border:'1px solid #ffd70044',background:'rgba(255,215,0,0.03)',maxWidth:'94%',marginLeft:'auto',marginRight:'auto'}}>",
    "Premium box compact"
)

# 3. Premium header block -> smaller
safe_replace(
    "<div style={{textAlign:'center',marginBottom:8}}>\n              <span style={{fontSize:'1rem'}}>👑</span>\n              <div style={{fontSize:'0.78rem',fontWeight:700,color:'#ffd700',fontFamily:'var(--font-mono)',letterSpacing:'0.04em',marginTop:2}}>PREMIUM SUBSCRIPTION</div>",
    "<div style={{textAlign:'center',marginBottom:4}}>\n              <span style={{fontSize:'0.85rem'}}>👑</span>\n              <div style={{fontSize:'0.7rem',fontWeight:700,color:'#ffd700',fontFamily:'var(--font-mono)',letterSpacing:'0.04em',marginTop:1}}>PREMIUM SUBSCRIPTION</div>",
    "Premium header compact"
)

# 4. Security box -> smaller padding
safe_replace(
    "<div style={{padding:'10px',borderRadius:10,border:'1px solid #ffd70033',background:'rgba(0,0,0,0.3)',maxWidth:'94%',marginLeft:'auto',marginRight:'auto'}}>",
    "<div style={{padding:'6px 10px',borderRadius:10,border:'1px solid #ffd70033',background:'rgba(0,0,0,0.3)',maxWidth:'94%',marginLeft:'auto',marginRight:'auto'}}>",
    "Security box compact"
)

# 5. Security header/desc -> smaller
safe_replace(
    "<div style={{textAlign:'center',fontSize:'0.72rem',fontWeight:700,color:'#ffd700',fontFamily:'var(--font-mono)',marginBottom:2}}>🛡 BANK-GRADE SECURITY</div>\n            <div style={{textAlign:'center',fontSize:'0.58rem',color:'rgba(232,244,253,0.5)',marginBottom:8}}>256-BIT ENCRYPTION · MULTI-SIG PROTECTION · AUDITED SYSTEMS</div>",
    "<div style={{textAlign:'center',fontSize:'0.66rem',fontWeight:700,color:'#ffd700',fontFamily:'var(--font-mono)',marginBottom:1}}>🛡 BANK-GRADE SECURITY</div>\n            <div style={{textAlign:'center',fontSize:'0.54rem',color:'rgba(232,244,253,0.5)',marginBottom:4}}>256-BIT ENCRYPTION · MULTI-SIG PROTECTION · AUDITED SYSTEMS</div>",
    "Security header/desc compact"
)

with open(path, 'w') as f:
    f.write(content)

print("\n".join(changes))
