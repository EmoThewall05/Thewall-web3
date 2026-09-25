-- ============================================
-- P2P Offers Model + Transaction Proof Images
-- ============================================

-- 1. Offers table
CREATE TABLE IF NOT EXISTS p2p_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES p2p_communities(id) ON DELETE CASCADE,
  creator_wallet_address text NOT NULL,
  offer_type text NOT NULL CHECK (offer_type IN ('buy', 'sell')),
  amount numeric NOT NULL CHECK (amount > 0),
  price_per_unit numeric NOT NULL CHECK (price_per_unit > 0),
  payment_method text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'matched', 'cancelled')),
  matched_transaction_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_p2p_offers_community_status
  ON p2p_offers(community_id, status);

ALTER TABLE p2p_offers ENABLE ROW LEVEL SECURITY;

-- Default deny (same pattern as other p2p_* tables)
REVOKE ALL ON p2p_offers FROM anon, authenticated;

-- 2. Add proof image column + owner-approval timestamp check to transactions
ALTER TABLE p2p_transactions
  ADD COLUMN IF NOT EXISTS buyer_proof_image_url text,
  ADD COLUMN IF NOT EXISTS seller_proof_image_url text,
  ADD COLUMN IF NOT EXISTS offer_id uuid REFERENCES p2p_offers(id);

-- 3. Storage bucket for payment proof screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('p2p-transaction-proofs', 'p2p-transaction-proofs', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY IF NOT EXISTS "Public read proof images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'p2p-transaction-proofs');

CREATE POLICY IF NOT EXISTS "Anon upload proof images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'p2p-transaction-proofs');

-- ============================================
-- RPC: create_p2p_offer (public, frontend-callable)
-- ============================================
CREATE OR REPLACE FUNCTION create_p2p_offer(
  p_community_id uuid,
  p_creator_wallet text,
  p_offer_type text,
  p_amount numeric,
  p_price_per_unit numeric,
  p_payment_method text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_offer_id uuid;
  v_is_member boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM p2p_community_members
    WHERE community_id = p_community_id
      AND wallet_address = p_creator_wallet
  ) INTO v_is_member;

  IF NOT v_is_member THEN
    RAISE EXCEPTION 'Only community members can create offers';
  END IF;

  INSERT INTO p2p_offers (community_id, creator_wallet_address, offer_type, amount, price_per_unit, payment_method)
  VALUES (p_community_id, p_creator_wallet, p_offer_type, p_amount, p_price_per_unit, p_payment_method)
  RETURNING id INTO v_offer_id;

  RETURN v_offer_id;
END;
$$;

GRANT EXECUTE ON FUNCTION create_p2p_offer(uuid, text, text, numeric, numeric, text) TO anon, authenticated;

-- ============================================
-- RPC: list_p2p_offers (public, frontend-callable)
-- ============================================
CREATE OR REPLACE FUNCTION list_p2p_offers(p_community_id uuid)
RETURNS TABLE (
  id uuid,
  creator_wallet_address text,
  offer_type text,
  amount numeric,
  price_per_unit numeric,
  payment_method text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id, creator_wallet_address, offer_type, amount, price_per_unit, payment_method, created_at
  FROM p2p_offers
  WHERE community_id = p_community_id AND status = 'open'
  ORDER BY created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION list_p2p_offers(uuid) TO anon, authenticated;

-- ============================================
-- RPC: accept_p2p_offer (public, frontend-callable)
-- Creates the p2p_transactions row and marks the offer matched
-- ============================================
CREATE OR REPLACE FUNCTION accept_p2p_offer(
  p_offer_id uuid,
  p_acceptor_wallet text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_offer p2p_offers%ROWTYPE;
  v_transaction_id uuid;
  v_buyer text;
  v_seller text;
BEGIN
  SELECT * INTO v_offer FROM p2p_offers WHERE id = p_offer_id AND status = 'open'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Offer not found or already matched';
  END IF;

  IF v_offer.creator_wallet_address = p_acceptor_wallet THEN
    RAISE EXCEPTION 'Cannot accept your own offer';
  END IF;

  IF v_offer.offer_type = 'sell' THEN
    v_seller := v_offer.creator_wallet_address;
    v_buyer := p_acceptor_wallet;
  ELSE
    v_buyer := v_offer.creator_wallet_address;
    v_seller := p_acceptor_wallet;
  END IF;

  INSERT INTO p2p_transactions (community_id, buyer_wallet_address, seller_wallet_address, amount, status, offer_id)
  VALUES (v_offer.community_id, v_buyer, v_seller, v_offer.amount, 'pending', p_offer_id)
  RETURNING id INTO v_transaction_id;

  UPDATE p2p_offers SET status = 'matched', matched_transaction_id = v_transaction_id WHERE id = p_offer_id;

  RETURN v_transaction_id;
END;
$$;

GRANT EXECUTE ON FUNCTION accept_p2p_offer(uuid, text) TO anon, authenticated;

-- ============================================
-- Update submit_p2p_transaction_proof to accept an optional image URL
-- ============================================
CREATE OR REPLACE FUNCTION submit_p2p_transaction_proof(
  p_transaction_id uuid,
  p_wallet_address text,
  p_proof text,
  p_proof_image_url text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tx p2p_transactions%ROWTYPE;
BEGIN
  SELECT * INTO v_tx FROM p2p_transactions WHERE id = p_transaction_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;

  IF p_wallet_address = v_tx.buyer_wallet_address THEN
    UPDATE p2p_transactions
    SET buyer_proof = p_proof, buyer_proof_image_url = p_proof_image_url
    WHERE id = p_transaction_id;
  ELSIF p_wallet_address = v_tx.seller_wallet_address THEN
    UPDATE p2p_transactions
    SET seller_proof = p_proof, seller_proof_image_url = p_proof_image_url
    WHERE id = p_transaction_id;
  ELSE
    RAISE EXCEPTION 'Not a party to this transaction';
  END IF;

  -- Flip to verifying once both sides have submitted proof
  UPDATE p2p_transactions
  SET status = 'verifying'
  WHERE id = p_transaction_id
    AND buyer_proof IS NOT NULL
    AND seller_proof IS NOT NULL
    AND status = 'pending';
END;
$$;

GRANT EXECUTE ON FUNCTION submit_p2p_transaction_proof(uuid, text, text, text) TO anon, authenticated;
