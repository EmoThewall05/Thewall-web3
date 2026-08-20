import { NextRequest, NextResponse } from 'next/server';
import { getFeeTier } from '@/lib/feeTier';
import { getUsdValue } from '@/lib/priceFeed';

const INCH_KEY = process.env.ONEINCH_API_KEY || '';
const CHAIN_IDS: Record<string, number> = { ETH: 1, ARB: 42161, BNB: 56, BASE: 8453 };
const NATIVE = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const TOKEN_MAP: Record<string, Record<string, string>> = {
  USDC: { '1': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', '42161': '0xaf88d065e77c8cc2239327c5edb3a432268e5831', '8453': '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913' },
  USDT: { '1': '0xdac17f958d2ee523a2206206994597c13d831ec7', '42161': '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9' },
};

function getAddr(sym: string, chainId: number): string {
  if (['ETH', 'ARB', 'BNB', 'BASE'].includes(sym)) return NATIVE;
  return TOKEN_MAP[sym]?.[String(chainId)] || '';
}

export async function POST(req: NextRequest) {
  try {
    const { action, fromToken, toToken, amount, fromAddress } = await req.json();
    if (!fromToken || !toToken || !amount) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    const chainId = CHAIN_IDS[fromToken] || 1;
    const src = getAddr(fromToken, chainId);
    const dst = getAddr(toToken, chainId);
    const stableSymbols = ['USDC', 'USDT'];
    const usdValue = stableSymbols.includes(fromToken) ? parseFloat(amount) : await getUsdValue(fromToken, amount);
    const { isPremium, feePercent } = await getFeeTier(fromAddress, usdValue);

    if (!src || !dst) {
      return NextResponse.json({ success: true, fallback: true, quote: { fromToken, toToken, amount, toAmount: '0', priceImpact: 0.3, route: `${fromToken} → Bridge → ${toToken}`, feePercent, isPremium } });
    }

    const dec = ['USDC', 'USDT'].includes(fromToken) ? 6 : 18;
    const amtWei = BigInt(Math.floor(parseFloat(amount) * 10 ** dec)).toString();

    if (action === 'quote') {
      const res = await fetch(`https://api.1inch.dev/swap/v6.0/${chainId}/quote?src=${src}&dst=${dst}&amount=${amtWei}&fee=${feePercent}&referrer=0x36F0C4Ce3ed7DbfeF2037b6275BFB3096B5e699F`, { headers: { Authorization: `Bearer ${INCH_KEY}` } });
      const data = await res.json();
      if (data.error) return NextResponse.json({ error: data.description || data.error }, { status: 400 });
      const toDec = ['USDC', 'USDT'].includes(toToken) ? 6 : 18;
      const toAmount = (Number(data.dstAmount) / 10 ** toDec).toFixed(6);
      return NextResponse.json({ success: true, quote: { fromToken, toToken, amount, toAmount, priceImpact: 0.2, route: `${fromToken} → 1inch V6 → ${toToken}`, protocols: '1inch', feePercent, isPremium } });
    }

    if (action === 'simulate') {
      if (!fromAddress) return NextResponse.json({ error: 'Wallet not connected' }, { status: 400 });
      const url = `https://api.1inch.dev/swap/v6.0/${chainId}/swap?src=${src}&dst=${dst}&amount=${amtWei}&from=${fromAddress}&slippage=1&disableEstimate=false&fee=${feePercent}&referrer=0x36F0C4Ce3ed7DbfeF2037b6275BFB3096B5e699F`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${INCH_KEY}` } });
      const data = await res.json();
      if (data.error) return NextResponse.json({ success: true, simOk: false, simError: data.description || data.error });
      return NextResponse.json({ success: true, simOk: true, gas: data.tx?.gas, gasPrice: data.tx?.gasPrice, to: data.tx?.to, feePercent, isPremium });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
