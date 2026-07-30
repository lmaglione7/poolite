-- Commerce v3: real product photos, loyalty coupons, referrals, order coupon
-- tracking. Run after 0001–0003.

-- Real supplier photos. Keep the flat SVG illustrations as the app-side
-- fallback for products without a photo yet.
alter table public.products add column if not exists image_url text;
alter table public.products add column if not exists gallery_urls text[] not null default '{}';

-- Loyalty + referral coupons. Amounts are fixed € discounts.
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  code text not null,
  label text not null,
  amount numeric not null check (amount > 0),
  min_spend numeric not null default 0,
  reason text not null default '',
  source text not null default 'loyalty' check (source in ('loyalty', 'referral', 'manual')),
  used boolean not null default false,
  used_order_id uuid references public.orders (id),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, code)
);

alter table public.coupons enable row level security;
create policy "coupons_select_own" on public.coupons for select using (auth.uid() = user_id);
-- Coupons are granted server-side (edge function / service role) so the
-- amount can never be forged from the client.

-- Referral tracking: one row per friend who signed up with a code.
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users (id) on delete cascade,
  referred_id uuid not null references auth.users (id) on delete cascade,
  code text not null,
  rewarded boolean not null default false,
  created_at timestamptz not null default now(),
  unique (referred_id)
);

alter table public.referrals enable row level security;
create policy "referrals_select_own" on public.referrals for select using (auth.uid() = referrer_id or auth.uid() = referred_id);

-- Stable per-user referral code.
create table if not exists public.referral_codes (
  user_id uuid primary key references auth.users (id) on delete cascade,
  code text not null unique,
  created_at timestamptz not null default now()
);

alter table public.referral_codes enable row level security;
create policy "referral_codes_select_own" on public.referral_codes for select using (auth.uid() = user_id);

-- Which coupon (if any) was applied to an order, and the shipping tier used.
alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists discount numeric not null default 0;
alter table public.orders add column if not exists shipping_tier text not null default 'standard'
  check (shipping_tier in ('paid', 'standard', 'express'));
alter table public.orders add column if not exists carrier text;
alter table public.orders add column if not exists tracking_code text;

-- Grants the €30 referral coupon when a new user signs up with a code.
-- Called by the client right after signup (security definer so it can write
-- coupons the user cannot forge).
create or replace function public.claim_referral(p_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_referrer uuid;
begin
  select user_id into v_referrer from public.referral_codes where code = upper(p_code);
  if v_referrer is null or v_referrer = auth.uid() then
    return;
  end if;

  insert into public.referrals (referrer_id, referred_id, code, rewarded)
  values (v_referrer, auth.uid(), upper(p_code), true)
  on conflict (referred_id) do nothing;

  if found then
    insert into public.coupons (user_id, code, label, amount, min_spend, reason, source)
    values (
      v_referrer,
      'AMICO-' || substr(md5(random()::text), 1, 6),
      'Un amico si è iscritto 🎉',
      30,
      0,
      'Grazie per aver fatto conoscere Poolite',
      'referral'
    );
  end if;
end;
$$;
