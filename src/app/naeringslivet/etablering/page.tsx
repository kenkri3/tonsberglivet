import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { Map, Zap, CheckCircle2, PhoneCall, Building } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Etablering & Næringsarealer | Tønsberglivet',
  description: 'Starte bedrift eller finne næringsarealer i Tønsberg? Se ledige lokaler og gründerhjelp.',
};

const areas = [
  {
    name: 'Tønsberg Stasjonsområde',
    type: 'Kollektivknutepunkt',
    status: 'Under utvikling',
    desc: 'Moderne kontorlokaler kun 1 time og 15 minutter fra Oslo S med tog.',
    image: '/images/tonsberg/byen_fra_luften.jpg',
  },
  {
    name: 'Foynkvartalet & Bryggekanten',
    type: 'Sentrumskjerne',
    status: 'Ledige lokaler',
    desc: 'Prestige-adresse i Nedre Langgate med førsteklasses arkitektur og utsikt mot kanalen.',
    image: '/images/tonsberg/brygga_full.jpg',
  },
  {
    name: 'Kaldnes Vest & Sjøfronten',
    type: 'Sjøfront & Næring',
    status: 'Under regulering',
    desc: 'Ny urban bydel med kombinasjon av høyteknologi, kontorfellesskap og sjønære boliger.',
    image: '/images/tonsberg/kaldnes_havn.jpg',
  },
  {
    name: 'Statens Park',
    type: 'Helse & Offentlig',
    status: 'Etablert næringspark',
    desc: 'Regional klynge for helsebedrifter, konsulenter, rådgivere og offentlige organisasjoner.',
    image: '/images/tonsberg/torvet_tonsberg.jpg',
  },
];

export default function EtableringPage() {
  return (
    <main className="min-h-screen pb-20">
      <HeroSection
        title="Etablering & Næringsarealer"
        subtitle="Etabler bedrift i Tønsbergregionen"
        description="Få hjelp til oppstart via Gründerhuset Hi5, START-programmet og sjekk ledige næringsarealer."
        backgroundGradient="linear-gradient(135deg, #1E3A5F, #1D4ED8)"
        backgroundImage="/images/tonsberg/byliv_gate.jpg"
        imageAlt="Gatebildet i Tønsberg sentrum"
        priority
        compact={true}
      />

      <div className="container mx-auto px-4 mt-12 space-y-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {areas.map((a, idx) => (
            <div
              key={idx}
              className="group bg-surface rounded-3xl border border-border overflow-hidden hover:shadow-xl hover:border-blue-500/40 transition-all duration-300 flex flex-col"
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
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-white bg-blue-900/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-blue-400/30">
                    {a.type}
                  </span>
                  <span className="text-xs font-semibold text-emerald-300 bg-emerald-950/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-500/30">
                    {a.status}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-bold text-xl text-white drop-shadow-sm">{a.name}</h3>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-sm text-foreground-muted leading-relaxed">{a.desc}</p>
                <div className="pt-2">
                  <span className="inline-flex items-center text-xs font-bold text-primary group-hover:gap-2 gap-1.5 transition-all">
                    Les om området og prosjektene &rarr;
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-surface-muted border border-border rounded-3xl p-8 text-center space-y-4">
          <h3 className="text-2xl font-bold text-foreground">Trenger du rådgivning om etablering?</h3>
          <p className="text-sm text-foreground-muted max-w-lg mx-auto">
            Ta kontakt med oss i Tønsberglivet for å bli satt i direkte kontakt med næringsavdelingen i kommunen og regionale investorer.
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
