'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WithdrawPage() {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleWithdraw = async () => {
    if (!amount || !address) {
      alert("Amount-ഉം Address-ഉം നിർബന്ധമാണ്!");
      return;
    }

    setLoading(true);
    setStatus('Processing...');

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'broadcast',
          chain: 'SOL',
          to: address,
          amount: amount
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus(`വിജയിച്ചു! TX: ${data.txHash}`);
        alert("വിത്ത്ഡ്രോവൽ സക്സസ് ആയി മച്ചാനേ!");
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus('Transaction Failed!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-2xl border border-blue-500/30">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-400">Withdraw Soul (SOL)</h1>
        
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Binance / Exchange Address</label>
          <input 
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter Solana Address"
            className="w-full p-3 bg-black border border-gray-700 rounded-lg focus:border-blue-500 outline-none"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Amount (SOL)</label>
          <input 
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full p-3 bg-black border border-gray-700 rounded-lg focus:border-blue-500 outline-none"
          />
        </div>

        <button 
          onClick={handleWithdraw}
          disabled={loading}
          className={`w-full p-4 rounded-xl font-bold transition-all ${loading ? 'bg-gray-700' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
        >
          {loading ? 'Sending...' : 'Confirm Withdrawal'}
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
    </div>
  );
}
