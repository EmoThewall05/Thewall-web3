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

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">🦋 P2P Community</h1>
        <Link
          href="/p2p-community/create"
          className="text-sm bg-gradient-to-r from-purple-500 to-blue-500 px-3 py-1.5 rounded-lg font-medium"
        >
          + Create
        </Link>
      </div>
      <p className="text-gray-400 text-sm mb-4">Trusted communities-ൽ trade ചെയ്യൂ</p>

      <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Community search ചെയ്യൂ..."
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
        />
        <button
          type="submit"
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm"
        >
          🔍
        </button>
      </form>

      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {!loading && !error && communities.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="mb-1">🦋 ഒരു community-യും കണ്ടില്ല</p>
          <p className="text-sm">ആദ്യത്തെ community നീ create ചെയ്യൂ!</p>
        </div>
      )}

      <div className="space-y-3">
        {communities.map((c) => (
          <Link
            key={c.id}
            href={`/p2p-community/${c.id}`}
            className="block bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-purple-500 transition"
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-white">{c.name}</h3>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  c.status === 'open'
                    ? 'bg-green-900 text-green-400'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {c.status}
              </span>
            </div>
            {c.description && (
              <p className="text-gray-400 text-sm mb-2 line-clamp-2">{c.description}</p>
            )}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Owner: {shortAddress(c.owner_wallet_address)}</span>
              <span>
                {c.member_count}/{c.max_members} members
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
