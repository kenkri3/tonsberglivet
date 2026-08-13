import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';

export const metadata: Metadata = {
  title: 'Personvernerklæring | Tønsberglivet',
  description: 'Informasjon om hvordan Tønsberglivet AS samler inn og behandler personopplysninger.',
};

export default function PersonvernPage() {
  return (
    <main className="min-h-screen pb-20">
      <HeroSection
        compact={true}
        title="Personvernerklæring"
        subtitle="Ditt personvern er viktig for oss"
        description="Denne personvernerklæringen forklarer hvordan Tønsberglivet AS samler inn, bruker og beskytter personopplysninger på våre nettsider."
        backgroundGradient="linear-gradient(135deg, #1E3A5F 0%, #0F172A 100%)"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-surface border border-border p-8 md:p-12 rounded-3xl space-y-8 text-foreground leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-bold">1. Behandlingsansvarlig</h2>
            <p className="text-foreground-muted text-base">
              Tønsberglivet AS (org.nr. 925 000 000) ved daglig leder er behandlingsansvarlig for virksomhetens behandling av personopplysninger. Kontakt e-post: hei@tonsberglivet.no.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">2. Hvilke opplysninger vi samler inn</h2>
            <p className="text-foreground-muted text-base">
              Vi samler inn opplysninger du oppgir til oss når du:
            </p>
            <ul className="list-disc pl-6 text-foreground-muted space-y-2">
              <li>Melder deg på vårt nyhetsbrev (e-postadresse).</li>
              <li>Sender inn forespørsel om torvleie eller bedriftsavtaler (navn, e-post, telefonnummer, bedriftsnavn).</li>
              <li>Søker om å bli partner (kontaktperson, firmaopplysninger).</li>
              <li>Benytter kontaktskjemaet på nettsiden.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">3. Formålet med behandlingen</h2>
            <p className="text-foreground-muted text-base">
              Personopplysningene benyttes utelukkende til å levere de forespurte tjenestene, besvare henvendelser og sende ut relevante nyheter og oppdateringer om Tønsberglivet. Vi selger eller deler aldri dine opplysninger med tredjeparter.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">4. Dine rettigheter</h2>
            <p className="text-foreground-muted text-base">
              Du har rett til når som helst å kreve innsyn, retting eller sletting av personopplysningene vi har lagret om deg. Du kan også trekke tilbake ditt samtykke til nyhetsbrev ved å bruke avmeldingslenken i e-postene våre.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
