import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';

export const metadata: Metadata = {
  title: 'Våre Prosjekter | Tønsberglivet',
  description: 'Se hvilke prosjekter og initiativer Tønsberglivet driver frem for å skape en enda bedre by.',
};

const prosjekter = [
  { id: 1, title: 'Barn i byen', desc: 'Kunstprosjekter med barnehager for å inkludere de minste i byrommet.', status: 'Pågår' },
  { id: 2, title: 'Bondens marked', desc: 'Lokale matprodusenter fyller Torvet med ferske og kortreiste varer.', status: 'Årlig' },
  { id: 3, title: 'Jul i Tønsberg', desc: 'Skaper magisk julestemning med julemarked, belysning og aktiviteter i desember.', status: 'Årlig' },
  { id: 4, title: 'Nyt Tønsberg', desc: 'Mat- og opplevelsesuker som feirer den lokale gastronomien i regionen.', status: 'Planlagt' },
  { id: 5, title: 'Handelens dager', desc: 'Gode tilbud, yrende folkeliv og aktiviteter i byens handlegater.', status: 'Årlig' },
  { id: 6, title: 'Gjenbruksmarked', desc: 'Fokus på bærekraft med markeder for kjøp og salg av brukte skatter.', status: 'Pågår' },
  { id: 7, title: 'Tønsbergdagen', desc: 'Årets største handledag med tradisjoner helt tilbake til 1974.', status: 'Årlig' },
  { id: 8, title: 'Innflytterfesten', desc: 'Velkomstarrangement for alle nye innbyggere i Tønsberg og Færder.', status: 'Planlagt' },
  { id: 9, title: 'Høstfest på Løkken', desc: 'Feiring av høsten med markedsboder, musikk og aktiviteter for familien.', status: 'Årlig' }
];

export default function ProsjekterPage() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <HeroSection 
        title="Våre prosjekter"
        subtitle="Tønsberglivet"
        description="Vi jobber kontinuerlig med små og store prosjekter for å gjøre Tønsbergregionen til et enda bedre sted å bo, besøke og drive næring i."
        backgroundGradient="linear-gradient(135deg, #1E3A5F, #1D4ED8)"
        compact={true}
      />

      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prosjekter.map((prosjekt) => (
            <div key={prosjekt.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{prosjekt.title}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {prosjekt.status}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 flex-grow">
                {prosjekt.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
