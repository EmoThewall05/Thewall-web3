-- Lock down direct table access; all access must go through SECURITY DEFINER RPC functions
alter table p2p_communities enable row level security;
alter table p2p_community_members enable row level security;
alter table p2p_join_requests enable row level security;
alter table p2p_transactions enable row level security;
alter table p2p_disputes enable row level security;

-- No policies defined = default deny for anon/authenticated roles.
-- Only SECURITY DEFINER functions (owned by postgres) can read/write.

-- Create a new P2P community
create or replace function create_p2p_community(
  p_owner_wallet_address text,
  p_name text,
  p_description text default null,
  p_is_public boolean default true
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_owner_wallet_address is null or length(trim(p_owner_wallet_address)) = 0 then
    raise exception 'owner_wallet_address is required';
  end if;

  if p_name is null or length(trim(p_name)) < 3 then
    raise exception 'Community name must be at least 3 characters';
  end if;

  insert into p2p_communities (owner_wallet_address, name, description, is_public)
  values (p_owner_wallet_address, trim(p_name), p_description, p_is_public)
  returning id into v_id;

  -- Owner is automatically the first member
  insert into p2p_community_members (community_id, wallet_address)
  values (v_id, p_owner_wallet_address);

  return v_id;
end;
$$;

-- Search public communities (returns owner details + member count, no sensitive data)
create or replace function search_p2p_communities(p_search text default null)
returns table (
  id uuid,
  name text,
  description text,
  owner_wallet_address text,
  member_count integer,
  max_members integer,
  status text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select c.id, c.name, c.description, c.owner_wallet_address, c.member_count, c.max_members, c.status
  from p2p_communities c
  where c.is_public = true
    and (p_search is null or c.name ilike '%' || p_search || '%')
  order by c.created_at desc
  limit 50;
end;
$$;

-- Request to join a community
create or replace function request_join_p2p_community(
  p_community_id uuid,
  p_wallet_address text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_member_count integer;
  v_max_members integer;
  v_status text;
begin
  select member_count, max_members, status into v_member_count, v_max_members, v_status
  from p2p_communities where id = p_community_id;

  if v_status is null then
    raise exception 'Community not found';
  end if;

  if v_status != 'open' then
    raise exception 'Community is not open for join requests';
  end if;

  if v_member_count >= v_max_members then
    raise exception 'Community is full';
  end if;

  insert into p2p_join_requests (community_id, wallet_address)
  values (p_community_id, p_wallet_address)
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function create_p2p_community(text, text, text, boolean) to anon, authenticated;
grant execute on function search_p2p_communities(text) to anon, authenticated;
grant execute on function request_join_p2p_community(uuid, text) to anon, authenticated;
