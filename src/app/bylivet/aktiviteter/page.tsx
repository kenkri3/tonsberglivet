import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { Compass, Landmark, Music, Drama, Users, Sparkles } from 'lucide-react';
import Link from 'next/link';

import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Kultur & Aktiviteter | Tønsberglivet',
  description: 'Opplev Slottsfjellet, Oseberg Kulturhus, Tønsberg Bibliotek og spennende byaktiviteter.',
};

const activities = [
  {
    title: 'Slottsfjellet & Tårnet',
    desc: 'Norges største ruinepark fra middelalderen med fantastisk panoramautsikt over hele byfjorden.',
    icon: Landmark,
    image: '/images/slottsfjellet.jpg',
    tag: 'Historisk landemerke',
  },
  {
    title: 'Oseberg Kulturhus',
    desc: 'Teater, standup, konserter og store nasjonale forestillinger på bryggekanten midt i sentrum.',
    icon: Drama,
    image: '/images/tonsberg/kultur_tonsberg.jpg',
    tag: 'Scene & Konserter',
  },
  {
    title: 'Kajakk & Padling',
    desc: 'Padle gjennom Kanalen, rundt Kaldnes og ut mot den fantastiske Færder Nasjonalpark.',
    icon: Compass,
    image: '/images/tonsberg/kajakk_faerder.jpg',
    tag: 'Fjordsafari',
  },
  {
    title: 'Tønsberg Bibliotek & Byliv',
    desc: 'Bynære kulturarrangementer, forfatterkvelder, språktrening, brettspill og barneaktiviteter.',
    icon: Users,
    image: '/images/tonsberg/fotograf_varpe_tonsberg.jpg',
    tag: 'Kulturmøteplass',
  },
  {
    title: 'Vikingodden & Oseberg',
    desc: 'Bli med tilbake til vikingtiden der historien lever i nåtid, med aktiviteter for hele familien.',
    icon: Sparkles,
    image: '/images/tonsberg/local-25.jpg',
    tag: 'Vikinghistorie',
  },
  {
    title: 'Barnas Tønsberg',
    desc: 'Kunstprosjekter, verksteder og familieaktiviteter som setter farger på hele byen.',
    icon: Music,
    image: '/images/tonsberg/barn_aktivitet.jpg',
    tag: 'For hele familien',
  },
];

export default function AktiviteterPage() {
  return (
    <main className="min-h-screen pb-20">
      <HeroSection
        title="Kultur & Aktiviteter"
        subtitle="Historie, Teater & Opplevelser"
        description="Fra tusenårig historie på Slottsfjellet til sprudlende kulturliv og vannaktiviteter på Kanalen."
        backgroundGradient="linear-gradient(135deg, #4C1D95, #7C3AED)"
        backgroundImage="/images/tonsberg/local-25.jpg"
        imageAlt="Vikingodden i Tønsberg"
        priority
        compact={true}
      />

      <div className="container mx-auto px-4 mt-12 space-y-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {activities.map((act, idx) => {
            const Icon = act.icon;
            return (
              <div
                key={idx}
                className="group bg-surface rounded-3xl border border-border overflow-hidden hover:shadow-xl hover:border-purple-500/40 transition-all duration-300 flex flex-col"
              >
                <div className="relative h-52 sm:h-60 w-full overflow-hidden bg-surface-muted">
                  <Image
                    src={act.image}
                    alt={act.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                  <span className="absolute top-4 right-4 max-w-[60%] truncate text-[11px] sm:text-xs font-bold text-white bg-purple-900/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-purple-400/30">
                    {act.tag}
                  </span>
                  <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                    <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl text-white shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-lg sm:text-xl text-white drop-shadow-sm leading-tight">{act.title}</h3>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-sm text-foreground-muted leading-relaxed">{act.desc}</p>
                  <div className="pt-2">
                    <span className="inline-flex items-center text-xs font-bold text-purple-600 dark:text-purple-400 group-hover:gap-2 gap-1.5 transition-all">
                      Les mer om opplevelsen &rarr;
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Billetter Live */}
        <div className="bg-surface border border-border rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full uppercase tracking-wider">
              Ticketmaster Integrert
            </span>
            <h3 className="text-2xl font-bold text-foreground mt-2">Kjøp billetter til kulturopplevelser</h3>
            <p className="text-sm text-foreground-muted mt-1">
              Se konsertprogrammet og kjøp billetter direkte fra arrangementskalenderen.
            </p>
          </div>
          <Link
            href="/eventer"
            className="px-6 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary-hover transition-colors shadow-sm shrink-0"
          >
            Se Arrangementskalender
          </Link>
        </div>
      </div>
    </main>
  );
}
