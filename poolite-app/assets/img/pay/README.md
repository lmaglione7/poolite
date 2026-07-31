# Loghi dei metodi di pagamento

Lascia qui i file ufficiali scaricati dai brand: l'app li mostra da sola al
posto del badge testuale, senza toccare il codice.

## Nomi file attesi (PNG con sfondo trasparente, oppure SVG)

| File            | Marchio          | Dove scaricarlo                                                    |
|-----------------|------------------|--------------------------------------------------------------------|
| `applepay.png`  | Apple Pay        | Apple Identity Guidelines for Apple Pay (developer.apple.com)       |
| `googlepay.png` | Google Pay       | Google Pay Brand Guidelines (developers.google.com/pay)             |
| `visa.png`      | Visa             | Visa Product Brand Standards                                        |
| `mastercard.png`| Mastercard       | Mastercard Brand Center                                             |
| `amex.png`      | American Express | American Express Merchant Brand Guidelines                          |
| `card.png`      | (opzionale)      | Icona generica carta, se preferisci un'unica immagine per "Carta"   |

## Regole d'oro

- **Non ridisegnare né modificare i marchi**: colori, proporzioni e spazio
  libero attorno sono vincolati dalle linee guida di ciascun brand.
- Usa i PNG a **2x o 3x** (es. altezza 96 px) così restano nitidi sui display Retina.
- Apple richiede che il pulsante Apple Pay usi il componente nativo di sistema
  al momento del pagamento: questi loghi servono solo come indicazione dei
  metodi accettati (schermate carrello/checkout/impostazioni).

Dopo aver aggiunto i file, registra l'import in `src/data/paymentLogos.ts`
(c'è già una riga commentata per ognuno: basta toglierle il commento).
