import os
BASE = os.path.expanduser("~/Thewall-web3")
PATH = os.path.join(BASE, "app", "api", "bridge")
FILE = os.path.join(PATH, "route.ts")
os.makedirs(PATH, exist_ok=True)
content = '''import { NextRequest, NextResponse } from 'next/server';
const LIFI = 'https://li.quest/v1';
const CHAINS: Record<string, number> = { ETH: 1, ARB: 42161, BNB: 56, POL: 137 };
const NATIVE = '0x0000000000000000000000000000000000000000';
const TOKENS: Record<string, Record<string, string>> = {
  USDC: { '1': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', '42161': '0xaf88d065e77c8cc2239327c5edb3a432268e5831', '137': '0x2791bca1f2de4661ed88a30c99a7a9449aa84174' },
  USDT: { '1': '0xdac17f958d2ee523a2206206994597c13d831ec7', '42161': '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9' },
};
function getAddr(sym: string, chainId: number): string {
  return TOKENS[sym]?.[String(chainId)] || NATIVE;
}
export async function POST(req: NextRequest) {
  try {
    const { action, fromChain, toChain, fromToken, toToken, amount } = await req.json();
    if (!fromChain||!toChain||!fromToken||!toToken||!amount) return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    const fromId = CHAINS[fromChain], toId = CHAINS[toChain];
    if (!fromId||!toId) return NextResponse.json({ error: 'Unsupported chain' }, { status: 400 });
    const dec = ['USDC','USDT'].includes(fromToken) ? 6 : 18;
    const amtWei = BigInt(Math.floor(parseFloat(amount) * 10 ** dec)).toString();
    const params = new URLSearchParams({ fromChain: String(fromId), toChain: String(toId), fromToken: getAddr(fromToken, fromId), toToken: getAddr(toToken, toId), fromAmount: amtWei });
    const res = await fetch(`${LIFI}/quote?${params}`);
    const data = await res.json();
    if (data.message||!data.estimate) return NextResponse.json({ error: data.message||'No route' }, { status: 400 });
    const toDec = ['USDC','USDT'].includes(toToken) ? 6 : 18;
    const toAmount = (Number(data.estimate.toAmount) / 10 ** toDec).toFixed(6);
    const fees = data.estimate.feeCosts?.reduce((s: number, f: any) => s + parseFloat(f.amountUSD||0), 0) || 0;
    return NextResponse.json({ success: true, quote: { fromChain, toChain, fromToken, toToken, amount, toAmount, estimatedTime: `~${Math.ceil((data.estimate.executionDuration||60)/60)} min`, feesUsd: fees.toFixed(2), bridge: data.tool||'LI.FI', route: `${fromToken}(${fromChain}) → ${data.tool||'Bridge'} → ${toToken}(${toChain})` } });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
'''
with open(FILE, 'w') as f: f.write(content)
print("✅ bridge/route.ts created!")
