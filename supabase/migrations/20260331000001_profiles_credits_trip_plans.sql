-- Atlas BFF: extended profiles, credit ledger, trip_plans (replaces generic plans).
-- Created via Supabase CLI migration naming (supabase migration new profiles_credits_trip_plans).

-- ---------------------------------------------------------------------------
-- Profiles: identity & contact (email lives in auth.users; expose via API)
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists gender text,
  add column if not exists phone text,
  add column if not exists bio text,
  add column if not exists country text;

comment on column public.profiles.country is 'ISO 3166-1 alpha-2 (e.g. US, BR)';
comment on column public.profiles.gender is 'free text or app-enforced enum (male|female|other|prefer_not_to_say)';

-- ---------------------------------------------------------------------------
-- Credits: balance per user + append-only ledger (all adds/spends recorded)
-- ---------------------------------------------------------------------------
create table if not exists public.user_credits (
  user_id uuid primary key references auth.users (id) on delete cascade,
  balance bigint not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

alter table public.user_credits enable row level security;

create policy "user_credits_select_own"
  on public.user_credits for select
  using (auth.uid() = user_id);

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount bigint not null,
  balance_after bigint not null,
  reason text not null,
  reference_type text,
  reference_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists credit_transactions_user_created_idx
  on public.credit_transactions (user_id, created_at desc);

alter table public.credit_transactions enable row level security;

create policy "credit_transactions_select_own"
  on public.credit_transactions for select
  using (auth.uid() = user_id);

-- Server-side only: BFF uses service role to call apply_credit (never expose key to browsers).
create or replace function public.apply_credit(
  p_user_id uuid,
  p_delta bigint,
  p_reason text,
  p_reference_type text default null,
  p_reference_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_balance bigint;
begin
  insert into public.user_credits (user_id, balance)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;

  update public.user_credits
  set
    balance = balance + p_delta,
    updated_at = now()
  where user_id = p_user_id
  returning balance into v_new_balance;

  if v_new_balance is null then
    raise exception 'user not found';
  end if;

  if v_new_balance < 0 then
    update public.user_credits
    set balance = balance - p_delta, updated_at = now()
    where user_id = p_user_id;
    raise exception 'insufficient credits';
  end if;

  insert into public.credit_transactions (
    user_id,
    amount,
    balance_after,
    reason,
    reference_type,
    reference_id,
    metadata
  )
  values (
    p_user_id,
    p_delta,
    v_new_balance,
    p_reason,
    p_reference_type,
    p_reference_id,
    p_metadata
  );

  return v_new_balance;
end;
$$;

revoke all on function public.apply_credit(uuid, bigint, text, text, uuid, jsonb) from public;
grant execute on function public.apply_credit(uuid, bigint, text, text, uuid, jsonb) to service_role;

-- ---------------------------------------------------------------------------
-- Trip plans: replace public.plans (rename + new columns). No status field.
-- ---------------------------------------------------------------------------
drop policy if exists "plans_all_own" on public.plans;

alter table public.plans rename to trip_plans;

drop index if exists plans_status_idx;

alter table public.trip_plans drop column if exists status;

alter table public.trip_plans
  add column if not exists ai_suggested_title text,
  add column if not exists departure_at timestamptz,
  add column if not exists arrival_at timestamptz,
  add column if not exists flight_numbers text[] not null default '{}',
  add column if not exists days_count integer,
  add column if not exists destination text,
  add column if not exists destination_country text,
  add column if not exists form_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists itinerary jsonb not null default '{}'::jsonb;

-- Migrate legacy payload into form_snapshot / itinerary when column still exists.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'trip_plans'
      and column_name = 'payload'
  ) then
    update public.trip_plans
    set
      form_snapshot = case
        when payload is not null and payload <> '{}'::jsonb then payload
        else form_snapshot
      end,
      itinerary = case
        when payload ? 'itinerary' then coalesce(payload->'itinerary', '{}'::jsonb)
        else itinerary
      end;
  end if;
end $$;

alter table public.trip_plans drop column if exists payload;

do $$
begin
  if exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'plans_user_id_idx'
  ) then
    execute 'alter index public.plans_user_id_idx rename to trip_plans_user_id_idx';
  end if;
end $$;

drop trigger if exists plans_set_updated_at on public.trip_plans;

create trigger trip_plans_set_updated_at
  before update on public.trip_plans
  for each row execute function public.set_plans_updated_at();

alter table public.trip_plans enable row level security;

drop policy if exists "trip_plans_all_own" on public.trip_plans;

create policy "trip_plans_all_own"
  on public.trip_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Existing users (before user_credits existed): one row each.
insert into public.user_credits (user_id, balance)
select id, 0 from public.profiles
on conflict (user_id) do nothing;

-- ---------------------------------------------------------------------------
-- Auth trigger: profile + credits row on signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  dn text;
begin
  dn := coalesce(
    meta->>'display_name',
    nullif(trim(coalesce(meta->>'first_name', '') || ' ' || coalesce(meta->>'last_name', '')), ''),
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (
    id,
    display_name,
    first_name,
    last_name,
    gender,
    phone,
    bio,
    country
  )
  values (
    new.id,
    dn,
    meta->>'first_name',
    meta->>'last_name',
    meta->>'gender',
    meta->>'phone',
    meta->>'bio',
    meta->>'country'
  );

  insert into public.user_credits (user_id, balance)
  values (new.id, 0)
  on conflict (user_id) do nothing;

  return new;
end;
$$;
