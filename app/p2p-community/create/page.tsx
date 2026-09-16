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
      const { data, error: rpcError } = await supabase.rpc('create_p2p_community', {
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

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-2xl font-bold mb-1">🦋 Community Studio</h1>
      <p className="text-gray-400 text-sm mb-6">നിന്റെ P2P community ഉണ്ടാക്കൂ</p>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Community Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ഉദാ: Dubai Traders Circle"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white"
            maxLength={50}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="നിന്റെ community-യെക്കുറിച്ച് explain ചെയ്യൂ..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white h-24"
            maxLength={500}
          />
        </div>

        <div className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-lg px-3 py-2">
          <span className="text-sm text-gray-300">Public (search-ൽ കാണിക്കണോ)</span>
          <button
            type="button"
            onClick={() => setIsPublic(!isPublic)}
            className={`w-12 h-6 rounded-full transition ${isPublic ? 'bg-blue-500' : 'bg-gray-600'}`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition transform ${
                isPublic ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-500">
          🦋 Community 10-25 members size-ൽ ആയിരിക്കും. Owner ആയി തുടരാൻ KYC verification പിന്നീട് വേണ്ടി വരും.
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Community Create ചെയ്യൂ'}
        </button>
      </form>
    </div>
  );
}
