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

    const { items, couponCode, addressId, shippingSpeed } = (await req.json()) as {
      items: { product_id: string; qty: number }[];
      couponCode?: string | null;
      addressId?: string | null;
      shippingSpeed?: 'standard' | 'express';
    };
    if (!items?.length) return new Response('Empty cart', { status: 400 });

    // A shipping address is mandatory — we snapshot it onto the order so a
    // later edit to the address book never rewrites shipping history.
    if (!addressId) return new Response('Missing shipping address', { status: 400 });
    const { data: address } = await supabaseAdmin
      .from('addresses')
      .select('*')
      .eq('id', addressId)
      .eq('user_id', userId)
      .maybeSingle();
    if (!address) return new Response('Invalid shipping address', { status: 400 });

    const productIds = items.map((i) => i.product_id);
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, name, price, stock')
      .in('id', productIds);
    if (productsError || !products) return new Response('Could not price cart', { status: 500 });

    // Refuse before charging if anything is out of stock.
    const stockById = Object.fromEntries(products.map((p) => [p.id, p.stock]));
    const nameById = Object.fromEntries(products.map((p) => [p.id, p.name]));
    for (const i of items) {
      const available = stockById[i.product_id];
      if (typeof available === 'number' && available < i.qty) {
        return Response.json({ error: 'out_of_stock', productId: i.product_id }, { status: 409 });
      }
    }

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

    // Shipping (mirrors src/data/commerce.ts — keep the two in sync).
    const FREE_SHIPPING_MIN = 39;
    const FAST_SHIPPING_MIN = 99;
    const STANDARD_SHIPPING_COST = 4.9;
    const EXPRESS_SHIPPING_COST = 9.9;
    const speed = shippingSpeed === 'express' ? 'express' : 'standard';
    const shippingCost =
      speed === 'express'
        ? subtotal >= FAST_SHIPPING_MIN
          ? 0
          : EXPRESS_SHIPPING_COST
        : subtotal >= FREE_SHIPPING_MIN
          ? 0
          : STANDARD_SHIPPING_COST;

    const total = Math.max(0, subtotal - discount) + shippingCost;

    const eta = new Date();
    eta.setDate(eta.getDate() + (speed === 'express' ? 1 : 3));

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        status: 'pending',
        total,
        coupon_code: appliedCode,
        discount,
        shipping_tier: speed,
        shipping_cost: shippingCost,
        shipping_address: address,
        estimated_delivery: eta.toISOString().slice(0, 10),
      })
      .select()
      .single();
    if (orderError || !order) return new Response('Could not create order', { status: 500 });

    // Hold the stock now that the order exists; if this throws, the order stays
    // 'pending' and no PaymentIntent is created.
    const { error: stockError } = await supabaseAdmin.rpc('reserve_stock', {
      p_items: items.map((i) => ({ product_id: i.product_id, qty: i.qty })),
    });
    if (stockError) {
      await supabaseAdmin.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
      return Response.json({ error: 'out_of_stock' }, { status: 409 });
    }

    if (appliedCode) {
      await supabaseAdmin
        .from('coupons')
        .update({ used: true, used_order_id: order.id })
        .eq('user_id', userId)
        .eq('code', appliedCode);
    }

    await supabaseAdmin.from('order_items').insert(
      items.map((i) => ({
        order_id: order.id,
        product_id: i.product_id,
        product_name: nameById[i.product_id],
        qty: i.qty,
        unit_price: priceById[i.product_id],
      }))
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
