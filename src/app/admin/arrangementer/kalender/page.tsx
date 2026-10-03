'use client';

import { Calendar } from 'lucide-react';
import { CrudManager, type CrudFelt } from '@/components/admin/CrudManager';

/**
 * Kalenderen i databasen.
 *
 * Denne siden redigerer `Event`-tabellen direkte. Den skiller seg fra
 * /admin/arrangementer, som viser Ticketmaster-feeden – den kilden er ekstern
 * og kan ikke redigeres. Etter migreringen av kundens eksisterende nettsted
 * ligger det over tusen arrangementer i databasen, og de må kunne rettes.
 */

const KATEGORIER = [
  { value: 'ARRANGEMENT', label: 'Arrangement' },
  { value: 'KONSERT', label: 'Konsert' },
  { value: 'MARKED', label: 'Marked' },
  { value: 'KURS', label: 'Kurs' },
  { value: 'BARN', label: 'Barn' },
  { value: 'SPORT', label: 'Sport' },
  { value: 'KULTUR', label: 'Kultur' },
  { value: 'FESTIVAL', label: 'Festival' },
];

const FELT: CrudFelt[] = [
  { key: 'title', label: 'Tittel', required: true, placeholder: 'Konsert på Foynhagen', bred: true },
  { key: 'slug', label: 'Slug (URL)', placeholder: 'lages automatisk fra tittelen', bred: true },
  { key: 'startDate', label: 'Startdato', type: 'date', required: true, visILinje: true },
  { key: 'endDate', label: 'Sluttdato', type: 'date' },
  { key: 'startTime', label: 'Starttid', type: 'time' },
  { key: 'endTime', label: 'Sluttid', type: 'time' },
  { key: 'location', label: 'Sted', placeholder: 'Foynhagen', visILinje: true },
  { key: 'address', label: 'Adresse' },
  { key: 'category', label: 'Kategori', type: 'select', options: KATEGORIER },
  { key: 'externalUrl', label: 'Billettlenke', placeholder: 'https://…' },
  { key: 'description', label: 'Beskrivelse', type: 'textarea' },
  { key: 'published', label: 'Publisert', type: 'checkbox', placeholder: 'Synlig på nettstedet' },
  { key: 'featured', label: 'Fremhevet', type: 'checkbox', placeholder: 'Vis på forsiden' },
];

export default function KalenderPage() {
  return (
    <CrudManager
      tittel="Arrangementskalender"
      beskrivelse="Alt som ligger i Tønsberglivets egen kalenderdatabase. Endringer slår umiddelbart inn på nettstedet."
      ikon={<Calendar className="w-6 h-6 text-primary" />}
      endepunkt="/api/events"
      felt={FELT}
      tittelFelt="title"
      filterFelt={{ key: 'category', label: 'Kategori', options: KATEGORIER }}
      sokPlaceholder="Søk i tittel, sted eller slug…"
      nyKnappTekst="Nytt arrangement"
    />
  );
}
