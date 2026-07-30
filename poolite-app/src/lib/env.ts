// All values come from EXPO_PUBLIC_* env vars (see .env.example) so the same
// build works before and after the Supabase/Stripe projects exist.
export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
  // €/kWh used for the cost estimate — a single configurable flat rate
  // (no metered electricity-price API is wired in; see README "Electricity price").
  electricityRatePerKwh: Number(process.env.EXPO_PUBLIC_ELECTRICITY_RATE ?? '0.28'),
};

export const isSupabaseConfigured = !!(env.supabaseUrl && env.supabaseAnonKey);
export const isStripeConfigured = !!env.stripePublishableKey;
