// Marks orders 'paid' when Stripe confirms the charge. Deploy with:
//   supabase functions deploy stripe-webhook --no-verify-jwt
// Register the endpoint URL in the Stripe dashboard (Developers → Webhooks)
// listening for payment_intent.succeeded, then:
//   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
import Stripe from 'npm:stripe@17';
import { createClient } from 'npm:@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature');
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature!, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed', err);
    return new Response('Invalid signature', { status: 400 });
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent;
    const orderId = intent.metadata?.order_id;
    if (orderId) {
      await supabaseAdmin
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', orderId)
        .eq('stripe_payment_intent_id', intent.id);
    }
  }

  return new Response('ok', { status: 200 });
});
