'use client';

import { useState, useEffect, use as usePromise } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import PeguardChatWidget from '@/components/PeguardChatWidget';
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

export default function CommunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = usePromise(params);
  const { address, isConnected } = useAppKitAccount();
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const supabase = getSupabaseBrowser();
        const { data, error: rpcError } = await (supabase.rpc as any)(
          'search_p2p_communities',
          { p_search: null }
        );
        if (rpcError) throw rpcError;
        const found = (data || []).find((c: Community) => c.id === id);
        setCommunity(found || null);
      } catch (err: any) {
        setError(err.message || 'Failed to load community');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleJoin = async () => {
    setError(null);
    setMessage(null);

    if (!isConnected || !address) {
      setError('Connect your wallet first');
      return;
    }

    setJoining(true);
    try {
      const supabase = getSupabaseBrowser();
      const { error: rpcError } = await (supabase.rpc as any)('request_join_p2p_community', {
        p_community_id: id,
        p_wallet_address: address,
      });
      if (rpcError) throw rpcError;
      setMessage('🦋 Join request sent! Waiting for owner approval.');
    } catch (err: any) {
      setError(err.message || 'Failed to send join request');
    } finally {
      setJoining(false);
    }
  };

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh', background: '#000', color: '#fff', padding: 16,
    fontFamily: 'var(--font-mono, monospace)', boxSizing: 'border-box',
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Loading...</p>
      </div>
    );
  }

  if (!community) {
    return (
      <div style={pageStyle}>
        <p style={{ color: '#9ca3af' }}>Community not found 🦋</p>
      </div>
    );
  }

  const shortAddress = (addr: string) =>
    addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;

  return (
    <div style={pageStyle}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 6, color: '#00e5ff', textShadow: '0 0 10px rgba(0,229,255,0.4)' }}>
        🦋 {community.name}
      </h1>
      <span style={{
        display: 'inline-block', fontSize: '0.65rem', padding: '3px 10px', borderRadius: 999, marginBottom: 16, fontWeight: 700,
        ...(community.status === 'open'
          ? { background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }
          : { background: 'rgba(107,114,128,0.15)', color: '#9ca3af', border: '1px solid rgba(107,114,128,0.3)' }),
      }}>
        {community.status.toUpperCase()}
      </span>

      {community.description && (
        <p style={{ color: '#d1d5db', fontSize: '0.85rem', marginBottom: 16 }}>{community.description}</p>
      )}

      <div style={{
        background: '#0d0d14', border: '1px solid rgba(0,229,255,0.2)', borderRadius: 12,
        padding: 16, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#6b7280' }}>Owner</span>
          <span style={{ color: '#fff' }}>{shortAddress(community.owner_wallet_address)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#6b7280' }}>Members</span>
          <span style={{ color: '#a855f7' }}>{community.member_count}/{community.max_members}</span>
        </div>
      </div>

      {message && <p style={{ color: '#4ade80', fontSize: '0.85rem', marginBottom: 12 }}>{message}</p>}
      {error && <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: 12 }}>{error}</p>}

      <button
        onClick={handleJoin}
        disabled={joining || community.status !== 'open' || !!message}
        style={{
          width: '100%', color: '#000', fontWeight: 700, padding: '13px 0', borderRadius: 8, border: 'none',
          fontSize: '0.9rem', cursor: (joining || community.status !== 'open' || !!message) ? 'not-allowed' : 'pointer',
          opacity: (joining || community.status !== 'open' || !!message) ? 0.5 : 1,
          background: 'linear-gradient(90deg, #00e5ff, #a855f7)', boxShadow: '0 0 15px rgba(0,229,255,0.3)',
        }}
      >
        {joining ? 'Sending...' : message ? 'Request Sent' : 'Send Join Request'}
      </button>
      <PeguardChatWidget />
    </div>
  );
}
