import { Metadata } from 'next';
import Link from 'next/link';
import { Store, Gift, CalendarDays, PlusCircle, Filter, Sparkles, ChevronRight, ArrowRight, MapPin, Clock } from 'lucide-react';
import { SectionCard, BusinessCard } from '@/components/ui/Cards';

export const metadata: Metadata = {
  title: 'Bylivet | Tønsberglivet',
  description: 'Opplev Tønsberg! Her finner du en oversikt over shopping, spisesteder, overnatting og opplevelser midt i hjertet av byen.',
};

export default function BylivetPage() {
  return (
    <main className="min-h-screen space-y-16 pb-20">
      {/* ── Bilde-Hero Banner ── */}
      <header className="relative min-h-[55vh] flex items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/brygge.jpg"
            alt="Bylivet i Tønsberg"
            className="w-full h-full object-cover object-center scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-slate-950/70 to-slate-950/40" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 w-full">
          <div className="max-w-3xl space-y-4">
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Link href="/" className="hover:text-white transition-colors">Forside</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-amber-300">Bylivet</span>
            </div>

            <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
              Bylivet i Tønsberg
            </h1>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-light max-w-2xl">
              I Tønsberg sentrum finner du et rikt utvalg av butikker, restauranter, kafeer, kultur og opplevelser. Oppdag alt det spennende byen har å by på.
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
              <img src="/images/grundergata.jpg" alt="Gründergata" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
              <img src="/images/regnbue.jpg" alt="Festival og Mangfold" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <span className="absolute top-3 left-3 px-3 py-1 bg-surface/90 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-foreground border border-border flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Sommer
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

      {/* ── Utforsk sentrum (Bedrifter & Lokasjoner) ── */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">Utforsk sentrum</h2>
            <p className="text-foreground-muted text-sm mt-0.5">Steder å besøke og ting å oppleve</p>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto">
            {['Alle', 'Shopping', 'Mat & drikke', 'Aktivitet', 'Overnatting', 'Kultur'].map((category, i) => (
              <button 
                key={category}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  i === 0 
                    ? 'bg-primary text-white' 
                    : 'bg-surface text-foreground hover:bg-surface-muted border border-border'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Grid med aktører */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <BusinessCard
            name="Kafé Nansen"
            category="Mat & drikke"
            address="Storgaten 32, Tønsberg"
            description="Koselig kafé med ferske bakevarer, deilig kaffe og lunsjretter. Perfekt for en pust i bakken."
          />
          <BusinessCard
            name="Farmannstredet"
            category="Shopping"
            address="Jernbanegaten 1D, Tønsberg"
            description="Fylkets største kjøpesenter med over 70 spennende butikker og spisesteder midt i hjertet av byen."
          />
          <BusinessCard
            name="Quality Hotel Klubben"
            category="Overnatting"
            address="Nedre Langgate 49, Tønsberg"
            description="Moderne hotell med fantastisk beliggenhet ved brygga. Konsertsal, restaurant og flotte konferansefasiliteter."
          />
          <BusinessCard
            name="Bogart"
            category="Shopping"
            address="Storgaten 38, Tønsberg"
            description="Eksklusiv klesbutikk for kvalitetsbevisste menn og kvinner, med et bredt utvalg av kjente merkevarer."
          />
          <BusinessCard
            name="Slottsfjellsmuseet"
            category="Kultur"
            address="Farmannsveien 30, Tønsberg"
            description="Opplev Tønsbergs rike middelalderhistorie og sjøfartshistorie gjennom spennende utstillinger."
          />
          <BusinessCard
            name="Klara"
            category="Frisør & velvære"
            address="Rådhusgaten 4, Tønsberg"
            description="Moderne frisørsalong som tilbyr klipp, farge, og styling i avslappende og lekre omgivelser."
          />
        </div>
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


