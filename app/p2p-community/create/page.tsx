'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppKitAccount } from '@reown/appkit/react';
import { getSupabaseBrowser } from '@/lib/supabase';

export default function CreateP2PCommunityPage() {
  const router = useRouter();
  const { address, isConnected } = useAppKitAccount();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const [phone, setPhone] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', background: '#0d0d14', border: '1px solid rgba(0,229,255,0.25)',
    borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: '0.85rem', outline: 'none',
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleSendOtp = async () => {
    setOtpMessage(null);
    if (!email.trim() || !email.includes('@')) {
      setOtpMessage('Enter a valid email first');
      return;
    }
    setSendingOtp(true);
    try {
      const res = await fetch('/api/p2p-send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not send code');
      setOtpSent(true);
      setOtpMessage('Code sent! Check your email.');
    } catch (err: any) {
      setOtpMessage(err.message || 'Failed to send code');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpMessage(null);
    if (!otpCode.trim()) {
      setOtpMessage('Enter the code');
      return;
    }
    setVerifyingOtp(true);
    try {
      const supabase = getSupabaseBrowser();
      const { data, error: rpcError } = await (supabase.rpc as any)('verify_p2p_email_otp', {
        p_email: email.trim(),
        p_code: otpCode.trim(),
      });
      if (rpcError) throw rpcError;
      if (data === true) {
        setEmailVerified(true);
        setOtpMessage('Email verified ✓');
      } else {
        setOtpMessage('Incorrect code, try again');
      }
    } catch (err: any) {
      setOtpMessage(err.message || 'Verification failed');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const canSubmit =
    isConnected && !!address &&
    name.trim().length >= 3 &&
    phone.trim().length > 0 &&
    ownerAddress.trim().length > 0 &&
    emailVerified;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!canSubmit) {
      setError('Please fill all required fields and verify your email');
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseBrowser();

      let bannerUrl: string | null = null;
      if (bannerFile) {
        const ext = bannerFile.name.split('.').pop();
        const path = `${address}-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('p2p-community-banners')
          .upload(path, bannerFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('p2p-community-banners').getPublicUrl(path);
        bannerUrl = urlData.publicUrl;
      }

      const { data, error: rpcError } = await (supabase.rpc as any)('create_p2p_community', {
        p_owner_wallet_address: address,
        p_name: name.trim(),
        p_description: description.trim() || null,
        p_is_public: isPublic,
        p_owner_phone: phone.trim(),
        p_owner_email: email.trim(),
        p_owner_address: ownerAddress.trim(),
        p_banner_url: bannerUrl,
      });

      if (rpcError) throw rpcError;

      router.push(`/p2p-community/${data}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create community');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: 16, fontFamily: 'var(--font-mono, monospace)', boxSizing: 'border-box' }}>
      <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 4, color: '#00e5ff', textShadow: '0 0 10px rgba(0,229,255,0.4)' }}>
        🦋 Community Studio
      </h1>
      <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: 20 }}>Set up your P2P community</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 }}>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#d1d5db', marginBottom: 4 }}>Banner Image (optional)</label>
          {bannerPreview && (
            <img src={bannerPreview} alt="Banner preview" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
          )}
          <input type="file" accept="image/*" onChange={handleBannerChange} style={{ ...inputStyle, padding: '8px' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#d1d5db', marginBottom: 4 }}>Community Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dubai Traders Circle"
            style={inputStyle}
            maxLength={50}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#d1d5db', marginBottom: 4 }}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your community..."
            style={{ ...inputStyle, height: 96, resize: 'vertical', fontFamily: 'inherit' }}
            maxLength={500}
          />
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#0d0d14', border: '1px solid rgba(0,229,255,0.25)', borderRadius: 8, padding: '10px 12px',
        }}>
          <span style={{ fontSize: '0.8rem', color: '#d1d5db' }}>Public (show in search)</span>
          <button
            type="button"
            onClick={() => setIsPublic(!isPublic)}
            style={{
              width: 44, height: 24, borderRadius: 999, border: 'none', position: 'relative', cursor: 'pointer',
              background: isPublic ? '#00e5ff' : '#4b5563', transition: 'background 0.2s',
            }}
          >
            <div style={{
              width: 18, height: 18, background: '#fff', borderRadius: '50%', position: 'absolute', top: 3,
              left: isPublic ? 23 : 3, transition: 'left 0.2s',
            }} />
          </button>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16 }}>
          <p style={{ fontSize: '0.75rem', color: '#a855f7', marginBottom: 12, fontWeight: 700 }}>
            🦋 Owner Details (required)
          </p>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#d1d5db', marginBottom: 4 }}>Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+971 5xx xxx xxx"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#d1d5db', marginBottom: 4 }}>Address</label>
            <input
              type="text"
              value={ownerAddress}
              onChange={(e) => setOwnerAddress(e.target.value)}
              placeholder="Your address"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#d1d5db', marginBottom: 4 }}>Email</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailVerified(false); setOtpSent(false); }}
                placeholder="you@example.com"
                disabled={emailVerified}
                style={{ ...inputStyle, flex: 1, opacity: emailVerified ? 0.6 : 1 }}
              />
              {!emailVerified && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                  style={{
                    padding: '0 14px', borderRadius: 8, border: '1px solid rgba(0,229,255,0.3)',
                    background: 'transparent', color: '#00e5ff', fontSize: '0.75rem', cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {sendingOtp ? '...' : otpSent ? 'Resend' : 'Send Code'}
                </button>
              )}
            </div>
          </div>

          {otpSent && !emailVerified && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="6-digit code"
                maxLength={6}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={verifyingOtp}
                style={{
                  padding: '0 14px', borderRadius: 8, border: 'none',
                  background: '#a855f7', color: '#fff', fontSize: '0.75rem', cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {verifyingOtp ? '...' : 'Verify'}
              </button>
            </div>
          )}

          {emailVerified && (
            <p style={{ color: '#4ade80', fontSize: '0.75rem', margin: '4px 0' }}>✓ Email verified</p>
          )}
          {otpMessage && !emailVerified && (
            <p style={{ color: '#facc15', fontSize: '0.72rem', margin: '4px 0' }}>{otpMessage}</p>
          )}
        </div>

        <div style={{
          background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 8,
          padding: '10px 12px', fontSize: '0.68rem', color: '#9ca3af',
        }}>
          🦋 Communities have 10-25 members. Owners will need KYC verification later.
        </div>

        {error && <p style={{ color: '#f87171', fontSize: '0.8rem', margin: 0 }}>{error}</p>}

        <button
          type="submit"
          disabled={loading || !canSubmit}
          style={{
            width: '100%', color: '#000', fontWeight: 700, padding: '13px 0', borderRadius: 8, border: 'none',
            fontSize: '0.9rem', cursor: (loading || !canSubmit) ? 'not-allowed' : 'pointer', opacity: (loading || !canSubmit) ? 0.5 : 1,
            background: 'linear-gradient(90deg, #00e5ff, #a855f7)', boxShadow: '0 0 15px rgba(0,229,255,0.3)',
          }}
        >
          {loading ? 'Creating...' : 'Create Community'}
        </button>
      </form>
    </div>
  );
}
