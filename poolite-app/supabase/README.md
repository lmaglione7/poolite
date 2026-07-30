# Backend setup — Supabase + Stripe

The app runs today in **demo mode** with no backend configured: onboarding,
weather, and the Shop catalog all work locally. This guide wires up the real
marketplace backend (accounts, cart, orders) and real payments.

## 1. Create the Supabase project

1. Go to https://supabase.com/dashboard and sign in (or sign up — GitHub login is fastest).
2. Click **New project**. Pick/create an organization, name it e.g. `poolite`,
   set a database password (save it), choose a region close to Italy
   (e.g. `eu-central-1`), and click **Create new project**. Wait ~2 minutes.
3. Once it's ready, go to **Project Settings → API** and copy:
   - **Project URL**
   - **anon public** key
   - **service_role** key (keep this secret — never put it in the app)

## 2. Run the database migrations

Install the Supabase CLI (`npm i -g supabase`), then from `poolite-app/`:

```sh
supabase login
supabase link --project-ref <your-project-ref>   # found in the project URL
supabase db push                                  # runs migrations/0001 and 0002
```

Or, without the CLI: open **SQL Editor** in the dashboard and paste the
contents of `supabase/migrations/0001_schema.sql`, run it, then do the same
for `0002_seed_products.sql`.

This creates `pools`, `products` (pre-seeded with the 13-product catalog),
`cart_items`, `orders`, `order_items`, `water_logs`, and `treatment_logs`,
all with row-level security so each user only ever sees their own data.

## 3. Create the Stripe account

1. Go to https://dashboard.stripe.com/register and sign up.
2. You don't need to fill in business/bank details to use **test mode** —
   confirm the toggle in the top-right of the dashboard says "Test mode".
3. Go to **Developers → API keys** and copy the **Publishable key**
   (`pk_test_...`) and **Secret key** (`sk_test_...`).

## 4. Deploy the Edge Functions

These keep the Stripe secret key off the device — the app never sees it.

```sh
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase functions deploy create-payment-intent
supabase functions deploy stripe-webhook --no-verify-jwt
```

Then in the Stripe dashboard, go to **Developers → Webhooks → Add endpoint**,
set the URL to the `stripe-webhook` function's URL (shown after deploying —
looks like `https://<project-ref>.supabase.co/functions/v1/stripe-webhook`),
and select the `payment_intent.succeeded` event. Copy the webhook's **signing
secret** and run:

```sh
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

## 5. Configure the app

Copy `.env.example` to `.env` in `poolite-app/` and fill in:

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Restart `npx expo start` (env vars are read at bundle time). Once these are
set, the app automatically switches from demo mode to the real backend:
sign-up/login becomes real, cart/orders persist in Postgres, and checkout
opens a real Stripe payment sheet (still test-mode cards, e.g. `4242 4242
4242 4242`, until you activate the Stripe account for live payments).

## Notes on scope

- **Electricity price** used for the cost estimate is a single flat
  `EXPO_PUBLIC_ELECTRICITY_RATE` (€/kWh, default 0.28) — there's no metered
  spot-price API wired in (see root README).
- **Weather** (today/tomorrow temperature + sun hours used to pick the pump
  window) is live via Open-Meteo, no key required.
