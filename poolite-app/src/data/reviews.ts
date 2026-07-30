// Contextual verified reviews: each one carries the reviewer's pool context so
// a buyer can see "someone with a pool like mine" — the trust edge a generic
// marketplace can't offer. Mirrors the Supabase `product_reviews` table.
export interface ProductReview {
  id: string;
  productId: string;
  author: string;
  rating: number;
  text: string;
  poolContext: string; // "Piscina media · cloro · Monza"
  verified: boolean;
  helpfulCount: number;
  monthsAgo: number;
}

export const REVIEWS: ProductReview[] = [
  { id: 'r1', productId: 'shock', author: 'Paolo B.', rating: 5, text: 'Acqua verde dopo una settimana di ferie: la sera il trattamento, la mattina dopo era già azzurra. Incredibile.', poolContext: 'Piscina media (25 m³) · cloro · Brescia', verified: true, helpfulCount: 41, monthsAgo: 1 },
  { id: 'r2', productId: 'shock', author: 'Lucia M.', rating: 4, text: 'Funziona come promesso, seguite le dosi con attenzione. Con la pompa accesa tutta la notte risultato perfetto.', poolContext: 'Piscina grande (45 m³) · cloro · Verona', verified: true, helpfulCount: 18, monthsAgo: 2 },
  { id: 'r3', productId: 'antialghe', author: 'Franco T.', rating: 5, text: 'Da quando lo uso ogni settimana il verde non è più tornato. Una tacca del misurino e via.', poolContext: 'Piscina media (25 m³) · cloro · Monza', verified: true, helpfulCount: 27, monthsAgo: 1 },
  { id: 'r4', productId: 'cloro5', author: 'Giovanna R.', rating: 5, text: 'Il secchio da 5 kg mi ha coperto tutta l’estate. Pastiglie comode, l’acqua resta limpida e il pH stabile.', poolContext: 'Piscina media (25 m³) · cloro · Bergamo', verified: true, helpfulCount: 56, monthsAgo: 3 },
  { id: 'r5', productId: 'cloro5', author: 'Marco D.', rating: 4, text: 'Buon prodotto, prezzo in offerta imbattibile. Con lo skimmer piccolo meglio la mezza pastiglia.', poolContext: 'Piscina piccola (10 m³) · cloro · Como', verified: true, helpfulCount: 12, monthsAgo: 1 },
  { id: 'r6', productId: 'floc', author: 'Elena S.', rating: 5, text: 'Acqua torbida da giorni, una cartuccia nello skimmer e la mattina si vedeva il fondo. Magia.', poolContext: 'Piscina media (25 m³) · sale · Varese', verified: true, helpfulCount: 33, monthsAgo: 2 },
  { id: 'r7', productId: 'telo', author: 'Roberto C.', rating: 5, text: 'Su misura perfetto. Acqua 2 gradi più calda e molto meno cloro consumato. Si ripaga davvero.', poolContext: 'Piscina grande (45 m³) · cloro · Padova', verified: true, helpfulCount: 48, monthsAgo: 2 },
  { id: 'r8', productId: 'robot', author: 'Anna P.', rating: 5, text: 'La schiena ringrazia. Lo metto la sera, la mattina fondo e pareti puliti. Il miglior acquisto per la piscina.', poolContext: 'Piscina grande (45 m³) · sale · Treviso', verified: true, helpfulCount: 72, monthsAgo: 4 },
  { id: 'r9', productId: 'robot', author: 'Stefano L.', rating: 4, text: 'Ottimo sul fondo, sulle scale un po’ meno. Per il prezzo scontato Poolite comunque promosso.', poolContext: 'Piscina media (25 m³) · cloro · Milano', verified: true, helpfulCount: 21, monthsAgo: 1 },
  { id: 'r10', productId: 'retino', author: 'Carla V.', rating: 4, text: 'Robusto, manico lungo, rete profonda. Fa il suo dovere ogni mattina.', poolContext: 'Piscina piccola (10 m³) · cloro · Monza', verified: true, helpfulCount: 9, monthsAgo: 1 },
  { id: 'r11', productId: 'kit', author: 'Luigi F.', rating: 5, text: 'Semplicissimo: immergi, confronti i colori, sai cosa fare. Con l’app poi è tutto ancora più chiaro.', poolContext: 'Piscina media (25 m³) · cloro · Bologna', verified: true, helpfulCount: 15, monthsAgo: 2 },
  { id: 'r12', productId: 'sale25', author: 'Marta G.', rating: 5, text: 'Sale purissimo, si scioglie in fretta senza residui sul fondo. Prezzo giusto.', poolContext: 'Piscina media (25 m³) · sale · Rimini', verified: true, helpfulCount: 11, monthsAgo: 1 },
  { id: 'r13', productId: 'doccia', author: 'Piero N.', rating: 4, text: 'Con una giornata di sole l’acqua è davvero calda. Montaggio in mezz’ora.', poolContext: 'Piscina grande (45 m³) · cloro · Lecce', verified: true, helpfulCount: 14, monthsAgo: 3 },
  { id: 'r14', productId: 'pompacalore', author: 'Davide E.', rating: 5, text: 'Stagione allungata da maggio a fine settembre. Consuma poco davvero, bollette sotto controllo con i consigli dell’app.', poolContext: 'Piscina grande (45 m³) · sale · Verona', verified: true, helpfulCount: 38, monthsAgo: 5 },
  { id: 'r15', productId: 'luciled', author: 'Silvia A.', rating: 5, text: 'Effetto wow la sera, i bambini non vogliono più uscire dall’acqua. Montato senza attrezzi.', poolContext: 'Piscina media (25 m³) · cloro · Firenze', verified: true, helpfulCount: 25, monthsAgo: 2 },
  { id: 'r16', productId: 'filtro', author: 'Andrea Z.', rating: 4, text: 'Compatibili con la mia pompa, filtrano bene. Una al mese come consiglia l’app.', poolContext: 'Piscina piccola (10 m³) · cloro · Torino', verified: true, helpfulCount: 8, monthsAgo: 1 },
];

export function reviewsForProduct(productId: string): ProductReview[] {
  return REVIEWS.filter((r) => r.productId === productId);
}
