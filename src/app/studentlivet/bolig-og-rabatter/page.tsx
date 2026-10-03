import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { GraduationCap, Home, Percent, HeartHandshake, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { BusinessCategory } from '@prisma/client';
import { hentBedrifter } from '@/lib/business-directory';
import { BusinessGrid } from '@/components/business/BusinessGrid';

// Innholdet hentes fra databasen ved hvert besøk.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Studentbolig & Rabatter | Tønsberglivet',
  description: 'Informasjon om studentboliger, studentrabatter i Tønsberg og SSN helserefusjon.',
};

const studentOffers = [
  {
    title: 'Studentsamskipnaden (SSN)',
    category: 'Bolig & Velferd',
    desc: 'SSN tilbyr moderne studentboliger på Campus Vestfold og Eik, samt generøs helserefusjonsordning for studenter.',
    image: '/images/tonsberg/studentlivet-usn.jpg',
    imageAlt: 'Student som leser en bok',
  },
  {
    title: 'Studentrabatter i Sentrum',
    category: 'Handel & Kafé',
    desc: 'Vis gyldig studentbevis og få eksklusive studentrabatter hos over 40 butikker, kaffebarer og treningssentre.',
    image: '/images/tonsberg/studentrabatter-i-sentrum-ungdom-s.jpg',
    imageAlt: 'Ungdom som heier i Tønsberg sentrum',
  },
  {
    title: 'Ung Arena+ Tønsberg',
    category: 'Helse & Møteplass',
    desc: 'Lavterskel helsetilbud, rådgivning, karriereveiledning og sosiale kvelder for unge og studenter.',
    image: '/images/tonsberg/ung-arena-tonsberg-lopegruppe-fora.jpg',
    imageAlt: 'Løpegruppe foran butikkene i Tønsberg',
  },
  {
    title: 'Kollektivtransport & Tog',
    category: 'VKT & Vy',
    desc: 'Svært gode bussforbindelser mellom Tønsberg sentrum, Bakkenteigen og direkte togforbindelse mot Oslo.',
    image: '/images/tonsberg/kollektivtransport-tog-aktiviteter.jpg',
    imageAlt: 'Aktiviteter om bord på et skip i Tønsberg',
  },
];

export default async function StudentBoligOgRabatterPage() {
  const steder = await hentBedrifter(undefined, 12);

  return (
    <main className="min-h-screen pb-20">
      <HeroSection
        title="Studentbolig & Rabatter"
        subtitle="Studere ved USN Campus Vestfold / Tønsberg"
        description="Få full oversikt over SSN sine studentboliger, studentrabatter i byen og gratis helsetjenester."
        backgroundGradient="linear-gradient(135deg, #DC2626, #EF4444)"
        backgroundImage="/images/legacy/Faerderbiennalen-nytt-bilde.jpeg"
        imageAlt="Svaberg og åpent hav ved Færder, like utenfor Tønsberg"
        priority
        compact={true}
      />

      <div className="container mx-auto px-4 mt-12 space-y-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {studentOffers.map((o, idx) => (
            <Link
              key={idx}
              href="#steder"
              className="group bg-surface rounded-3xl border border-border overflow-hidden hover:shadow-xl hover:border-red-500/40 transition-all duration-300 flex flex-col"
            >
              <div className="relative h-56 w-full overflow-hidden bg-surface-muted">
                <Image
                  src={o.image}
                  alt={o.imageAlt ?? o.title}
                  fill
                  className="object-cover img-crop-top group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <span className="absolute top-4 right-4 text-xs font-bold text-white bg-red-900/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-red-400/30">
                  {o.category}
                </span>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-bold text-xl text-white drop-shadow-sm">{o.title}</h3>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-sm text-foreground-muted leading-relaxed">{o.desc}</p>
                <div className="pt-2">
                  <span className="inline-flex items-center text-xs font-bold text-red-600 dark:text-red-400 group-hover:gap-2 gap-1.5 transition-all">
                    Se steder og tilbud &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-2xl font-bold mb-2">Bruk Sentrumsgavekortet som student!</h3>
            <p className="text-red-100 text-sm max-w-lg">
              Sentrumsgavekortet kan brukes hos over 300 steder i Tønsberg – ideelt som gave eller opplevelse.
            </p>
          </div>
          <Link
            href="/bylivet/gavekort"
            className="px-6 py-3.5 bg-white text-red-700 font-bold rounded-xl hover:bg-red-50 transition-colors shrink-0 shadow-md"
          >
            Les om Gavekort
          </Link>
        </div>
      </div>
      {/* ── Fra bedriftsregisteret ── */}
      <section id="steder" className="container mx-auto px-4 max-w-7xl scroll-mt-24">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Steder og tilbud i byen
            </h2>
            <p className="text-sm text-foreground-muted mt-1">Hentet fra Tønsberglivets bedriftsregister.</p>
          </div>
          <Link
            href="/naeringslivet/bedrifter"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Se hele registeret &rarr;
          </Link>
        </div>

        <BusinessGrid
          bedrifter={steder}
          tomTekst="Ingen steder er publisert i registeret ennå."
        />
      </section>

    </main>
  );
}
