import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { 
  TrendingUp, Building2, Lightbulb, Users, ArrowRight,
  Briefcase, Plane, Train
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Næringslivet i Tønsberg | Tønsberglivet',
  description: 'Næring og forretningsmuligheter i Tønsberg. Oppdag næringsområder, etablering og kompetanse.',
};

export default function NaeringslivetPage() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <HeroSection 
        title="Næringslivet"
        subtitle="Næring i Tønsberg"
        description="Et mangfoldig og fremoverlent næringsliv i sterk vekst, strategisk plassert i hjertet av Vestfold."
        backgroundGradient="linear-gradient(135deg, #7C3AED, #8B5CF6)"
        compact={true}
      />

      {/* Fakta */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">Fakta om Tønsbergregionen</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<Briefcase />} value="33 000+" label="Arbeidsplasser" />
          <StatCard icon={<Building2 />} value="7 500+" label="Virksomheter" />
          <StatCard icon={<Train />} value="1.5 t" label="Tog til Oslo" />
          <StatCard icon={<Plane />} value="15 min" label="Til Torp Lufthavn" />
        </div>
      </section>

      {/* Næringsarealer */}
      <section className="bg-white dark:bg-slate-900 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white">Næringsarealer og byutvikling</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <DevelopmentCard title="Tønsberg stasjonsområde" desc="Knutepunktutvikling med moderne kontorlokaler og nærhet til all kollektivtrafikk." />
            <DevelopmentCard title="Foynkvartalet" desc="Innovativt kvartal midt i sentrum som kombinerer handel, kontor og urbant liv." />
            <DevelopmentCard title="Statens Park" desc="Sentral beliggenhet med fokus på offentlige instanser og kunnskapsbedrifter." />
            <DevelopmentCard title="Kaldnes Vest" desc="Fremtidens bydel med spennende muligheter for næring og boligutvikling ved sjøen." />
          </div>
        </div>
      </section>

      {/* Etablering */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">Støtte til etablering</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-violet-50 dark:bg-violet-900/20 p-8 rounded-2xl">
            <Lightbulb className="h-10 w-10 text-violet-600 dark:text-violet-400 mb-4" />
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Vekst i Vestfold</h3>
            <p className="text-slate-600 dark:text-slate-300">Tilbyr veiledning, kapital og nettverk for bedrifter med ambisjoner om vekst.</p>
          </div>
          <div className="bg-violet-50 dark:bg-violet-900/20 p-8 rounded-2xl">
            <TrendingUp className="h-10 w-10 text-violet-600 dark:text-violet-400 mb-4" />
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Gründerhuset Hi5</h3>
            <p className="text-slate-600 dark:text-slate-300">Et dynamisk fellesskap for oppstartsbedrifter med kontorplasser og mentorordninger.</p>
          </div>
          <div className="bg-violet-50 dark:bg-violet-900/20 p-8 rounded-2xl">
            <Users className="h-10 w-10 text-violet-600 dark:text-violet-400 mb-4" />
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">START-programmet</h3>
            <p className="text-slate-600 dark:text-slate-300">Kurs og kompetanseprogram for deg som vil etablere egen bedrift i regionen.</p>
          </div>
        </div>
      </section>

      {/* Menneskene og kompetansen */}
      <section className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-3xl font-bold mb-6">Kompetanse og bransjer</h2>
          <p className="text-lg text-slate-300 mb-8">
            Tønsberg har klynger av høy kompetanse innen flere sektorer. Regionen er sterk på helse og velferdsteknologi, IT, jus og bank/finans. Med Universitetet i Sørøst-Norge (USN) har vi tilgang til forskning og dyktige nyutdannede kandidater rett i nærområdet.
          </p>
          <Link href="/kontakt" className="inline-flex items-center justify-center rounded-full bg-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 transition-all">
            Kontakt oss for næringsspørsmål <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
      <div className="text-violet-600 dark:text-violet-400 mb-4 [&>svg]:h-10 [&>svg]:w-10">{icon}</div>
      <div className="text-3xl font-black text-slate-900 dark:text-white mb-2">{value}</div>
      <div className="text-slate-600 dark:text-slate-400 font-medium">{label}</div>
    </div>
  );
}

function DevelopmentCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="p-6 border-l-4 border-violet-500 bg-white dark:bg-slate-800 shadow-sm rounded-r-2xl">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-slate-300">{desc}</p>
    </div>
  );
}
