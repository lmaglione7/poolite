// Web has no real target per the design brief (iOS/Expo) — this stub keeps a
// web preview bundleable without pulling in @stripe/stripe-react-native's
// native-only modules. Checkout falls back to the simulated flow on web.
export function AppStripeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
