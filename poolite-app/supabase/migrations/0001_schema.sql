-- Poolite marketplace schema.
-- Run with: supabase db push  (or paste into the SQL editor in the Supabase dashboard)

create extension if not exists "pgcrypto";

-- One row per signed-up user: onboarding answers + gamification counters.
create table if not exists public.pools (
  user_id uuid primary key references auth.users (id) on delete cascade,
  size text check (size in ('S', 'M', 'L', 'XL', 'custom')),
  dim_l numeric,
  dim_w numeric,
  dim_d numeric,
  pump text check (pump in ('0.5', '0.75', '1', '1.5', '2', 'boh')),
  city text,
  city_lat double precision,
  city_lon double precision,
  treatment text check (treatment in ('cloro', 'sale', 'boh')),
  has_onboarded boolean not null default false,
  gocce integer not null default 0,
  streak integer not null default 0,
  cumulative_savings numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pools enable row level security;

create policy "pools_select_own" on public.pools for select using (auth.uid() = user_id);
create policy "pools_upsert_own" on public.pools for insert with check (auth.uid() = user_id);
create policy "pools_update_own" on public.pools for update using (auth.uid() = user_id);

-- Product catalog — publicly readable, only editable via the dashboard/service role.
create table if not exists public.products (
  id text primary key,
  category text not null check (category in ('chimici', 'robot', 'accessori', 'pompe', 'coperture', 'luci')),
  name text not null,
  emoji text not null,
  price numeric not null,
  old_price numeric,
  badge text not null default '',
  rating numeric not null default 4.5,
  description text not null default ''
);

alter table public.products enable row level security;
create policy "products_public_read" on public.products for select using (true);

-- Cart, one row per (user, product).
create table if not exists public.cart_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null references public.products (id),
  qty integer not null check (qty > 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table public.cart_items enable row level security;
create policy "cart_items_all_own" on public.cart_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Orders — created by the client as 'pending', flipped to 'paid' only by the
-- create-payment-intent / stripe-webhook edge functions (service role).
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'paid', 'fulfilled', 'cancelled')),
  total numeric not null,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;
create policy "orders_select_own" on public.orders for select using (auth.uid() = user_id);
create policy "orders_insert_own" on public.orders for insert with check (auth.uid() = user_id);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id text not null references public.products (id),
  qty integer not null,
  unit_price numeric not null
);

alter table public.order_items enable row level security;
create policy "order_items_select_own" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "order_items_insert_own" on public.order_items for insert
  with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

-- Daily "che colore è l'acqua" answers (one per user per day).
create table if not exists public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  color text not null check (color in ('azzurra', 'torbida', 'verdina')),
  answered_on date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, answered_on)
);

alter table public.water_logs enable row level security;
create policy "water_logs_all_own" on public.water_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Treatment diary ("Cloro", "pH+", …) chip taps.
create table if not exists public.treatment_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  emoji text not null,
  created_at timestamptz not null default now()
);

alter table public.treatment_logs enable row level security;
create policy "treatment_logs_all_own" on public.treatment_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
