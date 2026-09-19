'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getSupabaseBrowser } from '@/lib/supabase';

type Community = {
  id: string;
  name: string;
  description: string | null;
  owner_wallet_address: string;
  member_count: number;
  max_members: number;
  status: string;
};

export default function P2PCommunityPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommunities = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseBrowser();
      const { data, error: rpcError } = await (supabase.rpc as any)('search_p2p_communities', {
        p_search: query.trim() || null,
      });
      if (rpcError) throw rpcError;
      setCommunities(data || []);
    } catch (err: any) {
      setError(err.message || 'Communities load ചെയ്യാൻ പറ്റിയില്ല');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunities('');
  }, [fetchCommunities]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCommunities(search);
  };

  const shortAddress = (addr: string) =>
    addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;

  const totalMembers = communities.reduce((sum, c) => sum + c.member_count, 0);
  const openCount = communities.filter((c) => c.status === 'open').length;

  return (
    <div className="min-h-screen bg-black text-white pb-6" style={{ fontFamily: 'var(--font-mono, monospace)' }}>
      {/* Header banner */}
      <div
        className="relative h-28 w-full"
        style={{
          background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a2e 100%)',
          borderBottom: '1px solid rgba(0,229,255,0.3)',
        }}
      >
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(0,229,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(168,85,247,0.15) 0%, transparent 50%)'
        }} />
      </div>

      <div className="px-4 -mt-10 relative">
        <div className="flex items-end justify-between mb-3">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
            style={{
              background: 'radial-gradient(circle, #0a0a1a 0%, #000 100%)',
              border: '2px solid #00e5ff',
              boxShadow: '0 0 20px rgba(0,229,255,0.5)',
            }}
          >
            🦋
          </div>
          <Link
            href="/p2p-community/create"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold"
            style={{
              background: 'linear-gradient(90deg, #00e5ff, #a855f7)',
              color: '#000',
              boxShadow: '0 0 15px rgba(0,229,255,0.4)',
            }}
          >
            🎬 CREATE
          </Link>
        </div>

        <h1 className="text-xl font-bold" style={{ color: '#00e5ff', textShadow: '0 0 10px rgba(0,229,255,0.4)' }}>
          P2P Community
        </h1>
        <p className="text-gray-400 text-xs mt-0.5 mb-4">Trusted communities-ൽ trade ചെയ്യൂ</p>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="rounded-lg p-2.5 text-center" style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.2)' }}>
            <div className="text-lg font-bold" style={{ color: '#00e5ff' }}>{communities.length}</div>
            <div className="text-[10px] text-gray-500">Communities</div>
          </div>
          <div className="rounded-lg p-2.5 text-center" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)' }}>
            <div className="text-lg font-bold" style={{ color: '#a855f7' }}>{totalMembers}</div>
            <div className="text-[10px] text-gray-500">Members</div>
          </div>
          <div className="rounded-lg p-2.5 text-center" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <div className="text-lg font-bold" style={{ color: '#22c55e' }}>{openCount}</div>
            <div className="text-[10px] text-gray-500">Open</div>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-5">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Community search ചെയ്യൂ..."
            className="flex-1 rounded-lg px-3 py-2.5 text-white text-sm outline-none"
            style={{ background: '#0d0d14', border: '1px solid rgba(0,229,255,0.25)' }}
          />
          <button
            type="submit"
            className="rounded-lg px-4 text-sm"
            style={{ background: '#0d0d14', border: '1px solid rgba(0,229,255,0.25)', color: '#00e5ff' }}
          >
            🔍
          </button>
        </form>

        {loading && <p className="text-gray-500 text-sm text-center py-8">Loading...</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {!loading && !error && communities.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <p className="mb-1 text-2xl">🦋</p>
            <p className="mb-1">ഒരു community-യും കണ്ടില്ല</p>
            <p className="text-sm">ആദ്യത്തെ community നീ create ചെയ്യൂ!</p>
          </div>
        )}

        <div className="space-y-3">
          {communities.map((c) => (
            <Link
              key={c.id}
              href={`/p2p-community/${c.id}`}
              className="block rounded-xl p-4 transition"
              style={{
                background: '#0d0d14',
                border: '1px solid rgba(0,229,255,0.15)',
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-white">{c.name}</h3>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                  style={
                    c.status === 'open'
                      ? { background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }
                      : { background: 'rgba(107,114,128,0.15)', color: '#9ca3af', border: '1px solid rgba(107,114,128,0.3)' }
                  }
                >
                  {c.status.toUpperCase()}
                </span>
              </div>
              {c.description && (
                <p className="text-gray-400 text-sm mb-2 line-clamp-2">{c.description}</p>
              )}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Owner: {shortAddress(c.owner_wallet_address)}</span>
                <span style={{ color: '#a855f7' }}>
                  {c.member_count}/{c.max_members} members
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
