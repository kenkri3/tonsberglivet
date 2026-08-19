import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { Hotel, Bed, Sun, MapPin, Star } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Overnatting i Tønsberg & Færder | Tønsberglivet',
  description: 'Hoteller, bryggehotell, Engø Gård og Havna Hotell på Tjøme.',
};

const hotels = [
  { name: 'Hotel Klubben', location: 'Nedre Langgate 49, Tønsberg', category: 'Byhotell', desc: 'Legendarisk hotell midt på Brygga med moderne rom, konferanse og sjøutsikt.' },
  { name: 'Quality Hotel Tønsberg', location: 'Oseberg, Tønsberg Brygge', category: 'Bryggehotell & Spa', desc: 'Flott bryggehotell med utendørs basseng på taket, restaurant og konferansefasiliteter.' },
  { name: 'Engø Gård', location: 'Tjøme / Færder', category: 'Eksklusivt & Historisk', desc: 'Idyllisk herregård på Tjøme med stjerne-gastronomi, ro og vakker park.' },
  { name: 'Havna Hotel Tjøme', location: 'Havna, Tjøme', category: 'Skjærgårdshotell', desc: 'Hotell og leiligheter rett ved svabergene på Tjøme med båthavn og badestrand.' },
];

export default function OvernattingPage() {
  return (
    <main className="min-h-screen pb-20">
      <HeroSection
        title="Overnatting"
        subtitle="Byhotell & Skjærgårdsperler"
        description="Finn det perfekte stedet å bo – fra livlige bryggehoteller i Tønsberg sentrum til idylliske Engø Gård på Tjøme."
        backgroundGradient="linear-gradient(135deg, #D97706, #F59E0B)"
        compact={true}
      />

      <div className="container mx-auto px-4 mt-12 space-y-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hotels.map((h, idx) => (
            <div key={idx} className="bg-surface rounded-2xl border border-border p-6 space-y-3 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 bg-amber-100 dark:bg-amber-950 px-3 py-1 rounded-full uppercase tracking-wider">
                  {h.category}
                </span>
                <Hotel className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-bold text-xl text-foreground">{h.name}</h3>
              <p className="text-xs font-semibold text-foreground-subtle flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary" /> {h.location}
              </p>
              <p className="text-sm text-foreground-muted leading-relaxed">{h.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-primary to-blue-700 text-white rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-2xl font-bold mb-2">Opplev også kultur & arrangementer!</h3>
            <p className="text-blue-100 text-sm max-w-lg">
              Kombiner hotelloppholdet med konserter i Foynhagen eller teater på Oseberg.
            </p>
          </div>
          <Link
            href="/eventer"
            className="px-6 py-3.5 bg-white text-primary font-bold rounded-xl hover:bg-blue-50 transition-colors shrink-0 shadow-md"
          >
            Se Hva Skjer
          </Link>
        </div>
      </div>
    </main>
  );
}
