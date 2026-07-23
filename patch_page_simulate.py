import sys
FILE = "app/page.tsx"
with open(FILE) as f:
    c = f.read()

old_iface = "interface SwapState   { fromToken: string; toToken: string; amount: string; estimatedOut: string; loading: boolean; error: string; success: string; priceImpact: number; route: string }"
if old_iface not in c:
    print("SKIP1: SwapState interface not found"); sys.exit(1)
new_iface = "interface SwapState   { fromToken: string; toToken: string; amount: string; estimatedOut: string; loading: boolean; error: string; success: string; priceImpact: number; route: string; simStatus: 'idle'|'simulating'|'ok'|'fail'|'nowallet'; simGas: string; simError: string }"
c = c.replace(old_iface, new_iface, 1)

old_state = "const [swap, setSwap] = useState<SwapState>({ fromToken:'ETH', toToken:'SOL', amount:'', estimatedOut:'', loading:false, error:'', success:'', priceImpact:0, route:'' })"
if old_state not in c:
    print("SKIP2: swap useState not found"); sys.exit(1)
new_state = "const [swap, setSwap] = useState<SwapState>({ fromToken:'ETH', toToken:'SOL', amount:'', estimatedOut:'', loading:false, error:'', success:'', priceImpact:0, route:'', simStatus:'idle', simGas:'', simError:'' })"
c = c.replace(old_state, new_state, 1)

old_handle = """  const handleSwap = async()=>{
    if(!swap.amount)return
    setSwap(p=>({...p,loading:true,error:'',success:''}))
    try {
      const qRes = await fetch('/api/swap', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ action:'quote', fromToken:swap.fromToken, toToken:swap.toToken, amount:swap.amount }) })
      const qData = await qRes.json()
      if(!qData.success) throw new Error(qData.error||'Quote failed')
      const q = qData.quote
      setSwap(p=>({...p, loading:false, estimatedOut:q.toAmount, priceImpact:q.priceImpact, route:q.route, success:`OK ${swap.amount} ${swap.fromToken} to ${q.toAmount} ${swap.toToken}`}))
    } catch(e:any) { setSwap(p=>({...p,loading:false,error:e.message||'Swap failed'})) }
  }"""
if old_handle not in c:
    print("SKIP3: handleSwap not found"); sys.exit(1)
new_handle = """  const handleSwap = async()=>{
    if(!swap.amount)return
    setSwap(p=>({...p,loading:true,error:'',success:'',simStatus:'idle',simError:''}))
    try {
      const qRes = await fetch('/api/swap', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ action:'quote', fromToken:swap.fromToken, toToken:swap.toToken, amount:swap.amount }) })
      const qData = await qRes.json()
      if(!qData.success) throw new Error(qData.error||'Quote failed')
      const q = qData.quote
      setSwap(p=>({...p, loading:false, estimatedOut:q.toAmount, priceImpact:q.priceImpact, route:q.route, success:`OK ${swap.amount} ${swap.fromToken} to ${q.toAmount} ${swap.toToken}`}))
      if(!user?.address){ setSwap(p=>({...p,simStatus:'nowallet'})); return }
      setSwap(p=>({...p,simStatus:'simulating'}))
      try {
        const sRes = await fetch('/api/swap', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ action:'simulate', fromToken:swap.fromToken, toToken:swap.toToken, amount:swap.amount, fromAddress:user.address }) })
        const sData = await sRes.json()
        if(sData.simOk) setSwap(p=>({...p,simStatus:'ok',simGas:sData.gas||'',simError:''}))
        else setSwap(p=>({...p,simStatus:'fail',simError:sData.simError||sData.error||'Simulation failed'}))
      } catch(e:any) { setSwap(p=>({...p,simStatus:'fail',simError:e.message||'Simulation failed'})) }
    } catch(e:any) { setSwap(p=>({...p,loading:false,error:e.message||'Swap failed'})) }
  }"""
c = c.replace(old_handle, new_handle, 1)

old_button = """          <button onClick={handleSwap} disabled={swap.loading||!swap.amount||!swap.estimatedOut} style={{width:'100%',padding:'14px',background:swap.loading||!swap.amount?'var(--bg3)':'linear-gradient(135deg,#627eea,#9945ff)',border:'none',borderRadius:10,color:'#fff',...s.mono,fontSize:'0.9rem',fontWeight:700,cursor:swap.loading||!swap.amount?'not-allowed':'pointer'}}>{swap.loading?'⏳ Swapping...':`🔄 Swap ${swap.fromToken} to ${swap.toToken}`}</button>"""
if old_button not in c:
    print("SKIP4: swap button not found"); sys.exit(1)
new_button = """          <button onClick={handleSwap} disabled={swap.loading||!swap.amount||swap.simStatus==='simulating'||swap.simStatus==='fail'} style={{width:'100%',padding:'14px',background:swap.loading||!swap.amount?'var(--bg3)':swap.simStatus==='fail'?'#ff4466':swap.simStatus==='ok'?'linear-gradient(135deg,#00cc66,#00ff88)':'linear-gradient(135deg,#627eea,#9945ff)',border:'none',borderRadius:10,color:'#fff',...s.mono,fontSize:'0.9rem',fontWeight:700,cursor:swap.loading||!swap.amount||swap.simStatus==='fail'?'not-allowed':'pointer'}}>{swap.loading?'⏳ Getting quote...':swap.simStatus==='simulating'?'🔍 Simulating...':swap.simStatus==='ok'?`✅ Verified — Swap ${swap.fromToken} to ${swap.toToken}`:swap.simStatus==='fail'?'⚠️ Simulation failed':swap.simStatus==='nowallet'?'🔗 Connect wallet to verify':`🔄 Swap ${swap.fromToken} to ${swap.toToken}`}</button>
          {swap.simStatus==='fail'&&swap.simError&&<div style={{padding:'10px',background:'rgba(255,68,102,0.08)',border:'1px solid rgba(255,68,102,0.2)',borderRadius:8,color:'#ff4466',fontSize:'0.75rem',marginTop:8}}>⚠️ {swap.simError}</div>}
          {swap.simStatus==='nowallet'&&<div style={{padding:'10px',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text-muted)',fontSize:'0.72rem',marginTop:8}}>Connect your wallet to verify this swap before sending it.</div>}"""
c = c.replace(old_button, new_button, 1)

with open(FILE, 'w') as f:
    f.write(c)
print("DONE2: page.tsx updated")
