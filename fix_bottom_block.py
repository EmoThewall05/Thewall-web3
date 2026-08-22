import os

path = os.path.expanduser('~/Thewall-web3/app/page.tsx')
with open(path, 'r') as f:
    content = f.read()

# ---------- 1. "5 Chains" -> "6 Chains" ----------
old_sub = "Web3 · IND → DXB · 5 Chains"
new_sub = "Web3 · IND → DXB · 6 Chains"
assert content.count(old_sub) == 1, f"Chains text not found/unique! Found {content.count(old_sub)}"
content = content.replace(old_sub, new_sub, 1)

# ---------- 2. Open wrapper before SIGN UP / LOGIN button ----------
old_btn_open = "<button onClick={handleConnectWallet} style={{width:'100%',padding:'12px',marginBottom:8,background:'linear-gradient(135deg,#ffd700,#b8860b)',border:'none',borderRadius:10,color:'#1a1200',fontFamily:'var(--font-mono)',fontSize:'0.9rem',fontWeight:700,letterSpacing:'0.05em',cursor:'pointer',boxShadow:'0 0 20px rgba(255,215,0,0.25)'}}>SIGN UP / LOGIN</button>"
new_btn_open = "<div style={{border:'1px solid #ffd70044',borderRadius:14,padding:12,marginBottom:8,background:'linear-gradient(160deg, rgba(255,215,0,0.04), rgba(0,0,0,0.2))'}}>\n          <button onClick={handleConnectWallet} style={{width:'100%',padding:'12px',marginBottom:8,background:'linear-gradient(135deg,#ffd700,#b8860b)',border:'none',borderRadius:10,color:'#1a1200',fontFamily:'var(--font-mono)',fontSize:'0.9rem',fontWeight:700,letterSpacing:'0.05em',cursor:'pointer',boxShadow:'0 0 20px rgba(255,215,0,0.25)'}}>SIGN UP / LOGIN</button>"
assert content.count(old_btn_open) == 1, f"Button anchor not found/unique! Found {content.count(old_btn_open)}"
content = content.replace(old_btn_open, new_btn_open, 1)

# ---------- 3. Give SmartWalletConnect a button-card feel ----------
old_swc = "<div style={{marginBottom:8}}>\n            <SmartWalletConnect onConnect={(address, email) => { setUser({address, type: 'smart', email}); setScreen('dashboard') }} />\n          </div>"
new_swc = "<div style={{marginBottom:8,padding:2,borderRadius:10,border:'1px solid rgba(0,255,136,0.35)',background:'rgba(0,255,136,0.05)'}}>\n            <SmartWalletConnect onConnect={(address, email) => { setUser({address, type: 'smart', email}); setScreen('dashboard') }} />\n          </div>"
assert content.count(old_swc) == 1, f"SmartWalletConnect wrapper not found/unique! Found {content.count(old_swc)}"
content = content.replace(old_swc, new_swc, 1)

# ---------- 4. Narrow Premium Subscription box ----------
old_prem = "<div style={{padding:'10px',marginBottom:8,borderRadius:10,border:'1px solid #ffd70044',background:'rgba(255,215,0,0.03)'}}>"
new_prem = "<div style={{padding:'10px',marginBottom:8,borderRadius:10,border:'1px solid #ffd70044',background:'rgba(255,215,0,0.03)',maxWidth:'94%',marginLeft:'auto',marginRight:'auto'}}>"
assert content.count(old_prem) == 1, f"Premium box not found/unique! Found {content.count(old_prem)}"
content = content.replace(old_prem, new_prem, 1)

# ---------- 5. Narrow Bank-Grade Security box ----------
old_sec = "<div style={{padding:'10px',borderRadius:10,border:'1px solid #ffd70033',background:'rgba(0,0,0,0.3)'}}>"
new_sec = "<div style={{padding:'10px',borderRadius:10,border:'1px solid #ffd70033',background:'rgba(0,0,0,0.3)',maxWidth:'94%',marginLeft:'auto',marginRight:'auto'}}>"
assert content.count(old_sec) == 1, f"Security box not found/unique! Found {content.count(old_sec)}"
content = content.replace(old_sec, new_sec, 1)

# ---------- 6. Close wrapper div after Bank-Grade Security block ----------
old_close = "<div>✅<br/>CCSS<br/>COMPLIANT</div>\n            </div>\n          </div>}"
new_close = "<div>✅<br/>CCSS<br/>COMPLIANT</div>\n            </div>\n          </div>\n          </div>}"
assert content.count(old_close) == 1, f"Closing anchor not found/unique! Found {content.count(old_close)}"
content = content.replace(old_close, new_close, 1)

with open(path, 'w') as f:
    f.write(content)

print("[OK] 6 Chains + cohesive bottom card + narrowed Premium/Security boxes")
