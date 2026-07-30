// IKEA/LEGO-style instruction booklets: one step per screen, big number,
// one action per step, imperative sentences a child could follow. Warnings
// and dosage tables where it matters — nothing left to chance.

export interface ManualStep {
  emoji: string;
  title: string;
  text: string;
  warning?: string;
}

export interface DosageRow {
  pool: string;
  dose: string;
}

export interface ProductManual {
  productId: string;
  tagline: string;
  timeNeeded: string;
  difficulty: 'Facilissimo' | 'Facile' | 'Medio';
  youNeed: string[];
  steps: ManualStep[];
  dosage?: { title: string; rows: DosageRow[] };
  safety: string[];
  proTip: string;
}

export const MANUALS: ProductManual[] = [
  {
    productId: 'shock',
    tagline: 'Da acqua verde ad azzurra in 24 ore',
    timeNeeded: '10 minuti + una notte',
    difficulty: 'Facile',
    youNeed: ['Guanti di gomma', 'Un secchio pulito', 'La pompa funzionante'],
    steps: [
      { emoji: '🧤', title: 'Metti i guanti', text: 'Sempre, prima di toccare qualsiasi prodotto chimico.' },
      { emoji: '🌅', title: 'Aspetta la sera', text: 'Il trattamento shock si fa al tramonto: il sole distruggerebbe metà del cloro.' },
      { emoji: '⚖️', title: 'Pesa la dose', text: 'Guarda la tabella qui sotto: la dose dipende da quanta acqua ha la tua piscina. L’app la sa già.' },
      { emoji: '🪣', title: 'Sciogli nel secchio', text: 'Riempi il secchio con acqua della piscina, versa il prodotto NEL secchio (mai il contrario) e mescola 1 minuto.', warning: 'Mai versare acqua sul prodotto: sempre il prodotto nell’acqua.' },
      { emoji: '💧', title: 'Versa lungo i bordi', text: 'Cammina lentamente lungo il perimetro versando la soluzione, davanti alle bocchette di mandata.' },
      { emoji: '🔄', title: 'Pompa accesa tutta la notte', text: 'Lascia filtrare almeno 8 ore di fila. È il passaggio che fa la differenza.' },
      { emoji: '🌊', title: 'Controlla al mattino', text: 'Acqua azzurrina ma torbida? Perfetto, è normale: le alghe morte sono in sospensione. Il filtro le catturerà in giornata.' },
      { emoji: '🧪', title: 'Testa prima di tuffarti', text: 'Aspetta che il cloro torni sotto 3 mg/L (kit test) prima di fare il bagno. Di solito 24–48 ore.' },
    ],
    dosage: {
      title: 'Dose: 15 g per m³ d’acqua',
      rows: [
        { pool: 'Piscina piccola (~10 m³)', dose: '150 g' },
        { pool: 'Piscina media (~25 m³)', dose: '375 g' },
        { pool: 'Piscina grande (~45 m³)', dose: '675 g' },
        { pool: 'Grandissima (60+ m³)', dose: '900 g o più' },
      ],
    },
    safety: [
      'Tieni il prodotto chiuso, all’asciutto, lontano da bambini e animali',
      'Non mescolare MAI con altri prodotti chimici',
      'Se finisce negli occhi: sciacqua 15 minuti con acqua corrente e chiama il medico',
    ],
    proTip: 'Il giorno dopo lo shock, aggiungi l’antialghe: così il verde non torna più.',
  },
  {
    productId: 'antialghe',
    tagline: 'Lo scudo settimanale contro il verde',
    timeNeeded: '5 minuti',
    difficulty: 'Facilissimo',
    youNeed: ['Il misurino (è nel tappo)', 'Guanti'],
    steps: [
      { emoji: '📅', title: 'Scegli il giorno fisso', text: 'Ogni settimana, sempre lo stesso giorno. L’app te lo ricorda se registri il trattamento nel diario.' },
      { emoji: '🧤', title: 'Guanti e misurino', text: 'Svita il tappo: è anche il misurino. Una tacca = 100 ml.' },
      { emoji: '⚖️', title: 'Misura la dose', text: 'Dose normale: 30 ml per 10 m³. Dopo uno shock o con acqua sopra i 28 °C: dose doppia la prima volta.' },
      { emoji: '💧', title: 'Versa davanti alle bocchette', text: 'A pompa accesa, versa il liquido nei punti dove l’acqua si muove: si distribuisce da solo.' },
      { emoji: '🔄', title: 'Filtra 2 ore', text: 'Lascia la pompa accesa almeno 2 ore. Poi puoi fare il bagno normalmente.' },
    ],
    dosage: {
      title: 'Dose settimanale: 30 ml per 10 m³',
      rows: [
        { pool: 'Piscina piccola (~10 m³)', dose: '30 ml' },
        { pool: 'Piscina media (~25 m³)', dose: '75 ml' },
        { pool: 'Piscina grande (~45 m³)', dose: '135 ml' },
      ],
    },
    safety: ['Non ingerire', 'Lava le mani dopo l’uso', 'Conserva in luogo fresco, al riparo dal sole'],
    proTip: 'La costanza batte la quantità: metà dose ogni settimana funziona meglio di dose doppia ogni due.',
  },
  {
    productId: 'cloro5',
    tagline: 'Una pastiglia a settimana, acqua sempre a posto',
    timeNeeded: '2 minuti a settimana',
    difficulty: 'Facilissimo',
    youNeed: ['Lo skimmer (o un dosatore galleggiante)', 'Guanti'],
    steps: [
      { emoji: '🧤', title: 'Guanti, sempre', text: 'Anche solo per una pastiglia.' },
      { emoji: '🍩', title: 'Una pastiglia nello skimmer', text: 'Apri il coperchio dello skimmer e appoggia la pastiglia nel cestello. Per piscine sotto i 15 m³: mezza pastiglia.', warning: 'Mai lanciare la pastiglia direttamente in acqua: macchia il fondo.' },
      { emoji: '🔄', title: 'La pompa fa il resto', text: 'La pastiglia si scioglie piano (5–7 giorni) e le 4 azioni lavorano da sole: disinfetta, previene alghe, chiarifica, stabilizza il pH.' },
      { emoji: '👀', title: 'Controlla ogni settimana', text: 'Quando la pastiglia è finita, mettine una nuova. Con l’app: registra "Cloro" nel diario e ci pensa lei a ricordartelo.' },
      { emoji: '🧪', title: 'Test quindicinale', text: 'Ogni 2 settimane, striscia test: cloro tra 1 e 3 mg/L, pH tra 7,2 e 7,6. Se sballa, l’app ti dice cosa fare.' },
    ],
    safety: ['Conserva il secchio ben chiuso e all’asciutto', 'Non mescolare con altri prodotti', 'Tieni lontano da fonti di calore'],
    proTip: 'D’estate sopra i 30 °C il cloro si consuma più in fretta: controlla la pastiglia ogni 4–5 giorni invece che 7.',
  },
  {
    productId: 'floc',
    tagline: 'Acqua torbida? Limpida in una notte',
    timeNeeded: '2 minuti + una notte',
    difficulty: 'Facilissimo',
    youNeed: ['Lo skimmer', 'Niente altro'],
    steps: [
      { emoji: '🌫', title: 'Riconosci il momento', text: 'Acqua lattiginosa, si vede male il fondo? È il momento del flocculante.' },
      { emoji: '💊', title: 'Una cartuccia nello skimmer', text: 'Apri la confezione, metti UNA cartuccia nel cestello dello skimmer. Fine.' },
      { emoji: '🔄', title: 'Pompa accesa tutta la notte', text: 'Il flocculante “appiccica” le micro-particelle tra loro: diventano abbastanza grandi da farsi catturare dal filtro.' },
      { emoji: '🧽', title: 'Pulisci il filtro al mattino', text: 'Il filtro avrà catturato tutto: fai un controlavaggio (sabbia) o sciacqua la cartuccia filtrante.' },
      { emoji: '✨', title: 'Goditi l’acqua cristallina', text: 'Se dopo 24 ore è ancora torbida, ripeti con una seconda cartuccia. Persiste? Chiedi a un tecnico dall’app.' },
    ],
    safety: ['Non aprire la cartuccia: va usata intera', 'Tieni lontano dai bambini'],
    proTip: 'Torbida spesso? Quasi sempre è il pH troppo alto: testa e correggi prima, il flocculante dopo.',
  },
  {
    productId: 'telo',
    tagline: 'Montato in 15 minuti, si ripaga in un mese',
    timeNeeded: '15 minuti la prima volta, poi 2',
    difficulty: 'Facile',
    youNeed: ['Una seconda persona (consigliata)', 'Metro (solo la prima volta)'],
    steps: [
      { emoji: '📦', title: 'Srotola vicino alla piscina', text: 'Apri il telo sul prato, lato bolle/isolante rivolto verso di te (andrà a contatto con l’acqua).' },
      { emoji: '🧭', title: 'Orienta il lato lungo', text: 'Allinea il lato lungo del telo al lato lungo della piscina.' },
      { emoji: '🌊', title: 'Appoggia sull’acqua', text: 'In due, uno per lato: appoggiate il telo sull’acqua, bolle in giù. Deve galleggiare, non essere teso.', warning: 'Il telo estivo NON è un dispositivo di sicurezza: non camminarci sopra, non sostituire mai la sorveglianza dei bambini.' },
      { emoji: '✂️', title: 'Su misura (solo se serve)', text: 'Se sborda, segna con un pennarello e taglia con forbici robuste seguendo il bordo interno della piscina.' },
      { emoji: '🌅', title: 'Metti la sera, togli la mattina', text: 'Copri al tramonto, scopri quando vuoi fare il bagno. Meno evaporazione, acqua più calda, meno cloro consumato.' },
      { emoji: '🧹', title: 'Una volta a settimana', text: 'Sciacqualo con acqua dolce e lascialo asciugare all’ombra prima di ripiegarlo se non lo usi.' },
    ],
    safety: ['Mai lasciare bambini vicino alla piscina coperta senza sorveglianza', 'Rimuovi l’acqua piovana accumulata sopra il telo'],
    proTip: 'Con il telo messo ogni notte risparmi fino al 60% di evaporazione: l’app lo conteggia nel salvadanaio.',
  },
  {
    productId: 'retino',
    tagline: 'Due minuti al giorno, piscina sempre pulita',
    timeNeeded: '2 minuti al giorno',
    difficulty: 'Facilissimo',
    youNeed: ['Solo le tue mani'],
    steps: [
      { emoji: '🔧', title: 'Monta il manico', text: 'Infila il manico telescopico nella testa del retino finché non senti "click". Allunga alla misura che ti serve.' },
      { emoji: '🍃', title: 'Prima la superficie', text: 'Passa il retino a pelo d’acqua con movimenti lenti a "S": foglie e insetti restano nella rete.' },
      { emoji: '🕳', title: 'Poi il fondo', text: 'La rete profonda arriva sul fondo: passala come una scopa, lentamente per non sollevare la sporcizia.' },
      { emoji: '🗑', title: 'Svuota lontano', text: 'Svuota la rete nel bidone, non sul prato: il vento riporterebbe tutto in acqua.' },
      { emoji: '🚿', title: 'Sciacqua e riponi', text: 'Un getto d’acqua dolce e all’ombra: la rete dura anni.' },
    ],
    safety: ['Controlla che il click di aggancio sia completo prima di usarlo sul fondo'],
    proTip: 'Il momento migliore è la mattina presto, prima che il sole "cuocia" le foglie sul fondo.',
  },
  {
    productId: 'kit',
    tagline: 'Sai sempre come sta la tua acqua, in 15 secondi',
    timeNeeded: '1 minuto',
    difficulty: 'Facilissimo',
    youNeed: ['Mani asciutte'],
    steps: [
      { emoji: '🖐', title: 'Mani asciutte', text: 'L’umidità falsa le strisce: asciugati bene prima di aprire il flacone.' },
      { emoji: '📏', title: 'Prendi UNA striscia', text: 'Estraila e richiudi subito il flacone: l’aria umida rovina le altre.' },
      { emoji: '💧', title: 'Immergi 2 secondi', text: 'A 30 cm dal bordo e 30 cm di profondità, lontano dalle bocchette. Immergi e togli senza scuotere.' },
      { emoji: '⏱', title: 'Aspetta 15 secondi', text: 'Tieni la striscia orizzontale. Non scuoterla, non toccare i quadratini.' },
      { emoji: '🎨', title: 'Confronta i colori', text: 'Avvicina la striscia alla scala sul flacone. Cloro ideale: 1–3 mg/L. pH ideale: 7,2–7,6.' },
      { emoji: '📱', title: 'Registra nell’app', text: 'Rispondi alla domanda del giorno o registra il trattamento: più dati mi dai, meglio ti consiglio.' },
    ],
    safety: ['Non toccare i reagenti con le dita', 'Conserva sotto i 30 °C'],
    proTip: 'Testa sempre alla stessa ora (ideale: mattina) per confronti affidabili giorno su giorno.',
  },
  {
    productId: 'robot',
    tagline: 'Lui pulisce, tu ti rilassi',
    timeNeeded: '5 minuti + 2 ore di lavoro suo',
    difficulty: 'Facile',
    youNeed: ['Una presa elettrica con salvavita', 'La piscina senza bagnanti'],
    steps: [
      { emoji: '🔌', title: 'Collega alla centralina', text: 'Attacca il cavo del robot alla sua centralina, e la centralina alla presa. Il cavo galleggiante deve essere tutto srotolato.', warning: 'Solo prese protette da salvavita (differenziale). In dubbio? Chiedi a un elettricista.' },
      { emoji: '🌊', title: 'Immergilo piano', text: 'Caccia l’aria: inclinalo sott’acqua finché non escono più bolle, poi lascialo scendere sul fondo.' },
      { emoji: '▶️', title: 'Premi start', text: 'Dalla centralina, avvia il ciclo. Il robot mappa la piscina da solo: fondo, pareti e linea d’acqua.' },
      { emoji: '🚫', title: 'Nessuno in acqua', text: 'Durante il ciclo (circa 2 ore) niente bagni: è una regola di sicurezza, sempre.' },
      { emoji: '🧺', title: 'Svuota il cestello', text: 'A fine ciclo tira su il robot con la maniglia (mai dal cavo!), apri il cestello e svuotalo. Sciacqualo col tubo.' },
      { emoji: '🌳', title: 'Riponi all’ombra', text: 'Robot e cavo all’ombra, cavo arrotolato largo senza pieghe strette.' },
    ],
    safety: ['MAI tirare il robot dal cavo', 'MAI usarlo con persone in acqua', 'Scollega dalla corrente prima di toccare il cestello'],
    proTip: 'Fallo lavorare di notte con la tariffa elettrica più bassa: l’app ti dice la fascia più economica.',
  },
  {
    productId: 'sale25',
    tagline: 'Il carburante puro del tuo impianto a sale',
    timeNeeded: '10 minuti',
    difficulty: 'Facile',
    youNeed: ['L’elettrolizzatore spento', 'Un aiuto per sollevare il sacco (25 kg!)'],
    steps: [
      { emoji: '🧪', title: 'Misura prima il sale attuale', text: 'Il display dell’elettrolizzatore (o una striscia test sale) ti dice i g/L attuali. Ideale: 3–5 g/L secondo il tuo impianto.' },
      { emoji: '🧮', title: 'Calcola quanto aggiungere', text: 'Servono 10 kg per alzare di 1 g/L una piscina da 10 m³. Esempio: piscina 25 m³ da 2,5 a 3,5 g/L = 25 kg, un sacco intero.' },
      { emoji: '⏸', title: 'Spegni l’elettrolizzatore', text: 'La cella non deve lavorare mentre il sale si scioglie: rischia di leggere valori sballati.', warning: 'Lascia la POMPA accesa: è l’elettrolizzatore che va spento.' },
      { emoji: '🌊', title: 'Versa lungo i bordi', text: 'Distribuisci il sale camminando lungo il perimetro, mai tutto in un punto.' },
      { emoji: '🔄', title: 'Filtra 24 ore', text: 'Pompa accesa un giorno intero: il sale si scioglie completamente.' },
      { emoji: '▶️', title: 'Riaccendi e verifica', text: 'Riattiva l’elettrolizzatore e controlla che legga il valore atteso.' },
    ],
    safety: ['Solleva il sacco in due o trascinalo: 25 kg sono tanti', 'Sale specifico per piscine, mai sale da cucina'],
    proTip: 'Il sale non evapora: lo perdi solo con controlavaggi e schizzi. Se il livello cala spesso, controlla le perdite.',
  },
  {
    productId: 'doccia',
    tagline: 'Acqua calda gratis, scaldata dal sole',
    timeNeeded: '30 minuti, una volta sola',
    difficulty: 'Medio',
    youNeed: ['Cacciavite', 'Chiave inglese', 'Tubo da giardino', 'Base piana e soleggiata'],
    steps: [
      { emoji: '📍', title: 'Scegli il punto giusto', text: 'Pavimento piano, sole diretto almeno 6 ore al giorno, vicino alla piscina e a un rubinetto.' },
      { emoji: '🔩', title: 'Fissa la base', text: 'Avvita la colonna alla base con le viti in dotazione. Su prato: usa la piastra di ancoraggio inclusa.' },
      { emoji: '🚰', title: 'Collega il tubo', text: 'Attacco rapido da giardino standard: click e sei collegato. Apri l’acqua e controlla che non goccioli.' },
      { emoji: '☀️', title: 'Lascia scaldare', text: 'Il serbatoio da 35 L scalda in 2–3 ore di sole pieno. Fino a 60 °C in piena estate!', warning: 'Prima di ogni doccia, testa la temperatura con la mano: d’estate l’acqua può essere MOLTO calda. C’è il miscelatore: usalo.' },
      { emoji: '🚿', title: 'Doccia prima e dopo il bagno', text: 'Sciacquarsi PRIMA di entrare tiene la piscina pulita più a lungo (meno creme solari in acqua = meno cloro necessario).' },
      { emoji: '❄️', title: 'A fine stagione', text: 'Svuota completamente il serbatoio e riponila al coperto: il gelo la romperebbe.' },
    ],
    safety: ['Testa sempre la temperatura prima di usarla sui bambini', 'Svuota il serbatoio se non la usi per più di una settimana'],
    proTip: 'Doccia veloce pre-bagno per tutti = fino al 30% di cloro in meno consumato. Il salvadanaio ringrazia.',
  },
  {
    productId: 'pompacalore',
    tagline: 'Da maggio a settembre a 28 gradi',
    timeNeeded: 'Installazione professionale consigliata',
    difficulty: 'Medio',
    youNeed: ['Un tecnico per l’installazione (consigliato)', 'Bypass sull’impianto', 'Linea elettrica dedicata'],
    steps: [
      { emoji: '📍', title: 'Posizione: aria libera', text: 'All’aperto, almeno 50 cm dal muro e 3 m di spazio davanti alla ventola: la pompa "respira" l’aria per scaldare l’acqua.' },
      { emoji: '🔧', title: 'Installazione con bypass', text: 'Un tecnico collega la pompa all’impianto con 3 valvole (bypass): così regoli quanta acqua ci passa e la escludi d’inverno. Dall’app puoi richiedere un tecnico di zona.', warning: 'Collegamento elettrico: SOLO un elettricista qualificato, con linea dedicata e salvavita.' },
      { emoji: '🌡', title: 'Imposta 28 gradi', text: 'La temperatura perfetta per il bagno. Ogni grado in più costa circa il 10% in più di corrente.' },
      { emoji: '🕐', title: 'Falla lavorare di giorno', text: 'La pompa di calore rende di più con aria calda: falla andare nelle ore centrali, insieme alla filtrazione. L’app coordina le fasce.' },
      { emoji: '🧊', title: 'Col telo, sempre', text: 'Pompa di calore + telo la notte = il calore resta in acqua. Senza telo, metà del calore vola via.' },
      { emoji: '🍂', title: 'A fine stagione', text: 'Chiudi il bypass, svuota la pompa dall’acqua (tappo in basso) e coprila. Pronta per la prossima primavera.' },
    ],
    safety: ['Non coprire mai la ventola in funzione', 'Manutenzione annuale del gas refrigerante da parte di un tecnico'],
    proTip: 'Accendila 2 giorni prima del primo bagno stagionale: scaldare da 15 a 28 °C richiede tempo, mantenerli quasi niente.',
  },
  {
    productId: 'luciled',
    tagline: 'La piscina cambia colore con un tasto',
    timeNeeded: '20 minuti',
    difficulty: 'Facile',
    youNeed: ['Il telecomando in dotazione', '2 batterie AAA'],
    steps: [
      { emoji: '🔋', title: 'Batterie nel telecomando', text: '2 AAA (non incluse). Il faro invece si ricarica con il cavo USB magnetico in dotazione: 2 ore di carica, 8 di luce.' },
      { emoji: '🧲', title: 'Fissa il supporto', text: 'Il supporto a ventosa si attacca alla parete della piscina sott’acqua: premi forte 5 secondi. Su liner ruvido usa il supporto magnetico (parete sottile).' },
      { emoji: '💡', title: 'Aggancia il faro', text: 'Il faro si aggancia al supporto con una rotazione di un quarto di giro. Senti il click? È fissato.' },
      { emoji: '🎨', title: 'Scegli il colore', text: 'Dal telecomando: 16 colori fissi + 4 programmi (dissolvenza, arcobaleno, candela, festa). Il tasto ❤️ salva il tuo preferito.' },
      { emoji: '🔄', title: 'Ricarica settimanale', text: 'Stacca il faro (un quarto di giro), asciugalo, attacca il cavo magnetico. Domattina è pronto.' },
    ],
    safety: ['Ricarica SOLO fuori dall’acqua e con faro asciutto', 'Non fissare la luce direttamente da vicino'],
    proTip: 'Luce turchese fissa = si vede subito se l’acqua inizia a intorbidirsi. Bello E utile.',
  },
  {
    productId: 'filtro',
    tagline: 'Cambio cartuccia in 5 minuti, acqua che respira',
    timeNeeded: '5 minuti',
    difficulty: 'Facilissimo',
    youNeed: ['Pompa spenta', 'Le mani (bagnate va benissimo)'],
    steps: [
      { emoji: '⏻', title: 'Spegni la pompa', text: 'Sempre, prima di aprire qualsiasi cosa. Stacca anche la spina per sicurezza.', warning: 'Mai aprire il vano filtro con la pompa in funzione.' },
      { emoji: '🔓', title: 'Apri il vano filtro', text: 'Svita il coperchio del prefiltro (di solito un quarto di giro in senso antiorario).' },
      { emoji: '🗑', title: 'Togli la cartuccia vecchia', text: 'Estraila dritta verso l’alto. Grigia e intasata? Ha fatto il suo dovere.' },
      { emoji: '💦', title: 'Sciacqua il vano', text: 'Un getto d’acqua per togliere i residui dal fondo del vano.' },
      { emoji: '🆕', title: 'Inserisci la nuova', text: 'Dritta, fino in fondo, con la guarnizione in alto. Non forzare: se non entra, ruotala leggermente.' },
      { emoji: '🔒', title: 'Chiudi e riaccendi', text: 'Riavvita il coperchio (senza stringere come un forsennato: la guarnizione fa lei la tenuta), riattacca e riaccendi.' },
      { emoji: '📱', title: 'Registralo nell’app', text: 'Così ti ricordo io quando è ora della prossima: circa una al mese in piena stagione.' },
    ],
    safety: ['Pompa sempre spenta e scollegata prima di aprire'],
    proTip: 'Tieni sempre una cartuccia di scorta: quella "quasi finita" si accorge di esserlo sempre il sabato sera. Con la scorta automatica non ci pensi più.',
  },
];

export const MANUALS_BY_PRODUCT: Record<string, ProductManual> = Object.fromEntries(
  MANUALS.map((m) => [m.productId, m])
);
