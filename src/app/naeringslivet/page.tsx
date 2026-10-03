import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { 
  TrendingUp, Building2, Lightbulb, Users, ArrowRight,
  Briefcase, Plane, Train, ChevronRight, Sparkles
} from 'lucide-react';
import { NaeringslivetLogo } from '@/components/brand/BrandLogos';
import { NavJobsWidget } from '@/components/jobs/NavJobsWidget';

export const metadata: Metadata = {
  title: 'Næringslivet i Tønsberg | Tønsberglivet',
  description: 'Næring og forretningsmuligheter i Tønsberg. Oppdag næringsområder, etablering og kompetanse.',
};

export default function NaeringslivetPage() {
  return (
    <main className="min-h-screen space-y-16 pb-20">
      {/* ── Bilde-Hero Banner ── */}
      <header className="relative min-h-[60vh] sm:min-h-[55vh] flex items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/tonsberg/tonsberg-by-og-havn-sett-fra-lufte.jpg"
            alt="Tønsberg by og havn sett fra luften"
            fill
            priority
            sizes="100vw"
            className="object-cover img-crop-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-slate-950/75 to-slate-950/45" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 relative z-10 w-full">
          <div className="max-w-3xl space-y-4">
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Link href="/" className="hover:text-white transition-colors">Forside</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-amber-300">Næringslivet</span>
            </div>

            {/* Offisiell logo */}
            <div className="pt-2">
              <NaeringslivetLogo className="h-9 md:h-11 w-auto text-purple-400 drop-shadow-md" />
            </div>

            <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
              Næringslivet i Tønsberg. <br />
              <span className="font-serif italic font-normal text-amber-300">Kraftsentrum for vekst og nyskaping.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-light max-w-2xl drop-shadow">
              Et fremoverlent næringsliv med over 7 500 bedrifter, 33 000 arbeidsplasser og sterke kompetanseklynger innen IT, finans, helse og maritim industri.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/naeringslivet/etablering"
                className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
              >
                <span>Etablering & Arealer</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/naeringslivet/bedrifter"
                className="px-6 py-3 bg-surface/90 hover:bg-surface text-foreground rounded-xl text-xs font-bold shadow-md border border-border transition-all"
              >
                Bedriftskatalogen
              </Link>
            </div>

          </div>
        </div>
      </header>

      {/* ── Nøkkeltall for Næringslivet (-mt-16) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<Briefcase />} value="33 000+" label="Arbeidsplasser i regionen" />
          <StatCard icon={<Building2 />} value="7 500+" label="Aktive virksomheter" />
          <StatCard icon={<Train />} value="1.5 t" label="Tog direkte til Oslo S" />
          <StatCard icon={<Plane />} value="15 min" label="Til Torp Sandefjord Lufthavn" />
        </div>
      </section>

      {/* ── Redaksjonell historie: Helene & Matgründere ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 bg-surface rounded-3xl border border-border overflow-hidden shadow-xl group">
          <div className="lg:col-span-6 relative aspect-[16/10] lg:aspect-auto overflow-hidden">
            <Image
              src="/images/tonsberg/matgr-nder-paa-torvet-max-w-7xl-mx.jpg"
              alt="Matgründer på Torvet"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover img-crop-top group-hover:scale-105 transition-transform duration-700"
            />
            <span className="absolute top-4 left-4 px-3.5 py-1 bg-surface/95 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-foreground border border-border">
              Gründerprofil
            </span>
          </div>

          <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Nyetablering på Tønsberg Torv
              </span>

              <h3 className="text-2xl lg:text-3xl font-extrabold text-foreground leading-snug group-hover:text-primary transition-colors">
                Fra kjøkkengulvet til Torvet: Slik satser Helene på lokalbakt håndverk
              </h3>

              <p className="text-foreground-muted text-sm leading-relaxed">
                Med støtte fra Tønsberglivets torvleieordning og lokale rådgivere har Helene etablert sin egen surdeigsbakeri-bod på Torvet. Responsen har vært overveldende med lange køer hver lørdag formiddag.
              </p>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs font-bold text-foreground-subtle">Publisert i Næringslivet</span>
              <Link
                href="/bylivet/torvleie"
                className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform"
              >
                Les om torvleie for gründere <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ledige stillinger i Tønsberg (NAV Arbeidsplassen Live API) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <NavJobsWidget
          title="Karrieremuligheter i Tønsbergregionen"
          subtitle="Stillinger hentes fra NAV Arbeidsplassen. Widgeten viser selv når kilden ikke er tilgjengelig."
          limit={6}
        />
      </section>

      {/* ── Næringsarealer og Byutvikling ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-border pb-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">Næringsarealer og byutvikling</h2>
          <p className="text-foreground-muted text-sm mt-0.5">Strategiske utviklingsområder for fremtidens bedrifter</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DevelopmentCard title="Tønsberg stasjonsområde" desc="Knutepunktutvikling med moderne kontorlokaler og nærhet til all kollektivtrafikk." />
          <DevelopmentCard title="Foynkvartalet" desc="Innovativt kvartal midt i sentrum som kombinerer handel, kontor og urbant liv." />
          <DevelopmentCard title="Statens Park" desc="Sentral beliggenhet med fokus på offentlige instanser og kunnskapsbedrifter." />
          <DevelopmentCard title="Kaldnes Vest" desc="Fremtidens bydel med spennende muligheter for næring og boligutvikling ved sjøen." />
        </div>
      </section>

      {/* ── Støtte til etablering ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-border pb-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">Støtte til etablering</h2>
          <p className="text-foreground-muted text-sm mt-0.5">Ressurser, rådgivning og felleskap for vekst</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-surface border border-border p-8 rounded-3xl space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center">
              <Lightbulb className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Vekst i Vestfold</h3>
            <p className="text-xs text-foreground-muted leading-relaxed">
              Tilbyr veiledning, kapital og nettverk for bedrifter med ambisjoner om vekst og internasjonalisering.
            </p>
          </div>

          <div className="bg-surface border border-border p-8 rounded-3xl space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Gründerhuset Hi5</h3>
            <p className="text-xs text-foreground-muted leading-relaxed">
              Et dynamisk fellesskap for oppstartsbedrifter med kontorplasser, mentorordninger og investornettverk.
            </p>
          </div>

          <div className="bg-surface border border-border p-8 rounded-3xl space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground">START-programmet</h3>
            <p className="text-xs text-foreground-muted leading-relaxed">
              Kurs og kompetanseprogram for deg som vil etablere egen bedrift i Tønsbergregionen.
            </p>
          </div>
        </div>
      </section>

      {/* ── Menneskene og kompetansen ── */}
      <section className="py-16 bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-extrabold">Kompetanse, klynger og forskning</h2>
          <p className="text-base text-slate-300 font-light leading-relaxed max-w-3xl mx-auto">
            Tønsberg har sterke miljøer innen helse og velferdsteknologi, IT, jus og bank/finans. Med Universitetet i Sørøst-Norge (USN) har vi tilgang til forskning og dyktige nyutdannede kandidater rett i nærområdet.
          </p>
          <div className="pt-2">
            <Link
              href="/kontakt"
              className="inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary-hover px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all"
            >
              Kontakt oss for næringsspørsmål <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-surface rounded-3xl shadow-sm border border-border text-center space-y-2">
      <div className="text-primary mb-2 [&>svg]:h-8 [&>svg]:w-8">{icon}</div>
      <div className="text-2xl sm:text-3xl font-black text-foreground whitespace-nowrap tracking-tight">{value}</div>
      <div className="text-xs text-foreground-muted font-medium">{label}</div>
    </div>
  );
}

function DevelopmentCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-6 border-l-4 border-primary bg-surface shadow-sm rounded-r-2xl border-y border-r border-border space-y-2">
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <p className="text-xs text-foreground-muted leading-relaxed">{desc}</p>
    </div>
  );
}

