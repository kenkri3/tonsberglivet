import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { SectionCard } from '@/components/ui/Cards';
import { 
  Compass, Map, Utensils, BedDouble, Trees, Castle,
  Ship, Sun, Music, Camera, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Reiselivet i Tønsberg | Tønsberglivet',
  description: 'Besøk Færder og Tønsberg. Opplev fantastisk skjærgård, historiske steder, god mat og spennende aktiviteter.',
};

export default function ReiselivetPage() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <HeroSection 
        title="Reiselivet"
        subtitle="Besøk Færder & Tønsberg"
        description="Norges eldste by byr på en uforglemmelig miks av vikinghistorie, idyllisk skjærgård og et yrende byliv på Brygga."
        backgroundGradient="linear-gradient(135deg, #D97706, #F59E0B)"
        compact={true}
      />

      {/* 10 gode grunner */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">10 gode grunner til å besøke oss</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <ReasonBadge icon={<Sun />} text="Skjærgårdsidyll" />
          <ReasonBadge icon={<Castle />} text="Slottsfjellet" />
          <ReasonBadge icon={<Utensils />} text="Brygga i Tønsberg" />
          <ReasonBadge icon={<Ship />} text="Vikinghistorie" />
          <ReasonBadge icon={<Trees />} text="Verdens Ende" />
          <ReasonBadge icon={<Music />} text="Sommerkonserter" />
          <ReasonBadge icon={<Camera />} text="Gode opplevelser" />
          <ReasonBadge icon={<Compass />} text="Færder Nasjonalpark" />
          <ReasonBadge icon={<Map />} text="Bolærne" />
          <ReasonBadge icon={<BedDouble />} text="Unik overnatting" />
        </div>
      </section>

      {/* Overnatting */}
      <section className="bg-white dark:bg-slate-900 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white">Overnatting</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SectionCard title="Hotel Klubben" description="Legendarisk hotell midt i hjertet av byen med fantastisk utsikt over havna." href="#" gradient="linear-gradient(135deg, #D97706, #F59E0B)" />
            <SectionCard title="Quality Hotel Tønsberg" description="Moderne hotell på Brygga, perfekt for både familier og forretningsreisende." href="#" gradient="linear-gradient(135deg, #B45309, #D97706)" />
            <SectionCard title="Engø Gård" description="En oase av ro på Tjøme, kjent for gastronomi i særklasse og unik atmosfære." href="#" gradient="linear-gradient(135deg, #92400E, #B45309)" />
            <SectionCard title="Havna Hotell" description="Idyllisk beliggende på Tjøme med fantastiske bademuligheter og marina." href="#" gradient="linear-gradient(135deg, #78350F, #92400E)" />
          </div>
        </div>
      </section>

      {/* Mat & Drikke og Aktiviteter */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Mat & drikke</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
              Fra fersk sjømat på Tønsberg Brygge til prisbelønte fine dining-restauranter. Regionen vår er et eldorado for matelskere. Vi har lokale gårdsutsalg, sjarmerende kaffebarer og restauranter som serverer det beste fra hav og land.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center text-slate-700 dark:text-slate-200"><Utensils className="h-5 w-5 mr-3 text-amber-500" /> Sjømat og lokale råvarer</li>
              <li className="flex items-center text-slate-700 dark:text-slate-200"><Utensils className="h-5 w-5 mr-3 text-amber-500" /> Yrende folkeliv på Brygga</li>
              <li className="flex items-center text-slate-700 dark:text-slate-200"><Utensils className="h-5 w-5 mr-3 text-amber-500" /> Gårdsbutikker med kortreist mat</li>
            </ul>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Aktiviteter</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
              Er du ute etter fart og spenning, eller ro og fred? Hos oss finner du alt. Utforsk skjærgården i kajakk, dra på øyhopping, eller lær om historien på Slottsfjellsmuseet.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl text-center font-medium text-amber-900 dark:text-amber-100">Kajakk og padling</div>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl text-center font-medium text-amber-900 dark:text-amber-100">Klatring og buldring</div>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl text-center font-medium text-amber-900 dark:text-amber-100">Historiske vandringer</div>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl text-center font-medium text-amber-900 dark:text-amber-100">Museer og gallerier</div>
            </div>
          </div>
        </div>
      </section>

      {/* Færder Nasjonalpark */}
      <section className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Færder Nasjonalpark</h2>
            <p className="text-lg text-slate-300">
              En av Norges viktigste og mest besøkte nasjonalparker. Et eldorado for båtfolk, padlere og friluftsentusiaster, med et unikt marint liv og særpreget kystnatur.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <h3 className="text-xl font-bold mb-3 text-amber-400">Verdens Ende</h3>
              <p className="text-slate-300">Kjent for sitt ikoniske vippefyr og nakne svaberg mot det åpne havet. Besøkssenter for nasjonalparken ligger også her.</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <h3 className="text-xl font-bold mb-3 text-amber-400">Øygruppen Bolærne</h3>
              <p className="text-slate-300">Spennende militærhistorie kombinert med fantastiske turområder, sandstrender og gjestehavn.</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <h3 className="text-xl font-bold mb-3 text-amber-400">Moutmarka</h3>
              <p className="text-slate-300">Naturreservat med spennende rullesteinstrender og artsrik flora, perfekt for fotturer langs kysten.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-amber-50 dark:bg-amber-900/20 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Planlegg ditt besøk</h2>
          <Link href="/hva-skjer" className="inline-flex items-center justify-center rounded-full bg-amber-500 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 transition-all">
            Utforsk arrangementer <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function ReasonBadge({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center hover:border-amber-400 transition-colors">
      <div className="text-amber-500 mb-3 [&>svg]:h-8 [&>svg]:w-8">{icon}</div>
      <span className="font-semibold text-slate-900 dark:text-white">{text}</span>
    </div>
  );
}
