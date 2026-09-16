-- P2P Community feature schema

create table if not exists p2p_communities (
  id uuid primary key default gen_random_uuid(),
  owner_wallet_address text not null,
  name text not null,
  description text,
  is_public boolean not null default true,
  status text not null default 'open', -- open | closed | suspended
  member_count integer not null default 1,
  min_members integer not null default 10,
  max_members integer not null default 25,
  kyc_verified boolean not null default false,
  vpn_block_until timestamptz,
  vpn_fail_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists p2p_community_members (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references p2p_communities(id) on delete cascade,
  wallet_address text not null,
  reputation_score integer not null default 100,
  joined_at timestamptz not null default now(),
  unique(community_id, wallet_address)
);

create table if not exists p2p_join_requests (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references p2p_communities(id) on delete cascade,
  wallet_address text not null,
  status text not null default 'pending', -- pending | approved | rejected
  created_at timestamptz not null default now()
);

create table if not exists p2p_transactions (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references p2p_communities(id) on delete cascade,
  buyer_wallet_address text not null,
  seller_wallet_address text not null,
  amount numeric not null,
  currency text not null,
  status text not null default 'pending',
  -- pending | buyer_paid | seller_held | owner_confirmed | worker_verified | completed | disputed | cancelled
  buyer_confirmed_at timestamptz,
  seller_held_at timestamptz,
  owner_confirmed_at timestamptz,
  worker_verified_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists p2p_disputes (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references p2p_transactions(id) on delete cascade,
  raised_by text not null,
  reason text,
  status text not null default 'open', -- open | resolved
  resolution text,
  created_at timestamptz not null default now()
);
