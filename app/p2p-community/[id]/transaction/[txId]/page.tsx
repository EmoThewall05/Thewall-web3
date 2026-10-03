'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAppKitAccount } from '@reown/appkit/react';
import { getSupabaseBrowser } from '@/lib/supabase';

export default function TransactionPage() {
  const { txId } = useParams<{ txId: string }>();
  const { address } = useAppKitAccount();
  const supabase = getSupabaseBrowser();

  const [tx, setTx] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [proofText, setProofText] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const verifyTriggered = useRef(false);

  const loadTx = useCallback(async () => {
    const { data, error } = await supabase
      .from('p2p_transactions')
      .select('*')
      .eq('id', txId)
      .single();
    if (!error) setTx(data);
    setLoading(false);
  }, [txId, supabase]);

  useEffect(() => {
    loadTx();
    const interval = setInterval(loadTx, 5000);
    return () => clearInterval(interval);
  }, [loadTx]);

  // Auto-trigger worker verification once both proofs are in (status flips to 'verifying')
  useEffect(() => {
    if (tx?.status === 'verifying' && !verifyTriggered.current) {
      verifyTriggered.current = true;
      fetch('/api/p2p-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction_id: tx.id }),
      }).catch(() => {
        // Silent fail — next poll will still show status; could retry later
        verifyTriggered.current = false;
      });
    }
  }, [tx?.status, tx?.id]);

  const isBuyer = tx && address === tx.buyer_wallet_address;
  const isSeller = tx && address === tx.seller_wallet_address;
  const myProof = isBuyer ? tx?.buyer_proof : isSeller ? tx?.seller_proof : null;

  const handleSubmitProof = async () => {
    if (!address || !tx) return;
    if (!proofText) return setError('Add a note describing your payment/transfer');

    setSubmitting(true);
    setError('');

    let imageUrl: string | null = null;
    if (proofFile) {
      const fileName = `${tx.id}-${address}-${Date.now()}.${proofFile.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage
        .from('p2p-transaction-proofs')
        .upload(fileName, proofFile);
      if (uploadError) {
        setError(uploadError.message);
        setSubmitting(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('p2p-transaction-proofs').getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    const { error } = await (supabase.rpc as any)('submit_p2p_transaction_proof', {
      p_transaction_id: tx.id,
      p_wallet_address: address,
      p_proof: proofText,
      p_proof_image_url: imageUrl,
    });
    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }
    loadTx();
  };

  if (loading) return <div style={{ padding: '24px', color: '#e8f4fd' }}>Loading transaction...</div>;
  if (!tx) return <div style={{ padding: '24px', color: '#e8f4fd' }}>Transaction not found.</div>;

  const statusColor: Record<string, string> = {
    pending: '#ffd700',
    verifying: '#00b3f7',
    awaiting_owner: '#a855f7',
    approved: '#00ff88',
    rejected: '#ff4466',
  };

  return (
    <div style={{ padding: '16px', maxWidth: '480px', margin: '0 auto', color: '#e8f4fd', fontFamily: 'var(--font-mono, monospace)' }}>
      <h2 style={{ fontSize: '20px', marginBottom: '4px' }}>🦋 Transaction</h2>
      <p style={{ fontSize: '11px', color: 'rgba(232,244,253,0.4)', marginBottom: '16px' }}>{tx.id}</p>

      <div style={{ padding: '16px', borderRadius: '8px', background: '#070d14', border: '1px solid rgba(0,179,247,0.12)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
          <span style={{ color: 'rgba(232,244,253,0.5)' }}>Status</span>
          <span style={{ fontWeight: 700, color: statusColor[tx.status] || '#e8f4fd' }}>
            {tx.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
          <span style={{ color: 'rgba(232,244,253,0.5)' }}>Amount</span>
          <span>{tx.amount} EMC</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
          <span style={{ color: 'rgba(232,244,253,0.5)' }}>Your role</span>
          <span>{isBuyer ? 'Buyer' : isSeller ? 'Seller' : 'Observer'}</span>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: '16px', padding: '12px', borderRadius: '8px', background: 'rgba(255,68,102,0.1)', border: '1px solid #ff4466', color: '#ff4466', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {(isBuyer || isSeller) && tx.status === 'pending' && !myProof && (
        <div style={{ padding: '16px', borderRadius: '8px', background: '#070d14', border: '1px solid rgba(0,179,247,0.12)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700 }}>Submit your proof</h3>
          <textarea
            placeholder="Describe your payment (UTR / txn ref / notes)"
            value={proofText}
            onChange={(e) => setProofText(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#0c1520', border: '1px solid rgba(0,179,247,0.12)', color: '#e8f4fd', fontFamily: 'inherit', fontSize: '14px' }}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProofFile(e.target.files?.[0] || null)}
            style={{ fontSize: '13px', color: 'rgba(232,244,253,0.5)' }}
          />
          <button
            onClick={handleSubmitProof}
            disabled={submitting}
            style={{ width: '100%', padding: '13px', borderRadius: '8px', background: '#00b3f7', color: '#00131c', fontWeight: 700, border: 'none', fontFamily: 'inherit', fontSize: '14px', cursor: 'pointer', opacity: submitting ? 0.5 : 1 }}
          >
            {submitting ? 'Submitting...' : 'Submit Proof'}
          </button>
        </div>
      )}

      {(isBuyer || isSeller) && myProof && tx.status === 'pending' && (
        <p style={{ fontSize: '14px', color: 'rgba(232,244,253,0.5)' }}>
          ✅ Your proof submitted. Waiting for the other party to submit theirs.
        </p>
      )}

      {tx.status === 'verifying' && (
        <p style={{ fontSize: '14px', color: '#00b3f7' }}>🔍 Verification in progress — please wait.</p>
      )}

      {tx.status === 'awaiting_owner' && (
        <p style={{ fontSize: '14px', color: '#a855f7' }}>⏳ Waiting for community owner's final decision.</p>
      )}

      {tx.status === 'approved' && (
        <p style={{ fontSize: '14px', color: '#00ff88' }}>✅ Transaction approved and completed.</p>
      )}

      {tx.status === 'rejected' && (
        <p style={{ fontSize: '14px', color: '#ff4466' }}>❌ Transaction was rejected.</p>
      )}
    </div>
  );
}
