import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Building2, Briefcase, GraduationCap, MapPin, Coffee, ShoppingBag, 
  Handshake, Users, ArrowRight, Sparkles, Calendar, Clock, ChevronRight, 
  Store, Home as HomeIcon, Palmtree, Ticket, Flame, Award, ShieldCheck
} from 'lucide-react';
import { fetchLiveTicketmasterEvents } from '@/lib/ticketmaster';
import { groupEventPerformances, shortDateLabel } from '@/lib/event-grouping';
import { getNewsArticles } from '@/lib/news-server';
import { PhotoGallery } from '@/components/ui/PhotoGallery';
import { TonsberglivetLogo } from '@/components/brand/BrandLogos';
import { FiveLivesShowcase } from '@/components/home/FiveLivesShowcase';
import { GiftCardFeature } from '@/components/home/GiftCardFeature';
import { CityPulseBar } from '@/components/home/CityPulseBar';

export const metadata: Metadata = {
  title: 'Tønsberglivet — Mer synlighet, mer stolthet, mer liv, mer kraft',
  description: 'Velkommen til Tønsberglivet. Omdømme- og byutviklingsselskapet som samler og styrker Norges eldste kystby.',
};

// Sakene hentes fra CMS/arkiv. Fem minutter holder forsiden fersk uten at
// hvert besøk treffer databasen.
export const revalidate = 300;

export default async function Home() {
  const [events, newsArticles] = await Promise.all([
    fetchLiveTicketmasterEvents(),
    getNewsArticles(),
  ]);

  // Forsiden viser de tre ferskeste sakene – aldri eksempeltekst.
  const [leadStory, ...otherStories] = newsArticles;
  const sideStories = otherStories.slice(0, 2);

  // Samme produksjon går ofte flere ganger. Vi viser én produksjon per kort med
  // antall forestillinger og en dato-liste, i stedet for nesten identiske kort.
  const featuredEvents = groupEventPerformances(events)
    .slice(0, 6)
    .map((group) => ({
      id: group.key,
      title: group.title,
      date: group.next.date,
      time: group.next.time,
      imageUrl: group.imageUrl,
      category: group.category,
      description: group.description,
      venueName: group.location,
      location: group.location,
      ticketUrl: group.next.ticketUrl,
      performances:
        group.performances.length > 1
          ? group.performances.map((p) => ({ date: shortDateLabel(p.date), time: p.time }))
          : [],
    }));

  return (
    <div className="min-h-screen space-y-20 pb-24 overflow-x-hidden">
      
      {/* ── 1. CINEMATIC HERO MED OFFISIELL MERKEVARE ── */}
      <section className="relative min-h-[82vh] flex items-center justify-center overflow-hidden bg-[#16193d]">
        
        {/* Bakgrunnsbilde med cinematic dybde */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/tonsberg/solnedgang-over-byfjorden-med-slot.jpg"
            alt="Solnedgang over byfjorden med Slottsfjellstårnet"
            fill
            priority
            sizes="100vw"
            className="object-cover img-crop-top scale-105 animate-fade-in opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#16193d] via-[#16193d]/60 to-[#16193d]/30" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 relative z-10 w-full">
          <div className="max-w-3xl space-y-6">
            
            {/* Merkevarelogo SVG */}
            <div className="animate-fade-in">
              <TonsberglivetLogo className="h-10 sm:h-12 md:h-14 w-auto text-[#d3dafe] drop-shadow-md" />
            </div>

            {/* Subtil merkevare-etikett */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-slate-200 border border-white/20 text-[11px] font-semibold tracking-[0.2em] uppercase">
              <span>Grunnlagt 871 e.Kr. • Norges eldste by</span>
            </div>

            {/* Tittel med Playfair Display serif aksent */}
            <h1 className="text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.02]">
              Livet, slik det <br />
              <span className="font-serif italic font-normal text-amber-200/95">skal leves.</span>
            </h1>

            {/* Ingress */}
            <p className="text-base sm:text-lg md:text-xl text-slate-200 leading-relaxed font-light max-w-2xl drop-shadow-sm">
              Tønsberglivet er fellesskapet som samler og styrker Norges eldste by — for mer synlighet, mer stolthet, mer liv og mer kraft.
            </p>

            {/* Handlinger */}
            <div className="flex flex-wrap items-center gap-3.5 pt-4">
              <Link
                href="/bylivet"
                className="px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-full font-bold text-sm shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 group"
              >
                <span>Utforsk Bylivet</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/eventer"
                className="px-8 py-4 bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 text-white rounded-full font-medium text-sm transition-all flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-amber-300" />
                <span>Hva skjer i kveld?</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── 2. LIVE CITY PULSE BAR (Overlappende -mt-10) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-14 relative z-20">
        <CityPulseBar eventCount={events.length > 0 ? events.length : 14} />
      </section>

      {/* ── 3. DE FEM LIVENE — INTERAKTIVT MASTER SHOWCASE ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FiveLivesShowcase />
      </section>

      {/* ── 4. ARRANGEMENTER I TØNSBERG ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-muted border border-border text-foreground-muted text-xs font-semibold uppercase tracking-wider mb-2">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>Kultur & Konsertkalender</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Hva skjer i Tønsberg?
            </h2>
            <p className="text-foreground-muted text-base mt-2 font-light max-w-xl">
              Ferske oppdateringer fra Foynhagen, Oseberg Kulturhus, Tønsberg og Færder Bibliotek og Slottsfjellet.
            </p>
          </div>
          <Link
            href="/eventer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-surface border border-border text-foreground hover:bg-surface-muted rounded-2xl text-sm font-semibold shadow-2xs transition-colors shrink-0"
          >
            <span>Se alle arrangementer</span>
            <ArrowRight className="w-4 h-4 text-primary" />
          </Link>
        </div>

        {/* Arrangement Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredEvents.map((ev) => (
            <div
              key={ev.id}
              className="bg-surface rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              {/* Bilde med spillested-badge. Mangler arrangementet eget bilde, viser
                  vi en merkevareflate i stedet for et lånt stockfoto – ellers fikk
                  flere kort nøyaktig samme bilde og så ut som duplikater. */}
              <div className="relative aspect-[16/9] overflow-hidden bg-slate-950">
                {ev.imageUrl ? (
                  <Image
                    src={ev.imageUrl}
                    alt={ev.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover img-crop-top group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-hover to-[#16193d] flex items-center justify-center">
                    <Calendar className="w-14 h-14 text-white/25" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                {/* Dato-chip */}
                <div className="absolute top-4 left-4 bg-surface/95 backdrop-blur-md rounded-2xl px-3 py-1.5 text-center shadow-lg border border-border">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-primary">
                    {ev.date.split(' ')[1]?.toUpperCase() || 'DATO'}
                  </span>
                  <span className="block text-base font-extrabold text-foreground leading-none">
                    {ev.date.split(' ')[0]?.replace('.', '') || '1'}
                  </span>
                </div>

                {/* Sted */}
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
                  <span className="flex items-center gap-1.5 font-medium truncate drop-shadow">
                    <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    {ev.venueName || ev.location}
                  </span>
                </div>
              </div>

              {/* Tekstinnhold */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary-light px-2.5 py-0.5 rounded-full">
                      {ev.category}
                    </span>
                    {ev.performances.length > 1 && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                        {ev.performances.length} forestillinger
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-foreground mt-2 group-hover:text-primary transition-colors line-clamp-2">
                    {ev.title}
                  </h3>
                  <p className="text-xs text-foreground-muted mt-2 line-clamp-2 leading-relaxed">
                    {ev.description}
                  </p>
                  {ev.performances.length > 1 && (
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {ev.performances.slice(0, 4).map((p, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-semibold bg-surface-muted border border-border text-foreground-muted px-2 py-0.5 rounded-full whitespace-nowrap"
                        >
                          {p.date}
                          {p.time ? ` ${p.time}` : ''}
                        </span>
                      ))}
                      {ev.performances.length > 4 && (
                        <span className="text-[10px] font-semibold text-foreground-subtle px-2 py-0.5">
                          +{ev.performances.length - 4} flere
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground-subtle flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-primary" /> {ev.time || 'Kl. 19:00'}
                  </span>
                  <a
                    href={ev.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
                  >
                    <span>Kjøp billett</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. SENTRUMSGAVEKORTET LUXURY FEATURE ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GiftCardFeature />
      </section>

      {/* ── 6. REDAKSJONELT & REPORTASJER ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary block mb-1">
              Aktuelt & Reportasjer
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
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

        {/* Stort hovedkort: den ferskeste saken fra redaksjonen */}
        {leadStory && (
          <div className="grid grid-cols-1 lg:grid-cols-12 bg-surface rounded-3xl border border-border overflow-hidden shadow-xl hover:shadow-2xl transition-all group">
            <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto overflow-hidden">
              {leadStory.imageUrl ? (
                <Image
                  src={leadStory.imageUrl}
                  alt={leadStory.imageAlt || leadStory.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover img-crop-top group-hover:scale-105 transition-transform duration-700"
                />
              ) : null}
              <span className="absolute top-4 left-4 px-3.5 py-1 bg-surface/95 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-foreground border border-border">
                {leadStory.categoryLabel}
              </span>
            </div>

            <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs text-foreground-subtle">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-primary" /> {leadStory.date}</span>
                  <span>•</span>
                  <span>{leadStory.readTime}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground group-hover:text-primary transition-colors leading-tight font-serif">
                  {leadStory.title}
                </h3>

                <p className="text-sm md:text-base text-foreground-muted leading-relaxed font-light">
                  {leadStory.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <Link
                  href={`/nyheter/${leadStory.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-primary group-hover:text-primary-hover transition-colors"
                >
                  <span>Les hele saken</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <span className="text-xs font-semibold text-foreground-subtle">{leadStory.author}</span>
              </div>
            </div>
          </div>
        )}

        {/* To mindre redaksjonelle kort: de neste sakene i rekken */}
        {sideStories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sideStories.map((story) => (
              <div
                key={story.id}
                className="bg-surface rounded-3xl border border-border overflow-hidden hover:shadow-lg transition-all group flex flex-col justify-between"
              >
                {story.imageUrl ? (
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={story.imageUrl}
                      alt={story.imageAlt || story.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover img-crop-top group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : null}

                <div className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-primary bg-primary/10 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                        {story.categoryLabel}
                      </span>
                      <span className="text-foreground-subtle">{story.date}</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {story.title}
                    </h3>
                    <p className="text-sm text-foreground-muted leading-relaxed font-light">
                      {story.excerpt}
                    </p>
                  </div>
                  <Link
                    href={`/nyheter/${story.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline pt-2"
                  >
                    <span>Les hele saken</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── 7. TALL SOM TELLER — NORDIC DYNAMIC STATS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-surface rounded-3xl border border-border p-8 md:p-14 shadow-lg space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Tall som teller for Tønsberg
            </h2>
            <p className="text-foreground-muted text-sm md:text-base font-light">
              Nøkkeltall som bekrefter regionens kraft som bo- og næringssenter i Vestfold.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-5">
            <div className="text-center p-4 sm:p-5 lg:p-6 rounded-2xl bg-surface-muted/60 hover:bg-surface-muted border border-border transition-colors flex flex-col items-center justify-center">
              <div className="text-2xl sm:text-3xl xl:text-4xl font-black text-primary tracking-tight whitespace-nowrap mb-1">
                871
              </div>
              <p className="text-xs sm:text-sm font-semibold text-foreground-muted">
                Norges eldste by (e.Kr.)
              </p>
            </div>
            <div className="text-center p-4 sm:p-5 lg:p-6 rounded-2xl bg-surface-muted/60 hover:bg-surface-muted border border-border transition-colors flex flex-col items-center justify-center">
              <div className="text-2xl sm:text-3xl xl:text-4xl font-black text-primary tracking-tight whitespace-nowrap mb-1">
                33&nbsp;000+
              </div>
              <p className="text-xs sm:text-sm font-semibold text-foreground-muted">
                Arbeidsplasser
              </p>
            </div>
            <div className="text-center p-4 sm:p-5 lg:p-6 rounded-2xl bg-surface-muted/60 hover:bg-surface-muted border border-border transition-colors flex flex-col items-center justify-center">
              <div className="text-2xl sm:text-3xl xl:text-4xl font-black text-primary tracking-tight whitespace-nowrap mb-1">
                7&nbsp;500+
              </div>
              <p className="text-xs sm:text-sm font-semibold text-foreground-muted">
                Bedrifter
              </p>
            </div>
            <div className="text-center p-4 sm:p-5 lg:p-6 rounded-2xl bg-surface-muted/60 hover:bg-surface-muted border border-border transition-colors flex flex-col items-center justify-center">
              <div className="text-2xl sm:text-3xl xl:text-4xl font-black text-primary tracking-tight whitespace-nowrap mb-1">
                300+
              </div>
              <p className="text-xs sm:text-sm font-semibold text-foreground-muted">
                Butikker &amp; servering
              </p>
            </div>
            <div className="text-center p-4 sm:p-5 lg:p-6 rounded-2xl bg-surface-muted/60 hover:bg-surface-muted border border-border transition-colors flex flex-col items-center justify-center col-span-2 sm:col-span-1 lg:col-span-1">
              <div className="text-2xl sm:text-3xl xl:text-4xl font-black text-primary tracking-tight whitespace-nowrap mb-1">
                50+
              </div>
              <p className="text-xs sm:text-sm font-semibold text-foreground-muted">
                Strategiske partnere
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. FOTOGALLERI FRA TØNSBERG (MED LIGHTBOX) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PhotoGallery
          title="Bilder fra Tønsberglivet"
          subtitle="Opplev atmosfæren i Norges eldste kystby, på Brygga, Slottsfjellet og Færder-skjærgården."
          photos={[
            {
              src: '/images/legacy/brygga1-scaled-e1779878998864.jpg',
              alt: 'Tønsberg Brygge og kanalen i solnedgang, sett fra oven',
              caption: 'Tønsberg Brygge i solnedgang',
              location: 'Tønsberg Brygge & Kanalen',
              category: 'Byoversikt',
              photographer: 'Tønsberglivet Arkiv',
            },
            {
              src: '/images/tonsberg/slottsfjellet-luftfoto-festomraadet.jpg',
              alt: 'Publikum og scene på Slottsfjellfestivalen, sett fra luften',
              caption: 'Slottsfjellfestivalen',
              location: 'Slottsfjellet, Tønsberg',
              category: 'Festival & Konsert',
              photographer: 'Per Christian Hestnæs (2022)',
            },
            {
              src: '/images/tonsberg/kvinne-med-gaveeske-i-en-butikk-st.jpg',
              alt: 'Kvinne med gaveeske i en butikk',
              caption: 'Stemning på Tønsberg Brygge',
              location: 'Bryggekanten',
              category: 'Byliv & Mat',
              photographer: 'Tønsberglivet Arkiv',
            },
            {
              src: '/images/legacy/Oversiktsbilde-faerderdagen-2019.jpg',
              alt: 'Færder fyr med svaberg og åpent hav',
              caption: 'Færder fyr',
              location: 'Færder Nasjonalpark',
              category: 'Reiseliv & Natur',
              photographer: 'Tønsberglivet Arkiv',
            },
            {
              src: '/images/legacy/celebration-nationalday-restaurant-quality-hotel-tonsberg.jpg',
              alt: 'Gjester ved bordet med norsk flagg og bløtkake',
              caption: 'Feiring ved bordet',
              location: 'Quality Hotel Tønsberg',
              category: 'Gastronomi',
              photographer: 'Quality Hotel Tønsberg',
            },
            {
              src: '/images/tonsberg/folk-i-gatene-ved-brygga-i-tonsber.jpg',
              alt: 'Folk i gatene ved brygga i Tønsberg',
              caption: 'Gateliv i sentrum',
              location: 'Storgaten, Tønsberg',
              category: 'Byliv & Stemning',
              photographer: 'Tønsberglivet',
            },
            {
              src: '/images/tonsberg/stand-med-lokalproduserte-varer-in.jpg',
              alt: 'Stand med lokalproduserte varer innendørs i Tønsberg',
              caption: 'Høstmarked på Torvet',
              location: 'Tønsberg Torv',
              category: 'Marked & Lokalmat',
              photographer: 'Tønsberglivet',
            },
            {
              src: '/images/tonsberg/barnepublikum-foran-en-utendorssce.jpg',
              alt: 'Barnepublikum foran en utendørsscene i Tønsberg',
              caption: 'Barn i byen',
              location: 'Tønsberg Sentrum',
              category: 'Familie & Kultur',
              photographer: 'Tønsberglivet',
            },
            {
              src: '/images/tonsberg/student-park.jpg',
              alt: 'Studenter på plenen ved USN Campus Vestfold',
              caption: 'Studentmiljøet ved USN',
              location: 'Campus Vestfold',
              category: 'Studentlivet',
              photographer: 'USN',
            },
          ]}
        />
      </section>

      {/* ── 9. BLI PARTNER & SAMFUNNSOPPDRAGET ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-gradient-to-br from-[#16193d] via-[#1a1f4c] to-[#0c0e24] rounded-3xl p-8 md:p-16 text-white shadow-2xl relative overflow-hidden border border-blue-900/60">
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <Handshake className="w-14 h-14 mx-auto text-amber-300 opacity-90" />
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Vil din bedrift være med å bygge Tønsberg?
            </h2>
            <p className="text-base md:text-lg text-blue-100 font-light leading-relaxed">
              Bli partner i Tønsberglivet og ta del i fellesskapet som utvikler Norges eldste kystby for mer synlighet, mer stolthet, mer liv og mer kraft.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/om-oss/partnere"
                className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-full text-slate-900 bg-white hover:bg-slate-100 shadow-xl transition-all"
              >
                Les mer om partnerskap
              </Link>
              <Link
                href="/kontakt"
                className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-full text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
              >
                Kontakt daglig leder
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 10. NYHETSBREV ── */}
      <section className="bg-surface border-t border-border py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <Users className="w-10 h-10 text-primary mx-auto" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Få helgens høydepunkter i innboksen</h2>
          <p className="text-foreground-muted text-sm max-w-md mx-auto font-light">
            Motta vårt ukentlige kuraterte nyhetsbrev med konserter, torvmarkeder, restauranttips og næringsnytt fra Tønsberg.
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

    </div>
  );
}
