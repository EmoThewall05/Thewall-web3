import sys
FILE = "app/api/swap/route.ts"
with open(FILE) as f:
    c = f.read()
old_destructure = "const { action, fromToken, toToken, amount } = await req.json();"
new_destructure = "const { action, fromToken, toToken, amount, fromAddress } = await req.json();"
if old_destructure not in c:
    print("SKIP1: destructure not found"); sys.exit(1)
c = c.replace(old_destructure, new_destructure, 1)
old_tail = """    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });"""
if old_tail not in c:
    print("SKIP2: tail not found"); sys.exit(1)
new_tail = """    if (action === 'simulate') {
      if (!fromAddress) return NextResponse.json({ error: 'Wallet not connected' }, { status: 400 });
      const url = `https://api.1inch.dev/swap/v6.0/${chainId}/swap?src=${src}&dst=${dst}&amount=${amtWei}&from=${fromAddress}&slippage=1&disableEstimate=false`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${INCH_KEY}` } });
      const data = await res.json();
      if (data.error) return NextResponse.json({ success: true, simOk: false, simError: data.description || data.error });
      return NextResponse.json({ success: true, simOk: true, gas: data.tx?.gas, gasPrice: data.tx?.gasPrice, to: data.tx?.to });
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });"""
c = c.replace(old_tail, new_tail, 1)
with open(FILE, 'w') as f:
    f.write(c)
print("DONE1: route.ts updated")
