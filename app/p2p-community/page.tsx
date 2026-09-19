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
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: 24, fontFamily: 'var(--font-mono, monospace)', boxSizing: 'border-box' }}>
      <div style={{
        position: 'relative', height: 112, width: '100%',
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a2e 100%)',
        borderBottom: '1px solid rgba(0,229,255,0.3)',
      }} />

      <div style={{ padding: '0 16px', marginTop: -40, position: 'relative', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
            background: 'radial-gradient(circle, #0a0a1a 0%, #000 100%)',
            border: '2px solid #00e5ff', boxShadow: '0 0 20px rgba(0,229,255,0.5)',
          }}>
            🦋
          </div>
          <Link href="/p2p-community/create" style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 700,
            background: 'linear-gradient(90deg, #00e5ff, #a855f7)', color: '#000', boxShadow: '0 0 15px rgba(0,229,255,0.4)', textDecoration: 'none',
          }}>
            🎬 CREATE
          </Link>
        </div>

        <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#00e5ff', textShadow: '0 0 10px rgba(0,229,255,0.4)', margin: 0 }}>
          P2P Community
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '0.72rem', marginTop: 4, marginBottom: 16 }}>Trusted communities-ൽ trade ചെയ്യൂ</p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <div style={{ flex: 1, borderRadius: 10, padding: 10, textAlign: 'center', background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.2)' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#00e5ff' }}>{communities.length}</div>
            <div style={{ fontSize: '0.6rem', color: '#6b7280' }}>Communities</div>
          </div>
          <div style={{ flex: 1, borderRadius: 10, padding: 10, textAlign: 'center', background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#a855f7' }}>{totalMembers}</div>
            <div style={{ fontSize: '0.6rem', color: '#6b7280' }}>Members</div>
          </div>
          <div style={{ flex: 1, borderRadius: 10, padding: 10, textAlign: 'center', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#22c55e' }}>{openCount}</div>
            <div style={{ fontSize: '0.6rem', color: '#6b7280' }}>Open</div>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Community search ചെയ്യൂ..."
            style={{ flex: 1, borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: '0.85rem', outline: 'none', background: '#0d0d14', border: '1px solid rgba(0,229,255,0.25)', minWidth: 0 }}
          />
          <button type="submit" style={{ borderRadius: 8, padding: '0 16px', fontSize: '0.85rem', background: '#0d0d14', border: '1px solid rgba(0,229,255,0.25)', color: '#00e5ff' }}>
            🔍
          </button>
        </form>

        {loading && <p style={{ color: '#6b7280', fontSize: '0.85rem', textAlign: 'center', padding: '32px 0' }}>Loading...</p>}
        {error && <p style={{ color: '#f87171', fontSize: '0.85rem' }}>{error}</p>}

        {!loading && !error && communities.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 0', color: '#6b7280' }}>
            <p style={{ marginBottom: 4, fontSize: '1.5rem' }}>🦋</p>
            <p style={{ marginBottom: 4 }}>ഒരു community-യും കണ്ടില്ല</p>
            <p style={{ fontSize: '0.85rem' }}>ആദ്യത്തെ community നീ create ചെയ്യൂ!</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {communities.map((c) => (
            <Link key={c.id} href={`/p2p-community/${c.id}`} style={{
              display: 'block', borderRadius: 12, padding: 16, textDecoration: 'none',
              background: '#0d0d14', border: '1px solid rgba(0,229,255,0.15)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <h3 style={{ fontWeight: 600, color: '#fff', margin: 0, fontSize: '0.95rem' }}>{c.name}</h3>
                <span style={{
                  fontSize: '0.6rem', padding: '2px 8px', borderRadius: 999, fontWeight: 700,
                  ...(c.status === 'open'
                    ? { background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }
                    : { background: 'rgba(107,114,128,0.15)', color: '#9ca3af', border: '1px solid rgba(107,114,128,0.3)' }),
                }}>
                  {c.status.toUpperCase()}
                </span>
              </div>
              {c.description && (
                <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: 8 }}>{c.description}</p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: '#6b7280' }}>
                <span>Owner: {shortAddress(c.owner_wallet_address)}</span>
                <span style={{ color: '#a855f7' }}>{c.member_count}/{c.max_members} members</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
