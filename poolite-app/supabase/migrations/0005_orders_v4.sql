-- Orders v4: shipping addresses, stock, wishlist, order numbers and tracking.
-- Completes the commerce loop (address → order → shipment → delivery).
-- Run after 0001–0004.

-- ── Shipping address book ────────────────────────────────────────────────
create table if not exists public.addresses (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null default 'Casa',
  first_name text not null,
  last_name text not null,
  phone text not null,
  street text not null,
  extra text not null default '',
  cap text not null check (cap ~ '^\d{5}$'),
  city text not null,
  province char(2) not null,
  notes text not null default '',
  is_default boolean not null default false,
  country char(2) not null default 'IT',
  created_at timestamptz not null default now()
);

alter table public.addresses enable row level security;
create policy "addresses_all_own" on public.addresses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Only one default address per user.
create unique index if not exists addresses_one_default
  on public.addresses (user_id) where is_default;

-- ── Stock and sales counters ─────────────────────────────────────────────
alter table public.products add column if not exists stock integer;
alter table public.products add column if not exists sold integer not null default 0;

-- Seed plausible stock for the demo catalog (only where still null).
update public.products set stock = 40 where stock is null;
update public.products set stock = 4 where id = 'floc' and stock = 40;
update public.products set stock = 6 where id = 'robot' and stock = 40;
update public.products set stock = 3 where id = 'pompacalore' and stock = 40;
update public.products set stock = 0 where id = 'luciled' and stock = 40;

-- ── Wishlist ─────────────────────────────────────────────────────────────
create table if not exists public.wishlist (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table public.wishlist enable row level security;
create policy "wishlist_all_own" on public.wishlist for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Orders: human number, address snapshot, shipping and tracking ────────
alter table public.orders add column if not exists order_number text;
alter table public.orders add column if not exists shipping_address jsonb;
alter table public.orders add column if not exists shipping_cost numeric not null default 0;
alter table public.orders add column if not exists estimated_delivery date;

-- Statuses now cover the full fulfilment timeline shown in the app.
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled', 'fulfilled'));

-- Keep the product name on the line: catalog names change, invoices must not.
alter table public.order_items add column if not exists product_name text;

create sequence if not exists order_number_seq start 1000;

create or replace function public.set_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null then
    new.order_number := 'PL-' || lpad(nextval('order_number_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists orders_set_number on public.orders;
create trigger orders_set_number before insert on public.orders
  for each row execute function public.set_order_number();

-- ── Stock decrement, atomic and race-safe ────────────────────────────────
-- Called by the payment edge function. Raises if any line is short, so a
-- PaymentIntent is never created for goods we cannot ship.
create or replace function public.reserve_stock(p_items jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item record;
begin
  for item in select * from jsonb_to_recordset(p_items) as x(product_id text, qty int) loop
    update public.products
       set stock = stock - item.qty
     where id = item.product_id
       and (stock is null or stock >= item.qty);
    if not found then
      raise exception 'Scorte insufficienti per %', item.product_id using errcode = 'P0001';
    end if;
  end loop;
end;
$$;
