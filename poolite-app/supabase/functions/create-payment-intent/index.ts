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

    const { items } = (await req.json()) as { items: { product_id: string; qty: number }[] };
    if (!items?.length) return new Response('Empty cart', { status: 400 });

    const productIds = items.map((i) => i.product_id);
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, price')
      .in('id', productIds);
    if (productsError || !products) return new Response('Could not price cart', { status: 500 });

    const priceById = Object.fromEntries(products.map((p) => [p.id, Number(p.price)]));
    const total = items.reduce((sum, i) => sum + (priceById[i.product_id] ?? 0) * i.qty, 0);
    if (total <= 0) return new Response('Invalid total', { status: 400 });

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({ user_id: userId, status: 'pending', total })
      .select()
      .single();
    if (orderError || !order) return new Response('Could not create order', { status: 500 });

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
