'use client';

import { Building2 } from 'lucide-react';
import { CrudManager, type CrudFelt } from '@/components/admin/CrudManager';

/**
 * Bedriftsregisteret i databasen.
 *
 * Denne siden redigerer `Business`-tabellen direkte. Den skiller seg fra
 * fanen «Nystartede» i /admin/bedrifter, som viser en synk fra
 * Brønnøysundregistrene – den kilden er ekstern og kan ikke redigeres.
 * Kundens 358 bedrifter ble migrert hit og må kunne vedlikeholdes.
 */

const KATEGORIER = [
  { value: 'SHOPPING', label: 'Shopping' },
  { value: 'MAT_DRIKKE', label: 'Mat & drikke' },
  { value: 'AKTIVITET', label: 'Aktivitet' },
  { value: 'OVERNATTING', label: 'Overnatting' },
  { value: 'FRISOR_VELVERE', label: 'Frisør & velvære' },
  { value: 'KULTUR', label: 'Kultur' },
  { value: 'BARN', label: 'Barn' },
  { value: 'ANNET', label: 'Annet' },
];

const OMRADER = [
  { value: 'TONSBERG_SENTRUM', label: 'Tønsberg sentrum' },
  { value: 'TONSBERG_KOMMUNE', label: 'Tønsberg kommune' },
  { value: 'FAERDER_KOMMUNE', label: 'Færder kommune' },
];

const FELT: CrudFelt[] = [
  { key: 'name', label: 'Navn', required: true, placeholder: 'Groovy Diner', bred: true },
  { key: 'slug', label: 'Slug (URL)', placeholder: 'lages automatisk fra navnet', bred: true },
  { key: 'category', label: 'Kategori', type: 'select', options: KATEGORIER, visILinje: false },
  { key: 'area', label: 'Område', type: 'select', options: OMRADER },
  { key: 'address', label: 'Adresse', placeholder: 'Kilden 1, 3118 Tønsberg', visILinje: true },
  { key: 'phone', label: 'Telefon', placeholder: '33 33 32 00' },
  { key: 'email', label: 'E-post', placeholder: 'post@eksempel.no' },
  { key: 'website', label: 'Nettside', placeholder: 'https://…' },
  { key: 'openingHours', label: 'Åpningstider', placeholder: 'Man–fre 10–18, lør 10–16' },
  { key: 'description', label: 'Beskrivelse', type: 'textarea' },
  { key: 'published', label: 'Publisert', type: 'checkbox', placeholder: 'Synlig på nettstedet' },
  { key: 'featured', label: 'Fremhevet', type: 'checkbox', placeholder: 'Vis frem' },
];

export default function BedriftsregisterPage() {
  return (
    <CrudManager
      tittel="Bedriftsregister"
      beskrivelse="Alt som ligger i Tønsberglivets eget bedriftsregister. Endringer slår umiddelbart inn på nettstedet."
      ikon={<Building2 className="w-6 h-6 text-primary" />}
      endepunkt="/api/businesses"
      felt={FELT}
      tittelFelt="name"
      filterFelt={{ key: 'category', label: 'Kategori', options: KATEGORIER }}
      sokPlaceholder="Søk i navn, adresse eller beskrivelse…"
      nyKnappTekst="Ny bedrift"
    />
  );
}
