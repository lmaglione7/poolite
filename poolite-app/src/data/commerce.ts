// Shipping carriers and payment methods shown across the shop. Carrier names
// are plain-text nominative references — official logos get added via each
// partner's media kit once commercial agreements are in place.

export const CARRIERS = [
  { id: 'dhl', name: 'DHL Express', eta: '24h nelle città principali' },
  { id: 'ups', name: 'UPS', eta: '24–48h in tutta Italia' },
  { id: 'brt', name: 'BRT (Bartolini)', eta: '24–48h, ottima copertura provinciale' },
  { id: 'poste', name: 'Poste Italiane', eta: '2–3 giorni, ovunque, anche isole minori' },
] as const;

export type PaymentMethodId = 'card' | 'applepay' | 'googlepay';

/**
 * Everything here is processed through Stripe — one processor, one reconciliation,
 * one refund flow. Apple Pay / Google Pay are Stripe wallets, not separate PSPs.
 * `logoKey` maps to assets/img/pay/<key>.png|svg (see that folder's README):
 * official brand assets drop in there and replace the text badge automatically.
 */
export const PAYMENT_METHODS: {
  id: PaymentMethodId;
  label: string;
  hint: string;
  logoKey: string;
}[] = [
  { id: 'card', label: 'Carta di credito o debito', hint: 'Visa, Mastercard, American Express', logoKey: 'card' },
  { id: 'applepay', label: 'Apple Pay', hint: 'Paga con Face ID o Touch ID', logoKey: 'applepay' },
  { id: 'googlepay', label: 'Google Pay', hint: 'Paga con il tuo account Google', logoKey: 'googlepay' },
];

/** Card scheme marks shown as a trust strip (assets/img/pay/<key>). */
export const CARD_SCHEMES = [
  { key: 'visa', label: 'Visa' },
  { key: 'mastercard', label: 'Mastercard' },
  { key: 'amex', label: 'American Express' },
];

/** Standard free shipping threshold (€). */
export const FREE_SHIPPING_MIN = 39;
/** Free *express* (24/48h guaranteed) shipping threshold (€). */
export const FAST_SHIPPING_MIN = 99;
/** Charged when the cart is below FREE_SHIPPING_MIN. */
export const STANDARD_SHIPPING_COST = 4.9;
/** Charged when the customer picks express below FAST_SHIPPING_MIN. */
export const EXPRESS_SHIPPING_COST = 9.9;

export type ShippingSpeed = 'standard' | 'express';

export function shippingCostFor(subtotal: number, speed: ShippingSpeed): number {
  if (speed === 'express') return subtotal >= FAST_SHIPPING_MIN ? 0 : EXPRESS_SHIPPING_COST;
  return subtotal >= FREE_SHIPPING_MIN ? 0 : STANDARD_SHIPPING_COST;
}
