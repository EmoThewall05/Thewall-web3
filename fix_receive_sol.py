path = "app/page.tsx"
with open(path) as f:
    content = f.read()

old = """          <div style={{marginBottom:16}}><div style={{...s.label,marginBottom:8}}>SOLANA</div><div style={{padding:'14px',background:'var(--bg2)',border:'1px solid rgba(153,69,255,0.4)',borderRadius:10,fontSize:'0.72rem',color:'#9945ff',wordBreak:'break-all',...s.mono,lineHeight:1.6}}>{SOL_WALLET}</div><button onClick={()=>navigator.clipboard.writeText(SOL_WALLET)} style={{marginTop:10,padding:'10px 20px',background:'var(--bg3)',border:'1px solid rgba(153,69,255,0.4)',borderRadius:8,color:'#9945ff',...s.mono,fontSize:'0.8rem',cursor:'pointer'}}>📋 Copy SOL</button></div>"""

new = """          <div style={{marginBottom:16}}><div style={{...s.label,marginBottom:8}}>SOLANA</div><div style={{padding:'14px',background:'var(--bg2)',border:'1px solid rgba(153,69,255,0.4)',borderRadius:10,fontSize:'0.72rem',color:'#9945ff',wordBreak:'break-all',...s.mono,lineHeight:1.6}}>{user?.solAddress || 'Not connected — try logging in again'}</div>{user?.solAddress&&<button onClick={()=>navigator.clipboard.writeText(user.solAddress!)} style={{marginTop:10,padding:'10px 20px',background:'var(--bg3)',border:'1px solid rgba(153,69,255,0.4)',borderRadius:8,color:'#9945ff',...s.mono,fontSize:'0.8rem',cursor:'pointer'}}>📋 Copy SOL</button>}</div>"""

if "user?.solAddress || 'Not connected" in content:
    print("[SKIP] already updated")
elif old not in content:
    print("[WARN] anchor not found")
else:
    content = content.replace(old, new, 1)
    with open(path, "w") as f:
        f.write(content)
    print("[OK] Receive modal now shows real user Solana address")
