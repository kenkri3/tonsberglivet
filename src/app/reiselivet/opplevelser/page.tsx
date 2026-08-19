import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { Sun, Waves, Mountain, Camera, Compass } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Opplevelser & Natur | Tønsberglivet',
  description: 'Utforsk Verdens Ende, Færder Nasjonalpark, Bolærne øyene og Slottsfjellet.',
};

const attractions = [
  { name: 'Verdens Ende & Vippefyret', area: 'Tjøme / Færder', desc: 'Ikonisk fyrtårn og svaberg på spissen av Tjøme med mektig utsikt mot Skagerrak.' },
  { name: 'Færder Nasjonalpark', area: 'Skjærgården', desc: 'En av Norges mest fantastiske marint nasjonalparker for padling, dykking og kyststier.' },
  { name: 'Bolærne Øyene', area: 'Nøtterøy Skjærgård', desc: 'Historiske øyer med kystfort, turstier og fergebåt fra Tønsberg Brygge.' },
  { name: 'Moutmarka', area: 'Sør-Tjøme', desc: 'Fredet kystområde med rullesteinstrender, unikt planteliv og kvelds-solnedgang.' },
];

export default function OpplevelserPage() {
  return (
    <main className="min-h-screen pb-20">
      <HeroSection
        title="Opplevelser & Natur"
        subtitle="Verdens Ende & Færder Nasjonalpark"
        description="Opplev Norges vakreste skjærgård, ikoniske svaberg, historiske øyer og uforglemmelige naturopplevelser."
        backgroundGradient="linear-gradient(135deg, #D97706, #0E7490)"
        compact={true}
      />

      <div className="container mx-auto px-4 mt-12 space-y-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {attractions.map((a, idx) => (
            <div key={idx} className="bg-surface rounded-2xl border border-border p-6 space-y-3 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-700 bg-cyan-100 dark:bg-cyan-950 px-3 py-1 rounded-full uppercase tracking-wider">
                  {a.area}
                </span>
                <Compass className="w-5 h-5 text-cyan-600" />
              </div>
              <h3 className="font-bold text-xl text-foreground">{a.name}</h3>
              <p className="text-sm text-foreground-muted leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-surface-muted border border-border rounded-3xl p-8 text-center space-y-4">
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
