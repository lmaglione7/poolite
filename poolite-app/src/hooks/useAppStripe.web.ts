// Web stub — @stripe/stripe-react-native has no web target. The cart screen
// only calls these when isStripeConfigured && Platform.OS !== 'web'; kept
// here purely so the web preview bundle doesn't fail to resolve the module.
export function useAppStripe() {
  return {
    initPaymentSheet: async () => ({ error: { message: 'Stripe non è disponibile in questa preview web.' } as any }),
    presentPaymentSheet: async () => ({ error: { message: 'Stripe non è disponibile in questa preview web.' } as any }),
  };
}
