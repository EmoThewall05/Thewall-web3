path = "app/page.tsx"
with open(path) as f:
    content = f.read()

# 1. Add Follow button to each leader card
old_card = """                  <div style={{display:'flex',gap:12,fontSize:'0.65rem',...s.muted}}>
                    <span>Trust: {ld.trust_score}</span>
                    <span>Win: {ld.win_rate}%</span>
                    <span>Followers: {ld.total_followers}</span>
                  </div>
                </div>
              ))}"""

new_card = """                  <div style={{display:'flex',gap:12,fontSize:'0.65rem',...s.muted,marginBottom:8}}>
                    <span>Trust: {ld.trust_score}</span>
                    <span>Win: {ld.win_rate}%</span>
                    <span>Followers: {ld.total_followers}</span>
                  </div>
                  <button onClick={()=>{setFollowTarget(ld);setFollowAllocation(10);setFollowStatus('')}} style={{width:'100%',padding:'8px',background:'var(--cyan-glow)',border:'1px solid var(--cyan)',borderRadius:8,...s.cyan,...s.mono,fontSize:'0.72rem',cursor:'pointer',fontWeight:700}}>🦋 Follow</button>
                </div>
              ))}"""

if old_card not in content:
    print("[WARN] card anchor not found")
else:
    content = content.replace(old_card, new_card, 1)
    with open(path, "w") as f:
        f.write(content)
    print("[OK] Follow button added to cards")

# 2. Insert follow modal after the browseLeadersOpen modal closes
with open(path) as f:
    content = f.read()

modal_anchor = """              {leadersList.map((ld,i)=>(
                <div key={i} style={{...s.card,padding:12,marginBottom:8}}>"""

# find the end of browseLeadersOpen modal block to insert after — anchor on the closing pattern unique to it
close_anchor = """            </div>
          </div>}"""

# We'll insert the follow modal right after the FIRST occurrence of close_anchor following browseLeadersOpen
idx = content.find("browseLeadersOpen&&<div")
if idx == -1:
    print("[WARN] browseLeadersOpen block not found")
else:
    close_idx = content.find(close_anchor, idx)
    if close_idx == -1:
        print("[WARN] closing anchor not found after browseLeadersOpen")
    elif "followTarget&&<div" in content:
        print("[SKIP] follow modal already exists")
    else:
        insert_pos = close_idx + len(close_anchor)
        follow_modal = """

          {followTarget&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.9)',zIndex:100000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={()=>setFollowTarget(null)}>
            <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:16,padding:20,maxWidth:340,width:'100%'}} onClick={e=>e.stopPropagation()}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                <div style={{fontSize:'0.9rem',...s.mono,color:'var(--text)',fontWeight:700}}>🦋 Follow {followTarget.display_name || (followTarget.wallet_address.slice(0,6)+'...'+followTarget.wallet_address.slice(-4))}</div>
                <button onClick={()=>setFollowTarget(null)} style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:6,color:'var(--text-muted)',width:28,height:28,cursor:'pointer',fontSize:'1rem'}}>x</button>
              </div>
              <div style={{fontSize:'0.7rem',...s.muted,marginBottom:12}}>Choose what % of your trades should mirror this leader's activity.</div>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
                <input type="range" min={1} max={100} value={followAllocation} onChange={e=>setFollowAllocation(Number(e.target.value))} style={{flex:1}}/>
                <div style={{fontSize:'0.85rem',...s.mono,...s.cyan,fontWeight:700,minWidth:44,textAlign:'right'}}>{followAllocation}%</div>
              </div>
              {followStatus&&<div style={{fontSize:'0.72rem',...s.mono,marginBottom:10,color:'var(--text)'}}>{followStatus}</div>}
              <button onClick={followLeader} disabled={followLoading} style={{width:'100%',padding:'12px',background:'var(--cyan)',border:'none',borderRadius:10,color:'#000',fontWeight:700,...s.mono,fontSize:'0.78rem',cursor:'pointer',opacity:followLoading?0.6:1}}>{followLoading?'Following...':'Confirm & Follow'}</button>
            </div>
          </div>}"""
        content = content[:insert_pos] + follow_modal + content[insert_pos:]
        with open(path, "w") as f:
            f.write(content)
        print("[OK] follow modal inserted")
