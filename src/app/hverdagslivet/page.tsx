import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Heart, MapPin, Anchor, Palette, Wallet, Trees, 
  GraduationCap, Stethoscope, Dumbbell, Users, Landmark,
  ArrowRight, ChevronRight, Sparkles
} from 'lucide-react';
import { HverdagslivetLogo } from '@/components/brand/BrandLogos';
import { AirQualityWidget } from '@/components/environment/AirQualityWidget';
import { NavJobsWidget } from '@/components/jobs/NavJobsWidget';
import { PhotoGallery } from '@/components/ui/PhotoGallery';
import { BusinessCategory } from '@prisma/client';
import { hentBedrifter } from '@/lib/business-directory';
import { BusinessGrid } from '@/components/business/BusinessGrid';

// Innholdet hentes fra databasen ved hvert besøk.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Hverdagslivet i Tønsberg | Tønsberglivet',
  description: 'Bo og lev i Tønsbergregionen. Opplev en fantastisk hverdag med kyst, kultur og fellesskap.',
};

export default async function HverdagslivetPage() {
  const steder = await hentBedrifter(undefined, 12);

  return (
    <main className="min-h-screen space-y-16 pb-20">
      {/* ── Bilde-Hero Banner ── */}
      <header className="relative min-h-[60vh] sm:min-h-[55vh] flex items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/tonsberg/solstoler-med-slottsfjellstaarnet-.jpg"
            alt="Solstoler med Slottsfjellstårnet i bakgrunnen"
            fill
            priority
            sizes="100vw"
            className="object-cover img-crop-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-slate-950/75 to-slate-950/40" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 relative z-10 w-full">
          <div className="max-w-3xl space-y-4">
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Link href="/" className="hover:text-white transition-colors">Forside</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-amber-300">Hverdagslivet</span>
            </div>

            {/* Offisiell logo */}
            <div className="pt-2">
              <HverdagslivetLogo className="h-9 md:h-11 w-auto text-emerald-400 drop-shadow-md" />
            </div>

            <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
              Bo & leve i Tønsberg. <br />
              <span className="font-serif italic font-normal text-amber-300">Det gode liv mellom sjø og skog.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-light max-w-2xl drop-shadow">
              Å bo i Tønsbergregionen gir deg det beste av to verdener – nærhet til urbane fasiliteter, trygge skoler og oppvekstmiljøer, og kort vei til fantastisk natur og kyststi.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <a
                href="#grunner"
                className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
              >
                <span>10 gode grunner</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                href="/nyheter?kategori=hverdagslivet"
                className="px-6 py-3 bg-surface/90 hover:bg-surface text-foreground rounded-xl text-xs font-bold shadow-md border border-border transition-all"
              >
                Siste hverdagsliv-nyheter
              </Link>
            </div>

          </div>
        </div>
      </header>

      {/* ── Intro (-mt-16) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="bg-surface rounded-3xl p-8 md:p-12 border border-border shadow-xl space-y-4 text-center max-w-4xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-primary-light text-primary mx-auto flex items-center justify-center">
            <Heart className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-3xl font-extrabold text-foreground">Et fantastisk sted å vokse opp og bo</h2>
          <p className="text-sm md:text-base text-foreground-muted leading-relaxed max-w-2xl mx-auto">
            Tønsberg og Færder byr på en unik kombinasjon av rik historie, et pulserende kulturliv og naturskjønne omgivelser. Enten du er på jakt etter en urban leilighet midt i sentrum, eller et barnevennlig nabolag nær sjøen, har regionen noe å tilby for enhver livsfase.
          </p>
        </div>
      </section>

      {/* ── 10 gode grunner ── */}
      <section id="grunner" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Kvaliteter</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">10 gode grunner til å flytte til Tønsberg</h2>
          <p className="text-xs md:text-sm text-foreground-muted">Oppdag hvorfor stadig flere etablerer seg i Norges eldste by</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ReasonCard icon={<MapPin className="h-6 w-6 text-primary" />} title="1. Nærhet til Oslo & Torp" desc="Kort reisevei til hovedstaden med tog på 1.5 time og 15 minutter til Torp Sandefjord Lufthavn." />
          <ReasonCard icon={<Anchor className="h-6 w-6 text-primary" />} title="2. Fantastisk kystlinje" desc="Færder nasjonalpark, holmer, svaberg og flotte badestrender rett utenfor stuedøren." />
          <ReasonCard icon={<Palette className="h-6 w-6 text-primary" />} title="3. Rikt kulturliv" desc="Konserter i Foynhagen, teater, Færderbiennalen og festivaler året rundt." />
          <ReasonCard icon={<Wallet className="h-6 w-6 text-primary" />} title="4. Attraktive boligpriser" desc="Betydelig mer plass og livskvalitet for pengene enn i Oslo-området." />
          <ReasonCard icon={<Trees className="h-6 w-6 text-primary" />} title="5. Nydelig natur og turstier" desc="Kyststier, skog og mark med fantastiske turmuligheter sommer som vinter." />
          <ReasonCard icon={<GraduationCap className="h-6 w-6 text-primary" />} title="6. Gode skoler og barnehager" desc="Trygge og moderne oppvekstmiljøer med USN Universitetscampus i nærområdet." />
          <ReasonCard icon={<Stethoscope className="h-6 w-6 text-primary" />} title="7. Utmerket helsetilbud" desc="Sykehuset i Vestfold lokalisert sentralt i byen samt gode lokale helsetjenester." />
          <ReasonCard icon={<Dumbbell className="h-6 w-6 text-primary" />} title="8. Bredt idretts- og friluftstilbud" desc="Klubber, haller, seilforeninger og moderne anlegg for nesten enhver idrett." />
          <ReasonCard icon={<Users className="h-6 w-6 text-primary" />} title="9. Inkluderende fellesskap" desc="Aktive velforeninger, frivillighetsmiljøer og varme lokalsamfunn." />
        </div>
      </section>

      {/* ── Miljø & Luftkvalitet samt Karrieremuligheter (Miljødirektoratet & NAV Live) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* items-start: kortene beholder sin naturlige høyde i stedet for å
            strekkes til det høyeste og få et stort tomt felt. */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <AirQualityWidget />
          <NavJobsWidget
            title="Finn jobb i Tønsbergregionen"
            subtitle="Planlegger du å flytte hit? Se ferske ledige stillinger via NAV Arbeidsplassen."
            limit={4}
          />
        </div>
      </section>

      {/* ── Frivillighet og Samfunnsengasjement ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-border pb-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">Frivillighet og engasjement</h2>
          <p className="text-foreground-muted text-sm mt-0.5">Menneskene som gjør byen vår varmere</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface p-6 rounded-3xl border border-border shadow-xs space-y-3">
            <Heart className="h-8 w-8 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Kirkens Bymisjon</h3>
            <p className="text-xs text-foreground-muted leading-relaxed">Bidrar til et varmere og mer inkluderende samfunn i Tønsberg.</p>
          </div>
          <div className="bg-surface p-6 rounded-3xl border border-border shadow-xs space-y-3">
            <Heart className="h-8 w-8 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Røde Kors Tønsberg</h3>
            <p className="text-xs text-foreground-muted leading-relaxed">Aktivt lokallag som driver med hjelpekorps, omsorg og ungdomsarenaer.</p>
          </div>
          <div className="bg-surface p-6 rounded-3xl border border-border shadow-xs space-y-3">
            <Heart className="h-8 w-8 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Frelsesarmeen</h3>
            <p className="text-xs text-foreground-muted leading-relaxed">Møteplasser, omsorgsarbeid og matutdeling med et sterkt nærvær i byen.</p>
          </div>
        </div>
      </section>

      {/* ── Fotogalleri for Hverdagslivet ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PhotoGallery
          title="Hverdagslivet i Tønsberg i Bilder"
          subtitle="Glimt fra nabolagene, skjærgården, parkene og kulturen i hverdagen."
          photos={[
            {
              src: '/images/legacy/barnas-bylordag.jpg',
              alt: 'Boligområde med bekk og lekende barn i Tønsberg',
              caption: 'Nabolag & Nærmiljø',
              location: 'Tønsberg',
              category: 'Bo & Oppvekst',
              photographer: 'Tønsberglivet Arkiv',
            },
            {
              src: '/images/tonsberg/maskotene-ellie-og-timba-paa-tonsb.jpg',
              alt: 'Maskotene Ellie og Timba på Tønsberg Torv',
              caption: 'Barnevennlige Tønsberg',
              location: 'Tønsberg Sentrum',
              category: 'Oppvekst & Familie',
              photographer: 'Tønsberglivet',
            },
            {
              src: '/images/tonsberg/gutter-som-hopper-i-sjoen-i-tonsbe.jpg',
              alt: 'Gutter som hopper i sjøen i Tønsberg',
              caption: 'Sommerdager i regionen',
              location: 'Tønsberg & Færder',
              category: 'Fellesskap',
              photographer: 'Tønsberglivet',
            },
          ]}
        />
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-extrabold">Klar for en ny og bedre hverdag?</h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Opplev hvorfor Tønsbergregionen er Vestfolds mest populære tilflytterkommune.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link
              href="/kontakt"
              className="inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary-hover px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all"
            >
              Ta kontakt med oss <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      {/* ── Fra bedriftsregisteret ── */}
      <section className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              I nabolaget
            </h2>
            <p className="text-sm text-foreground-muted mt-1">Hentet fra Tønsberglivets bedriftsregister.</p>
          </div>
          <Link
            href="/naeringslivet/bedrifter"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Se hele registeret &rarr;
          </Link>
        </div>

        <BusinessGrid
          bedrifter={steder}
          tomTekst="Ingen steder er publisert i registeret ennå."
        />
      </section>

    </main>
  );
}

function ReasonCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-6 bg-surface rounded-3xl border border-border transition-all hover:-translate-y-1 hover:shadow-md space-y-3">
      <div className="p-2.5 rounded-2xl bg-primary-light text-primary w-fit">{icon}</div>
      <h3 className="text-base font-bold text-foreground">{title}</h3>
      <p className="text-xs text-foreground-muted leading-relaxed">{desc}</p>
    </div>
  );
}

