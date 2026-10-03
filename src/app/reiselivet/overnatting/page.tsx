import { Metadata } from 'next';
import Image from 'next/image';
import { HeroSection } from '@/components/ui/HeroSection';
import { Hotel, Bed, Sun, MapPin, Star } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Overnatting i Tønsberg & Færder | Tønsberglivet',
  description: 'Hoteller, bryggehotell, Engø Gård og Havna Hotell på Tjøme.',
};

const hotels = [
  { 
    name: 'Hotel Klubben', 
    location: 'Nedre Langgate 49, Tønsberg', 
    category: 'Byhotell & Kultur', 
    desc: 'Legendarisk hotell midt på Brygga med moderne rom, anerkjent scene, konferansefasiliteter og fantastisk sjøutsikt over kanalen.',
    image: '/images/tonsberg/hotel-klubben-quality-hotel-tonsbe.jpg'
  },
  { 
    name: 'Quality Hotel Tønsberg', 
    location: 'Oseberg, Tønsberg Brygge', 
    category: 'Bryggehotell & Spa', 
    desc: 'Luksuriøst hotell ved vannkanten med spektakulært oppvarmet takbasseng, The Sense restaurant og førsteklasses velvære.',
    image: '/images/tonsberg/quality-hotel-tonsberg-engo-gaard-.jpg'
  },
  { 
    name: 'Engø Gård Hotel & Restaurant', 
    location: 'Tjøme / Færder', 
    category: 'Eksklusivt & Historisk', 
    desc: 'Idyllisk herregård på Tjøme med stjerne-gastronomi, sjarmerende engelsk stil, ro og prisbelønte matopplevelser.',
    image: '/images/tonsberg/engo-gaard-hotel-restaurant-havna-.jpg'
  },
  { 
    name: 'Havna Hotel Tjøme', 
    location: 'Havna, Tjøme', 
    category: 'Skjærgårdshotell', 
    desc: 'Hotell og leiligheter rett ved svabergene på Tjøme med gjestehavn, badestrand og umiddelbar adgang til Færder nasjonalpark.',
    image: '/images/tonsberg/havna-hotel-tjome.jpg'
  },
];

export default function OvernattingPage() {
  return (
    <main className="min-h-screen pb-20 bg-background">
      <HeroSection
        title="Overnatting"
        subtitle="Byhotell & Skjærgårdsperler"
        description="Finn det perfekte stedet å bo – fra livlige bryggehoteller i Tønsberg sentrum til idylliske herregårder på Tjøme."
        backgroundGradient="linear-gradient(135deg, #b45309 0%, #d97706 50%, #16193d 100%)"
        backgroundImage="/images/tonsberg/overnatting-byhotell-skjaergaardsp.jpg"
        imageAlt="Hotell ved brygga i Tønsberg"
        priority
        compact={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 md:mt-16 space-y-12 sm:space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {hotels.map((h, idx) => (
            <div 
              key={idx} 
              className="bg-surface rounded-3xl border border-border/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-500/30 transition-all duration-300 flex flex-col group"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
                <Image
                  src={h.image}
                  alt={h.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover img-crop-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                <span className="absolute top-4 left-4 text-xs font-bold text-white bg-amber-600/90 backdrop-blur-md px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  {h.category}
                </span>
              </div>

              <div className="p-6 sm:p-8 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-extrabold text-2xl text-foreground group-hover:text-primary transition-colors">{h.name}</h3>
                  <p className="text-xs font-semibold text-foreground-subtle flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" /> {h.location}
                  </p>
                  <p className="text-sm text-foreground-muted leading-relaxed font-light pt-1">{h.desc}</p>
                </div>

                <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Anbefalt av Tønsberglivet</span>
                  <a
                    href="https://booking.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                  >
                    <span>Sjekk tilgjengelighet</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-primary via-blue-700 to-indigo-900 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Kombiner oppholdet med kulturopplevelser</h3>
            <p className="text-blue-100 text-sm sm:text-base max-w-xl font-light">
              Få med deg konserter i Foynhagen, teaterforestillinger på Slottsfjellet eller guidet skjærgårdstur i Færder.
            </p>
          </div>
          <Link
            href="/eventer"
            className="px-8 py-4 bg-white text-slate-900 font-bold text-sm rounded-2xl hover:bg-slate-100 transition-all shrink-0 shadow-lg"
          >
            Se hva som skjer i kveld
          </Link>
        </div>
      </div>
    </main>
  );
}
