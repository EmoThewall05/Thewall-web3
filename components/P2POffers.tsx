'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppKitAccount } from '@reown/appkit/react';
import { getSupabaseBrowser } from '@/lib/supabase';

interface Offer {
  id: string;
  creator_wallet_address: string;
  offer_type: 'buy' | 'sell';
  amount: number;
  price_per_unit: number;
  payment_method: string;
  created_at: string;
}

export default function P2POffers({ communityId }: { communityId: string }) {
  const { address } = useAppKitAccount();
  const router = useRouter();
  const supabase = getSupabaseBrowser();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [offerType, setOfferType] = useState<'buy' | 'sell'>('sell');
  const [amount, setAmount] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadOffers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase.rpc as any)('list_p2p_offers', {
      p_community_id: communityId,
    });
    if (!error) setOffers(data || []);
    setLoading(false);
  }, [communityId, supabase]);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const handleCreateOffer = async () => {
    if (!address) return setError('Connect your wallet first');
    if (!amount || !pricePerUnit || !paymentMethod) return setError('Fill all fields');

    setSubmitting(true);
    setError('');
    const { error } = await (supabase.rpc as any)('create_p2p_offer', {
      p_community_id: communityId,
      p_creator_wallet: address,
      p_offer_type: offerType,
      p_amount: parseFloat(amount),
      p_price_per_unit: parseFloat(pricePerUnit),
      p_payment_method: paymentMethod,
    });
    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }
    setShowForm(false);
    setAmount('');
    setPricePerUnit('');
    setPaymentMethod('');
    loadOffers();
  };

  const handleAccept = async (offerId: string) => {
    if (!address) return setError('Connect your wallet first');
    setBusyId(offerId);
    setError('');

    const { data, error } = await (supabase.rpc as any)('accept_p2p_offer', {
      p_offer_id: offerId,
      p_acceptor_wallet: address,
    });
    setBusyId(null);

    if (error) {
      setError(error.message);
      return;
    }
    router.push(`/p2p-community/${communityId}/transaction/${data}`);
  };

  return (
    <div className="text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">🦋 Open Offers</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-sm font-semibold"
        >
          {showForm ? 'Cancel' : '+ Create Offer'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-900/40 border border-red-700 text-red-300 text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-6 p-4 rounded-xl bg-zinc-900 border border-zinc-700 space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => setOfferType('sell')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold ${offerType === 'sell' ? 'bg-emerald-600' : 'bg-zinc-800'}`}
            >
              Sell
            </button>
            <button
              onClick={() => setOfferType('buy')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold ${offerType === 'buy' ? 'bg-blue-600' : 'bg-zinc-800'}`}
            >
              Buy
            </button>
          </div>
          <input
            type="number"
            placeholder="Amount (EMC)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm"
          />
          <input
            type="number"
            placeholder="Price per unit (₹)"
            value={pricePerUnit}
            onChange={(e) => setPricePerUnit(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm"
          />
          <input
            type="text"
            placeholder="Payment method (e.g. UPI, Bank Transfer)"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm"
          />
          <button
            onClick={handleCreateOffer}
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 font-semibold disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Post Offer'}
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-zinc-400 text-sm">Loading offers...</p>
      ) : offers.length === 0 ? (
        <p className="text-zinc-400 text-sm">No open offers yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="p-4 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-between"
            >
              <div>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-bold mr-2 ${offer.offer_type === 'sell' ? 'bg-emerald-700' : 'bg-blue-700'}`}
                >
                  {offer.offer_type.toUpperCase()}
                </span>
                <div className="text-sm mt-1">
                  {offer.amount} EMC @ ₹{offer.price_per_unit}/unit
                </div>
                <div className="text-xs text-zinc-400">{offer.payment_method}</div>
                <div className="text-xs text-zinc-500">
                  {offer.creator_wallet_address.slice(0, 6)}...{offer.creator_wallet_address.slice(-4)}
                </div>
              </div>
              <button
                onClick={() => handleAccept(offer.id)}
                disabled={busyId === offer.id}
                className="px-4 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-sm font-semibold disabled:opacity-50"
              >
                {busyId === offer.id ? '...' : 'Accept'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
