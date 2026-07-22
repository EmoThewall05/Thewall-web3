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
    <div style={{minHeight:'100vh',background:'#000',color:'#fff',padding:'24px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:'100%',maxWidth:'420px',background:'#111827',padding:'32px',borderRadius:'16px',border:'1px solid rgba(59,130,246,0.3)'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:'bold',marginBottom:'24px',textAlign:'center',color:'#60a5fa'}}>Withdraw Soul (SOL)</h1>

        <div style={{marginBottom:'16px'}}>
          <label style={{display:'block',fontSize:'0.85rem',color:'#9ca3af',marginBottom:'8px'}}>Binance / Exchange Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter Solana Address"
            style={{width:'100%',padding:'12px',background:'#000',border:'1px solid #374151',borderRadius:'8px',color:'#fff',outline:'none'}}
          />
        </div>

        <div style={{marginBottom:'24px'}}>
          <label style={{display:'block',fontSize:'0.85rem',color:'#9ca3af',marginBottom:'8px'}}>Amount (SOL)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            style={{width:'100%',padding:'12px',background:'#000',border:'1px solid #374151',borderRadius:'8px',color:'#fff',outline:'none'}}
          />
        </div>

        <button
          onClick={handleWithdraw}
          disabled={loading}
          style={{width:'100%',padding:'16px',borderRadius:'12px',fontWeight:'bold',border:'none',cursor:'pointer',background:loading?'#374151':'#2563eb',color:'#fff'}}
        >
          {loading ? 'Sending...' : 'Confirm Withdrawal'}
        </button>

        {status && (
          <p style={{marginTop:'16px',fontSize:'0.75rem',textAlign:'center',color:'#9ca3af',wordBreak:'break-all',background:'#000',padding:'8px',borderRadius:'6px'}}>
            {status}
          </p>
        )}

        <button
          onClick={() => router.back()}
          style={{width:'100%',marginTop:'16px',fontSize:'0.85rem',color:'#6b7280',background:'none',border:'none',cursor:'pointer'}}
        >
          Back to Wallet
        </button>
      </div>
    </div>
  );
}
