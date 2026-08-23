path = 'app/page.tsx'
with open(path) as f:
    content = f.read()

changes = []

# 1. Add 'copytrade' to BottomTab type
old1 = "type BottomTab = 'home'|'trade'|'markets'|'settings'"
new1 = "type BottomTab = 'home'|'trade'|'markets'|'copytrade'|'settings'"
if old1 in content:
    content = content.replace(old1, new1)
    changes.append('[OK] BottomTab type updated')
elif new1 in content:
    changes.append('[SKIP] BottomTab type already patched')
else:
    changes.append('[WARN] BottomTab type not found')

# 2. Add Copy tab to bottom nav array
old2 = "{id:'home',icon:'🏠',label:'Home'},{id:'trade',icon:'💱',label:'Trade'},{id:'markets',icon:'📊',label:'Markets'},{id:'settings',icon:'⚙️',label:'Settings'}"
new2 = "{id:'home',icon:'🏠',label:'Home'},{id:'trade',icon:'💱',label:'Trade'},{id:'markets',icon:'📊',label:'Markets'},{id:'copytrade',icon:'👥',label:'Copy'},{id:'settings',icon:'⚙️',label:'Settings'}"
if old2 in content:
    content = content.replace(old2, new2)
    changes.append('[OK] Copy tab added to bottom nav')
elif new2 in content:
    changes.append('[SKIP] Bottom nav already patched')
else:
    changes.append('[WARN] Bottom nav array not found')

# 3. Add copytrade section before the closing </main> area (right after settings section ends)
old3 = """          </div>}
        </div>}
      </main>"""

new3 = """          </div>}
        </div>}

        {bottomTab==='copytrade'&&<div>
          <div style={{textAlign:'center',marginBottom:16}}>
            <div style={{fontSize:'1.4rem',fontWeight:700,color:'var(--text)',...s.mono}}>👥 Copy Trading</div>
            <div style={{fontSize:'0.7rem',...s.muted,marginTop:4}}>Follow top traders or become a Leader</div>
          </div>

          <div style={{display:'flex',gap:8,marginBottom:16}}>
            <button style={{flex:1,padding:'12px',background:'linear-gradient(135deg,#ffd700,#b8860b)',border:'none',borderRadius:10,color:'#1a1200',fontWeight:700,...s.mono,fontSize:'0.78rem',cursor:'pointer'}}>👑 Become a Leader</button>
            <button style={{flex:1,padding:'12px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:10,color:'var(--text)',fontWeight:700,...s.mono,fontSize:'0.78rem',cursor:'pointer'}}>🔍 Browse Leaders</button>
          </div>

          <div style={{border:'1px solid var(--border)',borderRadius:12,background:'var(--bg2)',padding:12,marginBottom:16}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
              <span style={{fontSize:'1.1rem'}}>🦋</span>
              <span style={{fontSize:'0.78rem',fontWeight:700,color:'var(--text)',...s.mono}}>Copy Trading Assistant</span>
            </div>
            <div id="copytrade-chat-log" style={{maxHeight:220,overflowY:'auto',marginBottom:10,display:'flex',flexDirection:'column',gap:8}}>
              {copyTradeChatLog.map((m,i)=>(
                <div key={i} style={{alignSelf:m.role==='user'?'flex-end':'flex-start',maxWidth:'85%',padding:'8px 12px',borderRadius:10,background:m.role==='user'?'var(--cyan-glow)':'var(--bg3)',color:'var(--text)',fontSize:'0.74rem',...s.mono}}>{m.content}</div>
              ))}
              {copyTradeChatLoading&&<div style={{alignSelf:'flex-start',fontSize:'0.72rem',...s.muted}}>🦋 thinking...</div>}
            </div>
            <div style={{display:'flex',gap:6}}>
              <input value={copyTradeInput} onChange={e=>setCopyTradeInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendCopyTradeMessage()} placeholder="Ask about copy trading..." style={{flex:1,padding:'8px 10px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg)',color:'var(--text)',fontSize:'0.74rem',...s.mono}}/>
              <button onClick={sendCopyTradeMessage} disabled={copyTradeChatLoading} style={{padding:'8px 14px',borderRadius:8,border:'none',background:'var(--cyan)',color:'#000',fontWeight:700,cursor:'pointer',fontSize:'0.74rem'}}>→</button>
            </div>
          </div>

          <div style={{textAlign:'center',fontSize:'0.68rem',...s.muted,padding:'20px 0'}}>No leaders yet — be the first! 🦋</div>
        </div>}
      </main>"""

if old3 in content:
    content = content.replace(old3, new3)
    changes.append('[OK] Copy Trading section added')
elif 'copytrade-chat-log' in content:
    changes.append('[SKIP] Copy Trading section already exists')
else:
    changes.append('[WARN] closing </main> block not found - manual check needed')

with open(path, 'w') as f:
    f.write(content)

for c in changes:
    print(c)
