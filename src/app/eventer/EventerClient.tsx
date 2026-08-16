'use client';

import { useState, useEffect } from 'react';
import { HeroSection } from '@/components/ui/HeroSection';
import { EventCard } from '@/components/ui/Cards';
import { Calendar, Filter, Ticket, RefreshCw, ExternalLink } from 'lucide-react';
import { TicketmasterEvent } from '@/lib/ticketmaster';

const categories = ['Alle', 'Konsert', 'Kultur', 'Mat & Drikke', 'Familie', 'Teater'];

const localEvents = [
  { id: 'loc-1', title: 'Bondens marked på Torvet', date: '22. aug 2026', time: '10:00', location: 'Torvet, Tønsberg', category: 'Mat & Drikke' },
  { id: 'loc-2', title: 'Tabletop-tirsdag', date: '26. aug 2026', time: '18:00', location: 'Tønsberg Bibliotek', category: 'Kultur' },
  { id: 'loc-3', title: 'Barnas museum', date: '27. aug 2026', time: '11:00', location: 'Slottsfjellsmuseet', category: 'Familie' },
  { id: 'loc-4', title: 'Språktrening på biblioteket', date: '28. aug 2026', time: '17:00', location: 'Tønsberg Bibliotek', category: 'Kultur' },
];

export default function EventerClient() {
  const [activeCategory, setActiveCategory] = useState('Alle');
  const [ticketmasterEvents, setTicketmasterEvents] = useState<TicketmasterEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ticketmaster')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setTicketmasterEvents(res.data);
        }
      })
      .catch((e) => console.error('Ticketmaster fetch error:', e))
      .finally(() => setLoading(false));
  }, []);

  const allEvents = [
    ...ticketmasterEvents.map((tm) => ({
      id: tm.id,
      title: tm.title,
      date: tm.date,
      time: tm.time,
      location: tm.location,
      category: tm.category,
      href: tm.ticketUrl,
      isTicketmaster: true,
      priceRange: tm.priceRange,
    })),
    ...localEvents.map((loc) => ({
      id: loc.id,
      title: loc.title,
      date: loc.date,
      time: loc.time,
      location: loc.location,
      category: loc.category,
      href: `/eventer/${loc.id}`,
      isTicketmaster: false,
      priceRange: undefined,
    })),
  ];

  const filteredEvents =
    activeCategory === 'Alle'
      ? allEvents
      : allEvents.filter((e) => e.category === activeCategory);

  return (
    <main className="min-h-screen pb-20">
      <HeroSection
        title="Hva skjer?"
        subtitle="Arrangementer & Konserter i Tønsberg"
        backgroundGradient="linear-gradient(135deg, #1D4ED8, #7C3AED)"
        compact={true}
      />

      <div className="container mx-auto px-4 mt-8 md:mt-12">
        {/* Ticketmaster Live Banner */}
        <div className="bg-primary-light/50 border border-primary/20 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary text-primary-foreground rounded-xl shrink-0">
              <Ticket className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                Ticketmaster Live-Oppdatering
                <span className="px-2 py-0.5 bg-success-light text-success text-xs font-bold rounded-full">
                  AUTO-SYNC ACTIVE
                </span>
              </h3>
              <p className="text-xs text-foreground-muted">
                Arrangementer fra Foynhagen, Oseberg Kulturhus og Slottsfjellet oppdateres automatisk via Ticketmaster API.
              </p>
            </div>
          </div>
          {loading && <RefreshCw className="w-5 h-5 text-primary animate-spin" />}
        </div>

        {/* Filter bar */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-surface border border-border p-4 rounded-2xl shadow-sm mb-8 gap-4">
          <div className="flex items-center gap-2 text-foreground-muted w-full md:w-auto">
            <Calendar className="w-5 h-5 text-primary" />
            <input type="month" className="bg-transparent border-none outline-none text-foreground font-medium" defaultValue="2026-08" />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            <Filter className="w-5 h-5 text-foreground-subtle mr-2 shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-surface-muted text-foreground-muted hover:bg-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="relative group">
              {event.isTicketmaster && (
                <span className="absolute top-3 right-3 z-10 px-2.5 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
                  <Ticket className="w-3 h-3" /> Ticketmaster
                </span>
              )}
              <EventCard
                title={event.title}
                date={event.date}
                time={event.time}
                location={event.location}
                category={event.category}
                href={event.href}
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
