export type ProductCategory = 'chimici' | 'robot' | 'accessori' | 'pompe' | 'coperture' | 'luci';

export interface Product {
  id: string;
  cat: ProductCategory;
  rating: number;
  name: string;
  emoji: string;
  price: number;
  old: number | null;
  badge: string;
  desc: string;
}

// Local fallback catalog — mirrors supabase/migrations/0002_seed_products.sql.
// Used when Supabase isn't configured yet (see src/lib/catalog.ts) so the app
// is fully demoable before a backend project exists.
export const PRODUCTS: Product[] = [
  { id: 'shock', cat: 'chimici', rating: 4.6, name: 'Shock Cloro Rapido 1 kg', emoji: '⚡', price: 14.9, old: 19.9, badge: 'Green · Made in Italy', desc: 'Cloro a scioglimento rapido: in 24 ore l’acqua verde torna azzurra. Dose: 15 g per m³, la sera, a pompa accesa.' },
  { id: 'antialghe', cat: 'chimici', rating: 4.4, name: 'Antialghe Concentrato 1 L', emoji: '🌿', price: 11.5, old: null, badge: 'Made in Italy', desc: 'Previene il ritorno delle alghe. Da usare il giorno dopo il trattamento shock, poi una volta a settimana.' },
  { id: 'cloro5', cat: 'chimici', rating: 4.8, name: 'Cloro Multifunzione 5 kg', emoji: '🧴', price: 34.9, old: 42, badge: 'Green · Made in Italy', desc: 'Pastiglie 4-in-1: disinfetta, previene le alghe, rende l’acqua limpida e stabilizza il pH. Scorta per tutta l’estate.' },
  { id: 'floc', cat: 'chimici', rating: 4.5, name: 'Flocculante in cartucce', emoji: '✨', price: 12.9, old: 15.9, badge: 'Green · Made in Italy', desc: 'Una cartuccia nello skimmer e l’acqua torbida torna limpida in una notte.' },
  { id: 'telo', cat: 'coperture', rating: 4.7, name: 'Telo copertura estiva', emoji: '🛡', price: 49, old: 65, badge: 'su misura', desc: 'Tiene l’acqua calda e pulita: meno evaporazione, meno cloro, meno ore di pompa. Si ripaga in un mese.' },
  { id: 'retino', cat: 'accessori', rating: 4.3, name: 'Retino professionale', emoji: '🥅', price: 12.9, old: 16.9, badge: 'manico telescopico', desc: 'Rete profonda e manico fino a 3 metri: foglie e insetti via in due minuti.' },
  { id: 'kit', cat: 'accessori', rating: 4.6, name: 'Kit test pH e cloro', emoji: '🧪', price: 9.9, old: null, badge: '80 strisce', desc: 'Immergi, aspetta 15 secondi, confronta i colori. Più semplice di così.' },
  { id: 'robot', cat: 'robot', rating: 4.5, name: 'Robot pulitore fondo', emoji: '🤖', price: 189, old: 229, badge: 'Green · 2 anni garanzia', desc: 'Pulisce fondo e pareti da solo mentre tu fai altro. Il regalo che la tua schiena ti chiede.' },
  { id: 'sale25', cat: 'chimici', rating: 4.7, name: 'Sale speciale piscine 25 kg', emoji: '🧂', price: 18.9, old: null, badge: 'purezza 99,9%', desc: 'Sale ad alta purezza per elettrolisi: si scioglie in fretta, senza residui.' },
  { id: 'doccia', cat: 'accessori', rating: 4.4, name: 'Doccia solare da giardino', emoji: '🚿', price: 119, old: 149, badge: '35 L · Made in Italy', desc: 'Acqua calda gratis, scaldata dal sole. Il tuffo inizia meglio.' },
  { id: 'pompacalore', cat: 'pompe', rating: 4.5, name: 'EcoHeat Pompa di Calore 12 kW', emoji: '♨️', price: 1250, old: 1490, badge: 'riscalda fino a 60 m³', desc: 'Allunga la stagione: acqua a 28 °C da maggio a settembre, consumando poco.' },
  { id: 'luciled', cat: 'luci', rating: 4.6, name: 'Faro LED subacqueo RGB', emoji: '💡', price: 39.9, old: 49.9, badge: 'con telecomando', desc: 'Cambia colore alla piscina con un tasto. Montaggio senza attrezzi.' },
  { id: 'filtro', cat: 'accessori', rating: 4.5, name: 'Cartucce filtro (2 pezzi)', emoji: '🌀', price: 16.9, old: null, badge: 'universali', desc: 'Ricambio per il filtro a cartuccia: una al mese e l’acqua ringrazia.' },
];

export const PRODUCTS_BY_ID: Record<string, Product> = Object.fromEntries(
  PRODUCTS.map((p) => [p.id, p])
);

export const CATEGORIES: { id: ProductCategory; label: string; image: string }[] = [
  { id: 'chimici', label: 'Prodotti chimici', image: 'cloro5' },
  { id: 'robot', label: 'Robot pulitori', image: 'robot' },
  { id: 'accessori', label: 'Accessori & filtri', image: 'filtro' },
  { id: 'pompe', label: 'Pompe di calore', image: 'pompacalore' },
  { id: 'coperture', label: 'Coperture', image: 'telo' },
  { id: 'luci', label: 'Luci LED', image: 'luciled' },
];

export function formatEuro(n: number): string {
  return n.toFixed(2).replace('.', ',') + ' €';
}

export function starString(rating: number): string {
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

export function pctOff(product: Product): string {
  if (!product.old) return '';
  return '−' + Math.round((1 - product.price / product.old) * 100) + '%';
}
