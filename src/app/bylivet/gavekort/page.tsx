import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { CreditCard, Smartphone, Store, Building, ChevronRight, Gift } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sentrumsgavekortet | Tønsberglivet',
  description: 'Gaven som gleder og støtter lokalt næringsliv. Kjøp Sentrumsgavekortet fysisk eller digitalt, og bruk det hos over 300 aktører i Tønsberg.',
};

export default function GavekortPage() {
  return (
    <main className="min-h-screen">
      <HeroSection
        compact={true}
        title="Sentrumsgavekortet"
        subtitle="Gaven som gleder alle"
        description="Med Sentrumsgavekortet gir du ikke bare en fantastisk gave, du støtter også det lokale næringslivet i byen vår. Gavekortet kan brukes hos over 300 butikker, serveringssteder og opplevelser i Tønsberg."
        backgroundGradient="linear-gradient(135deg, #B45309 0%, #F59E0B 100%)"
      />

      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">Slik fungerer det</h2>
          <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
            Det er enkelt å kjøpe, gi og bruke Sentrumsgavekortet. Velg mellom fysisk kort eller digital versjon.
          </p>
        </div>

        {/* Steg for steg */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 relative">
          <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-border -z-10"></div>
          
          <div className="bg-surface border border-border p-8 rounded-3xl text-center relative z-10">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold border-4 border-background">1</div>
            <h3 className="text-xl font-bold text-foreground mb-3">Kjøp</h3>
            <p className="text-foreground-muted">Kjøp digitalt via appen, eller skaff et fysisk kort hos en av våre utsalgssteder i byen.</p>
          </div>
          
          <div className="bg-surface border border-border p-8 rounded-3xl text-center relative z-10">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold border-4 border-background">2</div>
            <h3 className="text-xl font-bold text-foreground mb-3">Lad opp</h3>
            <p className="text-foreground-muted">Velg valgfritt beløp mellom 100 og 5000 kroner. Kortet er gyldig i 1 år fra ladedato.</p>
          </div>
          
          <div className="bg-surface border border-border p-8 rounded-3xl text-center relative z-10">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold border-4 border-background">3</div>
            <h3 className="text-xl font-bold text-foreground mb-3">Bruk</h3>
            <p className="text-foreground-muted">Gled deg over valgfrihet! Bruk kortet til shopping, en god middag, eller en kulturell opplevelse.</p>
          </div>
        </div>

        {/* Kjøpsalternativer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Fysisk */}
          <div className="bg-surface border border-border p-8 rounded-3xl shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-xl">
                <CreditCard className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Fysisk gavekort</h3>
            </div>
            <p className="text-foreground-muted text-base leading-relaxed mb-6 font-medium">
              Perfekt å pakke inn og legge under juletreet eller ta med i bursdag. Du kan kjøpe og lade det fysiske Sentrumsgavekortet hos disse utsalgsstedene:
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-foreground font-semibold">
                <Store className="w-5 h-5 text-amber-500 shrink-0" /> Klara <span className="text-sm font-normal text-foreground-muted ml-auto">(Rådhusgaten 4)</span>
              </li>
              <li className="flex items-center gap-3 text-foreground font-semibold">
                <Store className="w-5 h-5 text-amber-500 shrink-0" /> Mondi & Seven <span className="text-sm font-normal text-foreground-muted ml-auto">(Storgaten 36)</span>
              </li>
              <li className="flex items-center gap-3 text-foreground font-semibold">
                <Store className="w-5 h-5 text-amber-500 shrink-0" /> Bogart <span className="text-sm font-normal text-foreground-muted ml-auto">(Storgaten 38)</span>
              </li>
            </ul>
          </div>

          {/* Digitalt */}
          <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-8 rounded-3xl shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-amber-100 dark:bg-amber-900/40 p-3 rounded-xl">
                <Smartphone className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Digitalt gavekort</h3>
            </div>
            <p className="text-foreground-muted text-base leading-relaxed mb-6 font-medium">
              Raskt og enkelt! Send gavekortet direkte til mottakerens telefon. De trenger bare å laste ned appen for å bruke det i butikkene.
            </p>
            <div className="bg-surface p-6 rounded-2xl mb-8 border border-border shadow-sm">
              <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" /> Mine Gavekort-appen
              </h4>
              <p className="text-sm text-foreground-muted font-medium">
                Søk etter «Mine Gavekort» i App Store eller Google Play, eller klikk på knappene nedenfor for å laste ned appen.
              </p>
            </div>
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary-hover transition-colors text-sm shadow-sm">
                App Store
              </button>
              <button className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary-hover transition-colors text-sm shadow-sm">
                Google Play
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bedrifter */}
      <section className="py-20 bg-surface border-t border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Building className="w-12 h-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-foreground mb-4">Firmagaver og større bestillinger</h2>
          <p className="text-lg text-foreground-muted mb-8">
            Skal du kjøpe julegaver eller sommergaver til dine ansatte? Sentrumsgavekortet er en svært populær gave som sikrer at pengene blir igjen og skaper verdier i lokalmiljøet. Vi hjelper bedrifter med fakturering og klargjøring av større antall gavekort.
          </p>
          <Link 
            href="/kontakt" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
          >
            Kontakt oss for bedriftsavtale <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}

