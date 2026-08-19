import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { Map, Zap, CheckCircle2, PhoneCall, Building } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Etablering & Næringsarealer | Tønsberglivet',
  description: 'Starte bedrift eller finne næringsarealer i Tønsberg? Se ledige lokaler og gründerhjelp.',
};

const areas = [
  { name: 'Tønsberg Stasjonsområde', type: 'Kollektivknutepunkt', status: 'Under utvikling', desc: 'Moderne kontorlokaler 1.5 time fra Oslo med tog.' },
  { name: 'Foynkvartalet', type: 'Sentrumskjerne', status: 'Ledige lokaler', desc: 'Prestige-adresse i Nedre Langgate med førsteklasses arkitektur.' },
  { name: 'Kaldnes Vest', type: 'Sjøfront & Næring', status: 'Under regulering', desc: 'Ny bydel med kombinasjon av høyteknologi, kontor og bolig.' },
  { name: 'Statens Park', type: 'Helse & Offentlig', status: 'Etablert næringspark', desc: 'Klynge for helsebedrifter, konsulenter og statlige organisasjoner.' },
];

export default function EtableringPage() {
  return (
    <main className="min-h-screen pb-20">
      <HeroSection
        title="Etablering & Næringsarealer"
        subtitle="Etabler bedrift i Tønsbergregionen"
        description="Få hjelp til oppstart via Gründerhuset Hi5, START-programmet og sjekk ledige næringsarealer."
        backgroundGradient="linear-gradient(135deg, #1E3A5F, #1D4ED8)"
        compact={true}
      />

      <div className="container mx-auto px-4 mt-12 space-y-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {areas.map((a, idx) => (
            <div key={idx} className="bg-surface rounded-2xl border border-border p-6 space-y-3 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary bg-primary-light px-3 py-1 rounded-full uppercase tracking-wider">
                  {a.type}
                </span>
                <span className="text-xs font-semibold text-success bg-success-light px-2.5 py-0.5 rounded-full">
                  {a.status}
                </span>
              </div>
              <h3 className="font-bold text-xl text-foreground">{a.name}</h3>
              <p className="text-sm text-foreground-muted leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-surface-muted border border-border rounded-3xl p-8 text-center space-y-4">
          <h3 className="text-2xl font-bold text-foreground">Trenger du rådgivning om etablering?</h3>
          <p className="text-sm text-foreground-muted max-w-lg mx-auto">
            Ta kontakt med oss i Tønsberglivet for å bli satt i direkte kontakt med næringsavdelingen i kommune og regionale investorer.
          </p>
          <Link
            href="/kontakt"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary-hover transition-colors shadow-sm"
          >
            <PhoneCall className="w-4 h-4" /> Kontakt Næringsrådgiver
          </Link>
        </div>
      </div>
    </main>
  );
}
