path = "app/page.tsx"
with open(path) as f:
    content = f.read()

old_buttons = """            <button style={{flex:1,padding:'12px',background:'linear-gradient(135deg,#ffd700,#b8860b)',border:'none',borderRadius:10,color:'#1a1200',fontWeight:700,...s.mono,fontSize:'0.78rem',cursor:'pointer'}}>👑 Become a Leader</button>
            <button style={{flex:1,padding:'12px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:10,color:'var(--text)',fontWeight:700,...s.mono,fontSize:'0.78rem',cursor:'pointer'}}>🔍 Browse Leaders</button>"""

new_buttons = """            <button onClick={()=>{setBecomeLeaderStatus('');setBecomeLeaderOpen(true)}} style={{flex:1,padding:'12px',background:'linear-gradient(135deg,#ffd700,#b8860b)',border:'none',borderRadius:10,color:'#1a1200',fontWeight:700,...s.mono,fontSize:'0.78rem',cursor:'pointer'}}>👑 Become a Leader</button>
            <button onClick={()=>{setBrowseLeadersOpen(true);fetchLeaders()}} style={{flex:1,padding:'12px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:10,color:'var(--text)',fontWeight:700,...s.mono,fontSize:'0.78rem',cursor:'pointer'}}>🔍 Browse Leaders</button>"""

if old_buttons not in content:
    print("[WARN] button anchor not found — may already be wired")
else:
    content = content.replace(old_buttons, new_buttons, 1)
    with open(path, "w") as f:
        f.write(content)
    print("[OK] buttons wired")

# Now insert modals right before the final closing of the copytrade tab block.
# Anchor: the closing of the chat input row, right before "</div>}\n        </div>}" pattern for copytrade tab end.
with open(path) as f:
    content = f.read()

modal_anchor = "              <button onClick={sendCopyTradeMessage} disabled={copyTradeChatLoading} style={{padding:'8px 14px',borderRadius:8,border:'none',background:'var(--cyan)',color:'#000',fontWeight:700,cursor:'pointer',fontSize:'0.74rem'}}>→</button>\n            </div>\n          </div>"

modals = """

          {becomeLeaderOpen&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:99999,display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={()=>setBecomeLeaderOpen(false)}>
            <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:16,padding:20,maxWidth:340,width:'100%'}} onClick={e=>e.stopPropagation()}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                <div style={{fontSize:'0.9rem',...s.mono,color:'var(--text)',fontWeight:700}}>👑 Become a Leader</div>
                <button onClick={()=>setBecomeLeaderOpen(false)} style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:6,color:'var(--text-muted)',width:28,height:28,cursor:'pointer',fontSize:'1rem'}}>x</button>
              </div>
              <div style={{fontSize:'0.7rem',...s.muted,marginBottom:12}}>Your wallet's trades will become visible to followers. You'll earn EMC as your Trust Score 🦋 grows.</div>
              <input value={becomeLeaderName} onChange={e=>setBecomeLeaderName(e.target.value)} placeholder="Display name (optional)" style={{width:'100%',padding:'10px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg)',color:'var(--text)',fontSize:'0.78rem',...s.mono,marginBottom:12,boxSizing:'border-box'}}/>
              {becomeLeaderStatus&&<div style={{fontSize:'0.72rem',...s.mono,marginBottom:10,color:'var(--text)'}}>{becomeLeaderStatus}</div>}
              <button onClick={becomeLeader} disabled={becomeLeaderLoading} style={{width:'100%',padding:'12px',background:'linear-gradient(135deg,#ffd700,#b8860b)',border:'none',borderRadius:10,color:'#1a1200',fontWeight:700,...s.mono,fontSize:'0.78rem',cursor:'pointer',opacity:becomeLeaderLoading?0.6:1}}>{becomeLeaderLoading?'Joining...':'Confirm & Become a Leader'}</button>
            </div>
          </div>}

          {browseLeadersOpen&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:99999,display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={()=>setBrowseLeadersOpen(false)}>
            <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:16,padding:20,maxWidth:360,width:'100%',maxHeight:'75vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                <div style={{fontSize:'0.9rem',...s.mono,color:'var(--text)',fontWeight:700}}>🔍 Browse Leaders</div>
                <button onClick={()=>setBrowseLeadersOpen(false)} style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:6,color:'var(--text-muted)',width:28,height:28,cursor:'pointer',fontSize:'1rem'}}>x</button>
              </div>
              {leadersLoading&&<div style={{display:'flex',justifyContent:'center',padding:24}}><div className={styles.spinner}/></div>}
              {!leadersLoading&&leadersList.length===0&&<div style={{textAlign:'center',padding:24,fontSize:'0.75rem',...s.muted}}>No leaders yet — be the first! 🦋</div>}
              {leadersList.map((ld,i)=>(
                <div key={i} style={{...s.card,padding:12,marginBottom:8}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                    <div style={{fontSize:'0.78rem',...s.mono,color:'var(--text)',fontWeight:700}}>{ld.display_name || (ld.wallet_address.slice(0,6)+'...'+ld.wallet_address.slice(-4))}</div>
                    <span style={{fontSize:'0.9rem'}}>🦋</span>
                  </div>
                  <div style={{display:'flex',gap:12,fontSize:'0.65rem',...s.muted}}>
                    <span>Trust: {ld.trust_score}</span>
                    <span>Win: {ld.win_rate}%</span>
                    <span>Followers: {ld.total_followers}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>}"""

if "becomeLeaderOpen&&<div" in content:
    print("[SKIP] modals already exist")
elif modal_anchor not in content:
    print("[WARN] modal anchor not found")
else:
    content = content.replace(modal_anchor, modal_anchor + modals, 1)
    with open(path, "w") as f:
        f.write(content)
    print("[OK] modals inserted")
