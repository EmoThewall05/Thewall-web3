import os

path = os.path.expanduser('~/Thewall-web3/app/page.tsx')
with open(path, 'r') as f:
    content = f.read()

old_sub = "Web3 · IND → DXB · 5 Chains"
new_sub = "Web3 · IND → DXB · 6 Chains"
assert content.count(old_sub) == 1, f"Chains: {content.count(old_sub)}"
content = content.replace(old_sub, new_sub, 1)

old_btn = "<button onClick={handleConnectWallet} style={{width:'100%',padding:'12px',marginBottom:8,background:'linear-gradient(135deg,#ffd700,#b8860b)',border:'none',borderRadius:10,color:'#1a1200',fontFamily:'var(--font-mono)',fontSize:'0.9rem',fontWeight:700,letterSpacing:'0.05em',cursor:'pointer',boxShadow:'0 0 20px rgba(255,215,0,0.25)'}}>SIGN UP / LOGIN</button>"
assert content.count(old_btn) == 1, f"Button: {content.count(old_btn)}"
new_btn = "<div style={{border:'1px solid #ffd70044',borderRadius:14,padding:12,marginBottom:8,background:'linear-gradient(160deg, rgba(255,215,0,0.04), rgba(0,0,0,0.2))'}}>\n          " + old_btn
content = content.replace(old_btn, new_btn, 1)

old_swc = "<div style={{marginBottom:8}}>\n            <SmartWalletConnect"
assert content.count(old_swc) == 1, f"SWC: {content.count(old_swc)}"
new_swc = "<div style={{marginBottom:8,padding:2,borderRadius:10,border:'1px solid rgba(0,255,136,0.35)',background:'rgba(0,255,136,0.05)'}}>\n            <SmartWalletConnect"
content = content.replace(old_swc, new_swc, 1)

old_prem = "<div style={{padding:'10px',marginBottom:8,borderRadius:10,border:'1px solid #ffd70044',background:'rgba(255,215,0,0.03)'}}>"
assert content.count(old_prem) == 1, f"Premium: {content.count(old_prem)}"
new_prem = "<div style={{padding:'10px',marginBottom:8,borderRadius:10,border:'1px solid #ffd70044',background:'rgba(255,215,0,0.03)',maxWidth:'94%',marginLeft:'auto',marginRight:'auto'}}>"
content = content.replace(old_prem, new_prem, 1)

old_sec = "<div style={{padding:'10px',borderRadius:10,border:'1px solid #ffd70033',background:'rgba(0,0,0,0.3)'}}>"
assert content.count(old_sec) == 1, f"Security: {content.count(old_sec)}"
new_sec = "<div style={{padding:'10px',borderRadius:10,border:'1px solid #ffd70033',background:'rgba(0,0,0,0.3)',maxWidth:'94%',marginLeft:'auto',marginRight:'auto'}}>"
content = content.replace(old_sec, new_sec, 1)

with open(path, 'w') as f:
    f.write(content)

print("[OK] 5 changes applied (6 Chains, wrapper open, SmartWallet style, narrow Premium+Security)")
