-- Marketplace v2: contextual reviews, local technicians, service requests,
-- smart refill subscriptions. Run after 0001/0002.

-- Verified contextual reviews: pool context stored denormalized so the review
-- keeps describing the pool it was written with.
create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products (id),
  user_id uuid not null references auth.users (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  text text not null,
  pool_context text not null default '',
  verified boolean not null default false, -- set by backend when an order for this product exists
  helpful_count integer not null default 0,
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);

alter table public.product_reviews enable row level security;
create policy "reviews_public_read" on public.product_reviews for select using (true);
create policy "reviews_insert_own" on public.product_reviews for insert with check (auth.uid() = user_id);
create policy "reviews_update_own" on public.product_reviews for update using (auth.uid() = user_id);

-- Local technicians directory — managed via dashboard/service role.
create table if not exists public.technicians (
  id text primary key,
  name text not null,
  emoji text not null default '🔧',
  specialty text not null,
  zone text not null,
  rating numeric not null default 4.5,
  review_count integer not null default 0,
  years_active integer not null default 1,
  services text[] not null default '{}',
  responds_in text not null default 'entro 1 giorno',
  active boolean not null default true
);

alter table public.technicians enable row level security;
create policy "technicians_public_read" on public.technicians for select using (active);

insert into public.technicians (id, name, emoji, specialty, zone, rating, review_count, years_active, services, responds_in) values
('t1', 'AcquaChiara di Rossi Marco', '🔧', 'Manutenzione e riparazione pompe', 'Monza e Brianza', 4.9, 87, 12, array['Riparazione pompe', 'Sostituzione filtri', 'Apertura/chiusura stagione'], 'entro 2 ore'),
('t2', 'BluService Piscine', '🏊', 'Pulizia professionale e trattamenti', 'Milano Nord · Monza', 4.7, 132, 8, array['Pulizia completa', 'Recupero acqua verde', 'Analisi acqua a domicilio'], 'entro 4 ore'),
('t3', 'Idrotermica Colombo', '♨️', 'Pompe di calore e impianti', 'Brianza · Como', 4.8, 54, 15, array['Installazione pompe di calore', 'Impianti sale', 'Coperture su misura'], 'entro 1 giorno')
on conflict (id) do nothing;

-- "Richiedi intervento" requests; the technician side reads these via
-- dashboard/service tooling for now.
create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  technician_id text not null references public.technicians (id),
  message text not null,
  phone text not null,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

alter table public.service_requests enable row level security;
create policy "service_requests_select_own" on public.service_requests for select using (auth.uid() = user_id);
create policy "service_requests_insert_own" on public.service_requests for insert with check (auth.uid() = user_id);

-- Smart refill subscriptions ("Scorta automatica −10%").
create table if not exists public.subscriptions (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null references public.products (id),
  weeks integer not null check (weeks between 1 and 12),
  next_date date not null,
  paused boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table public.subscriptions enable row level security;
create policy "subscriptions_all_own" on public.subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
