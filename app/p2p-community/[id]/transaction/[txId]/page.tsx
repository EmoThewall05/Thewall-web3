'use client';

import { useState, useEffect, useCallback } from 'react';
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

  if (loading) return <div className="p-6 text-white">Loading transaction...</div>;
  if (!tx) return <div className="p-6 text-white">Transaction not found.</div>;

  const statusColor: Record<string, string> = {
    pending: 'text-yellow-400',
    verifying: 'text-blue-400',
    awaiting_owner: 'text-purple-400',
    approved: 'text-emerald-400',
    rejected: 'text-red-400',
  };

  return (
    <div className="p-4 max-w-lg mx-auto text-white">
      <h2 className="text-xl font-bold mb-1">🦋 Transaction</h2>
      <p className="text-xs text-zinc-500 mb-4">{tx.id}</p>

      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-700 mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-zinc-400">Status</span>
          <span className={`font-bold ${statusColor[tx.status] || ''}`}>
            {tx.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-zinc-400">Amount</span>
          <span>{tx.amount} EMC</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Your role</span>
          <span>{isBuyer ? 'Buyer' : isSeller ? 'Seller' : 'Observer'}</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-900/40 border border-red-700 text-red-300 text-sm">
          {error}
        </div>
      )}

      {(isBuyer || isSeller) && tx.status === 'pending' && !myProof && (
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-700 space-y-3">
          <h3 className="font-semibold text-sm">Submit your proof</h3>
          <textarea
            placeholder="Describe your payment (UTR / txn ref / notes)"
            value={proofText}
            onChange={(e) => setProofText(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-sm"
            rows={3}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProofFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-zinc-400"
          />
          <button
            onClick={handleSubmitProof}
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 font-semibold disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Proof'}
          </button>
        </div>
      )}

      {(isBuyer || isSeller) && myProof && tx.status === 'pending' && (
        <p className="text-sm text-zinc-400">
          ✅ Your proof submitted. Waiting for the other party to submit theirs.
        </p>
      )}

      {tx.status === 'verifying' && (
        <p className="text-sm text-blue-300">🔍 Verification in progress — please wait.</p>
      )}

      {tx.status === 'awaiting_owner' && (
        <p className="text-sm text-purple-300">⏳ Waiting for community owner's final decision.</p>
      )}

      {tx.status === 'approved' && (
        <p className="text-sm text-emerald-300">✅ Transaction approved and completed.</p>
      )}

      {tx.status === 'rejected' && (
        <p className="text-sm text-red-300">❌ Transaction was rejected.</p>
      )}
    </div>
  );
}
