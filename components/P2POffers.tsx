'use client';

import { useState, useEffect, useCallback, CSSProperties } from 'react';
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

const card: CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '16px',
};

const input: CSSProperties = {
  width: '100%',
  padding: '12px',
  borderRadius: 'var(--radius)',
  background: 'var(--bg3)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  fontFamily: 'var(--font-mono)',
  fontSize: '14px',
  outline: 'none',
};

const primaryBtn: CSSProperties = {
  width: '100%',
  padding: '13px',
  borderRadius: 'var(--radius)',
  background: 'var(--cyan)',
  color: '#00131c',
  fontFamily: 'var(--font-mono)',
  fontWeight: 700,
  border: 'none',
  cursor: 'pointer',
};

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
    <div style={{ marginTop: '20px', fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h3 style={{ fontSize: '17px', color: 'var(--cyan)', margin: 0 }}>🦋 Open Offers</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            background: showForm ? 'transparent' : 'var(--cyan-glow)',
            border: '1px solid var(--border-bright)',
            color: 'var(--cyan)',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {showForm ? 'Cancel' : '+ Create Offer'}
        </button>
      </div>

      {error && (
        <div style={{ ...card, borderColor: 'var(--red)', color: 'var(--red)', marginBottom: '14px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {showForm && (
        <div style={{ ...card, marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setOfferType('sell')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: 'var(--radius)',
                background: offerType === 'sell' ? 'rgba(0,255,136,0.15)' : 'var(--bg3)',
                border: offerType === 'sell' ? '1px solid var(--green)' : '1px solid var(--border)',
                color: offerType === 'sell' ? 'var(--green)' : 'var(--text-dim)',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Sell
            </button>
            <button
              onClick={() => setOfferType('buy')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: 'var(--radius)',
                background: offerType === 'buy' ? 'var(--cyan-glow)' : 'var(--bg3)',
                border: offerType === 'buy' ? '1px solid var(--cyan)' : '1px solid var(--border)',
                color: offerType === 'buy' ? 'var(--cyan)' : 'var(--text-dim)',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Buy
            </button>
          </div>

          <input
            type="number"
            placeholder="Amount (EMC)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={input}
          />
          <input
            type="number"
            placeholder="Price per unit (₹)"
            value={pricePerUnit}
            onChange={(e) => setPricePerUnit(e.target.value)}
            style={input}
          />
          <input
            type="text"
            placeholder="Payment method (e.g. UPI, Bank Transfer)"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={input}
          />
          <button onClick={handleCreateOffer} disabled={submitting} style={{ ...primaryBtn, opacity: submitting ? 0.5 : 1 }}>
            {submitting ? 'Creating...' : 'Post Offer'}
          </button>
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Loading offers...</p>
      ) : offers.length === 0 ? (
        <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>No open offers yet. Be the first!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {offers.map((offer) => (
            <div key={offer.id} style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    marginBottom: '6px',
                    background: offer.offer_type === 'sell' ? 'rgba(0,255,136,0.15)' : 'var(--cyan-glow)',
                    color: offer.offer_type === 'sell' ? 'var(--green)' : 'var(--cyan)',
                  }}
                >
                  {offer.offer_type.toUpperCase()}
                </span>
                <div style={{ fontSize: '14px' }}>
                  {offer.amount} EMC @ ₹{offer.price_per_unit}/unit
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{offer.payment_method}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {offer.creator_wallet_address.slice(0, 6)}...{offer.creator_wallet_address.slice(-4)}
                </div>
              </div>
              <button
                onClick={() => handleAccept(offer.id)}
                disabled={busyId === offer.id}
                style={{
                  padding: '9px 18px',
                  borderRadius: '20px',
                  background: 'var(--gold)',
                  color: '#1a1300',
                  border: 'none',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  opacity: busyId === offer.id ? 0.5 : 1,
                }}
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
