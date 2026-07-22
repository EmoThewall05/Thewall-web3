'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WithdrawEthPage() {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [fromAddress, setFromAddress] = useState(''); // TODO: connected wallet address ivide set cheyyanam
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const router = useRouter();

  const handlePreview = async () => {
    if (!amount || !address || !fromAddress) {
      alert("Amount, Address, ഉം wallet connect ഉം നിർബന്ധമാണ്!");
      return;
    }

    setLoading(true);
    setStatus('Simulating...');

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'simulate',
          chain: 'ETH',
          from: fromAddress,
          to: address,
          amount: amount,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSimResult(data.result);
        setShowPreview(true);
        setStatus('');
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus('Simulation Failed!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSend = async () => {
    // TODO: ivide nilavil ulla wallet signer function upayogichu
    // signedTx undakkanam, ath il apo /api/send action=broadcast call cheyyanam.
    // Signer function ethaan ennu ariyillathond ee part manually connect cheyyanam.
    alert("Signing logic connect cheyyendathund — nilavil ulla wallet signer vachu ee function complete cheyyu");
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-2xl border border-blue-500/30">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-400">Withdraw ETH</h1>

        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">To Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter ETH Address"
            className="w-full p-3 bg-black border border-gray-700 rounded-lg focus:border-blue-500 outline-none"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Amount (ETH)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full p-3 bg-black border border-gray-700 rounded-lg focus:border-blue-500 outline-none"
          />
        </div>

        <button
          onClick={handlePreview}
          disabled={loading}
          className={`w-full p-4 rounded-xl font-bold transition-all ${loading ? 'bg-gray-700' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
        >
          {loading ? 'Simulating...' : 'Preview Transaction'}
        </button>

        {status && (
          <p className="mt-4 text-xs text-center text-gray-400 break-all bg-black p-2 rounded">
            {status}
          </p>
        )}

        <button
          onClick={() => router.back()}
          className="w-full mt-4 text-sm text-gray-500 hover:text-white"
        >
          Back to Wallet
        </button>
      </div>

      {/* PREVIEW MODAL */}
      {showPreview && simResult && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
          <div className="w-full max-w-md bg-gray-900 p-6 rounded-2xl border border-blue-500/30">
            <h2 className="text-xl font-bold mb-4 text-blue-400">Transaction Preview</h2>

            {simResult.error ? (
              <p className="text-red-400 text-sm mb-4">⚠️ {simResult.error}</p>
            ) : (
              <div className="mb-4 space-y-2">
                {(simResult.changes || []).length === 0 && (
                  <p className="text-gray-400 text-sm">No asset changes detected.</p>
                )}
                {(simResult.changes || []).map((c: any, i: number) => (
                  <div key={i} className="bg-black p-3 rounded-lg text-sm">
                    <div className="text-gray-400">{c.changeType} — {c.assetType}</div>
                    <div className="text-white font-bold">{c.amount} {c.symbol || ''}</div>
                  </div>
                ))}
                {simResult.gasUsed && (
                  <div className="text-xs text-gray-500 mt-2">Estimated Gas: {simResult.gasUsed}</div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 p-3 rounded-xl bg-gray-700 hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSend}
                className="flex-1 p-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold"
              >
                Confirm Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
