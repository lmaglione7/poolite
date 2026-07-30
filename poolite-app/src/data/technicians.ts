// Local verified technicians/dealers directory — the first brick of the
// two-sided marketplace. Mirrors the Supabase `technicians` table.
export interface Technician {
  id: string;
  name: string;
  emoji: string;
  specialty: string;
  zone: string;
  rating: number;
  reviewCount: number;
  yearsActive: number;
  services: string[];
  respondsIn: string;
}

export const TECHNICIANS: Technician[] = [
  {
    id: 't1',
    name: 'AcquaChiara di Rossi Marco',
    emoji: '🔧',
    specialty: 'Manutenzione e riparazione pompe',
    zone: 'Monza e Brianza',
    rating: 4.9,
    reviewCount: 87,
    yearsActive: 12,
    services: ['Riparazione pompe', 'Sostituzione filtri', 'Apertura/chiusura stagione'],
    respondsIn: 'entro 2 ore',
  },
  {
    id: 't2',
    name: 'BluService Piscine',
    emoji: '🏊',
    specialty: 'Pulizia professionale e trattamenti',
    zone: 'Milano Nord · Monza',
    rating: 4.7,
    reviewCount: 132,
    yearsActive: 8,
    services: ['Pulizia completa', 'Recupero acqua verde', 'Analisi acqua a domicilio'],
    respondsIn: 'entro 4 ore',
  },
  {
    id: 't3',
    name: 'Idrotermica Colombo',
    emoji: '♨️',
    specialty: 'Pompe di calore e impianti',
    zone: 'Brianza · Como',
    rating: 4.8,
    reviewCount: 54,
    yearsActive: 15,
    services: ['Installazione pompe di calore', 'Impianti sale', 'Coperture su misura'],
    respondsIn: 'entro 1 giorno',
  },
];
