// Supabase Edge Function (Deno). Creates a Stripe PaymentIntent server-side so
// the secret key never ships in the app. Deploy with:
//   supabase functions deploy create-payment-intent
// and set the secret with:
//   supabase secrets set STRIPE_SECRET_KEY=sk_test_...
import Stripe from 'npm:stripe@17';
import { createClient } from 'npm:@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response('Missing Authorization header', { status: 401 });

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (userError || !userData.user) return new Response('Invalid session', { status: 401 });
    const userId = userData.user.id;

    const { items, couponCode } = (await req.json()) as {
      items: { product_id: string; qty: number }[];
      couponCode?: string | null;
    };
    if (!items?.length) return new Response('Empty cart', { status: 400 });

    const productIds = items.map((i) => i.product_id);
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, price')
      .in('id', productIds);
    if (productsError || !products) return new Response('Could not price cart', { status: 500 });

    const priceById = Object.fromEntries(products.map((p) => [p.id, Number(p.price)]));
    const subtotal = items.reduce((sum, i) => sum + (priceById[i.product_id] ?? 0) * i.qty, 0);
    if (subtotal <= 0) return new Response('Invalid total', { status: 400 });

    // Coupons are re-validated here: the client's claimed discount is never trusted.
    let discount = 0;
    let appliedCode: string | null = null;
    if (couponCode) {
      const { data: coupon } = await supabaseAdmin
        .from('coupons')
        .select('code, amount, min_spend, used, expires_at')
        .eq('user_id', userId)
        .eq('code', couponCode)
        .maybeSingle();
      const notExpired = !coupon?.expires_at || new Date(coupon.expires_at) > new Date();
      if (coupon && !coupon.used && notExpired && subtotal >= Number(coupon.min_spend)) {
        discount = Math.min(Number(coupon.amount), subtotal);
        appliedCode = coupon.code;
      }
    }

    // Shipping: free over 39 €, free express over 99 € (see src/data/commerce.ts).
    const FREE_SHIPPING_MIN = 39;
    const FAST_SHIPPING_MIN = 99;
    const STANDARD_SHIPPING_COST = 4.9;
    const shippingTier =
      subtotal >= FAST_SHIPPING_MIN ? 'express' : subtotal >= FREE_SHIPPING_MIN ? 'standard' : 'paid';
    const shippingCost = shippingTier === 'paid' ? STANDARD_SHIPPING_COST : 0;

    const total = Math.max(0, subtotal - discount) + shippingCost;

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        status: 'pending',
        total,
        coupon_code: appliedCode,
        discount,
        shipping_tier: shippingTier,
      })
      .select()
      .single();
    if (orderError || !order) return new Response('Could not create order', { status: 500 });

    if (appliedCode) {
      await supabaseAdmin
        .from('coupons')
        .update({ used: true, used_order_id: order.id })
        .eq('user_id', userId)
        .eq('code', appliedCode);
    }

    await supabaseAdmin.from('order_items').insert(
      items.map((i) => ({ order_id: order.id, product_id: i.product_id, qty: i.qty, unit_price: priceById[i.product_id] }))
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      metadata: { order_id: order.id, user_id: userId },
    });

    await supabaseAdmin
      .from('orders')
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq('id', order.id);

    return Response.json({ clientSecret: paymentIntent.client_secret, orderId: order.id });
  } catch (err) {
    console.error(err);
    return new Response('Internal error', { status: 500 });
  }
});
