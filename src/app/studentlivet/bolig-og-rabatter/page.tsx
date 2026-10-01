import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { GraduationCap, Home, Percent, HeartHandshake, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Studentbolig & Rabatter | Tønsberglivet',
  description: 'Informasjon om studentboliger, studentrabatter i Tønsberg og SSN helserefusjon.',
};

const studentOffers = [
  {
    title: 'Studentsamskipnaden (SSN)',
    category: 'Bolig & Velferd',
    desc: 'SSN tilbyr moderne studentboliger på Campus Vestfold og Eik, samt generøs helserefusjonsordning for studenter.',
    image: '/images/tonsberg/studentlivet_usn.jpg',
  },
  {
    title: 'Studentrabatter i Sentrum',
    category: 'Handel & Kafé',
    desc: 'Vis gyldig studentbevis og få eksklusive studentrabatter hos over 40 butikker, kaffebarer og treningssentre.',
    image: '/images/tonsberg/fotograf_varpe_tonsberg.jpg',
  },
  {
    title: 'Ung Arena+ Tønsberg',
    category: 'Helse & Møteplass',
    desc: 'Lavterskel helsetilbud, rådgivning, karriereveiledning og sosiale kvelder for unge og studenter.',
    image: '/images/tonsberg/student_tonsberg.jpg',
  },
  {
    title: 'Kollektivtransport & Tog',
    category: 'VKT & Vy',
    desc: 'Svært gode bussforbindelser mellom Tønsberg sentrum, Bakkenteigen og direkte togforbindelse mot Oslo.',
    image: '/images/tonsberg/tonsberg_panorama.jpg',
  },
];

export default function StudentBoligOgRabatterPage() {
  return (
    <main className="min-h-screen pb-20">
      <HeroSection
        title="Studentbolig & Rabatter"
        subtitle="Studere ved USN Campus Vestfold / Tønsberg"
        description="Få full oversikt over SSN sine studentboliger, studentrabatter i byen og gratis helsetjenester."
        backgroundGradient="linear-gradient(135deg, #DC2626, #EF4444)"
        compact={true}
      />

      <div className="container mx-auto px-4 mt-12 space-y-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {studentOffers.map((o, idx) => (
            <div
              key={idx}
              className="group bg-surface rounded-3xl border border-border overflow-hidden hover:shadow-xl hover:border-red-500/40 transition-all duration-300 flex flex-col"
            >
              <div className="relative h-56 w-full overflow-hidden bg-surface-muted">
                <Image
                  src={o.image}
                  alt={o.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
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
                    Les mer om ordningen &rarr;
                  </span>
                </div>
              </div>
            </div>
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
    </main>
  );
}
