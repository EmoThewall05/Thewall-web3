path = 'app/api/solana/route.ts'
with open(path) as f:
    content = f.read()

old_get = """export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ status: 'error', solBalance: 0, message: 'No Solana address provided' }, { status: 400 })
  }

  for (const url of RPC_URLS) {
    try {
      const data = await tryRPC(url, address);
      const lamports = data?.result?.value ?? 0;
      const solBalance = lamports / 1e9;
      return NextResponse.json({
        status: 'success',
        address,
        solBalance,
        lamports,
        rpc: url.includes('alchemy') ? 'alchemy' : url.includes('helius') ? 'helius' : 'public'
      });
    } catch (e) {
      continue;
    }
  }
  return NextResponse.json({ status: 'error', solBalance: 0, message: 'All RPCs failed' }, { status: 500 });
}"""

new_get = """async function tryHealth(url) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getSlot', params: [] }),
    signal: AbortSignal.timeout(5000)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address')

  if (!address) {
    for (const url of RPC_URLS) {
      try {
        await tryHealth(url);
        return NextResponse.json({ status: 'success', mode: 'health' });
      } catch (e) {
        continue;
      }
    }
    return NextResponse.json({ status: 'error', message: 'All RPCs failed' }, { status: 500 });
  }

  for (const url of RPC_URLS) {
    try {
      const data = await tryRPC(url, address);
      const lamports = data?.result?.value ?? 0;
      const solBalance = lamports / 1e9;
      return NextResponse.json({
        status: 'success',
        address,
        solBalance,
        lamports,
        rpc: url.includes('alchemy') ? 'alchemy' : url.includes('helius') ? 'helius' : 'public'
      });
    } catch (e) {
      continue;
    }
  }
  return NextResponse.json({ status: 'error', solBalance: 0, message: 'All RPCs failed' }, { status: 500 });
}"""

if old_get not in content:
    print('[WARN] target GET block not found')
else:
    content = content.replace(old_get, new_get)
    with open(path, 'w') as f:
        f.write(content)
    print('[OK] fixed /api/solana health check')
