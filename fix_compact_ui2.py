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

# 1. Outer wallet wrapper - reduce padding/margin
safe_replace(
    "<div style={{border:'1px solid #ffd70044',borderRadius:14,padding:12,marginBottom:8,background:'linear-gradient(160deg, rgba(255,215,0,0.04), rgba(0,0,0,0.2))'}}>",
    "<div style={{border:'1px solid #ffd70044',borderRadius:14,padding:8,marginBottom:6,background:'linear-gradient(160deg, rgba(255,215,0,0.04), rgba(0,0,0,0.2))'}}>",
    "Outer wrapper compact"
)

# 2. SIGN UP button - reduce padding/margin
safe_replace(
    "<button onClick={handleConnectWallet} style={{width:'100%',padding:'12px',marginBottom:8,background:'linear-gradient(135deg,#ffd700,#b8860b)',border:'none',borderRadius:10,color:'#1a1200',fontFamily:'var(--font-mono)',fontSize:'0.9rem',fontWeight:700,letterSpacing:'0.05em',cursor:'pointer',boxShadow:'0 0 20px rgba(255,215,0,0.25)'}}>SIGN UP / LOGIN</button>",
    "<button onClick={handleConnectWallet} style={{width:'100%',padding:'10px',marginBottom:6,background:'linear-gradient(135deg,#ffd700,#b8860b)',border:'none',borderRadius:10,color:'#1a1200',fontFamily:'var(--font-mono)',fontSize:'0.85rem',fontWeight:700,letterSpacing:'0.05em',cursor:'pointer',boxShadow:'0 0 20px rgba(255,215,0,0.25)'}}>SIGN UP / LOGIN</button>",
    "Sign up button compact"
)

# 3. Premium description line - tighter
safe_replace(
    "<div style={{fontSize:'0.62rem',color:'rgba(232,244,253,0.6)',marginTop:4,lineHeight:1.4}}>Unlock exclusive perks, priority support, and advanced features.</div>",
    "<div style={{fontSize:'0.58rem',color:'rgba(232,244,253,0.6)',marginTop:2,lineHeight:1.15}}>Unlock exclusive perks, priority support, and advanced features.</div>",
    "Premium description compact"
)

# 4. Security description line - tighter
safe_replace(
    "<div style={{textAlign:'center',fontSize:'0.58rem',color:'rgba(232,244,253,0.5)',marginBottom:8}}>256-BIT ENCRYPTION · MULTI-SIG PROTECTION · AUDITED SYSTEMS</div>",
    "<div style={{textAlign:'center',fontSize:'0.54rem',color:'rgba(232,244,253,0.5)',marginBottom:4}}>256-BIT ENCRYPTION · MULTI-SIG PROTECTION · AUDITED SYSTEMS</div>",
    "Security description compact"
)

with open(path, 'w') as f:
    f.write(content)

print("\n".join(changes))
