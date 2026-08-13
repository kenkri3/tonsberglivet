import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { 
  Heart, MapPin, Anchor, Palette, Wallet, Trees, 
  GraduationCap, Stethoscope, Dumbbell, Users, Landmark,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Hverdagslivet i Tønsberg | Tønsberglivet',
  description: 'Bo og lev i Tønsbergregionen. Opplev en fantastisk hverdag med kyst, kultur og fellesskap.',
};

export default function HverdagslivetPage() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <HeroSection 
        title="Hverdagslivet"
        subtitle="Bo i Tønsberg"
        description="Å bo i Tønsbergregionen gir deg det beste av to verdener – nærhet til urbane fasiliteter og kort vei til fantastisk natur og skjærgård."
        backgroundGradient="linear-gradient(135deg, #059669, #10B981)"
        compact={true}
      />

      {/* Intro */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Et fantastisk sted å bo</h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Tønsberg og Færder byr på en unik kombinasjon av rik historie, et pulserende kulturliv og naturskjønne omgivelser. Enten du er på jakt etter en urban leilighet midt i byen, eller et fredelig hus nær sjøen, har regionen noe å tilby for enhver smak og livsfase.
          </p>
        </div>
      </section>

      {/* 10 gode grunner */}
      <section className="bg-white dark:bg-slate-900 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">10 gode grunner til å flytte til Tønsbergregionen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <ReasonCard icon={<MapPin className="h-8 w-8 text-emerald-600" />} title="1. Nærhet til Oslo" desc="Kort reisevei til hovedstaden med tog eller bil." />
            <ReasonCard icon={<Anchor className="h-8 w-8 text-emerald-600" />} title="2. Fantastisk kystlinje" desc="Færder nasjonalpark og flotte badestrender rett utenfor døra." />
            <ReasonCard icon={<Palette className="h-8 w-8 text-emerald-600" />} title="3. Rikt kulturliv" desc="Konserter, festivaler og teater året rundt." />
            <ReasonCard icon={<Wallet className="h-8 w-8 text-emerald-600" />} title="4. Overkommelige boligpriser" desc="Mer for pengene enn i hovedstadsområdet." />
            <ReasonCard icon={<Trees className="h-8 w-8 text-emerald-600" />} title="5. Nydelig natur" desc="Turstier, skog og mark lett tilgjengelig." />
            <ReasonCard icon={<GraduationCap className="h-8 w-8 text-emerald-600" />} title="6. Gode skoler" desc="Trygge og gode oppvekstvilkår med moderne skoler." />
            <ReasonCard icon={<Stethoscope className="h-8 w-8 text-emerald-600" />} title="7. Utmerket helsetilbud" desc="Sykehuset i Vestfold og gode lokale helsetjenester." />
            <ReasonCard icon={<Dumbbell className="h-8 w-8 text-emerald-600" />} title="8. Bredt idrettstilbud" desc="Klubber og anlegg for nesten enhver idrett." />
            <ReasonCard icon={<Users className="h-8 w-8 text-emerald-600" />} title="9. Sterkt fellesskap" desc="Inkluderende lokalsamfunn og aktive velforeninger." />
            <ReasonCard icon={<Landmark className="h-8 w-8 text-emerald-600" />} title="10. Historisk sus" desc="Norges eldste by med spennende vikinghistorie." />
          </div>
        </div>
      </section>

      {/* Frivillighet */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-8 text-slate-900 dark:text-white">Frivillighet og engasjement</h2>
        <p className="text-center text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-12">
          Regionen vår er bygget på sterkt engasjement. Gjennom frivillig arbeid kan du bli kjent med nye mennesker og bidra til samfunnet.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <Heart className="h-10 w-10 text-rose-500 mb-4" />
            <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Kirkens Bymisjon</h3>
            <p className="text-slate-600 dark:text-slate-300">Bidrar til et varmere og mer inkluderende samfunn i Tønsberg.</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <Heart className="h-10 w-10 text-rose-500 mb-4" />
            <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Røde Kors</h3>
            <p className="text-slate-600 dark:text-slate-300">Aktiv lokallag som driver med redning, omsorg og ungdomsarbeid.</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <Heart className="h-10 w-10 text-rose-500 mb-4" />
            <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Frelsesarmeen</h3>
            <p className="text-slate-600 dark:text-slate-300">Tilbyr suppe, såpe og frelse, med sterkt nærvær i bybildet.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-emerald-50 dark:bg-emerald-900/20 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Opplev hva som skjer i byen</h2>
          <Link href="/hva-skjer" className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-all">
            Se arrangementer <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function ReasonCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex flex-col p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400">{desc}</p>
    </div>
  );
}
