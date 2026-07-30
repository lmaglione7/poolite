import { StripeProvider } from '@stripe/stripe-react-native';
import { env, isStripeConfigured } from '../lib/env';

// Native (iOS/Android) implementation — real Stripe SDK. See the .web.tsx
// sibling: Metro picks that one for web builds, since @stripe/stripe-react-native
// has no web target and would fail to bundle there.
export function AppStripeProvider({ children }: { children: React.ReactNode }) {
  if (!isStripeConfigured) return <>{children}</>;
  return (
    <StripeProvider publishableKey={env.stripePublishableKey}>
      <>{children}</>
    </StripeProvider>
  );
}
