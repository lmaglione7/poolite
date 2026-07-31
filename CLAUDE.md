# Poolite — contesto del progetto

App iOS (React Native + Expo) per proprietari di piscine private in Italia.
Posizionamento: *"l'app che si ripaga da sola"* — dice quanto costa la piscina
ogni giorno, quando accendere la pompa per spendere meno, e vende i prodotti
giusti al momento giusto. Tono: maggiordomo competente e solare, mai
e-commerce aggressivo.

## Struttura del repository

| Cartella | Cosa contiene |
|---|---|
| `poolite-app/` | **L'app.** È qui che si lavora. |
| `project/` | Prototipo originale in HTML (`Poolite.dc.html`) — riferimento visivo |
| `chats/` | Trascrizione della sessione di design che ha generato il prototipo |

Leggi anche **`poolite-app/AGENTS.md`** (vincoli sulla versione di Expo) e
**`poolite-app/README.md`** (architettura completa).

## ⚠️ Vincolo critico: Expo SDK 54.0.2

`expo` è bloccata alla versione **esatta** 54.0.2 per combaciare con la build
di Expo Go installata sul telefono di sviluppo. **Non alzare la versione**:
Expo Go supporta un solo SDK alla volta e ha i moduli nativi compilati
dentro. Vedi `poolite-app/AGENTS.md` e `poolite-app/RISOLUZIONE-EXPO-GO.md`.

## Stato attuale

### Funziona già, senza configurare nulla (modalità demo)
- Onboarding in 4 step → rivelazione costo → 5 tab (Oggi, Domani, Acqua, Shop, Tu)
- Costo giornaliero calcolato con **meteo reale** (Open-Meteo, senza API key)
  e tariffa elettrica configurabile
- Marketplace completo: ricerca con filtri, preferiti, giacenze, carrello,
  rubrica indirizzi, checkout, ordini con timeline di tracking
- Manuali prodotto stile IKEA, coupon fedeltà, referral 30 €, scorte automatiche
- Impostazioni, Termini e Privacy

### Richiede configurazione (`poolite-app/supabase/README.md`)
- **Supabase**: account veri, catalogo, carrello e ordini lato server
- **Stripe**: pagamenti reali (carta, Apple Pay, Google Pay)

I dati stanno su `AsyncStorage` finché `.env` non è compilato: ogni context in
`src/state/` ricade sui dati locali se Supabase non è configurato.

### Richiede una development build (non esiste in Expo Go)
- Widget Salvadanaio sulla home screen iOS (`targets/widget/`)
- Notifiche push programmate

`src/lib/widgetBridge.ts` non fa nulla se il modulo nativo manca: nessun crash.

## Cosa manca per vendere davvero

1. **Fatturazione elettronica (SDI)** — obbligo di legge in Italia
2. **Email transazionali** — conferma ordine e spedizione (serve scegliere il provider)
3. **Pannello admin** — oggi ordini e spedizioni si gestirebbero a mano su Supabase
4. **Traduzioni** — il selettore lingua esiste, i testi tradotti no
5. **Foto prodotto reali** — basta popolare `products.image_url`, il codice è pronto
6. **Revisione legale** di Termini e Privacy + dati societari tra `[parentesi]`
7. Test automatici, error tracking, analytics

## Principi da rispettare

- **L'ambra (`#E8A13C`) è sacra**: solo per euro risparmiati e offerte. Se è
  ovunque, non significa più niente.
- **Niente urgenza finta**: nessun countdown, nessuna ruota della fortuna. La
  fiducia è il prodotto. Le scarsità mostrate ("ultimi 4 pezzi") sono numeri veri.
- **Italiano semplicissimo**, da spiegare a un bambino. Mai gergo tecnico:
  non "kWh ottimizzati" ma "oggi la piscina ti costa 2,40 €".
- **Il numero più importante di ogni schermata** deve leggersi a 2 metri.
- Utente tipo: 45–65 anni, piscina in giardino, vuole capire al volo.

## Comandi utili

```sh
cd poolite-app
npm install
npx expo start          # QR per Expo Go
npm run reset           # pulizia totale se Expo Go fa storie
npm run check-sdk       # verifica quale sdkVersion viene annunciata
npx tsc --noEmit        # controllo tipi
npx expo export --platform web --output-dir /tmp/web   # verifica che il bundle compili
```
