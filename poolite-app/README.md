# Poolite

React Native (Expo + Expo Router, TypeScript) implementation of the Poolite
design prototype (`../project/Poolite.dc.html` in this repo).

## Run it

```sh
npm install
npx expo start
```

Scan the QR with Expo Go, or press `i`/`a` for a simulator. The app works
fully in **demo mode** with no setup: onboarding, weather (live, via
Open-Meteo), and the Shop catalog all work locally on-device.

> **Expo SDK 54** — pinned on purpose. Expo Go from the App Store supports one
> SDK at a time, so the project must match it or the phone shows *"Project is
> incompatible with this version of Expo Go"*. See `AGENTS.md` before bumping.

To turn on real accounts, a real Postgres-backed marketplace, and real
Stripe payments, follow **`supabase/README.md`** and fill in `.env` (copy
from `.env.example`).

## Structure

```
app/                  Expo Router screens (file-based routing)
  onboarding/          4-step wizard (pool size, pump, city, treatment)
  reveal.tsx           "your pool costs you ~X/day" cost reveal + welcome gocce
  loading.tsx          "reading the weather…" transition
  (auth)/              login / signup (only shown once Supabase is configured)
  (tabs)/              Oggi · Domani · Acqua · Shop · Tu, floating pill tab bar
    shop/               nested stack: catalog, product detail, cart/checkout
  dev-menu.tsx          hidden QA screen (long-press the logo on any tab)
src/
  theme/                colors, typography
  components/           shared UI (Card, WaveDivider, ProductImage, …)
  state/                React Context: auth, pool profile, cart, dev overrides
  hooks/                weather/cost calc, catalog, water state, …
  lib/                  Supabase client, Open-Meteo client, pool-cost math
  data/                 product catalog + SVG asset map
supabase/
  migrations/           SQL schema + seed data
  functions/            create-payment-intent / stripe-webhook (Deno edge functions)
```

## Design-fidelity notes

Ported pixel-for-pixel from the prototype's palette, type scale, card radii,
and wave divider — see `src/theme/colors.ts`. A few things were necessarily
turned from hardcoded demo numbers into real computed/live values, per
product decisions made while scoping this build:

- **Weather**: live via Open-Meteo (no key). The "momento giusto" pump
  window is the sunniest contiguous window of the required length, computed
  from real hourly solar radiation.
- **Cost estimate**: real formula (pump flow rate/wattage by HP × pool
  volume × a single configurable `EXPO_PUBLIC_ELECTRICITY_RATE`), not a
  metered spot-price feed — see `supabase/README.md`.
- **Accounts/marketplace/payments**: real Supabase (Postgres + Auth) and
  Stripe, once configured. Falls back to on-device demo data until then.
- **Dev menu** (long-press the logo): the shipped equivalent of the
  prototype's "Tweaks" panel — forces net-error / acqua-verde for QA.

## Engagement & marketplace v2

Built on the Hooked model (trigger → action → variable reward → investment)
and Cold Start network-effect thinking:

- **Pump-window notification** (`src/lib/notifications.ts`): one daily local
  notification at the start of the optimal window, with the day's savings —
  the external trigger. Rescheduled from real forecast data on each app open.
- **Weekly report + milestones**: `/report` modal (weekly savings, vs last
  week, zone percentile) and a confetti overlay when cumulative savings cross
  25/50/100€… (`src/components/MilestoneOverlay.tsx`). Real numbers only.
- **Anonymous zone comparison**: "better than N% of pools in {city}" card on
  Oggi + percentile detail on Tu. `src/lib/zoneStats.ts` derives stable
  plausible stats until the backend can aggregate real users.
- **Contextual verified reviews**: every review carries the reviewer's pool
  context ("Piscina media · sale · Monza") — `src/data/reviews.ts`, table
  `product_reviews`.
- **Local technicians**: verified directory + free "richiedi intervento" form
  (`shop/tecnici`, tables `technicians`/`service_requests`).
- **Smart refills** ("Scorta automatica −10%"): frequency suggested from the
  user's own treatment diary, pause/skip anytime (`shop/scorte`,
  `SubscriptionsContext`, table `subscriptions`), reminder 3 days before.
- **Next-day delivery badge** on product + cart (UI only — negotiate with the
  supplier before enabling for real).

## Commerce, contenuti e conformità

- **Foto prodotto reali**: `products.image_url` (migrazione 0004). L'app carica
  la foto quando c'è e ricade sull'illustrazione piatta finché non ci sono —
  basta popolare la colonna con gli URL del fornitore, nessun codice da toccare.
- **Manuali passo-passo** (`app/manuale/[id].tsx`, dati in `src/data/manuals.ts`):
  libretto stile IKEA/LEGO, un'azione per schermata, numero gigante, dosaggi
  per volume piscina, avvertenze di sicurezza e consiglio finale. 13 manuali,
  uno per prodotto.
- **Coupon e inviti** (`RewardsContext`, `app/premi.tsx`): scala fedeltà
  1/3/5/10/20 ordini → −5/10/15/30/50 €, più 30 € per ogni amico iscritto col
  proprio link. Il coupon migliore si applica da solo al carrello; l'importo
  viene **rivalidato lato server** nella edge function (mai fidarsi del client).
- **Spedizioni e pagamenti** (`src/data/commerce.ts`): DHL, UPS, BRT, Poste
  Italiane; carta, Apple Pay e Google Pay — tutto via Stripe (vedi
  "Pagamenti" più sotto). Gratis sopra 39 €, **express gratis sopra 99 €**,
  con barra di avanzamento nel carrello. I nomi dei corrieri sono badge
  testuali: i loghi ufficiali si inseriscono con i media kit dei partner
  quando gli accordi sono firmati.
- **Impostazioni** (`app/impostazioni.tsx`): lingua (italiano attivo, altre
  4 predisposte), paese Italia, valuta EUR, controllo granulare delle
  notifiche, consensi privacy (analytics e marketing **off di default**).
- **Termini e Privacy** (`app/legale/`): bozze complete e ragionate su GDPR e
  Codice del Consumo (recesso 30 giorni, garanzia 24 mesi, tecnici
  terzi, recensioni verificate). **Da far revisionare a un legale** e completare
  con i dati societari tra `[parentesi quadre]` prima della pubblicazione.

## iOS home-screen widget (Salvadanaio)

`targets/widget/` is a WidgetKit extension (via `@bacons/apple-targets`)
showing cumulative savings, updated by the app through the shared App Group
(`src/lib/widgetBridge.ts`). It requires a **development build** — it does
not exist in Expo Go or on web:

```sh
npx expo prebuild -p ios --clean
npx expo run:ios   # needs Xcode; set your Apple team in app.json if prompted
```

The bridge no-ops safely everywhere the native module is absent.

## Customer journey (stile marketplace)

Il ciclo commerciale completo, dalla vetrina alla consegna:

1. **Scoperta** — ricerca con match tollerante ad accenti/maiuscole su nome,
   badge e descrizione; filtri (categoria, solo offerte, solo disponibili) e
   ordinamento (rilevanza, più venduti, prezzo, recensioni); contatore risultati.
2. **Prodotto** — foto reale o illustrazione, cuore preferiti, "N venduti",
   disponibilità onesta (`🔥 Ultimi N pezzi`, `Esaurito` con CTA disabilitata),
   recensioni contestuali, manuale passo-passo, scorta automatica.
3. **Carrello** — barra di avanzamento verso spedizione gratis/express,
   coupon migliore applicato in automatico, poi "Procedi all'ordine".
4. **Checkout** (`shop/checkout`) — indirizzo selezionabile, velocità di
   spedizione con costo calcolato, metodo di pagamento, riepilogo e totale.
   Tutto su una schermata, come i marketplace: niente wizard a step ciechi.
5. **Conferma** — numero ordine, data di consegna prevista, link al tracking.
6. **Post-vendita** (`ordini/`) — lista con filtri per stato, dettaglio con
   **timeline di tracking** (confermato → in preparazione → spedito →
   consegnato), riepilogo costi, indirizzo, "Ordina di nuovo" e assistenza.

### Indirizzi (`app/indirizzi/`)
Rubrica con etichette (Casa/Ufficio/Altro), validazione **CAP a 5 cifre**,
**sigla provincia** verificata sull'elenco reale, telefono, note per il
corriere e indirizzo predefinito. L'indirizzo viene **fotografato
sull'ordine** (`orders.shipping_address` jsonb): modificarlo in rubrica non
riscrive la storia delle spedizioni passate.

### Giacenze
`products.stock` guida i badge in UI e viene **decrementato lato server** con
la funzione atomica `reserve_stock()` prima di creare il PaymentIntent: se le
scorte non bastano l'ordine viene annullato e il cliente non paga.

### Pagamenti
Tutto passa da **Stripe**: carta (Visa/Mastercard/Amex), **Apple Pay** e
**Google Pay** come wallet Stripe. Un solo processore = una sola
riconciliazione e un solo flusso di rimborso.
I loghi ufficiali si aggiungono lasciando i file in `assets/img/pay/`
(vedi il README lì) e togliendo il commento alla riga corrispondente in
`src/data/paymentLogos.ts`: l'app passa da badge testuale a marchio reale
ovunque, senza altre modifiche.
