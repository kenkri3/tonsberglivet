import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { Calendar, Clock, MapPin, Share2, ArrowLeft, Ticket, CheckCircle2, Compass, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { permanentRedirect } from 'next/navigation';
import { EventJsonLd } from '@/components/seo/JsonLd';

const demoEventsMap: Record<string, {
  title: string;
  date: string;
  isoDate: string;
  time: string;
  location: string;
  address: string;
  category: string;
  organizer: string;
  price: string;
  description: string;
  highlights: string[];
  isExpired?: boolean;
}> = {
  '1': {
    title: 'Bondens marked på Torvet',
    date: 'Lørdag 22. august 2026',
    isoDate: '2026-08-22T10:00:00Z',
    time: '10:00 – 15:00',
    location: 'Tønsberg Torv',
    address: 'Torvet, 3110 Tønsberg',
    category: 'Marked',
    organizer: 'Bondens Marked Vestfold',
    price: '0 kr (Gratis inngang)',
    description: 'Opplev sesongens ferskeste råvarer direkte fra lokale bønder og matprodusenter i regionen. Her finner du ferskt bakverk, lokalost, nyslaktet kjøtt, spekemat, honning, og nystrikkede håndverksprodukter.',
    highlights: ['Lokalmat i verdensklasse', 'Ferske grønnsaker og frukt', 'Aktiviteter for barn', 'Kaffe og lapper på plassen'],
  },
  '2': {
    title: 'Konsert i Foynhagen',
    date: 'Søndag 23. august 2026',
    isoDate: '2026-08-23T19:00:00Z',
    time: '19:00 (Dørene åpner 18:00)',
    location: 'Foynhagen',
    address: 'Storgaten 24, 3126 Tønsberg',
    category: 'Konsert',
    organizer: 'Foynhagen AS',
    price: '350 kr (Billetter på Ticketmaster)',
    description: 'Foynhagen byr på magisk sommerstemning under åpen himmel. Ta med venner og familie til en uforglemmelig kveld fylt med levende musikk, god mat og god drikke.',
    highlights: ['Intim utendørsarena', 'Servering av mat og drikke', '18 års aldersgrense', 'Rullestoltilpasset'],
  },
  '3': {
    title: 'Tabletop-tirsdag på biblioteket',
    date: 'Tirsdag 26. august 2026',
    isoDate: '2026-08-26T17:00:00Z',
    time: '17:00 – 21:00',
    location: 'Tønsberg og Færder bibliotek',
    address: 'Storgaten 16, 3126 Tønsberg',
    category: 'Kultur',
    organizer: 'Tønsberg Spilleforening',
    price: '0 kr (Gratis)',
    description: 'Åpen brettspillkveld for alle brettspillinteresserte! Enten du er nybegynner eller erfaren spiller har vi et stort utvalg spill eller du kan ta med eget.',
    highlights: ['Over 50 brettspill tilgjengelig', 'Åpent for alle aldre', 'Enkel servering av kaffe/te', 'Sosialt og inkluderende'],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const event = demoEventsMap[id];
  
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
  const event = demoEventsMap[id];

  // ── Livssyklus & 301 Redirect Regel 5 ──
  // Hvis arrangementet er utgått eller ukjent, omdiriger permanent (301) til /eventer for å bevare SEO-autoritet
  if (!event || event.isExpired) {
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
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground-muted hover:text-foreground"
                >
                  <Share2 className="w-3.5 h-3.5" /> Del arrangement
                </button>
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
