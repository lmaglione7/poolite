# Poolite

React Native (Expo + Expo Router, TypeScript) implementation of the Poolite
design prototype (`../project/Poolite.dc.html` in this repo).

## Run it

```sh
npm install
npx expo start
```

Scan the QR with Expo Go, or press `i`/`a` for a simulator. The app works
fully in **demo mode** with no setup: onboarding, weather (live, via
Open-Meteo), and the Shop catalog all work locally on-device.

To turn on real accounts, a real Postgres-backed marketplace, and real
Stripe payments, follow **`supabase/README.md`** and fill in `.env` (copy
from `.env.example`).

## Structure

```
app/                  Expo Router screens (file-based routing)
  onboarding/          4-step wizard (pool size, pump, city, treatment)
  reveal.tsx           "your pool costs you ~X/day" cost reveal + welcome gocce
  loading.tsx          "reading the weather…" transition
  (auth)/              login / signup (only shown once Supabase is configured)
  (tabs)/              Oggi · Domani · Acqua · Shop · Tu, floating pill tab bar
    shop/               nested stack: catalog, product detail, cart/checkout
  dev-menu.tsx          hidden QA screen (long-press the logo on any tab)
src/
  theme/                colors, typography
  components/           shared UI (Card, WaveDivider, ProductImage, …)
  state/                React Context: auth, pool profile, cart, dev overrides
  hooks/                weather/cost calc, catalog, water state, …
  lib/                  Supabase client, Open-Meteo client, pool-cost math
  data/                 product catalog + SVG asset map
supabase/
  migrations/           SQL schema + seed data
  functions/            create-payment-intent / stripe-webhook (Deno edge functions)
```

## Design-fidelity notes

Ported pixel-for-pixel from the prototype's palette, type scale, card radii,
and wave divider — see `src/theme/colors.ts`. A few things were necessarily
turned from hardcoded demo numbers into real computed/live values, per
product decisions made while scoping this build:

- **Weather**: live via Open-Meteo (no key). The "momento giusto" pump
  window is the sunniest contiguous window of the required length, computed
  from real hourly solar radiation.
- **Cost estimate**: real formula (pump flow rate/wattage by HP × pool
  volume × a single configurable `EXPO_PUBLIC_ELECTRICITY_RATE`), not a
  metered spot-price feed — see `supabase/README.md`.
- **Accounts/marketplace/payments**: real Supabase (Postgres + Auth) and
  Stripe, once configured. Falls back to on-device demo data until then.
- **Dev menu** (long-press the logo): the shipped equivalent of the
  prototype's "Tweaks" panel — forces net-error / acqua-verde for QA.
