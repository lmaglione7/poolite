-- Seeds the catalog shown in the Shop tab. Mirrors src/data/products.ts —
-- keep the two in sync if you add/edit products.

insert into public.products (id, category, name, emoji, price, old_price, badge, rating, description) values
('shock', 'chimici', 'Shock Cloro Rapido 1 kg', '⚡', 14.9, 19.9, 'Green · Made in Italy', 4.6, 'Cloro a scioglimento rapido: in 24 ore l''acqua verde torna azzurra. Dose: 15 g per m³, la sera, a pompa accesa.'),
('antialghe', 'chimici', 'Antialghe Concentrato 1 L', '🌿', 11.5, null, 'Made in Italy', 4.4, 'Previene il ritorno delle alghe. Da usare il giorno dopo il trattamento shock, poi una volta a settimana.'),
('cloro5', 'chimici', 'Cloro Multifunzione 5 kg', '🧴', 34.9, 42, 'Green · Made in Italy', 4.8, 'Pastiglie 4-in-1: disinfetta, previene le alghe, rende l''acqua limpida e stabilizza il pH. Scorta per tutta l''estate.'),
('floc', 'chimici', 'Flocculante in cartucce', '✨', 12.9, 15.9, 'Green · Made in Italy', 4.5, 'Una cartuccia nello skimmer e l''acqua torbida torna limpida in una notte.'),
('telo', 'coperture', 'Telo copertura estiva', '🛡', 49, 65, 'su misura', 4.7, 'Tiene l''acqua calda e pulita: meno evaporazione, meno cloro, meno ore di pompa. Si ripaga in un mese.'),
('retino', 'accessori', 'Retino professionale', '🥅', 12.9, 16.9, 'manico telescopico', 4.3, 'Rete profonda e manico fino a 3 metri: foglie e insetti via in due minuti.'),
('kit', 'accessori', 'Kit test pH e cloro', '🧪', 9.9, null, '80 strisce', 4.6, 'Immergi, aspetta 15 secondi, confronta i colori. Più semplice di così.'),
('robot', 'robot', 'Robot pulitore fondo', '🤖', 189, 229, 'Green · 2 anni garanzia', 4.5, 'Pulisce fondo e pareti da solo mentre tu fai altro. Il regalo che la tua schiena ti chiede.'),
('sale25', 'chimici', 'Sale speciale piscine 25 kg', '🧂', 18.9, null, 'purezza 99,9%', 4.7, 'Sale ad alta purezza per elettrolisi: si scioglie in fretta, senza residui.'),
('doccia', 'accessori', 'Doccia solare da giardino', '🚿', 119, 149, '35 L · Made in Italy', 4.4, 'Acqua calda gratis, scaldata dal sole. Il tuffo inizia meglio.'),
('pompacalore', 'pompe', 'EcoHeat Pompa di Calore 12 kW', '♨️', 1250, 1490, 'riscalda fino a 60 m³', 4.5, 'Allunga la stagione: acqua a 28 °C da maggio a settembre, consumando poco.'),
('luciled', 'luci', 'Faro LED subacqueo RGB', '💡', 39.9, 49.9, 'con telecomando', 4.6, 'Cambia colore alla piscina con un tasto. Montaggio senza attrezzi.'),
('filtro', 'accessori', 'Cartucce filtro (2 pezzi)', '🌀', 16.9, null, 'universali', 4.5, 'Ricambio per il filtro a cartuccia: una al mese e l''acqua ringrazia.')
on conflict (id) do update set
  category = excluded.category,
  name = excluded.name,
  emoji = excluded.emoji,
  price = excluded.price,
  old_price = excluded.old_price,
  badge = excluded.badge,
  rating = excluded.rating,
  description = excluded.description;
