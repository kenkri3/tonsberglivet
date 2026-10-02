'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronRight, Sparkles, MapPin, Store, Home, Building2, Compass, GraduationCap } from 'lucide-react';
import { 
  BylivetLogo, HverdagslivetLogo, NaeringslivetLogo, 
  ReiselivetLogo, StudentlivetLogo 
} from '@/components/brand/BrandLogos';

interface LifePillar {
  id: string;
  name: string;
  logo: React.ReactNode;
  tagline: string;
  description: string;
  image: string;
  href: string;
  accentColor: string;
  accentBg: string;
  badgeBg: string;
  badgeText: string;
  stats: string;
  highlights: { label: string; href: string }[];
}

const pillars: LifePillar[] = [
  {
    id: 'bylivet',
    name: 'Bylivet',
    logo: <BylivetLogo className="h-7 w-auto fill-current" />,
    tagline: 'Handel, uteservering & kystmagi',
    description: 'Opplev den unike stemningen langs Tønsberg Brygge, spennende nisjebutikker i Storgaten og levende markeder på Tønsberg Torv.',
    image: '/images/tonsberg/folkefest.jpg',
    href: '/bylivet',
    accentColor: '#1D4ED8',
    accentBg: 'from-blue-600 to-indigo-700',
    badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
    badgeText: 'Brygga & Sentrum',
    stats: '300+ butikker & spisesteder',
    highlights: [
      { label: 'Shopping & Mote', href: '/bylivet/shopping' },
      { label: 'Mat & Drikke på Brygga', href: '/bylivet/mat-og-drikke' },
      { label: 'Kultur & Aktiviteter', href: '/bylivet/aktiviteter' },
      { label: 'Sentrumsgavekortet', href: '/bylivet/gavekort' },
      { label: 'Torvleie på Torvet', href: '/bylivet/torvleie' },
    ],
  },
  {
    id: 'hverdagslivet',
    name: 'Hverdagslivet',
    logo: <HverdagslivetLogo className="h-7 w-auto fill-current" />,
    tagline: 'Det gode liv mellom sjø og skog',
    description: 'Korte avstander, trygge oppvekstmiljøer, fantastisk kyststi rett utenfor døren og et rikt foreningsliv gjør Tønsberg til fylkets mest populære bosted.',
    image: '/images/tonsberg/hostmarked.jpg',
    href: '/hverdagslivet',
    accentColor: '#059669',
    accentBg: 'from-emerald-600 to-teal-700',
    badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    badgeText: 'Bo & Oppvekst',
    stats: 'Vestfolds #1 tilflytterkommune',
    highlights: [
      { label: '10 gode grunner til å flytte', href: '/hverdagslivet#grunner' },
      { label: 'Nabolag & Skoler', href: '/hverdagslivet' },
      { label: 'Frivillighet & Idrett', href: '/hverdagslivet' },
      { label: 'Kyststier & Friluft', href: '/reiselivet/opplevelser' },
    ],
  },
  {
    id: 'naeringslivet',
    name: 'Næringslivet',
    logo: <NaeringslivetLogo className="h-7 w-auto fill-current" />,
    tagline: 'Kraftsentrum for vekst og nyskaping',
    description: 'Et fremoverlent næringsliv med 7 500 bedrifter, ledende fagmiljøer innen IT, maritim teknologi og finans, og Gründerhuset Hi5 som arnested for vekst.',
    image: '/images/tonsberg/byen_fra_luften.jpg',
    href: '/naeringslivet',
    accentColor: '#7C3AED',
    accentBg: 'from-purple-600 to-indigo-800',
    badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200',
    badgeText: 'Innovasjon & Jobb',
    stats: '33 000+ arbeidsplasser',
    highlights: [
      { label: 'Bedriftene i Tønsberg', href: '/naeringslivet/bedrifter' },
      { label: 'Etablering & Lokaler', href: '/naeringslivet/etablering' },
      { label: 'Gründerhuset Hi5', href: '/naeringslivet/bedrifter' },
      { label: 'Bli Partner i Tønsberglivet', href: '/om-oss/partnere' },
    ],
  },
  {
    id: 'reiselivet',
    name: 'Reiselivet',
    logo: <ReiselivetLogo className="h-7 w-auto fill-current" />,
    tagline: 'Historiske perler & vill skjærgård',
    description: 'Fra det mektige Slottsfjelltårnet og tusen år gammel vikinghistorie til blankskurte svaberg ved Verdens Ende og Færder Nasjonalpark.',
    image: '/images/tonsberg/brygge_solnedgang.jpg',
    href: '/reiselivet',
    accentColor: '#D97706',
    accentBg: 'from-amber-600 to-orange-700',
    badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    badgeText: 'Destinasjon & Opplevelser',
    stats: 'Norges eldste kystby',
    highlights: [
      { label: 'Verdens Ende & Vippefyret', href: '/reiselivet/opplevelser' },
      { label: 'Hoteller & Overnatting', href: '/reiselivet/overnatting' },
      { label: 'Færder Nasjonalpark', href: '/reiselivet/opplevelser' },
      { label: '10 grunner til å besøke', href: '/reiselivet#grunner' },
    ],
  },
  {
    id: 'studentlivet',
    name: 'Studentlivet',
    logo: <StudentlivetLogo className="h-7 w-auto fill-current" />,
    tagline: 'Studiested med puls og samhold',
    description: 'USN Campus Vestfold byr på toppmoderne fasiliteter, et tettvevd studentfellesskap, gode boligordninger via SSN og rabatter i hele Tønsberg sentrum.',
    image: '/images/tonsberg/student_park.jpg',
    href: '/studentlivet',
    accentColor: '#DC2626',
    accentBg: 'from-red-600 to-rose-700',
    badgeBg: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
    badgeText: 'USN & Fellesskap',
    stats: '5 000+ studenter ved USN',
    highlights: [
      { label: 'Studentbolig & SSN', href: '/studentlivet/bolig-og-rabatter' },
      { label: 'Studentrabatter i sentrum', href: '/studentlivet/bolig-og-rabatter' },
      { label: 'Ung Arena+ & Trivsel', href: '/studentlivet' },
      { label: 'Uteliv på Brygga', href: '/bylivet/mat-og-drikke' },
    ],
  },
];

export function FiveLivesShowcase() {
  const [activeTab, setActiveTab] = useState(0);
  const active = pillars[activeTab];

  return (
    <section className="space-y-8">
      {/* Seksjonstittel */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-muted border border-border text-foreground-muted text-[11px] font-semibold uppercase tracking-wider mb-2">
            <span>Fem dimensjoner • Ett fellesskap</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            De fem livene i Tønsberg
          </h2>
          <p className="text-foreground-muted text-base md:text-lg mt-2 max-w-2xl font-light">
            Vårt samfunnsoppdrag er å samle og styrke hele regionen. Velg et liv og opplev mulighetene.
          </p>
        </div>

        <Link
          href="/om-oss"
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline transition-all"
        >
          <span>Om samfunnsoppdraget</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Tabs Selector med offisielle merkevare-SVGer */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none">
        {pillars.map((p, idx) => {
          const isActive = idx === activeTab;
          return (
            <button
              key={p.id}
              onClick={() => setActiveTab(idx)}
              className={`flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-2xl font-bold transition-all duration-300 whitespace-nowrap shrink-0 border ${
                isActive
                  ? 'bg-surface shadow-lg border-primary/40 text-foreground scale-[1.02] ring-2 ring-primary/20'
                  : 'bg-surface-muted/70 hover:bg-surface border-border text-foreground-muted hover:text-foreground opacity-80 hover:opacity-100'
              }`}
              aria-label={`Velg ${p.name}`}
            >
              <div className={`h-4 sm:h-5 transition-transform ${isActive ? 'scale-105' : ''}`}>
                {p.logo}
              </div>
            </button>
          );
        })}
      </div>

      {/* Hero Showcase Display Card */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white border border-border shadow-2xl min-h-[460px] grid grid-cols-1 lg:grid-cols-12 transition-all duration-500">
        
        {/* Bakgrunnsbilde med cinematic gradient */}
        <div className="lg:col-span-7 relative min-h-[280px] lg:min-h-full overflow-hidden">
          <Image
            src={active.image}
            alt={active.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover object-center transition-all duration-700 scale-100 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-slate-950/40 lg:to-slate-950" />
          
          {/* Badge over bilde */}
          <div className="absolute top-6 left-6 flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md ${active.badgeBg}`}>
              {active.badgeText}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-black/60 backdrop-blur-md text-white border border-white/10">
              {active.stats}
            </span>
          </div>
        </div>

        {/* Innholdsdel */}
        <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-between space-y-6 relative z-10 bg-slate-950/90 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none">
          <div className="space-y-4">
            
            {/* Logo tittel */}
            <div className="h-8 max-w-[200px] text-white">
              {active.logo}
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight font-serif italic">
              {active.tagline}
            </h3>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed font-light">
              {active.description}
            </p>

            {/* Hurtiglenker */}
            <div className="pt-2 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block">
                Populære snarveier:
              </span>
              <div className="flex flex-wrap gap-2">
                {active.highlights.map((h, i) => (
                  <Link
                    key={i}
                    href={h.href}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-medium text-white transition-all flex items-center gap-1 group"
                  >
                    <span>{h.label}</span>
                    <ChevronRight className="w-3 h-3 text-amber-300 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ))}
              </div>
            </div>

          </div>

          {/* CTA Handlingsknapp */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <Link
              href={active.href}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-slate-900 font-bold text-sm hover:bg-slate-100 transition-all shadow-xl group"
            >
              <span>Utforsk {active.name}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              Offisiell portal
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}
