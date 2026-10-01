import { Metadata } from 'next';
import Link from 'next/link';
import { 
  Compass, Map, Utensils, BedDouble, Trees, Castle,
  Ship, Sun, Music, Camera, ArrowRight, ChevronRight, Sparkles
} from 'lucide-react';
import { SectionCard } from '@/components/ui/Cards';
import { PhotoGallery } from '@/components/ui/PhotoGallery';
import { ReiselivetLogo } from '@/components/brand/BrandLogos';

export const metadata: Metadata = {
  title: 'Reiselivet i Tønsberg | Tønsberglivet',
  description: 'Besøk Færder og Tønsberg. Opplev fantastisk skjærgård, historiske steder, god mat og spennende aktiviteter.',
};

export default function ReiselivetPage() {
  return (
    <main className="min-h-screen space-y-16 pb-20">
      {/* ── Bilde-Hero Banner ── */}
      <header className="relative min-h-[55vh] flex items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/slottsfjellet.jpg"
            alt="Slottsfjellet og Reiselivet i Tønsberg"
            className="w-full h-full object-cover object-center scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-slate-950/75 to-slate-950/40" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 w-full">
          <div className="max-w-3xl space-y-4">
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Link href="/" className="hover:text-white transition-colors">Forside</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-amber-300">Reiselivet</span>
            </div>

            {/* Offisiell logo */}
            <div className="pt-2">
              <ReiselivetLogo className="h-9 md:h-11 w-auto text-amber-400 drop-shadow-md" />
            </div>

            <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
              Opplev Tønsberg & Færder. <br />
              <span className="font-serif italic font-normal text-amber-300">Historie, kyst og uforglemmelige øyeblikk.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-light max-w-2xl drop-shadow">
              Norges eldste by byr på en storslått miks av tusenårig vikinghistorie, idylliske øyer i Færder Nasjonalpark, Verdens Ende og et yrende bryggeliv.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/reiselivet/opplevelser"
                className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
              >
                <span>Opplevelser & Natur</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/reiselivet/overnatting"
                className="px-6 py-3 bg-surface/90 hover:bg-surface text-foreground rounded-xl text-xs font-bold shadow-md border border-border transition-all"
              >
                Hoteller & Overnatting
              </Link>
            </div>

          </div>
        </div>
      </header>

      {/* ── 10 gode grunner (-mt-16) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="bg-surface rounded-3xl p-8 border border-border shadow-xl space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Reisetips</span>
            <h2 className="text-2xl font-extrabold text-foreground">10 gode grunner til å besøke oss</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <ReasonBadge icon={<Sun />} text="Skjærgårdsidyll" />
            <ReasonBadge icon={<Castle />} text="Slottsfjellet" />
            <ReasonBadge icon={<Utensils />} text="Brygga i Tønsberg" />
            <ReasonBadge icon={<Ship />} text="Vikinghistorie" />
            <ReasonBadge icon={<Trees />} text="Verdens Ende" />
            <ReasonBadge icon={<Music />} text="Sommerkonserter" />
            <ReasonBadge icon={<Camera />} text="Gode opplevelser" />
            <ReasonBadge icon={<Compass />} text="Færder Nasjonalpark" />
            <ReasonBadge icon={<Map />} text="Bolærne" />
            <ReasonBadge icon={<BedDouble />} text="Unik overnatting" />
          </div>
        </div>
      </section>

      {/* ── Færder & Skjærgården Bilde-Seksjon ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 bg-surface rounded-3xl border border-border overflow-hidden shadow-xl group">
          <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto overflow-hidden">
            <img
              src="/images/skjaergard.jpg"
              alt="Færder Nasjonalpark og Skjærgården"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <span className="absolute top-4 left-4 px-3.5 py-1 bg-surface/95 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-foreground border border-border">
              Færder Nasjonalpark
            </span>
          </div>

          <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-bold text-primary flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Kyst- og øyparadis
              </span>

              <h3 className="text-2xl lg:text-3xl font-extrabold text-foreground leading-snug group-hover:text-primary transition-colors">
                Svaberg, øyhopping og urørt kystnatur i Norges vakreste nasjonalpark
              </h3>

              <p className="text-foreground-muted text-sm leading-relaxed">
                Fra Verdens Ende på Tjøme til de historiske øyene på Bolærne. Utforsk skjærgården med båt, kajakk eller vandrestier langs rullesteinstrendene i Moutmarka.
              </p>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs font-bold text-foreground-subtle">Reiseguide</span>
              <Link
                href="/reiselivet/opplevelser"
                className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform"
              >
                Utforsk opplevelser <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Overnatting ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary block mb-1">
              Førsteklasses Opphold
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">Hoteller & Overnatting</h2>
            <p className="text-foreground-muted text-sm mt-0.5">Bo komfortabelt ved bryggekanten eller i idylliske herregårdsomgivelser</p>
          </div>
          <Link
            href="/reiselivet/overnatting"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Se alle overnattingssteder</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Quality Hotel Tønsberg */}
          <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
              <img
                src="/images/tonsberg/quality_hotel_tonsberg.jpg"
                alt="Quality Hotel Tønsberg takbasseng"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 px-3 py-1 bg-surface/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border border-border">
                Takbasseng & Spa
              </span>
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-foreground-subtle">Tønsberg Brygge</span>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  Quality Hotel Tønsberg
                </h3>
                <p className="text-xs text-foreground-muted leading-relaxed">
                  Moderne bryggehotell med utendørs oppvarmet basseng på taket, The Sense restaurant og panoramautsikt over kanalen.
                </p>
              </div>
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Ledige rom</span>
                <Link
                  href="/reiselivet/overnatting"
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform"
                >
                  Les mer <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Hotel Klubben */}
          <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
              <img
                src="/images/tonsberg/brygge_kveldsstemning.jpg"
                alt="Hotel Klubben ved bryggen"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 px-3 py-1 bg-surface/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 border border-border">
                Klassiker & Kultur
              </span>
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-foreground-subtle">Nedre Langgate</span>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  Hotel Klubben
                </h3>
                <p className="text-xs text-foreground-muted leading-relaxed">
                  Legendarisk hotell i hjertet av byen. Kjent for revyer, fantastisk beliggenhet og lun atmosfære.
                </p>
              </div>
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Sentralt</span>
                <Link
                  href="/reiselivet/overnatting"
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform"
                >
                  Les mer <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Engø Gård */}
          <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
              <img
                src="/images/tonsberg/sommer_tonsberg.png"
                alt="Engø Gård på Tjøme"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 px-3 py-1 bg-surface/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 border border-border">
                Eksklusiv Gourmet
              </span>
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-foreground-subtle">Tjøme / Færder</span>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  Engø Gård Hotel & Restaurant
                </h3>
                <p className="text-xs text-foreground-muted leading-relaxed">
                  En oase av fred og luksus på Tjøme. Stjernegastronomi, historiske herregårdsbygninger og engelsk hage.
                </p>
              </div>
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">Michelin-anbefalt</span>
                <Link
                  href="/reiselivet/overnatting"
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform"
                >
                  Les mer <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Havna Hotell */}
          <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
              <img
                src="/images/tonsberg/ostre_bolarne.jpg"
                alt="Havna Hotell Tjøme ved skjærgården"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 px-3 py-1 bg-surface/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 border border-border">
                Skjærgårdshotell
              </span>
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-foreground-subtle">Røssesund / Havna</span>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  Havna Hotell Tjøme
                </h3>
                <p className="text-xs text-foreground-muted leading-relaxed">
                  Hotell og ferieleiligheter rett ved svabergene, med egen gjestehavn, badeanlegg og utsikt mot havet.
                </p>
              </div>
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Strand & Båt</span>
                <Link
                  href="/reiselivet/overnatting"
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform"
                >
                  Les mer <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bildegalleri for Reiselivet ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PhotoGallery
          title="Opplev Færder & Tønsbergs Reiseliv"
          subtitle="Bilder fra Slottsfjellet, Færder Nasjonalpark, Verdens Ende og bryggemiljøet."
          photos={[
            {
              src: '/images/skjaergard.jpg',
              alt: 'Verdens Ende og Vippefyret i Færder',
              caption: 'Verdens Ende & Vippefyret',
              location: 'Tjøme / Færder Nasjonalpark',
              category: 'Skjærgård & Kyst',
              photographer: 'Visit Færder',
            },
            {
              src: '/images/slottsfjellet.jpg',
              alt: 'Slottsfjellet ruinepark og Tårnet',
              caption: 'Slottsfjellet Middelalderborg',
              location: 'Slottsfjellet Tønsberg',
              category: 'Historie & Kultur',
              photographer: 'Tønsberglivet Arkiv',
            },
            {
              src: '/images/brygge.jpg',
              alt: 'Tønsberg Brygge om kvelden',
              caption: 'Sommerstemning på Brygga',
              location: 'Tønsberg Brygge',
              category: 'Uteliv & Gastronomi',
              photographer: 'Per Eide',
            },
          ]}
        />
      </section>

      {/* ── Planlegg ditt besøk ── */}
      <section className="py-16 bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-extrabold">Planlegg ditt besøk til Norges eldste by</h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Se hva som skjer i helgen, reserver overnatting og opplev stemningen ved kaikanten.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link
              href="/eventer"
              className="inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary-hover px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all"
            >
              Utforsk arrangementskalenderen <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function ReasonBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-surface rounded-2xl border border-border text-center hover:border-primary transition-colors space-y-2">
      <div className="text-primary [&>svg]:h-6 [&>svg]:w-6">{icon}</div>
      <span className="font-bold text-xs text-foreground">{text}</span>
    </div>
  );
}

