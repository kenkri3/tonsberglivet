import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { Calendar, Clock, MapPin, ArrowLeft, Ticket, CheckCircle2, Compass, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { permanentRedirect, notFound } from 'next/navigation';
import { EventJsonLd } from '@/components/seo/JsonLd';
import { ShareButton } from '@/components/ui/ShareButton';

/**
 * Slår opp et arrangement på id ELLER slug.
 *
 * Siden brukte tidligere en hardkodet `demoEventsMap` med fiktive arrangementer
 * («Bondens marked på Torvet», «Konsert i Foynhagen» …) som aldri fantes i
 * databasen. Det var dem sitemapen viste som /eventer/1, /eventer/2 og
 * /eventer/3. Etter migreringen ligger det 1095 ekte arrangementer i basen,
 * og de skal ha hver sin side.
 *
 * Returnerer samme form som den gamle kartan, så resten av JSX-en er urørt.
 */
const KATEGORI_ETIKETT: Record<string, string> = {
  ARRANGEMENT: 'Arrangement',
  KONSERT: 'Konsert',
  MARKED: 'Marked',
  KURS: 'Kurs',
  BARN: 'Barn',
  SPORT: 'Sport',
  KULTUR: 'Kultur',
  FESTIVAL: 'Festival',
};

async function hentArrangement(idOrSlug: string) {
  const { prisma } = await import('@/lib/prisma');
  const { resolveLocalImage } = await import('@/lib/local-image');

  let e = null;
  try {
    e = await prisma.event.findUnique({ where: { id: idOrSlug }, include: { image: true } });
    if (!e) {
      e = await prisma.event.findUnique({ where: { slug: idOrSlug }, include: { image: true } });
    }
  } catch {
    return null;
  }
  if (!e) return null;

  const start = new Date(e.startDate);
  const naa = new Date();
  // Et arrangement regnes som utgått dagen etter sluttdato (eller startdato).
  const slutt = e.endDate ? new Date(e.endDate) : start;
  const utgaatt = slutt.getTime() + 24 * 60 * 60 * 1000 < naa.getTime();

  const klokkeslett = e.startTime
    ? `${e.startTime}${e.endTime ? ` – ${e.endTime}` : ''}`
    : 'Tid ikke oppgitt';

  return {
    title: e.title,
    date: new Intl.DateTimeFormat('nb-NO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(start),
    isoDate: start.toISOString(),
    time: klokkeslett,
    location: e.location || 'Tønsberg',
    address: e.address || 'Tønsberg',
    category: KATEGORI_ETIKETT[e.category] ?? 'Arrangement',
    organizer: 'Tønsberglivet',
    // Vi har ikke billettpris i kilden. Da sier vi det, i stedet for å dikte
    // opp et beløp.
    price: e.externalUrl ? 'Billetter via arrangørens side' : 'Pris ikke oppgitt',
    description: e.description || `${e.title} i ${e.location || 'Tønsberg'}.`,
    highlights: [] as string[],
    isExpired: utgaatt,
    externalUrl: e.externalUrl ?? null,
    imageUrl: resolveLocalImage(e.image?.url) ?? null,
    imageAlt: e.image?.alt ?? e.title,
  };
}


export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const event = await hentArrangement(id);
  
  if (!event || event.isExpired) {
    return {
      title: 'Arrangementer i Tønsberg | Tønsberglivet',
      description: 'Se alle kommende konserter, festivaler og markeder i Tønsberg.',
    };
  }

  return {
    title: `${event.title} | Tønsberglivet`,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      url: `https://tonsberglivet.no/eventer/${id}`,
      siteName: 'Tønsberglivet',
      locale: 'nb_NO',
      type: 'website',
    },
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await hentArrangement(id);

  // ── Livssyklus ──
  // Utgått arrangement: permanent omdirigering til kalenderen, så SEO-autoriteten
  // bevares (dette var den opprinnelige hensikten).
  // Ukjent id: 404. En 301 ville fortalt Google at en side som aldri har
  // eksistert har flyttet seg, og det er direkte skadelig for indekseringen.
  if (!event) {
    notFound();
  }
  if (event.isExpired) {
    permanentRedirect('/eventer');
  }

  const eventUrl = `https://tonsberglivet.no/eventer/${id}`;

  return (
    <main className="min-h-screen pb-20">
      {/* Schema.org @graph Event & Breadcrumb JSON-LD */}
      <EventJsonLd
        title={event.title}
        description={event.description}
        startDate={event.isoDate}
        locationName={event.location}
        locationAddress={event.address}
        url={eventUrl}
        price={event.price.replace(/[^0-9]/g, '') || '0'}
      />

      <HeroSection
        compact={true}
        title={event.title}
        subtitle={`${event.category} • ${event.date}`}
        description={`${event.time} på ${event.location}`}
        backgroundGradient="linear-gradient(135deg, #1D4ED8 0%, #1E3A5F 100%)"
      />

      <div className="max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Link
          href="/eventer"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-foreground-muted hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Tilbake til alle arrangementer
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Venstre: Arrangement-detaljer (8 kolonner på PC/TV) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-surface border border-border p-6 sm:p-10 md:p-12 rounded-3xl space-y-8 shadow-xs">
              
              <div className="space-y-4">
                <span className="px-3 py-1 text-xs font-extrabold bg-primary/10 text-primary border border-primary/20 rounded-full inline-block">
                  {event.category}
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight">
                  {event.title}
                </h1>
                <p className="text-base sm:text-lg text-foreground-muted leading-relaxed font-medium">
                  {event.description}
                </p>
              </div>

              {/* Høydepunkter / GEO punktliste */}
              <div className="pt-6 border-t border-border space-y-3">
                <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
                  Høydepunkter & Fasiliteter
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {event.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-muted border border-border text-xs font-semibold text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toveis internlenker */}
              <div className="pt-6 border-t border-border space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                  Relatert i Tønsberg:
                </span>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/bylivet"
                    className="px-3 py-1.5 rounded-lg bg-surface-muted hover:bg-primary/10 hover:text-primary text-xs font-bold text-foreground transition-colors border border-border"
                  >
                    Bylivet & Shopping
                  </Link>
                  <Link
                    href="/bylivet/torvleie"
                    className="px-3 py-1.5 rounded-lg bg-surface-muted hover:bg-primary/10 hover:text-primary text-xs font-bold text-foreground transition-colors border border-border"
                  >
                    Leie torvplass
                  </Link>
                  <Link
                    href="/reiselivet"
                    className="px-3 py-1.5 rounded-lg bg-surface-muted hover:bg-primary/10 hover:text-primary text-xs font-bold text-foreground transition-colors border border-border"
                  >
                    Overnatting & Opplevelser
                  </Link>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-foreground-muted">Arrangert av {event.organizer}</span>
                <ShareButton
                  title={event.title}
                  text={event.description?.slice(0, 120)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground-muted hover:text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Høyre sidebar: Praktisk fakta & Billetter (4 kolonner på PC/TV) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Infoboks (Fakta for AI & Brukere) */}
            <div className="bg-surface border border-border rounded-3xl p-6 shadow-xs space-y-5">
              <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
                Praktisk informasjon
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-bold text-foreground">Dato</span>
                    <span className="text-foreground-muted">{event.date}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-bold text-foreground">Tidspunkt</span>
                    <span className="text-foreground-muted">{event.time}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-bold text-foreground">{event.location}</span>
                    <span className="text-foreground-muted">{event.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Ticket className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-bold text-foreground">Inngang / Pris</span>
                    <span className="text-foreground-muted font-bold text-primary">{event.price}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <a
                  href="https://www.ticketmaster.no"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Kjøp / Reserver billetter</span>
                </a>
              </div>
            </div>

            {/* Sikkerhetsgaranti for SEO livssyklus */}
            <div className="p-4 rounded-2xl bg-surface-muted border border-border text-[11px] text-foreground-muted space-y-1">
              <span className="font-bold text-foreground flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-primary" /> Oppdatert i sanntid
              </span>
              <p>
                Informasjon hentes direkte fra arrangør og Ticketmaster Discovery API for Tønsberg & Færder.
              </p>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}
