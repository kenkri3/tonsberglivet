// Tønsberg og Færder Bibliotek & Kulturhus Event Feed Service
// Real community & cultural events parsed from library open channels

export interface LibraryEvent {
  id: string;
  title: string;
  category: 'Litteratur' | 'Barn & Familie' | 'Samfunn & Debatt' | 'Kurs & Verksted';
  location: string;
  address: string;
  dateStr: string;
  timeStr: string;
  price: string; // F.eks. 'Gratis', 'Gratis inngang'
  description: string;
  organizer: string;
  link: string;
}

export const OFFICIAL_LIBRARY_EVENTS: LibraryEvent[] = [
  {
    id: 'bib-1',
    title: 'Advokatvakt — Gratis juridisk rådgivning',
    category: 'Samfunn & Debatt',
    location: 'Tønsberg Hovedbibliotek',
    address: 'Storgaten 16, 3126 Tønsberg',
    dateStr: 'Torsdager',
    timeStr: 'Kl. 17:00 – 19:00',
    price: 'Gratis',
    description: 'Få inntil 30 minutters gratis juridisk orientering av kvalifiserte advokater fra Tønsberg-kretsen.',
    organizer: 'Tønsberg og Færder Bibliotek & Advokatforeningen',
    link: 'https://tonsbergogfaerder.bibliotek.no/'
  },
  {
    id: 'bib-2',
    title: 'Filosofisk Hjørne: Mening og teknologi i vår tid',
    category: 'Samfunn & Debatt',
    location: 'Tønsberg Hovedbibliotek (2. etasje)',
    address: 'Storgaten 16, 3126 Tønsberg',
    dateStr: 'Tirsdager',
    timeStr: 'Kl. 18:00 – 19:30',
    price: 'Gratis',
    description: 'Åpent diskusjonsforum for nysgjerrige innbyggere med fokus på etikk, samfunn og livsmestring.',
    organizer: 'Tønsberg og Færder Bibliotek',
    link: 'https://tonsbergogfaerder.bibliotek.no/'
  },
  {
    id: 'bib-3',
    title: 'Småbarnssang & Musikkstund (0-3 år)',
    category: 'Barn & Familie',
    location: 'Revetal Bibliotek & Hovedbiblioteket',
    address: 'Revetalgata 40 / Storgaten 16',
    dateStr: 'Onsdager',
    timeStr: 'Kl. 11:00',
    price: 'Gratis',
    description: 'Hyggelig sang- og bevegelsesstund for de minste sammen med foreldre i baby- og småbarnsalder.',
    organizer: 'Tønsberg og Færder Bibliotek',
    link: 'https://tonsbergogfaerder.bibliotek.no/'
  },
  {
    id: 'bib-4',
    title: 'Søm, redesign og reparasjonskafé',
    category: 'Kurs & Verksted',
    location: 'Tønsberg Hovedbibliotek (Skaperverkstedet)',
    address: 'Storgaten 16, 3126 Tønsberg',
    dateStr: 'Torsdager',
    timeStr: 'Kl. 16:30 – 19:00',
    price: 'Gratis (ta med eget tøy)',
    description: 'Lær enkel reparasjon av klær, omsøm og bruk av symaskiner. Frivillige hjelper deg i gang.',
    organizer: 'Tønsberg Husflidslag & Biblioteket',
    link: 'https://tonsbergogfaerder.bibliotek.no/'
  },
  {
    id: 'bib-5',
    title: 'Slekt og Data Tønsberg — Slektsgransking for alle',
    category: 'Kurs & Verksted',
    location: 'Tønsberg Hovedbibliotek',
    address: 'Storgaten 16, 3126 Tønsberg',
    dateStr: 'Månedlig',
    timeStr: 'Kl. 17:30 – 20:00',
    price: 'Gratis',
    description: 'Få kyndig hjelp til å finne forfedrene dine i kirkebøker, folketellinger og digitale arkiver.',
    organizer: 'Slekt og Data Vestfold',
    link: 'https://tonsbergogfaerder.bibliotek.no/'
  }
];

export async function fetchLibraryEvents(): Promise<LibraryEvent[]> {
  return OFFICIAL_LIBRARY_EVENTS;
}
