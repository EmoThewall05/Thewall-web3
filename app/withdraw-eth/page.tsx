'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { initAppKit } from '../context/wallet';
import { useAppKitProvider } from '@reown/appkit/react';

export default function WithdrawEthPage() {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [fromAddress, setFromAddress] = useState('');
  const router = useRouter();
  const { walletProvider } = useAppKitProvider('eip155');

  useEffect(() => {
    (async () => {
      const modal = await initAppKit();
      if (modal) {
        const account = modal.getAccount();
        if (account?.isConnected && account?.address) {
          setFromAddress(account.address);
        }
      }
    })();
  }, []);

  const handlePreview = async () => {
    if (!amount || !address) {
      alert("Amount-ഉം Address-ഉം നിർബന്ധമാണ്!");
      return;
    }
    if (!fromAddress) {
      alert("വാലറ്റ് കണക്ട് ചെയ്യൂ ആദ്യം!");
      return;
    }

    setLoading(true);
    setStatus('Simulating transaction...');

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'simulate',
          chain: 'ETH',
          to: address,
          amount: amount,
          from: fromAddress
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPreview(data.changes);
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
    setLoading(true);
    setShowPreview(false);
    setStatus('Preparing transaction...');

    try {
      const prepRes = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'prepare',
          chain: 'ETH',
          to: address,
          amount: amount,
          from: fromAddress
        }),
      });

      const prepData = await prepRes.json();
      if (!prepData.success) {
        setStatus(`Error: ${prepData.error}`);
        setLoading(false);
        return;
      }

      if (!walletProvider) {
        setStatus('Wallet not connected!');
        setLoading(false);
        return;
      }

      setStatus('വാലറ്റിൽ Confirm ചെയ്യൂ...');

      const { BrowserProvider } = await import('ethers');
      const ethersProvider = new BrowserProvider(walletProvider as any);
      const signer = await ethersProvider.getSigner();

      const txResponse = await signer.sendTransaction({
        to: prepData.tx.to,
        value: prepData.tx.value,
        nonce: parseInt(prepData.tx.nonce, 16),
        gasPrice: prepData.tx.gasPrice,
        gasLimit: prepData.tx.gasLimit,
      });

      setStatus('Broadcasting...');
      const receipt = await txResponse.wait();

      setStatus(`വിജയിച്ചു! TX: ${receipt?.hash || txResponse.hash}`);
      alert("ETH വിത്ത്ഡ്രോവൽ സക്സസ് ആയി മച്ചാനേ!");
    } catch (error: any) {
      setStatus(`Transaction Failed! ${error?.message || ''}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-2xl border border-purple-500/30">
        <h1 className="text-2xl font-bold mb-6 text-center text-purple-400">Withdraw Ethereum (ETH)</h1>

        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Exchange / Wallet Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            className="w-full p-3 bg-black border border-gray-700 rounded-lg focus:border-purple-500 outline-none"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Amount (ETH)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full p-3 bg-black border border-gray-700 rounded-lg focus:border-purple-500 outline-none"
          />
        </div>

        <button
          onClick={handlePreview}
          disabled={loading}
          className={`w-full p-4 rounded-xl font-bold transition-all ${loading ? 'bg-gray-700' : 'bg-purple-600 hover:bg-purple-700 active:scale-95'}`}
        >
          {loading ? 'Please wait...' : 'Preview & Confirm'}
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

      {showPreview && preview && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
          <div className="w-full max-w-md bg-gray-900 p-6 rounded-2xl border border-purple-500/50">
            <h2 className="text-lg font-bold mb-4 text-purple-400">Transaction Preview</h2>
            <div className="bg-black p-4 rounded-lg mb-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Sending</span>
                <span className="text-white">{amount} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">To</span>
                <span className="text-white text-xs break-all">{address}</span>
              </div>
              {preview.gasEstimate && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Est. Gas Fee</span>
                  <span className="text-yellow-400">{preview.gasEstimate}</span>
                </div>
              )}
              {preview.assetChanges && preview.assetChanges.map((c: any, i: number) => (
                <div key={i} className="flex justify-between border-t border-gray-800 pt-2">
                  <span className="text-gray-400">{c.type}</span>
                  <span className={c.type === 'SEND' ? 'text-red-400' : 'text-green-400'}>
                    {c.amount}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 p-3 rounded-xl font-bold bg-gray-700 hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSend}
                className="flex-1 p-3 rounded-xl font-bold bg-purple-600 hover:bg-purple-700"
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
