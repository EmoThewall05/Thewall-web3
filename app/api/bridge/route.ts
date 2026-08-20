import { NextRequest, NextResponse } from 'next/server';
import { getFeeTier } from '@/lib/feeTier';
import { getUsdValue } from '@/lib/priceFeed';

const LIFI = 'https://li.quest/v1';
const CHAINS: Record<string, number> = { ETH: 1, ARB: 42161, BNB: 56, POL: 137, BASE: 8453 };
const NATIVE = '0x0000000000000000000000000000000000000000';
const TOKENS: Record<string, Record<string, string>> = {
  USDC: { '1': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', '42161': '0xaf88d065e77c8cc2239327c5edb3a432268e5831', '137': '0x2791bca1f2de4661558eb8f5cd76bd0c3fa8ea8', '8453': '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913' },
  USDT: { '1': '0xdac17f958d2ee523a2206206994597c13d831ec7', '42161': '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', '137': '0xc2132d05d31c914a87c6611c10748aeb04b58e8' },
};

function getAddr(sym: string, chainId: number): string {
  if (['USDC', 'USDT'].includes(sym)) return TOKENS[sym]?.[String(chainId)] || NATIVE;
  return NATIVE;
}

export async function POST(req: NextRequest) {
  try {
    const { action, fromChain, toChain, fromToken, toToken, amount, fromAddress } = await req.json();
    if (!fromChain || !toChain || !fromToken || !toToken || !amount) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    const fromId = CHAINS[fromChain], toId = CHAINS[toChain];
    if (!fromId || !toId) return NextResponse.json({ error: 'Unsupported chain' }, { status: 400 });

    const dec = ['USDC', 'USDT'].includes(fromToken) ? 6 : 18;
    const amtWei = BigInt(Math.floor(parseFloat(amount) * 10 ** dec)).toString();

    const params = new URLSearchParams({ fromChain: String(fromId), toChain: String(toId), fromToken: getAddr(fromToken, fromId), toToken: getAddr(toToken, toId), fromAmount: amtWei });
    const res = await fetch(`${LIFI}/quote?${params}`);
    const data = await res.json();
    if (data.message && !data.estimate) return NextResponse.json({ error: data.message }, { status: 400 });

    const toDec = ['USDC', 'USDT'].includes(toToken) ? 6 : 18;
    const toAmount = (Number(data.estimate.toAmount) / 10 ** toDec).toFixed(6);
    const lifiFees = (data.estimate.feeCosts || []).reduce((s: any, f: any) => s + parseFloat(f.amountUSD || 0), 0);

    const stableSymbols = ['USDC', 'USDT'];
    const usdValue = stableSymbols.includes(fromToken) ? parseFloat(amount) : await getUsdValue(fromToken, amount);
    const { feePercent, isPremium } = await getFeeTier(fromAddress, usdValue);
    const platformFeeAmount = parseFloat(amount) * (feePercent / 100);

    return NextResponse.json({
      success: true,
      quote: {
        fromChain, toChain, fromToken, toToken, amount, toAmount,
        estimatedTime: `${Math.ceil((data.estimate.executionDuration || 60) / 60)} min`,
        feesUsd: lifiFees.toFixed(2),
        route: `${fromChain}(${fromToken}) → LiFi → ${toChain}(${toToken})`,
        platformFee: { amount: platformFeeAmount.toFixed(8), feePercent, isPremium, treasury: '0x36F0C4Ce3ed7DbfeF2037b6275BFB3096B5e699F' },
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
