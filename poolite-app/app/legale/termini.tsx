import { LegalScreen } from '../../src/components/LegalScreen';
import { FREE_SHIPPING_MIN, FAST_SHIPPING_MIN } from '../../src/data/commerce';
import { REFERRAL_REWARD } from '../../src/state/RewardsContext';

export default function TerminiScreen() {
  return (
    <LegalScreen
      title="Termini e condizioni"
      updated="30 luglio 2026"
      intro="Questi termini regolano l'uso dell'app Poolite e gli acquisti nel negozio integrato. Li abbiamo scritti in italiano semplice: se qualcosa non è chiaro, scrivici e te lo spieghiamo."
      sections={[
        {
          heading: 'Chi siamo',
          body: [
            'Poolite è un servizio di [Ragione Sociale S.r.l.], con sede in [indirizzo completo], P.IVA [numero], iscritta al Registro Imprese di [città] al n. [numero]. Email di contatto: supporto@poolite.it · PEC: [pec].',
            'Il servizio è attualmente disponibile solo per utenti residenti in Italia. Tutti i prezzi sono espressi in Euro (€) e includono l’IVA italiana al 22% dove applicabile.',
          ],
        },
        {
          heading: 'Cosa fa (e cosa non fa) l’app',
          body: [
            'Poolite stima il costo di esercizio della tua piscina e ti consiglia le ore di filtrazione più convenienti, usando i dati meteo della tua località e i dati che ci fornisci sulla piscina.',
            'Le stime sono indicative e basate su un prezzo dell’energia configurabile: non sostituiscono la tua bolletta reale né una consulenza tecnica professionale. Poolite non è responsabile di danni derivanti da un uso improprio dei consigli forniti.',
            'I consigli sui trattamenti chimici non sostituiscono le istruzioni del produttore riportate sulla confezione, che prevalgono sempre.',
          ],
        },
        {
          heading: 'Account',
          body: [
            'Per acquistare devi creare un account fornendo un indirizzo email valido. Sei responsabile della riservatezza delle tue credenziali e delle attività svolte tramite il tuo account.',
            'Devi avere almeno 18 anni per acquistare. Puoi chiedere la cancellazione dell’account in qualsiasi momento scrivendo a supporto@poolite.it.',
          ],
        },
        {
          heading: 'Ordini e prezzi',
          body: [
            'Ogni ordine è una proposta d’acquisto: il contratto si conclude quando ti inviamo la conferma d’ordine via email.',
            'I prezzi mostrati sono comprensivi di IVA. Ci riserviamo di correggere errori di prezzo evidenti, avvisandoti prima della spedizione e lasciandoti libero di annullare.',
            'La disponibilità dei prodotti non è garantita fino alla conferma: se un articolo non è disponibile ti rimborsiamo integralmente entro 14 giorni.',
          ],
        },
        {
          heading: 'Pagamenti',
          body: [
            'Accettiamo carte di credito e debito (Visa, Mastercard, American Express), Apple Pay e Google Pay. Tutti i pagamenti sono gestiti da Stripe: Poolite non memorizza mai i dati completi della tua carta, che viaggiano cifrati direttamente verso il processore.',
            'L’addebito avviene al momento della conferma dell’ordine. In caso di annullamento o reso, il rimborso viene effettuato sullo stesso metodo di pagamento usato per l’acquisto.',
          ],
        },
        {
          heading: 'Spedizioni',
          body: [
            `Spediamo in tutta Italia, isole comprese, tramite DHL Express, UPS, BRT (Bartolini) e Poste Italiane. Il corriere viene scelto in base alla destinazione e all’ingombro.`,
            `Spedizione standard gratuita per ordini superiori a ${FREE_SHIPPING_MIN} €. Spedizione express gratuita (consegna in 24/48 ore lavorative) per ordini superiori a ${FAST_SHIPPING_MIN} €. Sotto queste soglie il costo esatto è mostrato nel carrello prima del pagamento.`,
            'Gli ordini confermati entro le 12:00 di un giorno lavorativo vengono normalmente affidati al corriere lo stesso giorno. I tempi di consegna sono indicativi e non includono ritardi imputabili al corriere, festività o cause di forza maggiore.',
            'Prodotti voluminosi (pompe di calore, docce solari) possono richiedere tempi più lunghi e consegna su strada: te lo indichiamo nella scheda prodotto.',
          ],
        },
        {
          heading: 'Diritto di recesso e resi',
          body: [
            'Come consumatore hai diritto di recedere entro 14 giorni dalla consegna senza doverne indicare il motivo (art. 52 Codice del Consumo). Noi lo estendiamo volontariamente a 30 giorni.',
            'Per esercitarlo, scrivi a resi@poolite.it o usa la funzione dedicata nell’app. Il rimborso avviene entro 14 giorni dal ricevimento del reso, con lo stesso metodo di pagamento usato.',
            'Il prodotto va restituito integro, nella confezione originale. Per ragioni igieniche e di sicurezza, i prodotti chimici sigillati non sono restituibili una volta aperti.',
            'La garanzia legale di conformità di 24 mesi si applica a tutti i prodotti venduti.',
          ],
        },
        {
          heading: 'Scorte automatiche',
          body: [
            'La “scorta automatica” è un abbonamento a consegna ricorrente con lo sconto indicato sul prodotto. Ti avvisiamo con notifica 3 giorni prima di ogni spedizione.',
            'Puoi saltare una consegna, metterla in pausa o disattivarla in qualsiasi momento dalla sezione “Le tue scorte”, senza costi né penali. Le modifiche effettuate dopo la partenza della spedizione valgono dalla consegna successiva.',
          ],
        },
        {
          heading: 'Coupon, premi e inviti',
          body: [
            'I coupon fedeltà si sbloccano automaticamente al raggiungimento del numero di ordini indicato nella sezione Premi, e sono validi sull’ordine successivo nel rispetto della spesa minima indicata.',
            `Il programma “invita un amico” riconosce ${REFERRAL_REWARD} € di sconto sul tuo prossimo ordine per ogni amico che si registra tramite il tuo link personale e completa la registrazione. Non è cumulabile con sé stesso sullo stesso ordine.`,
            'I coupon non sono cedibili né convertibili in denaro. In caso di reso di un ordine su cui è stato applicato un coupon, il rimborso corrisponde all’importo effettivamente pagato.',
            'Ci riserviamo di annullare coupon ottenuti con registrazioni fittizie o comportamenti fraudolenti.',
          ],
        },
        {
          heading: 'Tecnici e servizi di terzi',
          body: [
            'I tecnici presenti nella directory sono professionisti indipendenti, non dipendenti né agenti di Poolite. La richiesta di intervento tramite l’app è gratuita e senza impegno.',
            'Il contratto per il servizio si conclude direttamente tra te e il tecnico: Poolite non è parte del rapporto e non risponde dell’esecuzione dei lavori. Verifichiamo l’iscrizione e le recensioni, ma la scelta resta tua.',
          ],
        },
        {
          heading: 'Recensioni',
          body: [
            'Pubblichiamo solo recensioni di clienti che hanno effettivamente acquistato il prodotto tramite Poolite, come richiesto dalla normativa europea sulla trasparenza (Direttiva Omnibus).',
            'Non modifichiamo né cancelliamo recensioni negative autentiche. Rimuoviamo solo contenuti offensivi, diffamatori, fuori tema o contenenti dati personali di terzi.',
          ],
        },
        {
          heading: 'Modifiche e legge applicabile',
          body: [
            'Possiamo aggiornare questi termini: ti avviseremo in app delle modifiche sostanziali almeno 15 giorni prima che siano efficaci.',
            'Si applica la legge italiana. Per i consumatori è competente il foro del luogo di residenza o domicilio. È inoltre disponibile la piattaforma europea ODR per la risoluzione online delle controversie.',
          ],
        },
      ]}
    />
  );
}
