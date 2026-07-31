# Poolite — aggiornare il repo e far partire l'app sul tuo PC

Stato attuale: su GitHub c'è solo il **primo** caricamento. Questo pacchetto
contiene tutto il lavoro successivo (engagement, manuali, legale, checkout,
ordini, indirizzi, giacenze, preferiti). Sono ~144 file.

---

## 1. Aggiorna il repository (5 minuti)

Apri il terminale (su Windows: **Git Bash** o PowerShell) e incolla una riga
per volta:

```bash
# Scarica il repo dove preferisci (es. nella cartella Documenti)
git clone https://github.com/lmaglione7/poolite.git
cd poolite
```

Ora **estrai questo zip** e copia i 4 elementi (`README.md`, `chats`,
`project`, `poolite-app`) **dentro la cartella `poolite`** che si è appena
creata, sovrascrivendo quando chiede.

Poi torna al terminale:

```bash
git add -A
git status          # controlla: dovresti vedere ~100 file aggiunti/modificati
git commit -m "App completa: engagement, manuali, checkout, ordini, indirizzi"
git push
```

Se `git push` chiede le credenziali: usa il tuo username GitHub e, come
password, un **Personal Access Token** (GitHub non accetta più la password
normale). Lo crei in 1 minuto su github.com → Settings → Developer settings →
Personal access tokens → Tokens (classic) → Generate new token → spunta `repo`.

Da qui in poi lavori normalmente: `git pull`, modifichi, `git commit`, `git push`.

---

## 2. Fai partire l'app (10 minuti)

Serve **Node.js 20 o superiore** ([nodejs.org](https://nodejs.org) — versione LTS).
Verifica con `node -v`.

```bash
cd poolite-app
npm install          # la prima volta ci mette qualche minuto
npx expo start
```

Si apre una pagina con un **QR code**. Sul telefono:

- **iPhone**: installa **Expo Go** dall'App Store, apri la fotocamera e
  inquadra il QR.
- **Android**: installa **Expo Go** dal Play Store e scansiona il QR dall'app.

L'app parte in **modalità demo**: onboarding, meteo reale, catalogo, carrello,
checkout e ordini funzionano già, con i dati salvati sul telefono.

> Telefono e computer devono essere sulla **stessa rete Wi-Fi**. Se non si
> collega, prova `npx expo start --tunnel`.

---

## 3. Cosa funziona già e cosa no

### Già funzionante senza configurare niente
- Onboarding, calcolo costi con **meteo reale** (Open-Meteo)
- Tutte e 5 le tab, manuali passo-passo, preferiti
- Carrello, indirizzi, checkout, ordini con tracking (dati locali)

### Serve configurazione (vedi `poolite-app/supabase/README.md`)
- **Account veri e database**: progetto Supabase + `.env`
- **Pagamenti veri**: account Stripe + `.env`

### Serve una development build (non funziona in Expo Go)
- **Widget Salvadanaio** sulla home screen iOS
- **Notifiche push** programmate

Per quelle due serve Xcode (Mac) o EAS Build:
```bash
npx expo prebuild -p ios --clean
npx expo run:ios
```

---

## 4. I loghi dei pagamenti

Quando li hai, mettili in `poolite-app/assets/img/pay/` con questi nomi:
`applepay.png`, `googlepay.png`, `visa.png`, `mastercard.png`, `amex.png`.

Poi apri `poolite-app/src/data/paymentLogos.ts` e **togli il commento** (`//`)
alle righe corrispondenti. I badge testuali diventano i marchi veri ovunque
nell'app, in un colpo solo.

---

## 5. Cosa manca ancora per vendere davvero

- Fatturazione elettronica (SDI) — obbligo di legge in Italia
- Email transazionali (conferma ordine, spedizione)
- Pannello admin per gestire ordini e spedizioni
- Traduzioni (il selettore lingua c'è, i testi tradotti no)
- Foto prodotto reali dal fornitore
- Revisione legale di Termini e Privacy + dati societari
