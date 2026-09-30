import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { Sun, Waves, Mountain, Camera, Compass } from 'lucide-react';
import Link from 'next/link';
import { HeritageSection } from '@/components/culture/HeritageSection';
import { OceanConditionsWidget } from '@/components/weather/OceanConditionsWidget';

export const metadata: Metadata = {
  title: 'Opplevelser, Kulturarv & Natur | Tønsberglivet',
  description: 'Utforsk Verdens Ende, Færder Nasjonalpark, Slottsfjellet og Norges eldste by.',
};

const attractions = [
  { name: 'Verdens Ende & Vippefyret', area: 'Tjøme / Færder', desc: 'Ikonisk fyrtårn og svaberg på spissen av Tjøme med mektig utsikt mot Skagerrak og Færder fyr.' },
  { name: 'Færder Nasjonalpark', area: 'Skjærgården', desc: 'En av Norges mest fantastiske marine nasjonalparker for padling, dykking, bading og kyststier.' },
  { name: 'Bolærne Øyene', area: 'Nøtterøy Skjærgård', desc: 'Historiske øyer med kystfort, turstier og fergebåt fra Tønsberg Brygge.' },
  { name: 'Moutmarka & Bekkevika', area: 'Sør-Tjøme', desc: 'Fredet kystområde med rullesteinstrender, unikt planteliv og kvelds-solnedgang.' },
];

export default function OpplevelserPage() {
  return (
    <main className="min-h-screen pb-20 space-y-12">
      <HeroSection
        title="Opplevelser, Kulturarv & Natur"
        subtitle="Fra Vikingtid til Færder Nasjonalpark"
        description="Opplev Norges vakreste skjærgård, historiske middelalderborger, ikoniske svaberg og levende kystkultur."
        backgroundGradient="linear-gradient(135deg, #D97706, #0E7490)"
        compact={true}
      />

      <div className="container mx-auto px-4 space-y-12 max-w-6xl">
        {/* ── Badevann & Sjøforhold Live API ── */}
        <section>
          <OceanConditionsWidget />
        </section>

        {/* ── Kulturarv & Riksantikvaren Showcase ── */}
        <section>
          <HeritageSection />
        </section>

        {/* ── Naturattraksjoner ── */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground">Kystperler & Nasjonalpark</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {attractions.map((a, idx) => (
              <div key={idx} className="bg-surface rounded-2xl border border-border p-6 space-y-3 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-700 bg-cyan-100 dark:bg-cyan-950 px-3 py-1 rounded-full uppercase tracking-wider">
                    {a.area}
                  </span>
                  <Compass className="w-5 h-5 text-cyan-600" />
                </div>
                <h4 className="font-bold text-xl text-foreground">{a.name}</h4>
                <p className="text-sm text-foreground-muted leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="bg-surface-muted border border-border rounded-3xl p-8 text-center space-y-4 shadow-sm">
          <h3 className="text-2xl font-bold text-foreground">Planlegger du en dagstur til Tønsberg & Færder?</h3>
          <p className="text-sm text-foreground-muted max-w-lg mx-auto">
            Sjekk også byens restauranter, kaffebarer og kulturtilbud.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/bylivet/mat-og-drikke"
              className="px-6 py-3 bg-primary text-primary-foreground font-semibold text-sm rounded-xl hover:bg-primary-hover transition-colors shadow-sm"
            >
              Mat & Drikke
            </Link>
            <Link
              href="/reiselivet/overnatting"
              className="px-6 py-3 bg-surface border border-border text-foreground font-semibold text-sm rounded-xl hover:bg-surface-muted transition-colors"
            >
              Finn Overnatting
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
