import { useStripe } from '@stripe/stripe-react-native';

// Native (iOS/Android) — thin re-export of the real Stripe hook. See the
// .web.ts sibling: web has no Stripe SDK target, so Metro picks that stub
// instead when bundling for web (checkout falls back to the simulated flow).
export function useAppStripe() {
  return useStripe();
}
