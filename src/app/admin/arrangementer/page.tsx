'use client';

import { useState } from 'react';
import { Plus, Search, Eye, Pencil, Calendar as CalendarIcon, Ticket, RefreshCw, CheckCircle2 } from 'lucide-react';

const demoEvents = [
  { id: 'tm-1', title: 'Sommerkonsert i Foynhagen', date: '22. aug', time: '20:00', location: 'Foynhagen', category: 'Konsert', status: 'Ticketmaster Live' },
  { id: 'tm-2', title: 'Standup & Humorkveld på Oseberg', date: '28. aug', time: '19:30', location: 'Oseberg Kulturhus', category: 'Kultur', status: 'Ticketmaster Live' },
  { id: 'loc-1', title: 'Bondens marked på Torvet', date: '22. aug', time: '10:00–15:00', location: 'Tønsberg Torv', category: 'Marked', status: 'Publisert' },
  { id: 'loc-2', title: 'Tabletop-tirsdag', date: '26. aug', time: '17:00–21:00', location: 'Biblioteket', category: 'Kultur', status: 'Publisert' },
  { id: 'loc-3', title: 'Barnas museum', date: '27. aug', time: '11:00–14:00', location: 'Slottsfjellsmuseet', category: 'Barn', status: 'Publisert' },
];

export default function ArrangementerPage() {
  const [search, setSearch] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  const handleSyncTicketmaster = async () => {
    setSyncing(true);
    setSynced(false);
    try {
      await fetch('/api/ticketmaster');
      setSynced(true);
      setTimeout(() => setSynced(false), 3000);
    } catch (e) {
      console.error('Ticketmaster sync failed:', e);
    } finally {
      setSyncing(false);
    }
  };

  const [selectedCategory, setSelectedCategory] = useState('Alle');
  const categories = ['Alle', 'Konsert', 'Kultur', 'Marked', 'Barn'];

  const filtered = demoEvents.filter((e) => {
    const matchesCategory = selectedCategory === 'Alle' || e.category === selectedCategory;
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
                          e.location.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Arrangementer</h2>
          <p className="text-foreground-muted text-sm mt-1">{demoEvents.length} arrangementer • Live Ticketmaster Synk</p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleSyncTicketmaster}
            disabled={syncing}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-surface border border-border
                       rounded-xl text-xs sm:text-sm font-semibold text-foreground hover:bg-surface-muted transition-colors shadow-xs"
          >
            {synced ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <RefreshCw className={`w-4 h-4 text-primary ${syncing ? 'animate-spin' : ''}`} />
            )}
            {syncing ? 'Synkroniserer...' : synced ? 'Synkronisert!' : 'Synk Ticketmaster'}
          </button>
          <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-primary text-primary-foreground
                             rounded-xl text-xs sm:text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Nytt
          </button>
        </div>
      </div>

      {/* Søk og kategorier */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
          <input
            type="search"
            placeholder="Søk i arrangementer og spillesteder..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm
                       text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-surface border border-border text-foreground-muted hover:text-foreground hover:bg-surface-muted'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {filtered.map((event) => (
          <div
            key={event.id}
            className="bg-surface rounded-2xl border border-border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5
                       hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-primary/10 flex flex-col items-center justify-center">
                <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary mb-0.5" />
                <span className="text-[11px] sm:text-xs font-bold text-primary">{event.date}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base leading-snug">{event.title}</h3>
                  {event.status === 'Ticketmaster Live' && (
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-full flex items-center gap-1">
                      <Ticket className="w-3 h-3" /> Ticketmaster
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-foreground-muted mt-0.5">
                  {event.time} • {event.location}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-accent/10 text-accent rounded-full">
                {event.category}
              </span>
              <span
                className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                  event.status === 'Publisert'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                }`}
              >
                {event.status}
              </span>
              <div className="flex gap-1 pl-2 border-l border-border">
                <button
                  className="p-1.5 text-foreground-subtle hover:text-foreground rounded-lg hover:bg-surface-muted transition-colors"
                  title="Forhåndsvis"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  className="p-1.5 text-foreground-subtle hover:text-foreground rounded-lg hover:bg-surface-muted transition-colors"
                  title="Rediger"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
