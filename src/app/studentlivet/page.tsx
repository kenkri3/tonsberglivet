import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { 
  GraduationCap, Home, HeartPulse, Ticket, Briefcase, 
  BookOpen, Coffee, PartyPopper
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Studentlivet i Tønsberg | Tønsberglivet',
  description: 'Student i Tønsberg? Finn informasjon om bolig, helse, studentrabatter og fritidstilbud.',
};

export default function StudentlivetPage() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <HeroSection 
        title="Studentlivet"
        subtitle="Student i Tønsberg"
        description="Velkommen som student i Norges eldste by! Her får du en studietid med nærhet til både campus, natur og et pulserende byliv."
        backgroundGradient="linear-gradient(135deg, #DC2626, #EF4444)"
        compact={true}
      />

      {/* Intro */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <GraduationCap className="h-16 w-16 text-red-600 dark:text-red-500 mx-auto" />
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Studer på USN Campus Vestfold</h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Universitetet i Sørøst-Norge (USN) sin campus i Vestfold ligger på Bakkenteigen, sentralt mellom Horten og Tønsberg. Som student i Tønsberg får du oppleve et intimt, men levende studentmiljø i en av Norges mest attraktive kystbyer.
          </p>
        </div>
      </section>

      {/* Bolig og økonomi / Helse og trivsel */}
      <section className="bg-white dark:bg-slate-900 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Bolig */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <Home className="h-8 w-8 text-red-600 dark:text-red-500" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Bolig og økonomi</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Tønsberg tilbyr mange bomuligheter for studenter. Du kan finne rimelige studentboliger gjennom Studentsamskipnaden (SSN), eller leie privat.
              </p>
              <ul className="space-y-4">
                <li className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white">Gode nabolag</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Mange studenter velger å bo sentrumsnært eller på Eik for kort vei til bussforbindelser mot campus.</p>
                </li>
                <li className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white">Leie til eie</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Lokale initiativer for førstegangskjøpere og unge som vil inn på boligmarkedet.</p>
                </li>
              </ul>
            </div>

            {/* Helse */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <HeartPulse className="h-8 w-8 text-red-600 dark:text-red-500" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Helse og trivsel</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Det er viktig å ta vare på seg selv i studietiden. Regionen har et sterkt fokus på unges helse og trivsel.
              </p>
              <ul className="space-y-4">
                <li className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white">Ung arena+ / Ungdomshelsestasjon</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Gratis tilbud for deg mellom 13-24 (og opp til 25) for veiledning og helsehjelp.</p>
                </li>
                <li className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white">SSN Helse refusjon</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Som student kan du få refundert store deler av utgiftene til lege, tannlege og psykolog.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Studenttilbud & Fritid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">Livet utenfor forelesningssalen</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            icon={<Ticket />} 
            title="Studenttilbud" 
            desc="Få rabatter på kafeer, kulturtilbud, trening og hos frisører rundt om i Tønsberg."
          />
          <FeatureCard 
            icon={<PartyPopper />} 
            title="Fadderuke & Sosialt" 
            desc="Delta i fadderuken, bli med i studentforeninger og uteliv for å bygge nettverk."
          />
          <FeatureCard 
            icon={<BookOpen />} 
            title="Bibliotek & Lesesaler" 
            desc="Bruk Tønsberg og Nøtterøy bibliotek som et flott sted for kollokviegrupper og egenstudier."
          />
          <FeatureCard 
            icon={<Briefcase />} 
            title="Deltidsjobb" 
            desc="Gode muligheter for deltidsjobb i handel-, servering- og servicebransjen i byen."
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 text-center">
      <div className="inline-flex items-center justify-center p-3 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-xl mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">{desc}</p>
    </div>
  );
}
