import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';

export const metadata: Metadata = {
  title: 'Informasjonskapsler (Cookies) | Tønsberglivet',
  description: 'Informasjon om bruk av informasjonskapsler (cookies) på tonsberglivet.no.',
};

export default function CookiesPage() {
  return (
    <main className="min-h-screen pb-20">
      <HeroSection
        compact={true}
        title="Informasjonskapsler"
        subtitle="Bruk av cookies på tonsberglivet.no"
        description="Vi bruker informasjonskapsler for å sikre at nettsiden fungerer optimalt, huske dine preferanser og forbedre brukeropplevelsen."
        backgroundGradient="linear-gradient(135deg, #1E3A5F 0%, #0F172A 100%)"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-surface border border-border p-8 md:p-12 rounded-3xl space-y-8 text-foreground leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-bold">Hva er en informasjonskapsel?</h2>
            <p className="text-foreground-muted text-base">
              En informasjonskapsel (cookie) er en liten tekstfil som lagres i din nettleser når du besøker en nettside. Den lar nettsiden huske dine valg, slik som mørk/lys modus og språkinnstillinger.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">Kapsler vi benytter</h2>
            <div className="space-y-4">
              <div className="border border-border p-4 rounded-xl">
                <h3 className="font-bold text-foreground">1. Nødvendige kapsler</h3>
                <p className="text-sm text-foreground-muted">Brukes for å ta vare på ditt valgte fargetema (mørk eller lys modus: <code>tonsberglivet-theme</code>).</p>
              </div>
              <div className="border border-border p-4 rounded-xl">
                <h3 className="font-bold text-foreground">2. Analytiske kapsler</h3>
                <p className="text-sm text-foreground-muted">Anonymisert besøksstatistikk for å forstå hvordan sidene våre brukes og forbedre innholdet.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">Slik administrerer du kapsler</h2>
            <p className="text-foreground-muted text-base">
              Du kan når som helst endre innstillingene i din nettleser for å blokkere eller slette informasjonskapsler. Merk at noen funksjoner på nettsiden da kan slutte å fungere optimalt.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
