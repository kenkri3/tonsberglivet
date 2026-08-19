import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { GraduationCap, Home, Percent, HeartHandshake, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Studentbolig & Rabatter | Tønsberglivet',
  description: 'Informasjon om studentboliger, studentrabatter i Tønsberg og SSN helserefusjon.',
};

const studentOffers = [
  { title: 'Studentsamskipnaden i Sørøst-Norge (SSN)', category: 'Bolig & Helse', desc: 'SSN tilbyr moderne studentboliger på Campus Vestfold / Eik og helserefusjonsordning for studenter.' },
  { title: 'Studentrabatter i Sentrum', category: 'Handel & Kafé', desc: 'Vis gyldig studentbevis hos over 40 butikker, kaffebarer og treningssentre i Tønsberg.' },
  { title: 'Ung Arena+ Tønsberg', category: 'Helse & Møteplass', desc: 'Lavterskel helsetilbud, rådgivning og gratis samtalepartnere for unge og studenter.' },
  { title: 'Kollektivtransport (VKT)', desc: 'Studentrabatt på busslinjene mellom Tønsberg sentrum, Bakkenteigen / Campus Vestfold.' },
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {studentOffers.map((o, idx) => (
            <div key={idx} className="bg-surface rounded-2xl border border-border p-6 space-y-3 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-700 bg-red-100 dark:bg-red-950 px-3 py-1 rounded-full uppercase tracking-wider">
                  {o.category}
                </span>
                <GraduationCap className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-bold text-xl text-foreground">{o.title}</h3>
              <p className="text-sm text-foreground-muted leading-relaxed">{o.desc}</p>
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
