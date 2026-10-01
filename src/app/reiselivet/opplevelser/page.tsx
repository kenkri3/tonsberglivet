import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { Sun, Waves, Mountain, Camera, Compass } from 'lucide-react';
import Link from 'next/link';
import { HeritageSection } from '@/components/culture/HeritageSection';
import { OceanConditionsWidget } from '@/components/weather/OceanConditionsWidget';

import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Opplevelser, Kulturarv & Natur | Tønsberglivet',
  description: 'Utforsk Verdens Ende, Færder Nasjonalpark, Slottsfjellet og Norges eldste by.',
};

const attractions = [
  {
    name: 'Verdens Ende & Vippefyret',
    area: 'Tjøme / Færder',
    desc: 'Ikonisk fyrtårn og værbitte svaberg på spissen av Tjøme med mektig panoramautsikt mot Skagerrak og Færder fyr.',
    image: '/images/tonsberg/sommer_tonsberg.png',
  },
  {
    name: 'Færder Nasjonalpark',
    area: 'Skjærgården',
    desc: 'En av Norges mest fantastiske marine nasjonalparker for padling, dykking, bading og spektakulære kyststier.',
    image: '/images/tonsberg/kajakk_faerder.jpg',
  },
  {
    name: 'Bolærne Øyene',
    area: 'Nøtterøy Skjærgård',
    desc: 'Historiske øyer med kystfort, uberørte turstier, gjestehavn og rutebåt direkte fra Tønsberg Brygge.',
    image: '/images/tonsberg/ostre_bolarne.jpg',
  },
  {
    name: 'Moutmarka & Bekkevika',
    area: 'Sør-Tjøme',
    desc: 'Fredet kystområde med rullesteinstrender, unikt planteliv, spennende geologi og uforglemmelige kveldssolnedganger.',
    image: '/images/tonsberg/brygge_kveldsstemning.jpg',
  },
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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-foreground tracking-tight">Kystperler & Nasjonalpark</h3>
            <span className="text-xs font-semibold text-foreground-muted">Utforsk Færder & Tønsberg</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {attractions.map((a, idx) => (
              <div
                key={idx}
                className="group bg-surface rounded-3xl border border-border overflow-hidden hover:shadow-xl hover:border-cyan-500/40 transition-all duration-300 flex flex-col"
              >
                <div className="relative h-56 w-full overflow-hidden bg-surface-muted">
                  <Image
                    src={a.image}
                    alt={a.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <span className="absolute top-4 right-4 text-xs font-bold text-white bg-cyan-900/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-cyan-400/30">
                    {a.area}
                  </span>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h4 className="font-bold text-xl text-white drop-shadow-sm">{a.name}</h4>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-sm text-foreground-muted leading-relaxed">{a.desc}</p>
                  <div className="pt-2">
                    <span className="inline-flex items-center text-xs font-bold text-cyan-600 dark:text-cyan-400 group-hover:gap-2 gap-1.5 transition-all">
                      Se turbeskrivelse & kart &rarr;
                    </span>
                  </div>
                </div>
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
