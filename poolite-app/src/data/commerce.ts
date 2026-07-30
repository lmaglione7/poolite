// Shipping carriers and payment methods shown across the shop. Names are
// plain-text nominative references — official logos get added via each
// partner's media kit once commercial agreements are in place.

export const CARRIERS = [
  { id: 'dhl', name: 'DHL Express', eta: '24h nelle città principali' },
  { id: 'ups', name: 'UPS', eta: '24–48h in tutta Italia' },
  { id: 'brt', name: 'BRT (Bartolini)', eta: '24–48h, ottima copertura provinciale' },
  { id: 'poste', name: 'Poste Italiane', eta: '2–3 giorni, ovunque, anche isole minori' },
] as const;

export const PAYMENT_METHODS = [
  { id: 'card', label: 'Carta di credito/debito', icon: '💳' },
  { id: 'applepay', label: 'Apple Pay', icon: '' },
  { id: 'googlepay', label: 'Google Pay', icon: 'Ⓖ' },
  { id: 'paypal', label: 'PayPal', icon: 'Ⓟ' },
  { id: 'klarna', label: 'Klarna · paga in 3 rate', icon: '𝗞' },
  { id: 'satispay', label: 'Satispay', icon: 'Ⓢ' },
] as const;

/** Standard free shipping threshold (€). */
export const FREE_SHIPPING_MIN = 39;
/** Free *express* (24/48h guaranteed) shipping threshold (€). */
export const FAST_SHIPPING_MIN = 99;
