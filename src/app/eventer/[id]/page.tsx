import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { Calendar, Clock, MapPin, Share2, ArrowLeft, User, Info, Ticket } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const demoEventsMap: Record<string, {
  title: string;
  date: string;
  time: string;
  location: string;
  address: string;
  category: string;
  organizer: string;
  price: string;
  description: string;
  highlights: string[];
}> = {
  '1': {
    title: 'Bondens marked på Torvet',
    date: 'Lørdag 22. august 2026',
    time: '10:00 – 15:00',
    location: 'Tønsberg Torv',
    address: 'Torvet, 3110 Tønsberg',
    category: 'Marked',
    organizer: 'Bondens Marked Vestfold',
    price: 'Gratis inngang',
    description: 'Opplev sesongens ferskeste råvarer direkte fra lokale bønder og matprodusenter i regionen. Her finner du ferskt bakverk, lokalost, nyslaktet kjøtt, spekemat, honning, og nystrikkede håndverksprodukter.',
    highlights: ['Lokalmat i verdensklasse', 'Ferske grønnsaker og frukt', 'Aktiviteter for barn', 'Kaffe og lapper på plassen'],
  },
  '2': {
    title: 'Konsert i Foynhagen',
    date: 'Søndag 23. august 2026',
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
    time: '17:00 – 21:00',
    location: 'Tønsberg og Færder bibliotek',
    address: 'Storgaten 16, 3126 Tønsberg',
    category: 'Kultur',
    organizer: 'Tønsberg Spilleforening',
    price: 'Gratis',
    description: 'Åpen brettspillkveld for alle brettspillinteresserte! Enten du er nybegynner eller erfaren spiller har vi et stort utvalg spill eller du kan ta med eget.',
    highlights: ['Over 50 brettspill tilgjengelig', 'Åpent for alle aldre', 'Enkel servering av kaffe/te', 'Sosialt og inkluderende'],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const event = demoEventsMap[id] || demoEventsMap['1'];
  return {
    title: `${event.title} | Tønsberglivet`,
    description: event.description,
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = demoEventsMap[id] || demoEventsMap['1'];

  return (
    <main className="min-h-screen pb-20">
      <HeroSection
        compact={true}
        title={event.title}
        subtitle={`${event.category} • ${event.date}`}
        description={`${event.time} på ${event.location}`}
        backgroundGradient="linear-gradient(135deg, #1D4ED8 0%, #1E3A5F 100%)"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/eventer"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Tilbake til alle arrangementer
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-surface border border-border p-8 rounded-3xl space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Om arrangementet</h2>
              <p className="text-foreground-muted text-base leading-relaxed whitespace-pre-line">
                {event.description}
              </p>

              <div className="pt-6 border-t border-border">
                <h3 className="font-bold text-foreground mb-4">Høydepunkter</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {event.highlights.map((h, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-foreground-muted">
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-surface border border-border p-6 rounded-3xl space-y-5">
              <h3 className="font-bold text-lg text-foreground border-b border-border pb-3">Praktisk informasjon</h3>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-foreground-subtle uppercase tracking-wider">Dato</div>
                  <div className="text-sm font-semibold text-foreground">{event.date}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-foreground-subtle uppercase tracking-wider">Tidspunkt</div>
                  <div className="text-sm font-semibold text-foreground">{event.time}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-foreground-subtle uppercase tracking-wider">Sted</div>
                  <div className="text-sm font-semibold text-foreground">{event.location}</div>
                  <div className="text-xs text-foreground-muted">{event.address}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Ticket className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-foreground-subtle uppercase tracking-wider">Pris</div>
                  <div className="text-sm font-semibold text-foreground">{event.price}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-foreground-subtle uppercase tracking-wider">Arrangør</div>
                  <div className="text-sm font-semibold text-foreground">{event.organizer}</div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex gap-3">
                <button className="flex-1 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary-hover transition-colors text-sm text-center">
                  Legg til i kalender
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
