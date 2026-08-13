import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { SectionCard, BusinessCard } from '@/components/ui/Cards';
import Link from 'next/link';
import { Store, Gift, CalendarDays, PlusCircle, Filter } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Bylivet | Tønsberglivet',
  description: 'Opplev Tønsberg! Her finner du en oversikt over shopping, spisesteder, overnatting og opplevelser midt i hjertet av byen.',
};

export default function BylivetPage() {
  return (
    <main className="min-h-screen">
      <HeroSection
        compact={true}
        title="Bylivet"
        subtitle="Opplev Tønsberg"
        description="I Tønsberg sentrum finner du et rikt utvalg av butikker, restauranter, kafeer, kultur og opplevelser. Oppdag alt det spennende byen har å by på."
        backgroundGradient="linear-gradient(135deg, #1D4ED8, #0E7490)"
      />

      {/* Snarveier */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto -mt-10 md:-mt-16 relative z-10">
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

      {/* Utforsk byen */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Utforsk sentrum</h2>
            <p className="text-foreground-muted mt-1">Steder å besøke og ting å gjøre</p>
          </div>
          
          {/* Kategorifilter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
            <Filter className="w-5 h-5 text-foreground-muted mr-2 shrink-0 hidden md:block" />
            {['Alle', 'Shopping', 'Mat & drikke', 'Aktivitet', 'Overnatting', 'Frisør & velvære', 'Kultur', 'Barn'].map((category, i) => (
              <button 
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  i === 0 
                    ? 'bg-primary text-white' 
                    : 'bg-surface text-foreground hover:bg-surface-hover border border-border'
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

        <div className="mt-12 text-center">
          <button className="px-6 py-3 bg-surface border border-border text-foreground font-medium rounded-xl hover:bg-surface-hover transition-colors">
            Last inn flere
          </button>
        </div>
      </section>

      {/* Bli synlig */}
      <section className="py-20 bg-accent dark:bg-slate-900 mt-12 mb-20 border-y border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Er ikke din bedrift listet?</h2>
          <p className="text-lg text-foreground-muted mb-8 max-w-2xl mx-auto">
            Driv du næring i Tønsberg sentrum? Ta kontakt med oss for å bli en del av oversikten og nå ut til flere besøkende.
          </p>
          <Link 
            href="/kontakt" 
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
          >
            <PlusCircle className="w-5 h-5" /> Registrer din bedrift
          </Link>
        </div>
      </section>
    </main>
  );
}

