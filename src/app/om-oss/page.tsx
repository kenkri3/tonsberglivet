import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSection } from '@/components/ui/HeroSection';
import { 
  Users, 
  Target, 
  Building2, 
  CalendarHeart, 
  Handshake, 
  Sparkles, 
  Eye, 
  Heart, 
  Zap, 
  ArrowRight,
  ShieldCheck,
  Mail,
  Phone
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Om Oss | Tønsberglivet',
  description: 'Bli kjent med Tønsberglivet AS, vårt samfunnsoppdrag for Norges eldste by og vår organisering.',
};

const pillars = [
  {
    title: 'Mer synlighet',
    desc: 'Løfte frem alt det fantastiske som skjer i Tønsberg og Færder gjennom helhetlig markedsføring og felles digitale kanaler.',
    icon: Eye,
    color: 'from-blue-600 to-cyan-500',
  },
  {
    title: 'Mer stolthet',
    desc: 'Bygge lokal identitet og patriotisme. Være stolte av vår unike historie, kulturarv og det pulserende fellesskapet vi har i dag.',
    icon: Heart,
    color: 'from-rose-500 to-pink-500',
  },
  {
    title: 'Mer liv',
    desc: 'Skape aktiviteter, markeder, kultur og arrangementer som fyller gater, torg og bryggekanter gjennom alle årets fire årstider.',
    icon: Sparkles,
    color: 'from-amber-500 to-orange-500',
  },
  {
    title: 'Mer kraft',
    desc: 'Styrke næringslivet, tiltrekke nye etableringer og skape robuste samarbeidsarenaer mellom kommune, gårdeiere og handelsstand.',
    icon: Zap,
    color: 'from-emerald-500 to-teal-500',
  },
];

const teamMembers = [
  {
    name: 'Jonas M. Hauge',
    role: 'Daglig Leder',
    email: 'jonas@tonsberglivet.no',
    phone: '+47 971 69 755',
    bio: 'Brenner for byutvikling, næringsvekst og levende byrom i Norges eldste by.',
  },
  {
    name: 'Maren Solberg',
    role: 'Prosjektleder Byliv & Torv',
    email: 'torvet@tonsberglivet.no',
    phone: '+47 900 12 345',
    bio: 'Ansvarlig for markeder, torvleie, Tønsbergdagen og sesongbaserte byaktiviteter.',
  },
  {
    name: 'Henrik Lindqvist',
    role: 'Kommunikasjon & Digitale Kanaler',
    email: 'post@tonsberglivet.no',
    phone: '+47 912 34 567',
    bio: 'Formidler de gode historiene og drifter portal, sosiale medier og felleskampanjer.',
  },
];

const boardMembers = [
  { role: 'Styreleder', rep: 'Tønsberg Næringsforening & Handel' },
  { role: 'Nestleder', rep: 'Tønsberg Kommune v/ Byutvikling' },
  { role: 'Styremedlem', rep: 'Gårdeierforeningen i Sentrum' },
  { role: 'Styremedlem', rep: 'Reiseliv & Opplevelsesnæringen' },
  { role: 'Styremedlem', rep: 'Kulturlivet & Frivilligheten' },
];

export default function OmOssPage() {
  return (
    <main className="min-h-screen pb-20 bg-background">
      <HeroSection 
        title="Om Tønsberglivet" 
        subtitle="Hvem er vi?" 
        description="Tønsberglivet AS er et non-profit bysamarbeid som samler kommune, næringsliv og innbyggere for å utvikle regionen til et enda mer pulserende og attraktivt sted."
        backgroundGradient="linear-gradient(135deg, #16193d 0%, #1e3a5f 50%, #0c0e24 100%)"
        backgroundImage="/images/legacy/frivilligbors-7.jpg"
        imageAlt="To personer håndhilser på en frivilligbørs i Tønsberg"
        priority
        compact={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 md:mt-16 space-y-16 sm:space-y-20">
        
        {/* Selskapet Hero Feature */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-surface rounded-3xl p-6 sm:p-10 md:p-12 border border-border/80 shadow-md">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>Aksjeselskap uten utbytte</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Et unikt spleiselag for byens fremtid
            </h2>
            <p className="text-foreground-muted text-base leading-relaxed">
              Tønsberglivet AS ble stiftet med ett eneste formål: å styrke Tønsberg som fylkets ubestridte handelssentrum, kystsmykke og vekstmotor. Vi deler ikke ut utbytte – hver eneste krone reinvesteres i fysiske tiltak, fellesmarkedsføring, pynting, renhold og arrangementer.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-foreground-subtle">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-primary" /> Org.nr: 921 547 381</span>
              <span>•</span>
              <span>Rådhusgaten 1, 3126 Tønsberg</span>
            </div>
          </div>
          
          <div className="lg:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-border">
            <Image 
              src="/images/tonsberg/prisutdeling-med-diplom-og-blomste.jpg" 
              alt="Prisutdeling med diplom og blomster" 
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover img-crop-top"
            />
          </div>
        </section>

        {/* Samfunnsoppdraget - De fire søylene */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-primary block">
              Vårt Formål
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              Samfunnsoppdraget
            </h2>
            <p className="text-foreground-muted text-sm sm:text-base font-light">
              Fire felles løft som styrer alt vi gjør fra dag til dag.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div 
                  key={idx}
                  className="bg-surface rounded-3xl p-6 sm:p-7 border border-border/80 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${pillar.color} text-white flex items-center justify-center mb-5 shadow-sm`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Team & Ansatte */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary block mb-1">
                Folkene Bak
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Administrasjonen i Tønsberglivet
              </h2>
            </div>
            <p className="text-xs text-foreground-subtle">
              Vi holder til i Rådhusgaten 1
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teamMembers.map((member, i) => (
              <div 
                key={i} 
                className="bg-surface rounded-3xl p-6 sm:p-7 border border-border/80 shadow-sm flex flex-col justify-between space-y-5 hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{member.name}</h3>
                    <p className="text-xs font-semibold text-primary">{member.role}</p>
                  </div>
                  <p className="text-xs text-foreground-muted leading-relaxed">
                    {member.bio}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/60 space-y-2 text-xs text-foreground-muted">
                  <a href={`mailto:${member.email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                    <Mail className="w-3.5 h-3.5 text-primary" /> {member.email}
                  </a>
                  <a href={`tel:${member.phone}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                    <Phone className="w-3.5 h-3.5 text-primary" /> {member.phone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Styret */}
        <section className="bg-surface rounded-3xl p-8 sm:p-10 border border-border/80 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Styret i Tønsberglivet AS</h2>
              <p className="text-xs text-foreground-muted">Bred representasjon fra offentlig og privat sektor</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {boardMembers.map((b, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-surface-muted border border-border flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center text-primary font-bold text-sm shadow-2xs">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">{b.role}</h4>
                  <p className="text-xs text-foreground-muted">{b.rep}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Handlingsknapper / Hurtiglenker */}
        <section className="flex flex-wrap gap-4 justify-center pt-4">
          <Link 
            href="/om-oss/partnere" 
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-full font-bold text-sm shadow-md transition-all"
          >
            <span>Se våre partnere</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link 
            href="/kontakt" 
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-surface hover:bg-surface-muted text-foreground border border-border rounded-full font-bold text-sm shadow-2xs transition-all"
          >
            <span>Kontakt oss</span>
          </Link>
          <Link 
            href="/prosjekter" 
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-surface hover:bg-surface-muted text-foreground border border-border rounded-full font-bold text-sm shadow-2xs transition-all"
          >
            <span>Våre prosjekter</span>
          </Link>
        </section>

      </div>
    </main>
  );
}
