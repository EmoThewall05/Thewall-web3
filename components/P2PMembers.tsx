'use client';

import { useState, useEffect, useCallback, CSSProperties } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase';

interface Member {
  wallet_address: string;
  created_at: string;
}

const card: CSSProperties = {
  background: 'var(--bg2, #070d14)',
  border: '1px solid var(--border, rgba(0,179,247,0.12))',
  borderRadius: 'var(--radius, 8px)',
  padding: '10px 14px',
};

export default function P2PMembers({
  communityId,
  ownerWalletAddress,
}: {
  communityId: string;
  ownerWalletAddress: string;
}) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const supabase = getSupabaseBrowser();

  const loadMembers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('p2p_community_members')
      .select('wallet_address, created_at')
      .eq('community_id', communityId)
      .order('created_at', { ascending: true });
    if (!error) setMembers((data as Member[]) || []);
    setLoading(false);
  }, [communityId, supabase]);

  useEffect(() => {
    if (expanded && members.length === 0) loadMembers();
  }, [expanded, loadMembers, members.length]);

  const shortAddr = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`;

  return (
    <div style={{ marginTop: '16px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text, #e8f4fd)' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          borderRadius: 'var(--radius, 8px)',
          background: 'var(--bg2, #070d14)',
          border: '1px solid var(--border, rgba(0,179,247,0.12))',
          color: 'var(--cyan, #00b3f7)',
          fontFamily: 'inherit',
          fontSize: '14px',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        <span>👥 Members</span>
        <span>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {loading ? (
            <p style={{ color: 'var(--text-dim, rgba(232,244,253,0.5))', fontSize: '13px' }}>Loading members...</p>
          ) : (
            members.map((m) => (
              <div
                key={m.wallet_address}
                style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontSize: '13px' }}>{shortAddr(m.wallet_address)}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {m.wallet_address === ownerWalletAddress && (
                    <span style={{ fontSize: '11px', color: 'var(--gold, #ffd700)', fontWeight: 700 }}>👑 Owner</span>
                  )}
                  <span style={{ fontSize: '11px', color: 'var(--text-muted, rgba(232,244,253,0.25))' }}>
                    {new Date(m.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
