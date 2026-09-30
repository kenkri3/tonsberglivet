import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { Building2, Rocket, Briefcase, Award, Users, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { BrregSearchWidget } from '@/components/business/BrregSearchWidget';

export const metadata: Metadata = {
  title: 'Bedriftene i Tønsberg | Tønsberglivet',
  description: 'Utforsk over 7 500 bedrifter og 33 000 arbeidsplasser i Tønsbergregionen via Brønnøysundregistrene.',
};

const businessClusters = [
  { name: 'Gründerhuset Hi5', desc: 'Miljø for oppstartsbedrifter, inkubatorer og gründervekst midt i sentrum.', tag: 'Gründermiljø' },
  { name: 'Foynkvartalet & Sentrum', desc: 'Finans, advokat, konsulent og kompetansearbeidsplasser langs brygga.', tag: 'Tjenesteyting' },
  { name: 'Kaldnes Vest', desc: 'Nyskapende nærings- og boligområde ved byfjorden.', tag: 'Næringsareal' },
  { name: 'Statens Park', desc: 'Offentlige kompetansearbeidsplasser, offentlig forvaltning og helsehovedkvarter.', tag: 'Offentlig & Helse' },
];

export default function BedrifterPage() {
  return (
    <main className="min-h-screen pb-20 space-y-12">
      <HeroSection
        title="Bedriftene i Tønsberg"
        subtitle="7 500+ Bedrifter & 33 000 Arbeidsplasser"
        description="Tønsberg er næringshovedstaden i Vestfold med et drivende næringsliv innen helse, finans, IT og gründerånd. Søk i offisielle registerdata fra Brønnøysundregistrene nedenfor."
        backgroundGradient="linear-gradient(135deg, #7C3AED, #8B5CF6)"
        compact={true}
      />

      <div className="container mx-auto px-4 space-y-12 max-w-6xl">
        {/* ── Brønnøysundregistrene Live API Widget ── */}
        <section>
          <BrregSearchWidget />
        </section>

        {/* ── Næringsklynger ── */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground">Sentrale Næringsmiljøer og Klynger</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {businessClusters.map((b, idx) => (
              <div key={idx} className="bg-surface rounded-2xl border border-border p-6 space-y-3 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-700 bg-purple-100 dark:bg-purple-950 px-3 py-1 rounded-full uppercase tracking-wider">
                    {b.tag}
                  </span>
                  <Briefcase className="w-5 h-5 text-purple-600" />
                </div>
                <h4 className="font-bold text-xl text-foreground">{b.name}</h4>
                <p className="text-sm text-foreground-muted leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA Partner ── */}
        <div className="bg-surface border border-border rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">Vil bedriften din bli partner i Tønsberglivet?</h3>
            <p className="text-sm text-foreground-muted max-w-lg">
              Få økt synlighet, nettverk med 50+ lederbedrifter og støtt byutviklingen i Tønsberg.
            </p>
          </div>
          <Link
            href="/om-oss/partnere"
            className="px-6 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary-hover transition-colors shadow-sm shrink-0"
          >
            Bli Partner
          </Link>
        </div>
      </div>
    </main>
  );
}
