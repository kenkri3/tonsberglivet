'use client';

import { useState, useEffect } from 'react';
import { HeroSection } from '@/components/ui/HeroSection';
import { EventCard } from '@/components/ui/Cards';
import { Filter, Ticket, RefreshCw, Search } from 'lucide-react';
import { TicketmasterEvent } from '@/lib/ticketmaster';
import { LibraryEventsWidget } from '@/components/culture/LibraryEventsWidget';

const categories = ['Alle', 'Konsert', 'Kultur', 'Teater', 'Aktiviteter', 'Mat & Drikke'];

export default function EventerClient() {
  const [activeCategory, setActiveCategory] = useState('Alle');
  const [searchQuery, setSearchQuery] = useState('');
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

  const allEvents = ticketmasterEvents.map((tm) => ({
    id: tm.id,
    title: tm.title,
    date: tm.date,
    time: tm.time,
    location: tm.location,
    category: tm.category,
    href: tm.ticketUrl,
    imageUrl: tm.imageUrl,
    priceRange: tm.priceRange,
    isTicketmaster: true,
  }));

  const filteredEvents = allEvents.filter((e) => {
    const matchesCategory = activeCategory === 'Alle' || e.category.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch =
      !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen pb-20">
      <HeroSection
        title="Hva skjer i Tønsberg?"
        subtitle="Arrangementer, show, konserter & kultur i Norges eldste by"
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
                Ticketmaster Direktestrøm
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold rounded-full">
                  SANNTID • {ticketmasterEvents.length} LIVE ARRANGEMENTER
                </span>
              </h3>
              <p className="text-xs text-foreground-muted">
                Sanntidsoppdaterte billetter og eventer fra Foynhagen, Teigen Scene/Oseberg, Kaldnes Mek., Tønsberg Domkirke og Ticketmaster.
              </p>
            </div>
          </div>
          {loading && <RefreshCw className="w-5 h-5 text-primary animate-spin" />}
        </div>

        {/* Filter bar */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-surface border border-border p-4 rounded-2xl shadow-sm mb-8 gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
            <input
              type="text"
              placeholder="Søk artist, scene, konsert..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <Filter className="w-4 h-4 text-foreground-subtle mr-1 shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
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
        {filteredEvents.length === 0 && !loading ? (
          <div className="text-center py-16 bg-surface rounded-2xl border border-border">
            <p className="text-foreground-muted text-sm">Ingen arrangementer matcher søket.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEvents.map((event) => (
              <div key={event.id} className="relative group">
                <EventCard
                  title={event.title}
                  date={event.date}
                  time={event.time}
                  location={event.location}
                  category={event.category}
                  href={event.href}
                  imageUrl={event.imageUrl}
                  priceRange={event.priceRange}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── Tønsberg og Færder Bibliotek & Litteraturhus Feed ── */}
        <div className="mt-14">
          <LibraryEventsWidget />
        </div>
      </div>
    </main>
  );
}
