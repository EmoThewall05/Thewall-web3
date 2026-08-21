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
  const [showApproval, setShowApproval] = useState(false);
  const [approvalTxId, setApprovalTxId] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
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

  // Step 1 after preview: create an approval record instead of signing immediately
  const handleRequestApproval = async () => {
    setLoading(true);
    setStatus('Creating approval request...');

    try {
      const res = await fetch('/api/auth/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          walletAddress: fromAddress,
          transactionType: 'withdraw_eth',
          amount: amount,
          token: 'ETH',
          to: address,
          chain: 'ETH',
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setStatus(`Error: ${data.error}`);
        setLoading(false);
        return;
      }

      setApprovalTxId(data.txId);
      setShowPreview(false);
      setShowApproval(true);
      setStatus('');
    } catch (error) {
      setStatus('Approval request failed!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: user explicitly approves on this same device -> then sign + broadcast
  const handleApprove = async () => {
    if (!approvalTxId) return;
    setApproving(true);
    setStatus('Approving...');

    try {
      const approveRes = await fetch('/api/auth/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approved', txId: approvalTxId }),
      });
      const approveData = await approveRes.json();
      if (!approveData.success) {
        setStatus(`Error: ${approveData.error}`);
        setApproving(false);
        return;
      }

      setShowApproval(false);
      await handleConfirmSend(approvalTxId);
    } catch (error) {
      setStatus('Approval failed!');
      console.error(error);
      setApproving(false);
    }
  };

  const handleDenyApproval = async () => {
    if (approvalTxId) {
      try {
        await fetch('/api/auth/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'rejected', txId: approvalTxId }),
        });
      } catch (error) {
        console.error(error);
      }
    }
    setShowApproval(false);
    setApprovalTxId(null);
    setStatus('Transaction cancelled.');
  };

  const handleConfirmSend = async (txId: string) => {
    setLoading(true);
    setApproving(false);
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

      // Mark the approval as consumed now that it has actually been broadcast
      try {
        await fetch('/api/auth/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'broadcasted',
            txId: txId,
            txHash: receipt?.hash || txResponse.hash,
          }),
        });
      } catch (e) {
        console.error('mark broadcasted failed (non-fatal)', e);
      }

      setStatus(`വിജയിച്ചു! TX: ${receipt?.hash || txResponse.hash}`);
      alert("ETH വിത്ത്ഡ്രോവൽ സക്സസ് ആയി മച്ചാനേ!");
    } catch (error: any) {
      setStatus(`Transaction Failed! ${error?.message || ''}`);
      console.error(error);
    } finally {
      setLoading(false);
      setApprovalTxId(null);
    }
  };

  return (
    <div style={{minHeight:'100vh',background:'#000',color:'#fff',padding:'24px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:'100%',maxWidth:'420px',background:'#111827',padding:'32px',borderRadius:'16px',border:'1px solid rgba(168,85,247,0.3)'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:'bold',marginBottom:'24px',textAlign:'center',color:'#c084fc'}}>Withdraw Ethereum (ETH)</h1>

        <div style={{marginBottom:'16px'}}>
          <label style={{display:'block',fontSize:'0.85rem',color:'#9ca3af',marginBottom:'8px'}}>Exchange / Wallet Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            style={{width:'100%',padding:'12px',background:'#000',border:'1px solid #374151',borderRadius:'8px',color:'#fff',outline:'none'}}
          />
        </div>

        <div style={{marginBottom:'24px'}}>
          <label style={{display:'block',fontSize:'0.85rem',color:'#9ca3af',marginBottom:'8px'}}>Amount (ETH)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            style={{width:'100%',padding:'12px',background:'#000',border:'1px solid #374151',borderRadius:'8px',color:'#fff',outline:'none'}}
          />
        </div>

        <button
          onClick={handlePreview}
          disabled={loading}
          style={{width:'100%',padding:'16px',borderRadius:'12px',fontWeight:'bold',border:'none',cursor:'pointer',background:loading?'#374151':'#9333ea',color:'#fff'}}
        >
          {loading ? 'Please wait...' : 'Preview & Confirm'}
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

      {showPreview && preview && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',zIndex:50}}>
          <div style={{width:'100%',maxWidth:'420px',background:'#111827',padding:'24px',borderRadius:'16px',border:'1px solid rgba(168,85,247,0.5)'}}>
            <h2 style={{fontSize:'1.1rem',fontWeight:'bold',marginBottom:'16px',color:'#c084fc'}}>Transaction Preview</h2>
            <div style={{background:'#000',padding:'16px',borderRadius:'8px',marginBottom:'16px',fontSize:'0.85rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
                <span style={{color:'#9ca3af'}}>Sending</span>
                <span style={{color:'#fff'}}>{amount} ETH</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
                <span style={{color:'#9ca3af'}}>To</span>
                <span style={{color:'#fff',fontSize:'0.75rem',wordBreak:'break-all'}}>{address}</span>
              </div>
              {preview.gasEstimate && (
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
                  <span style={{color:'#9ca3af'}}>Est. Gas Fee</span>
                  <span style={{color:'#facc15'}}>{preview.gasEstimate}</span>
                </div>
              )}
              {preview.assetChanges && preview.assetChanges.map((c: any, i: number) => (
                <div key={i} style={{display:'flex',justifyContent:'space-between',borderTop:'1px solid #1f2937',paddingTop:'8px',marginTop:'8px'}}>
                  <span style={{color:'#9ca3af'}}>{c.type}</span>
                  <span style={{color: c.type === 'SEND' ? '#f87171' : '#4ade80'}}>
                    {c.amount}
                  </span>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:'12px'}}>
              <button
                onClick={() => setShowPreview(false)}
                style={{flex:1,padding:'12px',borderRadius:'12px',fontWeight:'bold',border:'none',cursor:'pointer',background:'#374151',color:'#fff'}}
              >
                Cancel
              </button>
              <button
                onClick={handleRequestApproval}
                disabled={loading}
                style={{flex:1,padding:'12px',borderRadius:'12px',fontWeight:'bold',border:'none',cursor:'pointer',background:'#9333ea',color:'#fff'}}
              >
                Confirm Send
              </button>
            </div>
          </div>
        </div>
      )}

      {showApproval && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',zIndex:60}}>
          <div style={{width:'100%',maxWidth:'420px',background:'#111827',padding:'24px',borderRadius:'16px',border:'2px solid #facc15'}}>
            <div style={{fontSize:'2rem',textAlign:'center',marginBottom:'8px'}}>🔐</div>
            <h2 style={{fontSize:'1.1rem',fontWeight:'bold',marginBottom:'16px',color:'#facc15',textAlign:'center'}}>Final Approval Required</h2>
            <div style={{background:'#000',padding:'16px',borderRadius:'8px',marginBottom:'20px',fontSize:'0.85rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
                <span style={{color:'#9ca3af'}}>Amount</span>
                <span style={{color:'#fff',fontWeight:'bold'}}>{amount} ETH</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <span style={{color:'#9ca3af'}}>To</span>
                <span style={{color:'#fff',fontSize:'0.75rem',wordBreak:'break-all'}}>{address}</span>
              </div>
            </div>
            <p style={{fontSize:'0.72rem',color:'#9ca3af',textAlign:'center',marginBottom:'20px'}}>
              Ith ninte transaction aano ennu ondu koodi ureppikkuka.
            </p>
            <div style={{display:'flex',gap:'12px'}}>
              <button
                onClick={handleDenyApproval}
                disabled={approving}
                style={{flex:1,padding:'12px',borderRadius:'12px',fontWeight:'bold',border:'none',cursor:'pointer',background:'#374151',color:'#fff'}}
              >
                Deny
              </button>
              <button
                onClick={handleApprove}
                disabled={approving}
                style={{flex:1,padding:'12px',borderRadius:'12px',fontWeight:'bold',border:'none',cursor:'pointer',background:approving?'#374151':'#22c55e',color:'#fff'}}
              >
                {approving ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
