'use client';

import { useState, useEffect, use as usePromise } from 'react';
import Link from 'next/link';
import { useAppKitAccount } from '@reown/appkit/react';
import { getSupabaseBrowser } from '@/lib/supabase';

type JoinRequest = {
  id: string;
  wallet_address: string;
  status: string;
  created_at: string;
};

type Transaction = {
  id: string;
  buyer_wallet_address: string;
  seller_wallet_address: string;
  amount: number;
  status: string;
  buyer_proof: string | null;
  seller_proof: string | null;
  buyer_proof_image_url: string | null;
  seller_proof_image_url: string | null;
  buyer_verification_score: number | null;
  buyer_verification_recommendation: string | null;
  seller_verification_score: number | null;
  seller_verification_recommendation: string | null;
};

export default function ManageCommunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = usePromise(params);
  const { address, isConnected } = useAppKitAccount();
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingOn, setActingOn] = useState<string | null>(null);

  const loadRequests = async () => {
    if (!address) return;
    try {
      const supabase = getSupabaseBrowser();
      const { data, error: rpcError } = await (supabase.rpc as any)('owner_get_join_requests', {
        p_community_id: id,
        p_owner_wallet_address: address,
      });
      if (rpcError) throw rpcError;
      setRequests(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load join requests');
    }
  };

  const loadTransactions = async () => {
    try {
      const supabase = getSupabaseBrowser();
      const { data, error: txError } = await supabase
        .from('p2p_transactions')
        .select('*')
        .eq('community_id', id)
        .in('status', ['awaiting_owner', 'verifying'])
        .order('created_at', { ascending: false });
      if (txError) throw txError;
      setTransactions((data as Transaction[]) || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    }
  };

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    await Promise.all([loadRequests(), loadTransactions()]);
    setLoading(false);
  };

  useEffect(() => {
    if (isConnected && address) {
      loadAll();
      const interval = setInterval(loadTransactions, 6000);
      return () => clearInterval(interval);
    }
  }, [id, isConnected, address]);

  const respond = async (requestId: string, approve: boolean) => {
    if (!address) return;
    setActingOn(requestId);
    setError(null);
    try {
      const supabase = getSupabaseBrowser();
      const { error: rpcError } = await (supabase.rpc as any)('owner_respond_join_request', {
        p_request_id: requestId,
        p_owner_wallet_address: address,
        p_approve: approve,
      });
      if (rpcError) throw rpcError;
      await loadRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to update request');
    } finally {
      setActingOn(null);
    }
  };

  const decideTransaction = async (txId: string, approve: boolean) => {
    if (!address) return;
    setActingOn(txId);
    setError(null);
    try {
      const supabase = getSupabaseBrowser();
      const { error: rpcError } = await (supabase.rpc as any)('owner_decide_p2p_transaction', {
        p_transaction_id: txId,
        p_owner_wallet_address: address,
        p_approve: approve,
      });
      if (rpcError) throw rpcError;
      await loadTransactions();
    } catch (err: any) {
      setError(err.message || 'Failed to decide transaction');
    } finally {
      setActingOn(null);
    }
  };

  const shortAddress = (addr: string) =>
    addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh', background: '#000', color: '#fff', padding: 16,
    fontFamily: 'var(--font-mono, monospace)', boxSizing: 'border-box',
  };

  if (!isConnected) {
    return (
      <div style={pageStyle}>
        <p style={{ color: '#9ca3af' }}>Connect your wallet to manage this community</p>
      </div>
    );
  }

  const pending = requests.filter((r) => r.status === 'pending');
  const resolved = requests.filter((r) => r.status !== 'pending');

  const recColor = (rec: string | null) => {
    if (rec === 'Approve') return '#22c55e';
    if (rec === 'Reject Recommended') return '#f87171';
    return '#facc15';
  };

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#00e5ff', textShadow: '0 0 10px rgba(0,229,255,0.4)', margin: 0 }}>
          🦋 Manage Community
        </h1>
        <Link href={`/p2p-community/${id}`} style={{ color: '#9ca3af', fontSize: '0.75rem', textDecoration: 'none' }}>
          ← Back
        </Link>
      </div>

      {error && <p style={{ color: '#f87171', fontSize: '0.85rem', marginTop: 12, marginBottom: 12 }}>{error}</p>}

      {/* ---------- Pending Transactions ---------- */}
      <p style={{ color: '#a855f7', fontSize: '0.85rem', fontWeight: 700, marginTop: 20, marginBottom: 10 }}>
        🦋 Pending Transactions
      </p>

      {!loading && transactions.length === 0 && (
        <p style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: 20 }}>No transactions awaiting your decision.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {transactions.map((tx) => (
          <div key={tx.id} style={{
            background: '#0d0d14', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 12, padding: 14,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9ca3af', marginBottom: 8 }}>
              <span>{tx.amount} {tx.currency}</span>
              <span style={{
                fontWeight: 700,
                color: tx.status === 'verifying' ? '#00b3f7' : '#a855f7',
              }}>
                {tx.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div style={{ fontSize: '0.75rem', marginBottom: 8 }}>
              <div style={{ color: '#9ca3af', marginBottom: 2 }}>Buyer: {shortAddress(tx.buyer_wallet_address)}</div>
              {tx.buyer_verification_score !== null && (
                <div style={{ color: recColor(tx.buyer_verification_recommendation) }}>
                  Score: {tx.buyer_verification_score}/100 — {tx.buyer_verification_recommendation}
                </div>
              )}
              {tx.buyer_proof && <div style={{ color: '#d1d5db', marginTop: 2 }}>Proof: {tx.buyer_proof}</div>}
              {tx.buyer_proof_image_url && (
                <a href={tx.buyer_proof_image_url} target="_blank" rel="noreferrer" style={{ color: '#00b3f7', fontSize: '0.7rem' }}>
                  View buyer proof image
                </a>
              )}
            </div>

            <div style={{ fontSize: '0.75rem', marginBottom: 10 }}>
              <div style={{ color: '#9ca3af', marginBottom: 2 }}>Seller: {shortAddress(tx.seller_wallet_address)}</div>
              {tx.seller_verification_score !== null && (
                <div style={{ color: recColor(tx.seller_verification_recommendation) }}>
                  Score: {tx.seller_verification_score}/100 — {tx.seller_verification_recommendation}
                </div>
              )}
              {tx.seller_proof && <div style={{ color: '#d1d5db', marginTop: 2 }}>Proof: {tx.seller_proof}</div>}
              {tx.seller_proof_image_url && (
                <a href={tx.seller_proof_image_url} target="_blank" rel="noreferrer" style={{ color: '#00b3f7', fontSize: '0.7rem' }}>
                  View seller proof image
                </a>
              )}
            </div>

            {tx.status === 'awaiting_owner' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => decideTransaction(tx.id, true)}
                  disabled={actingOn === tx.id}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: '0.8rem',
                    background: '#22c55e', color: '#000', cursor: actingOn === tx.id ? 'not-allowed' : 'pointer',
                    opacity: actingOn === tx.id ? 0.5 : 1,
                  }}
                >
                  {actingOn === tx.id ? '...' : 'Approve'}
                </button>
                <button
                  onClick={() => decideTransaction(tx.id, false)}
                  disabled={actingOn === tx.id}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: 8, border: '1px solid rgba(248,113,113,0.4)', fontWeight: 700, fontSize: '0.8rem',
                    background: 'transparent', color: '#f87171', cursor: actingOn === tx.id ? 'not-allowed' : 'pointer',
                    opacity: actingOn === tx.id ? 0.5 : 1,
                  }}
                >
                  {actingOn === tx.id ? '...' : 'Reject'}
                </button>
              </div>
            )}
            {tx.status === 'verifying' && (
              <p style={{ fontSize: '0.7rem', color: '#6b7280' }}>Waiting for AI verification to complete...</p>
            )}
          </div>
        ))}
      </div>

      {/* ---------- Join Requests ---------- */}
      <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: 10 }}>Join requests</p>

      {loading && <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Loading...</p>}

      {!loading && pending.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#6b7280' }}>
          <p style={{ fontSize: '1.5rem', marginBottom: 4 }}>🦋</p>
          <p>No pending join requests</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {pending.map((r) => (
          <div key={r.id} style={{
            background: '#0d0d14', border: '1px solid rgba(0,229,255,0.2)', borderRadius: 12, padding: 14,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: '0.85rem', color: '#fff' }}>{shortAddress(r.wallet_address)}</span>
              <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>
                {new Date(r.created_at).toLocaleDateString()}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => respond(r.id, true)}
                disabled={actingOn === r.id}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: '0.8rem',
                  background: '#22c55e', color: '#000', cursor: actingOn === r.id ? 'not-allowed' : 'pointer',
                  opacity: actingOn === r.id ? 0.5 : 1,
                }}
              >
                {actingOn === r.id ? '...' : 'Approve'}
              </button>
              <button
                onClick={() => respond(r.id, false)}
                disabled={actingOn === r.id}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 8, border: '1px solid rgba(248,113,113,0.4)', fontWeight: 700, fontSize: '0.8rem',
                  background: 'transparent', color: '#f87171', cursor: actingOn === r.id ? 'not-allowed' : 'pointer',
                  opacity: actingOn === r.id ? 0.5 : 1,
                }}
              >
                {actingOn === r.id ? '...' : 'Reject'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {resolved.length > 0 && (
        <>
          <p style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: 10 }}>Resolved</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {resolved.map((r) => (
              <div key={r.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 14px',
              }}>
                <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{shortAddress(r.wallet_address)}</span>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                  ...(r.status === 'approved'
                    ? { background: 'rgba(34,197,94,0.15)', color: '#22c55e' }
                    : { background: 'rgba(248,113,113,0.15)', color: '#f87171' }),
                }}>
                  {r.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
