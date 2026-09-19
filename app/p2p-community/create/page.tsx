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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isConnected || !address) {
      setError('Wallet connect ചെയ്യൂ ആദ്യം');
      return;
    }

    if (name.trim().length < 3) {
      setError('Community name കുറഞ്ഞത് 3 characters വേണം');
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseBrowser();
      const { data, error: rpcError } = await (supabase.rpc as any)('create_p2p_community', {
        p_owner_wallet_address: address,
        p_name: name.trim(),
        p_description: description.trim() || null,
        p_is_public: isPublic,
      });

      if (rpcError) throw rpcError;

      router.push(`/p2p-community/${data}`);
    } catch (err: any) {
      setError(err.message || 'Community create ചെയ്യാൻ പറ്റിയില്ല');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', background: '#0d0d14', border: '1px solid rgba(0,229,255,0.25)',
    borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: '0.85rem', outline: 'none',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: 16, fontFamily: 'var(--font-mono, monospace)', boxSizing: 'border-box' }}>
      <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 4, color: '#00e5ff', textShadow: '0 0 10px rgba(0,229,255,0.4)' }}>
        🦋 Community Studio
      </h1>
      <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: 20 }}>നിന്റെ P2P community ഉണ്ടാക്കൂ</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#d1d5db', marginBottom: 4 }}>Community Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ഉദാ: Dubai Traders Circle"
            style={inputStyle}
            maxLength={50}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#d1d5db', marginBottom: 4 }}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="നിന്റെ community-യെക്കുറിച്ച് explain ചെയ്യൂ..."
            style={{ ...inputStyle, height: 96, resize: 'vertical', fontFamily: 'inherit' }}
            maxLength={500}
          />
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#0d0d14', border: '1px solid rgba(0,229,255,0.25)', borderRadius: 8, padding: '10px 12px',
        }}>
          <span style={{ fontSize: '0.8rem', color: '#d1d5db' }}>Public (search-ൽ കാണിക്കണോ)</span>
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

        <div style={{
          background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 8,
          padding: '10px 12px', fontSize: '0.68rem', color: '#9ca3af',
        }}>
          🦋 Community 10-25 members size-ൽ ആയിരിക്കും. Owner ആയി തുടരാൻ KYC verification പിന്നീട് വേണ്ടി വരും.
        </div>

        {error && <p style={{ color: '#f87171', fontSize: '0.8rem', margin: 0 }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', color: '#000', fontWeight: 700, padding: '13px 0', borderRadius: 8, border: 'none',
            fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1,
            background: 'linear-gradient(90deg, #00e5ff, #a855f7)', boxShadow: '0 0 15px rgba(0,229,255,0.3)',
          }}
        >
          {loading ? 'Creating...' : 'Community Create ചെയ്യൂ'}
        </button>
      </form>
    </div>
  );
}
