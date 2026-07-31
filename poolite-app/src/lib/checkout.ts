import { supabase } from './supabase';

export interface CreatePaymentIntentResult {
  clientSecret: string;
  orderId: string;
}

/** Calls the create-payment-intent Edge Function, which prices the cart
 * server-side, creates the `orders`/`order_items` rows, and returns a Stripe
 * PaymentIntent client secret for the PaymentSheet. */
export async function createPaymentIntent(
  items: { product_id: string; qty: number }[],
  couponCode?: string | null,
  shipping?: { addressId: string; shippingSpeed: 'standard' | 'express' }
): Promise<CreatePaymentIntentResult> {
  if (!supabase) throw new Error('Backend non configurato');
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error('Devi accedere per completare l’ordine');

  const { data, error } = await supabase.functions.invoke('create-payment-intent', {
    body: {
      items,
      couponCode: couponCode ?? null,
      addressId: shipping?.addressId ?? null,
      shippingSpeed: shipping?.shippingSpeed ?? 'standard',
    },
    headers: { Authorization: `Bearer ${token}` },
  });
  if (error) throw error;
  return data as CreatePaymentIntentResult;
}
