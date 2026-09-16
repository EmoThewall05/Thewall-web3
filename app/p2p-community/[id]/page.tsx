'use client';

import { useState, useEffect, use as usePromise } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { getSupabaseBrowser } from '@/lib/supabase';

type Community = {
  id: string;
  name: string;
  description: string | null;
  owner_wallet_address: string;
  member_count: number;
  max_members: number;
  status: string;
};

export default function CommunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = usePromise(params);
  const { address, isConnected } = useAppKitAccount();
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const supabase = getSupabaseBrowser();
        const { data, error: rpcError } = await (supabase.rpc as any)(
          'search_p2p_communities',
          { p_search: null }
        );
        if (rpcError) throw rpcError;
        const found = (data || []).find((c: Community) => c.id === id);
        setCommunity(found || null);
      } catch (err: any) {
        setError(err.message || 'Community load ചെയ്യാൻ പറ്റിയില്ല');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleJoin = async () => {
    setError(null);
    setMessage(null);

    if (!isConnected || !address) {
      setError('Wallet connect ചെയ്യൂ ആദ്യം');
      return;
    }

    setJoining(true);
    try {
      const supabase = getSupabaseBrowser();
      const { error: rpcError } = await (supabase.rpc as any)('request_join_p2p_community', {
        p_community_id: id,
        p_wallet_address: address,
      });
      if (rpcError) throw rpcError;
      setMessage('🦋 Join request send ചെയ്തു! Owner approve ചെയ്യുന്നത് വരെ കാത്തിരിക്കൂ.');
    } catch (err: any) {
      setError(err.message || 'Join request send ചെയ്യാൻ പറ്റിയില്ല');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <p className="text-gray-400">Community കണ്ടില്ല 🦋</p>
      </div>
    );
  }

  const shortAddress = (addr: string) =>
    addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-2xl font-bold mb-1">🦋 {community.name}</h1>
      <span
        className={`inline-block text-xs px-2 py-0.5 rounded-full mb-4 ${
          community.status === 'open'
            ? 'bg-green-900 text-green-400'
            : 'bg-gray-800 text-gray-400'
        }`}
      >
        {community.status}
      </span>

      {community.description && (
        <p className="text-gray-300 text-sm mb-4">{community.description}</p>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Owner</span>
          <span className="text-white">{shortAddress(community.owner_wallet_address)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Members</span>
          <span className="text-white">
            {community.member_count}/{community.max_members}
          </span>
        </div>
      </div>

      {message && <p className="text-green-400 text-sm mb-3">{message}</p>}
      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      <button
        onClick={handleJoin}
        disabled={joining || community.status !== 'open' || !!message}
        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
      >
        {joining ? 'Sending...' : message ? 'Request Sent' : 'Join Request അയക്കൂ'}
      </button>
    </div>
  );
}
