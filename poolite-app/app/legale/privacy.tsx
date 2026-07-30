import { LegalScreen } from '../../src/components/LegalScreen';

export default function PrivacyScreen() {
  return (
    <LegalScreen
      title="Informativa privacy"
      updated="30 luglio 2026"
      intro="Questa informativa spiega quali dati raccogliamo, perché, e cosa puoi fare per controllarli. È redatta ai sensi del Regolamento UE 2016/679 (GDPR). In breve: raccogliamo il minimo indispensabile per farti risparmiare, e non vendiamo i tuoi dati a nessuno."
      sections={[
        {
          heading: 'Titolare del trattamento',
          body: [
            '[Ragione Sociale S.r.l.], con sede in [indirizzo completo], P.IVA [numero]. Email: privacy@poolite.it · PEC: [pec].',
            'Responsabile della protezione dei dati (DPO), se nominato: [nome e contatti].',
          ],
        },
        {
          heading: 'Quali dati raccogliamo',
          body: [
            'Dati dell’account: indirizzo email e password (conservata solo in forma cifrata, non la vediamo mai).',
            'Dati della piscina: dimensioni, tipo di pompa, città, tipo di trattamento, risposte alla domanda del giorno e trattamenti registrati nel diario. Servono a calcolare i consigli.',
            'Dati di acquisto: prodotti ordinati, importi, indirizzo di spedizione, storico ordini e abbonamenti alle scorte.',
            'Dati di pagamento: gestiti direttamente da Stripe, PayPal, Klarna o Satispay. Noi riceviamo solo l’esito e gli ultimi 4 numeri della carta, mai il numero completo né il CVV.',
            'Dati tecnici: modello di dispositivo, versione dell’app e log di errore, solo se hai attivato le statistiche d’uso.',
          ],
        },
        {
          heading: 'Perché li usiamo e con quale base giuridica',
          body: [
            'Per fornirti il servizio e i consigli sulla piscina — esecuzione del contratto (art. 6.1.b GDPR).',
            'Per gestire ordini, spedizioni, resi e garanzie — esecuzione del contratto e obblighi di legge fiscali (art. 6.1.b e 6.1.c).',
            'Per le notifiche operative (fascia pompa, scorte in arrivo) — esecuzione del contratto; puoi disattivarle dalle Impostazioni in qualsiasi momento.',
            'Per email promozionali e notifiche di offerte — solo con il tuo consenso esplicito (art. 6.1.a), revocabile in ogni momento.',
            'Per le statistiche d’uso — solo con il tuo consenso, disattivato di default.',
            'Per i confronti anonimi di zona — legittimo interesse (art. 6.1.f) nel fornire un servizio comparativo; i dati sono aggregati e anonimizzati, e puoi comunque escluderti dalle Impostazioni.',
          ],
        },
        {
          heading: 'Con chi li condividiamo',
          body: [
            'Fornitore di infrastruttura e database: Supabase (server nell’Unione Europea).',
            'Pagamenti: Stripe, PayPal, Klarna, Satispay — ciascuno titolare autonomo per i dati di pagamento.',
            'Spedizioni: DHL, UPS, BRT, Poste Italiane, che ricevono solo i dati necessari alla consegna (nome, indirizzo, telefono).',
            'Meteo: Open-Meteo, che riceve solo coordinate geografiche approssimative della località, senza alcun identificativo personale.',
            'Tecnici: se invii una richiesta di intervento, condividiamo con il tecnico scelto il tuo nome, telefono, messaggio e i dati tecnici della piscina.',
            'Non vendiamo, affittiamo né cediamo i tuoi dati a terzi per finalità di marketing. Mai.',
          ],
        },
        {
          heading: 'Dove e per quanto tempo',
          body: [
            'I dati sono conservati su server situati nell’Unione Europea. Eventuali trasferimenti extra-UE avvengono solo verso paesi con decisione di adeguatezza o tramite Clausole Contrattuali Standard.',
            'Dati dell’account e della piscina: fino alla cancellazione dell’account, più 30 giorni tecnici di backup.',
            'Dati fiscali e di fatturazione: 10 anni, come richiesto dalla legge italiana.',
            'Log tecnici: massimo 12 mesi.',
          ],
        },
        {
          heading: 'I tuoi diritti',
          body: [
            'Hai diritto di accedere ai tuoi dati, correggerli, cancellarli, limitarne il trattamento, opporti al trattamento basato sul legittimo interesse e ricevere i tuoi dati in formato portabile.',
            'Puoi revocare in qualsiasi momento i consensi prestati, senza che ciò pregiudichi la liceità del trattamento precedente.',
            'Per esercitare questi diritti scrivi a privacy@poolite.it: rispondiamo entro 30 giorni.',
            'Hai inoltre diritto di proporre reclamo al Garante per la protezione dei dati personali (www.garanteprivacy.it).',
          ],
        },
        {
          heading: 'Minori',
          body: [
            'Il servizio non è rivolto a minori di 16 anni e non raccogliamo consapevolmente i loro dati. Se ritieni che un minore ci abbia fornito dati, scrivici e li elimineremo.',
          ],
        },
        {
          heading: 'Sicurezza',
          body: [
            'Usiamo cifratura in transito (TLS) e a riposo, accesso ai dati limitato per ruolo e regole di sicurezza a livello di riga sul database, in modo che ogni utente possa leggere solo i propri dati.',
            'In caso di violazione dei dati che comporti un rischio elevato per i tuoi diritti, ti informeremo senza ingiustificato ritardo, come previsto dall’art. 34 GDPR.',
          ],
        },
      ]}
    />
  );
}
