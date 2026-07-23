#!/usr/bin/env python3
import os, sys

PATH = os.path.expanduser("~/Thewall-web3/app/page.tsx")
with open(PATH, 'r') as f:
    c = f.read()

# 1. Add BridgeState interface
old1 = "interface SwapState   { fromToken: string; toToken: string; amount: string; estimatedOut: string; loading: boolean; error: string; success: string; priceImpact: number; route: string }"
new1 = old1 + "\ninterface BridgeState { fromChain: string; toChain: string; fromToken: string; toToken: string; amount: string; estimatedOut: string; loading: boolean; error: string; success: string; estimatedTime: string; feesUsd: string; bridge: string; route: string }"
if old1 not in c: print("SKIP1: already patched")
else: c = c.replace(old1, new1, 1); print("OK1: BridgeState added")

# 2. Add bridge useState
old2 = "  const [swap, setSwap] = useState<SwapState>({ fromToken:'ETH', toToken:'SOL', amount:'', estimatedOut:'', loading:false, error:'', success:'', priceImpact:0, route:'' })"
new2 = old2 + "\n  const [bridge, setBridge] = useState<BridgeState>({ fromChain:'ETH', toChain:'ARB', fromToken:'ETH', toToken:'ETH', amount:'', estimatedOut:'', loading:false, error:'', success:'', estimatedTime:'', feesUsd:'', bridge:'', route:'' })\n  const [tradeTab, setTradeTab] = useState<'swap'|'bridge'>('swap')"
if old2 not in c: print("SKIP2: already patched")
else: c = c.replace(old2, new2, 1); print("OK2: bridge useState added")

# 3. Replace fake handleSwap
old3 = "  const handleSwap = async()=>{\n    if(!swap.amount||!swap.estimatedOut)return\n    setSwap(p=>({...p,loading:true,error:'',success:''}))\n    await new Promise(r=>setTimeout(r,2000))\n    setSwap(p=>({...p,loading:false,success:`\u2705 Swapped ${swap.amount} ${swap.fromToken} \u2192 ${swap.estimatedOut} ${swap.toToken}`,amount:'',estimatedOut:''}))\n  }"
new3 = """  const handleSwap = async()=>{
    if(!swap.amount)return
    setSwap(p=>({...p,loading:true,error:'',success:''}))
    try {
      const qRes = await fetch('/api/swap', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ action:'quote', fromToken:swap.fromToken, toToken:swap.toToken, amount:swap.amount }) })
      const qData = await qRes.json()
      if(!qData.success) throw new Error(qData.error||'Quote failed')
      const q = qData.quote
      setSwap(p=>({...p, loading:false, estimatedOut:q.toAmount, priceImpact:q.priceImpact, route:q.route, success:`OK ${swap.amount} ${swap.fromToken} to ${q.toAmount} ${swap.toToken}`}))
    } catch(e:any) { setSwap(p=>({...p,loading:false,error:e.message||'Swap failed'})) }
  }

  const handleBridgeQuote = async()=>{
    if(!bridge.amount)return
    setBridge(p=>({...p,loading:true,error:'',success:''}))
    try {
      const res = await fetch('/api/bridge', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ action:'quote', fromChain:bridge.fromChain, toChain:bridge.toChain, fromToken:bridge.fromToken, toToken:bridge.toToken, amount:bridge.amount }) })
      const data = await res.json()
      if(!data.success) throw new Error(data.error||'Bridge quote failed')
      const q = data.quote
      setBridge(p=>({...p, loading:false, estimatedOut:q.toAmount, estimatedTime:q.estimatedTime, feesUsd:q.feesUsd, bridge:q.bridge, route:q.route, success:`OK ${q.toAmount} ${bridge.toToken} via ${q.bridge} | ${q.estimatedTime} | $${q.feesUsd}`}))
    } catch(e:any) { setBridge(p=>({...p,loading:false,error:e.message||'Bridge failed'})) }
  }"""
if old3 not in c: print("SKIP3: already patched")
else: c = c.replace(old3, new3, 1); print("OK3: handleSwap + handleBridgeQuote added")

# 4. Replace trade tabs
old4 = "          <div style={{display:'flex',gap:8,marginBottom:16}}>{(['swap','send','receive']as const).map(t=><button key={t} onClick={()=>{if(t!=='swap'){setSendOpen(true);setSendTab(t as 'send'|'receive')}}} style={{flex:1,padding:'10px',border:'1px solid var(--border)',borderRadius:8,background:t==='swap'?'var(--cyan-glow)':'var(--bg2)',color:t==='swap'?'var(--cyan)':'var(--text-muted)',...s.mono,fontSize:'0.75rem',cursor:'pointer'}}>{t==='swap'?'🔄 Swap':t==='send'?'📤 Send':'📥 Receive'}</button>)}</div>"
new4 = """          <div style={{display:'flex',gap:6,marginBottom:16}}>
            {(['swap','bridge'] as const).map(t=><button key={t} onClick={()=>setTradeTab(t)} style={{flex:1,padding:'10px',border:'1px solid',borderColor:tradeTab===t?'var(--cyan)':'var(--border)',borderRadius:8,background:tradeTab===t?'var(--cyan-glow)':'var(--bg2)',color:tradeTab===t?'var(--cyan)':'var(--text-muted)',...s.mono,fontSize:'0.75rem',cursor:'pointer'}}>{t==='swap'?'🔄 Swap':'🌉 Bridge'}</button>)}
            <button onClick={()=>{setSendOpen(true);setSendTab('send')}} style={{flex:1,padding:'10px',border:'1px solid var(--border)',borderRadius:8,background:'var(--bg2)',color:'var(--text-muted)',...s.mono,fontSize:'0.75rem',cursor:'pointer'}}>📤 Send</button>
            <button onClick={()=>{setSendOpen(true);setSendTab('receive')}} style={{flex:1,padding:'10px',border:'1px solid var(--border)',borderRadius:8,background:'var(--bg2)',color:'var(--text-muted)',...s.mono,fontSize:'0.75rem',cursor:'pointer'}}>📥 Rcv</button>
          </div>
          {tradeTab==='bridge'&&<div>
            <div style={s.card}>
              <div style={s.label}>FROM</div>
              <div style={{display:'flex',gap:8,marginBottom:8}}>
                <select value={bridge.fromChain} onChange={e=>setBridge(p=>({...p,fromChain:e.target.value,estimatedOut:'',success:''}))} style={{flex:1,padding:'10px',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',...s.mono,fontSize:'0.82rem'}}>
                  {['ETH','ARB','BNB','POL'].map(ch=><option key={ch}>{ch}</option>)}
                </select>
                <select value={bridge.fromToken} onChange={e=>setBridge(p=>({...p,fromToken:e.target.value,estimatedOut:'',success:''}))} style={{flex:1,padding:'10px',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',...s.mono,fontSize:'0.82rem'}}>
                  {['ETH','USDC','USDT'].map(tk=><option key={tk}>{tk}</option>)}
                </select>
              </div>
              <input type="number" placeholder="0.00" value={bridge.amount} onChange={e=>setBridge(p=>({...p,amount:e.target.value,estimatedOut:'',success:''}))} style={{width:'100%',padding:'10px',background:'var(--bg3)',border:'1px solid var(--border-bright)',borderRadius:8,color:'var(--text)',...s.mono,fontSize:'1rem',boxSizing:'border-box'}}/>
            </div>
            <div style={{textAlign:'center',margin:'8px 0',fontSize:'1.4rem'}}>🌉</div>
            <div style={s.card}>
              <div style={s.label}>TO</div>
              <div style={{display:'flex',gap:8,marginBottom:8}}>
                <select value={bridge.toChain} onChange={e=>setBridge(p=>({...p,toChain:e.target.value,estimatedOut:'',success:''}))} style={{flex:1,padding:'10px',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',...s.mono,fontSize:'0.82rem'}}>
                  {['ETH','ARB','BNB','POL'].filter(ch=>ch!==bridge.fromChain).map(ch=><option key={ch}>{ch}</option>)}
                </select>
                <select value={bridge.toToken} onChange={e=>setBridge(p=>({...p,toToken:e.target.value,estimatedOut:'',success:''}))} style={{flex:1,padding:'10px',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',...s.mono,fontSize:'0.82rem'}}>
                  {['ETH','USDC','USDT'].map(tk=><option key={tk}>{tk}</option>)}
                </select>
              </div>
              <div style={{padding:'10px',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:8,color:bridge.estimatedOut?'#00ff88':'var(--text-muted)',...s.mono,fontSize:'1rem',minHeight:42}}>{bridge.estimatedOut||'0.00'}</div>
            </div>
            {bridge.estimatedOut&&<div style={{...s.card,marginBottom:12,fontSize:'0.7rem',...s.mono}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={s.muted}>Bridge</span><span style={s.cyan}>{bridge.bridge}</span></div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={s.muted}>Time</span><span style={{color:'#ffd700'}}>{bridge.estimatedTime}</span></div>
              <div style={{display:'flex',justifyContent:'space-between'}}><span style={s.muted}>Fees</span><span style={{color:'#00ff88'}}>${bridge.feesUsd}</span></div>
            </div>}
            {bridge.error&&<div style={{padding:'10px',background:'rgba(255,68,102,0.08)',border:'1px solid rgba(255,68,102,0.2)',borderRadius:8,color:'#ff4466',fontSize:'0.75rem',marginBottom:12}}>{bridge.error}</div>}
            {bridge.success&&<div style={{padding:'10px',background:'rgba(0,255,136,0.05)',border:'1px solid rgba(0,255,136,0.2)',borderRadius:8,color:'#00ff88',fontSize:'0.72rem',marginBottom:12,wordBreak:'break-word'}}>{bridge.success}</div>}
            <button onClick={handleBridgeQuote} disabled={bridge.loading||!bridge.amount} style={{width:'100%',padding:'14px',background:bridge.loading||!bridge.amount?'var(--bg3)':'linear-gradient(135deg,#f7931a,#9945ff)',border:'none',borderRadius:10,color:'#fff',...s.mono,fontSize:'0.9rem',fontWeight:700,cursor:bridge.loading||!bridge.amount?'not-allowed':'pointer'}}>{bridge.loading?'Finding Route...':'🌉 Get Bridge Quote'}</button>
            <div style={{textAlign:'center',fontSize:'0.62rem',...s.muted,marginTop:10}}>Powered by LI.FI · TheWall 🦋</div>
          </div>}
          {tradeTab==='swap'&&<div>"""
if old4 not in c: print("SKIP4: already patched")
else: c = c.replace(old4, new4, 1); print("OK4: Bridge tab UI added")

# 5. Close swap div
old5 = "          <div style={{textAlign:'center',fontSize:'0.62rem',...s.muted,marginTop:10}}>UniSwap V3 · Gasless \u26a1 · TheWall Universal \U0001f98b</div>\n        </div>}"
new5 = "          <div style={{textAlign:'center',fontSize:'0.62rem',...s.muted,marginTop:10}}>UniSwap V3 · Gasless \u26a1 · TheWall Universal \U0001f98b</div>\n          </div>}\n        </div>}"
if old5 not in c: print("SKIP5: already patched")
else: c = c.replace(old5, new5, 1); print("OK5: swap div closed")

with open(PATH, 'w') as f:
    f.write(c)
print("\nDONE! page.tsx updated")
