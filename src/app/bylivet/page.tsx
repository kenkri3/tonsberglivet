import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Store, Gift, CalendarDays, PlusCircle, Filter, Sparkles, ChevronRight, ArrowRight, MapPin, Clock } from 'lucide-react';
import { SectionCard } from '@/components/ui/Cards';
import { BylivetLogo } from '@/components/brand/BrandLogos';
import { PublicTransportWidget } from '@/components/transit/PublicTransportWidget';
import { TrafficWidget } from '@/components/traffic/TrafficWidget';
import { OceanConditionsWidget } from '@/components/weather/OceanConditionsWidget';
import { PhotoGallery } from '@/components/ui/PhotoGallery';
import { hentBedrifter } from '@/lib/business-directory';
import { CategoryFilterGrid } from '@/components/business/CategoryFilterGrid';

// Innholdet hentes fra databasen ved hvert besøk.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Bylivet | Tønsberglivet',
  description: 'Opplev Tønsberg! Her finner du en oversikt over shopping, spisesteder, overnatting og opplevelser midt i hjertet av byen.',
};

export default async function BylivetPage() {
  // Henter hele registeret slik at kategorifiltrene har noe å filtrere på.
  const steder = await hentBedrifter(undefined, 60);

  return (
    <main className="min-h-screen space-y-16 pb-20">
      {/* ── Bilde-Hero Banner ── */}
      <header className="relative min-h-[60vh] sm:min-h-[55vh] flex items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/tonsberg/tonsberg-brygge-om-kvelden-absolut.jpg"
            alt="Tønsberg Brygge om kvelden"
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
              <span className="text-amber-300">Bylivet</span>
            </div>

            {/* Offisiell logo */}
            <div className="pt-2">
              <BylivetLogo className="h-9 md:h-11 w-auto text-blue-400 drop-shadow-md" />
            </div>

            <h1 className="text-white text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1]">
              Bylivet i Tønsberg. <br />
              <span className="font-serif italic font-normal text-amber-300">Mat, handel og kystmagi.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-light max-w-2xl drop-shadow">
              I Tønsberg sentrum finner du et rikt utvalg av over 300 butikker, prisvinnende restauranter, koselige kaffebarer og yrende kulturliv ved bryggekanten.
            </p>

          </div>
        </div>
      </header>

      {/* ── Snarveier & Verktøy (-mt-16) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SectionCard
            title="Torvleie"
            description="Ønsker du å leie plass på Tønsberg Torv? Vi har dag-, sesong- og helårsplasser."
            href="/bylivet/torvleie"
            gradient="linear-gradient(135deg, #10B981, #059669)"
            icon={<Store className="w-8 h-8 text-white" />}
          />
          <SectionCard
            title="Sentrumsgavekortet"
            description="Den perfekte gaven! Kan brukes hos over 300 aktører i Tønsberg sentrum."
            href="/bylivet/gavekort"
            gradient="linear-gradient(135deg, #F59E0B, #D97706)"
            icon={<Gift className="w-8 h-8 text-white" />}
          />
          <SectionCard
            title="Hva skjer?"
            description="Finn kommende konserter, markeder, festivaler og andre arrangementer."
            href="/eventer"
            gradient="linear-gradient(135deg, #8B5CF6, #7C3AED)"
            icon={<CalendarDays className="w-8 h-8 text-white" />}
          />
        </div>
      </section>

      {/* ── Bypuls & Sanntidsdata (Entur, Kanalbrua & MET Sjøforhold) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* items-start: la hvert kort beholde sin naturlige høyde i stedet for å
            strekkes til kolonnen med mest innhold (ga et stort tomt kort). */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <PublicTransportWidget />
          <div className="space-y-8">
            <TrafficWidget />
            <OceanConditionsWidget />
          </div>
        </div>
      </section>

      {/* ── Redaksjonelle reportasjer for Bylivet ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary block mb-1">
              Aktuelt i bykjernen
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
              Stemningsrapporter & Guider
            </h2>
          </div>
          <Link href="/nyheter?kategori=bylivet" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            <span>Alle byliliv-saker</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-md group flex flex-col justify-between">
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image src="/images/legacy/barnasdag.jpg" alt="Tønsberg Torv med Domkirken i bakgrunnen" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover img-crop-top group-hover:scale-105 transition-transform duration-500" />
              <span className="absolute top-3 left-3 px-3 py-1 bg-surface/90 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-foreground border border-border">
                Trehus & Kultur
              </span>
            </div>
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  Gründergata og Nordbyen: – Den levende kulturarven vår
                </h3>
                <p className="text-xs text-foreground-muted leading-relaxed">
                  Trehusbebyggelsen blomstrer med nisjebutikker, gallerier og skjulte bakgårdscafeer med ferske kanelsnurrer.
                </p>
              </div>
              <Link href="/bylivet/shopping" className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform pt-2">
                Utforsk shopping i sentrum <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-md group flex flex-col justify-between">
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image src="/images/tonsberg/folkefest-med-flaggborter-i-tonsbe.jpg" alt="Folkefest med flaggborter i Tønsberg" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover img-crop-top group-hover:scale-105 transition-transform duration-500" />
              <span className="absolute top-3 left-3 px-3 py-1 bg-surface/90 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-foreground border border-border">
                Festival & Folkeliv
              </span>
            </div>
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  Folkefest på Brygga: Rekordmange samlet til feiring av fellesskapet
                </h3>
                <p className="text-xs text-foreground-muted leading-relaxed">
                  Hele byen kledde seg i farger da årets sommerfestival fylte kaikanten med musikk, mat og glede.
                </p>
              </div>
              <Link href="/eventer" className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform pt-2">
                Se festivalprogrammet <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Utforsk sentrum (Bedrifter & Lokasjoner) ──
          Seksjonen hadde tidligere seks kategoriknapper uten onClick – den
          første så «valgt» ut uansett – og seks håndskrevne eksempelkort
          («Kafé Nansen», «Farmannstredet» …) i stedet for innholdet som allerede
          ble hentet fra bedriftsregisteret. Filtreringen og registeret er nå
          slått sammen i én komponent, så brikkene faktisk filtrerer. */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <CategoryFilterGrid steder={steder} />
      </section>

      {/* ── Fotogalleri fra Bylivet ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PhotoGallery
          title="Bylivet i Tønsberg i Bilder"
          subtitle="Bildeglimt fra bryggekanten, Torvet, nisjebutikker og folkelivet i sentrum."
          photos={[
            {
              src: '/images/tonsberg/bylivet-i-tonsberg-i-bilder-bildeg.jpg',
              alt: 'Folkeliv på brygga i Tønsberg en sommerkveld',
              caption: 'Stemning på Tønsberg Brygge',
              location: 'Tønsberg Brygge',
              category: 'Uteservering & Uteliv',
              photographer: 'Tønsberglivet Arkiv',
            },
            {
              src: '/images/tonsberg/buffet-under-spis-ute-uka-i-tonsbe.jpg',
              alt: 'Buffet under Spis Ute Uka i Tønsberg',
              caption: 'Spis Ute Uka & Gastronomi',
              location: 'Tønsberg Sentrum',
              category: 'Gastronomi',
              photographer: 'Tønsberglivet',
            },
            {
              src: '/images/tonsberg/gjester-paa-restaurant-i-tonsberg-.jpg',
              alt: 'Gjester på restaurant i Tønsberg',
              caption: 'Lokal mat & Uteservering',
              location: 'Bryggekanten',
              category: 'Mat & Drikke',
              photographer: 'Fotograf Varpe',
            },
            {
              src: '/images/tonsberg/folkemengde-paa-tonsberg-torv-mark.jpg',
              alt: 'Folkemengde på Tønsberg Torv',
              caption: 'Markedshandel i sentrum',
              location: 'Tønsberg Torv',
              category: 'Handel & Marked',
              photographer: 'Tønsberglivet',
            },
            {
              src: '/images/tonsberg/kvinne-som-danser-paa-tonsberg-tor.jpg',
              alt: 'Kvinne som danser på Tønsberg Torv',
              caption: 'Stemning i gatene',
              location: 'Storgaten',
              category: 'Byliv & Stemning',
              photographer: 'Tønsberglivet',
            },
            {
              src: '/images/tonsberg/fest-med-lilla-lyssetting-i-tonsbe.jpg',
              alt: 'Fest med lilla lyssetting i Tønsberg',
              caption: 'Folkefest i byen',
              location: 'Tønsberg Brygge',
              category: 'Festival & Folkeliv',
              photographer: 'Tønsberglivet',
            },
            {
              src: '/images/tonsberg/markedsboder-med-klaer-paa-tonsber.jpg',
              alt: 'Markedsboder med klær på Tønsberg Torv',
              caption: 'Regnbuen over byen',
              location: 'Tønsberg Sentrum',
              category: 'Fellesskap & Mangfold',
              photographer: 'Tønsberglivet',
            },
          ]}
        />
      </section>

      {/* ── Bli synlig ── */}
      <section className="py-16 bg-surface border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">Er ikke din bedrift listet?</h2>
          <p className="text-sm md:text-base text-foreground-muted max-w-2xl mx-auto">
            Driver du næring i Tønsberg sentrum? Ta kontakt med oss for å bli en del av oversikten og nå ut til flere besøkende.
          </p>
          <div className="pt-2">
            <Link 
              href="/kontakt" 
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-xl transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4" /> Registrer din bedrift
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}


