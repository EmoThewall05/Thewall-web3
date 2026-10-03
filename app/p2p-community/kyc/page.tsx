'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppKitAccount } from '@reown/appkit/react';
import { getSupabaseBrowser } from '@/lib/supabase';

export default function OwnerKycPage() {
  const { address, isConnected } = useAppKitAccount();
  const router = useRouter();
  const supabase = getSupabaseBrowser();

  const [checking, setChecking] = useState(true);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [idType, setIdType] = useState<'passport' | 'driving_license' | 'national_id'>('passport');
  const [idNumber, setIdNumber] = useState('');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const checkExisting = async () => {
      if (!address) {
        setChecking(false);
        return;
      }
      const { data } = await (supabase.rpc as any)('get_owner_kyc_status', {
        p_wallet_address: address,
      });
      if (data && data.length > 0) {
        setExistingStatus(data[0].status);
      }
      setChecking(false);
    };
    checkExisting();
  }, [address, supabase]);

  const uploadFile = async (file: File, prefix: string) => {
    const ext = file.name.split('.').pop();
    const path = `${prefix}-${address}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('p2p-kyc-documents').upload(path, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('p2p-kyc-documents').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!address) return setError('Connect your wallet first');
    if (!fullName.trim() || !idNumber.trim() || !idFile || !selfieFile) {
      return setError('Please fill all fields and upload both documents');
    }

    setSubmitting(true);
    setError('');
    try {
      const idDocUrl = await uploadFile(idFile, 'id');
      const selfieUrl = await uploadFile(selfieFile, 'selfie');

      const { error: rpcError } = await (supabase.rpc as any)('submit_owner_kyc', {
        p_wallet_address: address,
        p_full_name: fullName.trim(),
        p_id_type: idType,
        p_id_number: idNumber.trim(),
        p_id_document_url: idDocUrl,
        p_selfie_url: selfieUrl,
      });
      if (rpcError) throw rpcError;

      setDone(true);
    } catch (err: any) {
      setError(err.message || 'KYC submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const wrap: React.CSSProperties = {
    minHeight: '100vh', background: '#000', color: '#fff', padding: 16,
    fontFamily: 'var(--font-mono, monospace)', boxSizing: 'border-box', maxWidth: 480, margin: '0 auto',
  };
  const input: React.CSSProperties = {
    width: '100%', padding: 12, borderRadius: 8, background: '#0c1520',
    border: '1px solid rgba(0,179,247,0.12)', color: '#fff', fontFamily: 'inherit', fontSize: 14,
  };

  if (!isConnected) {
    return <div style={wrap}><p style={{ color: '#9ca3af' }}>Connect your wallet to continue</p></div>;
  }

  if (checking) {
    return <div style={wrap}><p style={{ color: '#9ca3af' }}>Checking KYC status...</p></div>;
  }

  if (existingStatus === 'verified' || done) {
    return (
      <div style={wrap}>
        <h2 style={{ color: '#00ff88', fontSize: 20, marginBottom: 8 }}>✅ KYC Verified</h2>
        <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 20 }}>
          You're verified and can now create a P2P community.
        </p>
        <button
          onClick={() => router.push('/p2p-community/create')}
          style={{ width: '100%', padding: 13, borderRadius: 8, background: '#00b3f7', color: '#00131c', fontWeight: 700, border: 'none', fontFamily: 'inherit', fontSize: 14 }}
        >
          Create Community
        </button>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <h2 style={{ color: '#00b3f7', fontSize: 20, marginBottom: 4 }}>🦋 Owner KYC Verification</h2>
      <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 20 }}>
        Required once to create or own a P2P community. Your real identity builds trust with traders.
      </p>

      {error && (
        <div style={{ marginBottom: 16, padding: 12, borderRadius: 8, background: 'rgba(255,68,102,0.1)', border: '1px solid #ff4466', color: '#ff4466', fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 4 }}>Full legal name</label>
          <input style={input} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="As shown on your ID" />
        </div>

        <div>
          <label style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 4 }}>ID type</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['passport', 'driving_license', 'national_id'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setIdType(t)}
                style={{
                  flex: 1, padding: '10px 4px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                  background: idType === t ? 'rgba(0,179,247,0.15)' : '#0c1520',
                  border: idType === t ? '1px solid #00b3f7' : '1px solid rgba(0,179,247,0.12)',
                  color: idType === t ? '#00b3f7' : '#9ca3af',
                  cursor: 'pointer',
                }}
              >
                {t === 'passport' ? 'Passport' : t === 'driving_license' ? 'Driving License' : 'National ID'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 4 }}>ID number</label>
          <input style={input} value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder="Document number" />
        </div>

        <div>
          <label style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 4 }}>Upload ID document (photo)</label>
          <input type="file" accept="image/*" onChange={(e) => setIdFile(e.target.files?.[0] || null)} style={{ fontSize: 13, color: '#9ca3af' }} />
        </div>

        <div>
          <label style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 4 }}>Upload selfie</label>
          <input type="file" accept="image/*" onChange={(e) => setSelfieFile(e.target.files?.[0] || null)} style={{ fontSize: 13, color: '#9ca3af' }} />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{ width: '100%', padding: 13, borderRadius: 8, background: '#00b3f7', color: '#00131c', fontWeight: 700, border: 'none', fontFamily: 'inherit', fontSize: 14, opacity: submitting ? 0.5 : 1, marginTop: 8 }}
        >
          {submitting ? 'Submitting...' : 'Submit for Verification'}
        </button>

        <p style={{ fontSize: 11, color: 'rgba(232,244,253,0.3)', textAlign: 'center' }}>
          🦋 Verification is currently simulated for testing — real document checks coming soon.
        </p>
      </div>
    </div>
  );
}
