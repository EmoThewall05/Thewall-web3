import { NextRequest, NextResponse } from 'next/server';

const KEY = process.env.THEWALL_EARTH_MAIN_KEY;
const BASE_URL = `https://eth-mainnet.g.alchemy.com/nft/v3/${KEY}/getNFTsForOwner`;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');
  if (!address) return NextResponse.json({ error: 'Address required' }, { status: 400 });

  try {
    const url = `${BASE_URL}?owner=${address}&withMetadata=true&pageSize=20`;
    const res = await fetch(url);
    const data = await res.json();

    const nfts = (data.ownedNfts || []).map((n: any) => ({
      contract: n.contract?.address,
      tokenId: n.tokenId,
      name: n.name || n.contract?.name || 'Unnamed NFT',
      image: n.image?.cachedUrl || n.image?.originalUrl || n.image?.thumbnailUrl || null,
      collection: n.contract?.name || 'Unknown Collection',
    })).filter((n: any) => n.image);

    return NextResponse.json({ nfts });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
