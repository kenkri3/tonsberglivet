import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { Building2, Rocket, Briefcase, Award, Users, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { BusinessCategory } from '@prisma/client';
import { BrregSearchWidget } from '@/components/business/BrregSearchWidget';
import { BusinessGrid, CategoryPills } from '@/components/business/BusinessGrid';
import { hentBedrifter, hentBedriftstellinger } from '@/lib/business-directory';

export const metadata: Metadata = {
  title: 'Bedriftene i Tønsberg | Tønsberglivet',
  description: 'Utforsk over 7 500 bedrifter og 33 000 arbeidsplasser i Tønsbergregionen via Brønnøysundregistrene.',
};

// Registeret hentes fra databasen ved hvert besøk.
export const dynamic = 'force-dynamic';

const KATEGORIER: Record<string, { label: string; href: string; enum: BusinessCategory | null }> = {
  alle: { label: 'Alle', href: '/naeringslivet/bedrifter', enum: null },
  MAT_DRIKKE: {
    label: 'Mat & drikke',
    href: '/naeringslivet/bedrifter?kategori=MAT_DRIKKE',
    enum: BusinessCategory.MAT_DRIKKE,
  },
  SHOPPING: {
    label: 'Shopping',
    href: '/naeringslivet/bedrifter?kategori=SHOPPING',
    enum: BusinessCategory.SHOPPING,
  },
  AKTIVITET: {
    label: 'Aktivitet',
    href: '/naeringslivet/bedrifter?kategori=AKTIVITET',
    enum: BusinessCategory.AKTIVITET,
  },
  OVERNATTING: {
    label: 'Overnatting',
    href: '/naeringslivet/bedrifter?kategori=OVERNATTING',
    enum: BusinessCategory.OVERNATTING,
  },
  FRISOR_VELVERE: {
    label: 'Frisør & velvære',
    href: '/naeringslivet/bedrifter?kategori=FRISOR_VELVERE',
    enum: BusinessCategory.FRISOR_VELVERE,
  },
  KULTUR: {
    label: 'Kultur',
    href: '/naeringslivet/bedrifter?kategori=KULTUR',
    enum: BusinessCategory.KULTUR,
  },
  BARN: { label: 'Barn', href: '/naeringslivet/bedrifter?kategori=BARN', enum: BusinessCategory.BARN },
  ANNET: { label: 'Annet', href: '/naeringslivet/bedrifter?kategori=ANNET', enum: BusinessCategory.ANNET },
};

const businessClusters = [
  { name: 'Gründerhuset Hi5', desc: 'Miljø for oppstartsbedrifter, inkubatorer og gründervekst midt i sentrum.', tag: 'Gründermiljø' },
  { name: 'Foynkvartalet & Sentrum', desc: 'Finans, advokat, konsulent og kompetansearbeidsplasser langs brygga.', tag: 'Tjenesteyting' },
  { name: 'Kaldnes Vest', desc: 'Nyskapende nærings- og boligområde ved byfjorden.', tag: 'Næringsareal' },
  { name: 'Statens Park', desc: 'Offentlige kompetansearbeidsplasser, offentlig forvaltning og helsehovedkvarter.', tag: 'Offentlig & Helse' },
];

export default async function BedrifterPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const { kategori } = await searchParams;
  const valgt = kategori && KATEGORIER[kategori] ? kategori : 'alle';
  const valgtEnum = KATEGORIER[valgt].enum;

  const [bedrifter, tellinger] = await Promise.all([
    hentBedrifter(valgtEnum ?? undefined, 200),
    hentBedriftstellinger(),
  ]);

  const totalt = Object.values(tellinger).reduce((a, b) => a + b, 0);

  return (
    <main className="min-h-screen pb-20 space-y-12">
      <HeroSection
        title="Bedriftene i Tønsberg"
        subtitle="7 500+ Bedrifter & 33 000 Arbeidsplasser"
        description="Tønsberg er næringshovedstaden i Vestfold med et drivende næringsliv innen helse, finans, IT og gründerånd. Søk i offisielle registerdata fra Brønnøysundregistrene nedenfor."
        backgroundGradient="linear-gradient(135deg, #7C3AED, #8B5CF6)"
        backgroundImage="/images/tonsberg/arbeidsliv-verneutstyr.jpg"
        imageAlt="Lærling med hørselsvern og vernebriller"
        priority
        compact={true}
      />

      <div className="container mx-auto px-4 space-y-12 max-w-6xl">
        {/* ── Brønnøysundregistrene Live API Widget ── */}
        <section>
          <BrregSearchWidget />
        </section>

        {/* ── Bedriftsregisteret ── */}
        <section className="space-y-5">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Bedriftsregisteret</h2>
            <p className="text-sm text-foreground-muted mt-1">
              {totalt > 0
                ? `${totalt} bedrifter i Tønsberg og Færder, hentet fra Tønsberglivets eget register.`
                : 'Bedriftene hentes fra Tønsberglivets eget register.'}
            </p>
          </div>

          <CategoryPills tellinger={tellinger} baseSti="/naeringslivet/bedrifter" aktiv={valgt} etiketter={KATEGORIER} />

          <BusinessGrid
            bedrifter={bedrifter}
            visKategori={valgt === 'alle'}
            tomTekst="Ingen bedrifter er publisert i denne kategorien ennå."
          />
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
