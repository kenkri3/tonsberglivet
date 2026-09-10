import { Metadata } from 'next';
import Link from 'next/link';
import { 
  Building2, Briefcase, GraduationCap, MapPin, Coffee, ShoppingBag, 
  Handshake, Users, ArrowRight, Sparkles, Calendar, Clock, ChevronRight, Store, Home as HomeIcon, Palmtree
} from 'lucide-react';
import { fetchLiveTicketmasterEvents } from '@/lib/ticketmaster';
import { PhotoGallery } from '@/components/ui/PhotoGallery';

export const metadata: Metadata = {
  title: 'Tønsberglivet | Norges eldste by',
  description: 'Velkommen til Tønsberglivet. Vi jobber for synlighet, stolthet, liv og kraft i Norges eldste by.',
};

export default async function Home() {
  const events = await fetchLiveTicketmasterEvents();

  const categories = [
    { title: 'Bylivet', href: '/bylivet', image: '/images/brygge.jpg', desc: 'Arrangementer, shopping & mat', icon: Store },
    { title: 'Hverdagslivet', href: '/hverdagslivet', image: '/images/skjaergard.jpg', desc: 'Bo, oppvekst & nabolag', icon: HomeIcon },
    { title: 'Næringslivet', href: '/naeringslivet', image: '/images/grundergata.jpg', desc: 'Næringsparker & innovasjon', icon: Building2 },
    { title: 'Reiselivet', href: '/reiselivet', image: '/images/slottsfjellet.jpg', desc: 'Slottsfjellet & skjærgården', icon: Palmtree },
    { title: 'Studentlivet', href: '/studentlivet', image: '/images/student.jpg', desc: 'USN Campus & studentmiljø', icon: GraduationCap },
  ];

  return (
    <main className="min-h-screen space-y-16 pb-20">
      
      {/* ── 1. Hero Section med ekte Tønsberg-bilde ── */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero.jpg"
            alt="Tønsberg Brygge og Havn"
            className="w-full h-full object-cover object-center scale-105 animate-fade-in"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-slate-950/70 to-slate-950/40" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 relative z-10 w-full">
          <div className="max-w-3xl space-y-6">
            
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white border border-white/20 text-xs font-bold shadow-lg">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Opplev Norges eldste kystby</span>
            </div>

            {/* Tittel */}
            <h1 className="text-white text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] drop-shadow-sm">
              Livet, slik det <br />
              <span className="italic font-light text-amber-200">skal leves.</span>
            </h1>

            {/* Ingress */}
            <p className="text-lg md:text-xl text-slate-200 leading-relaxed font-light drop-shadow">
              Tønsberg kombinerer 1155 års rik kysthistorie med et pulserende byliv, fantastisk skjærgård og et fremtidsrettet næringsliv.
            </p>

            {/* Handlinger */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/bylivet"
                className="px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-full font-bold text-sm shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 group"
              >
                <span>Utforsk Bylivet</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/reiselivet"
                className="px-8 py-4 bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white rounded-full font-bold text-sm transition-all"
              >
                10 grunner til å besøke oss
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── 2. Kategori-stripe med bildemotiver (-mt-16 over hero) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={idx}
                href={cat.href}
                className="bg-surface rounded-2xl p-4 border border-border shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all group flex flex-col justify-between h-44 overflow-hidden relative"
              >
                <div className="absolute inset-0 opacity-15 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500">
                  <img src={cat.image} alt={cat.title} className="w-full h-full object-cover" />
                </div>

                <div className="w-9 h-9 rounded-xl bg-primary-light text-primary group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center relative z-10 shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>

                <div className="relative z-10">
                  <h3 className="font-extrabold text-sm text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                    <span>{cat.title}</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-xs text-foreground-subtle line-clamp-1 mt-0.5">{cat.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── 3. Redaksjonelle reportasjer & Aktuelt ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pt-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary block mb-1">
              Aktuelt & Reportasjer
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Siste nytt fra Tønsbergregionen
            </h2>
          </div>
          <Link
            href="/nyheter"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline transition-all"
          >
            <span>Se alle nyheter</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Stort Hovedkort: Slottsfjellet & Færderbiennalen */}
        <div className="grid grid-cols-1 lg:grid-cols-12 bg-surface rounded-3xl border border-border overflow-hidden shadow-xl hover:shadow-2xl transition-all group">
          <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto overflow-hidden">
            <img
              src="/images/slottsfjellet.jpg"
              alt="Slottsfjellet Tønsberg"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <span className="absolute top-4 left-4 px-3.5 py-1 bg-surface/95 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-foreground border border-border">
              Bylivet & Kultur
            </span>
          </div>

          <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs text-foreground-subtle">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-primary" /> 18. August 2026</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-primary" /> 3 min lesetid</span>
              </div>

              <h3 className="text-2xl lg:text-3xl font-extrabold text-foreground leading-snug group-hover:text-primary transition-colors">
                Færderbiennalen og sommerens høydepunkter setter Tønsberg på det internasjonale kunstkartet
              </h3>

              <p className="text-foreground-muted text-sm leading-relaxed">
                Slottsfjellet og bryggestrøket fylles med storslått samtidskunst, historiske vandringer og yrende festivalstemning. Les hele guiden til årets mest magiske opplevelser.
              </p>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs font-bold text-foreground-subtle">Av Tønsberglivet Redaksjon</span>
              <Link
                href="/nyheter/faerderbiennalen"
                className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform"
              >
                Les artikkelen <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* 3 Magasinkort i Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Kort 1: Matkultur */}
          <article className="bg-surface rounded-3xl border border-border overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between">
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src="/images/food.jpg"
                alt="Matmarked på Torvet"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 px-3 py-1 bg-surface/90 backdrop-blur-md rounded-full text-[11px] font-bold uppercase tracking-wider text-foreground border border-border">
                Næringslivet
              </span>
            </div>
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-xs text-foreground-subtle">14. August 2026</span>
                <h4 className="text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                  Fra kjøkkengulvet til Torvet: Slik satser Helene på lokalbakt håndverk
                </h4>
                <p className="text-xs text-foreground-muted line-clamp-2">
                  Ny torvbod skaper køer langs Torvgaten med ferske surdeigsbrød og kortreiste råvarer.
                </p>
              </div>
              <Link
                href="/bylivet/mat-og-drikke"
                className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform pt-2"
              >
                Les mer <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </article>

          {/* Kort 2: Gründergata */}
          <article className="bg-surface rounded-3xl border border-border overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between">
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src="/images/grundergata.jpg"
                alt="Gründergata"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 px-3 py-1 bg-surface/90 backdrop-blur-md rounded-full text-[11px] font-bold uppercase tracking-wider text-foreground border border-border">
                Bylivet
              </span>
            </div>
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-xs text-foreground-subtle">09. August 2026</span>
                <h4 className="text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                  Gründergata og Nordbyen: – Dette er den levende kulturarven vår
                </h4>
                <p className="text-xs text-foreground-muted line-clamp-2">
                  Trehusbebyggelsen blomstrer med nisjebutikker, gallerier og skjulte bakgårdscafeer.
                </p>
              </div>
              <Link
                href="/bylivet/shopping"
                className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform pt-2"
              >
                Les mer <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </article>

          {/* Kort 3: Mangfold & Brygga */}
          <article className="bg-surface rounded-3xl border border-border overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between">
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src="/images/regnbue.jpg"
                alt="Festival og Mangfold"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 px-3 py-1 bg-surface/90 backdrop-blur-md rounded-full text-[11px] font-bold uppercase tracking-wider text-foreground border border-border flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Kultur
              </span>
            </div>
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-xs text-foreground-subtle">02. August 2026</span>
                <h4 className="text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                  Folkefest på Brygga: Rekordmange samlet til feiring av fellesskapet
                </h4>
                <p className="text-xs text-foreground-muted line-clamp-2">
                  Hele byen kledde seg i farger da årets sommerfestival fylte kaikanten med musikk og glede.
                </p>
              </div>
              <Link
                href="/eventer"
                className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform pt-2"
              >
                Les mer <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </article>

        </div>
      </section>

      {/* ── 4. Arrangementskalender & Ticketmaster ── */}
      <section id="hva-skjer" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 lg:p-12 space-y-8 shadow-2xl border border-slate-800">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block mb-1">
                Hva skjer i byen
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">
                Arrangementskalender & Billetter
              </h2>
            </div>
            <Link
              href="/eventer"
              className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1"
            >
              <span>Se alle arrangementer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.slice(0, 4).map((ev) => (
              <div
                key={ev.id}
                className="bg-slate-800/80 border border-slate-700 hover:border-amber-400/60 p-5 rounded-2xl transition-all space-y-4 flex flex-col justify-between group shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="px-3 py-1 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs font-mono font-bold">
                      {ev.date}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{ev.category}</span>
                  </div>

                  <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors leading-snug">
                    {ev.title}
                  </h4>
                </div>

                <div className="space-y-1 text-xs text-slate-300 pt-3 border-t border-slate-700/60">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{ev.venueName || ev.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                    <Clock className="w-3 h-3" />
                    <span>{ev.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 5. Byen i tall ── */}
      <section className="py-20 bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-foreground mb-3">Tønsbergregionen i tall</h2>
            <p className="text-foreground-muted text-sm">En region i vekst, innovasjon og fellesskap</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-2xl bg-surface-muted border border-border">
              <div className="text-4xl md:text-5xl font-black text-primary mb-1">33 000+</div>
              <p className="text-xs md:text-sm font-semibold text-foreground-muted">Arbeidsplasser</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-surface-muted border border-border">
              <div className="text-4xl md:text-5xl font-black text-primary mb-1">7 500+</div>
              <p className="text-xs md:text-sm font-semibold text-foreground-muted">Bedrifter</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-surface-muted border border-border">
              <div className="text-4xl md:text-5xl font-black text-primary mb-1">300+</div>
              <p className="text-xs md:text-sm font-semibold text-foreground-muted">Butikker & servering</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-surface-muted border border-border">
              <div className="text-4xl md:text-5xl font-black text-primary mb-1">50+</div>
              <p className="text-xs md:text-sm font-semibold text-foreground-muted">Samarbeidspartnere</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5b. Fotogalleri fra Tønsberg ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <PhotoGallery
          title="Bilder fra Tønsberglivet"
          subtitle="Opplev atmosfæren i Norges eldste kystby, på Brygga, Slottsfjellet og Færder-skjærgården."
          photos={[
            {
              src: '/images/slottsfjellet.jpg',
              alt: 'Slottsfjellstårnet i Tønsberg',
              caption: 'Slottsfjellet & Tårnet',
              location: 'Slottsfjellet, Tønsberg',
              category: 'Middelalder & Kultur',
              photographer: 'Tønsberglivet Arkiv',
            },
            {
              src: '/images/brygge.jpg',
              alt: 'Tønsberg Brygge om kvelden',
              caption: 'Stemning på Tønsberg Brygge',
              location: 'Bryggekanten',
              category: 'Byliv & Mat',
              photographer: 'Per Eide',
            },
            {
              src: '/images/skjaergard.jpg',
              alt: 'Verdens Ende og Vippefyret',
              caption: 'Verdens Ende & Skjærgården',
              location: 'Færder Nasjonalpark',
              category: 'Reiseliv & Natur',
              photographer: 'Visit Færder',
            },
            {
              src: '/images/food.jpg',
              alt: 'Uteservering og matkultur',
              caption: 'Lokal mat & Uteservering',
              location: 'Kafé Nansen / Torvet',
              category: 'Gastronomi',
              photographer: 'Julie Hansen',
            },
            {
              src: '/images/shopping.jpg',
              alt: 'Sentrumshandel og nisjebutikker',
              caption: 'Sentrumshandel i Torvgaten',
              location: 'Tønsberg Sentrum',
              category: 'Shopping',
              photographer: 'Tønsberglivet',
            },
            {
              src: '/images/student.jpg',
              alt: 'Studenter ved USN Campus Vestfold',
              caption: 'Studentmiljøet i Tønsberg',
              location: 'Campus Vestfold',
              category: 'Studentlivet',
              photographer: 'USN',
            },
          ]}
        />
      </section>

      {/* ── 6. Bli partner CTA ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
        <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 rounded-3xl p-8 md:p-16 text-white shadow-2xl relative overflow-hidden border border-blue-800">
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <Handshake className="w-14 h-14 mx-auto text-amber-300 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Vil din bedrift være med å bygge Tønsberg?
            </h2>
            <p className="text-base md:text-lg text-blue-100 font-light leading-relaxed">
              Bli partner i Tønsberglivet og ta del i fellesskapet som utvikler Norges eldste kystby for fremtiden.
            </p>
            <div className="pt-2">
              <Link
                href="/om-oss/partnere"
                className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-full text-slate-900 bg-white hover:bg-slate-100 shadow-xl transition-all"
              >
                Les mer om partnerskap
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Nyhetsbrev ── */}
      <section className="bg-surface border-t border-border py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <Users className="w-10 h-10 text-primary mx-auto" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Få helgens høydepunkter i innboksen</h2>
          <p className="text-foreground-muted text-sm max-w-md mx-auto">
            Motta vårt ukentlige kuraterte nyhetsbrev med konserter, torvmarkeder, restauranttips og næringsnytt.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2" action="#">
            <input
              type="email"
              placeholder="Din e-postadresse..."
              className="flex-1 px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
            >
              Meld meg på
            </button>
          </form>
        </div>
      </section>

    </main>
  );
}


