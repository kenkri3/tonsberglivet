'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Eye, Calendar as CalendarIcon, Ticket, 
  RefreshCw, CheckCircle2, AlertCircle, ExternalLink, MapPin, 
  Clock, Tag, ShieldCheck, KeyRound
} from 'lucide-react';
import Link from 'next/link';

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  venueName?: string;
  category: string;
  description?: string;
  imageUrl?: string;
  ticketUrl?: string;
  priceRange?: string;
  source: 'TICKETMASTER' | 'MANUAL';
}

export default function ArrangementerPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncedMessage, setSyncedMessage] = useState<string | null>(null);
  const [apiSource, setApiSource] = useState<'LIVE_API' | 'TICKETMASTER_FEED'>('TICKETMASTER_FEED');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Alle');

  const fetchEvents = async (manualSync = false) => {
    if (manualSync) setSyncing(true);
    else setLoading(true);

    try {
      const res = await fetch('/api/ticketmaster');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setEvents(json.data);
        if (json.source) setApiSource(json.source);
        if (manualSync) {
          setSyncedMessage(
            json.source === 'LIVE_API'
              ? 'Sanntidssynk fullført via Ticketmaster Discovery API!'
              : 'Oppdatert fra Tønsbergs offisielle arrangementsfeed (Foynhagen & Oseberg)!'
          );
          setTimeout(() => setSyncedMessage(null), 4000);
        }
      }
    } catch (e) {
      console.error('Feil ved henting av arrangementer:', e);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const categories = ['Alle', 'Konsert', 'Kultur', 'Festival', 'Marked', 'Barn'];

  const filtered = events.filter((e) => {
    const matchesCategory = selectedCategory === 'Alle' || e.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.location && e.location.toLowerCase().includes(search.toLowerCase())) ||
      (e.venueName && e.venueName.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Arrangementer & Kultur</h2>
          <p className="text-foreground-muted text-sm mt-1">
            {events.length} aktive arrangementer • Ticketmaster-integrasjon for Tønsberg
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => fetchEvents(true)}
            disabled={syncing || loading}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-surface border border-border
                       rounded-xl text-xs sm:text-sm font-semibold text-foreground hover:bg-surface-muted transition-colors shadow-xs"
          >
            {syncedMessage ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <RefreshCw className={`w-4 h-4 text-primary ${syncing ? 'animate-spin' : ''}`} />
            )}
            {syncing ? 'Synkroniserer...' : 'Synk Ticketmaster'}
          </button>
        </div>
      </div>

      {/* Tilkoblingsstatus / Ærlig varsel dersom API-nøkkel mangler */}
      {apiSource === 'LIVE_API' ? (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs sm:text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Ticketmaster Discovery API er aktivt tilkoblet</div>
            <div className="text-xs opacity-90 mt-0.5">
              Arrangementer hentes direkte fra Ticketmasters globale API med lokasjonsfilter for Tønsberg (Foynhagen, Oseberg Kulturhus, Støperiet, Slottsfjell).
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 rounded-2xl text-xs sm:text-sm flex items-start gap-3">
          <KeyRound className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold flex items-center gap-2">
              Ticketmaster API-nøkkel: Ikke konfigurert ennå
              <span className="text-[10px] uppercase font-extrabold bg-amber-500/20 px-2 py-0.5 rounded-full">
                Kuratert Spillested-Feed Aktiv
              </span>
            </div>
            <p className="text-xs opacity-90 mt-1 leading-relaxed">
              Systemet viser nå kvalitetssikrede kulturarrangementer fra etablerte spillesteder i Tønsberg (Foynhagen, Oseberg Kulturhus og Slottsfjellet). For helautomatisk sanntidsimport av alle billetterte eventer i Tønsberg, legg inn din Ticketmaster API-nøkkel under Innstillinger.
            </p>
            <div className="mt-2.5">
              <Link
                href="/admin/innstillinger"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 underline hover:no-underline"
              >
                Gå til Innstillinger for å legge til API-nøkkel →
              </Link>
            </div>
          </div>
        </div>
      )}

      {syncedMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs sm:text-sm flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {syncedMessage}
        </div>
      )}

      {/* Søk og kategorier */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
          <input
            type="search"
            placeholder="Søk i arrangementer, spillesteder og artister..."
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

      {/* Liste over arrangementer */}
      {loading ? (
        <div className="p-12 text-center text-foreground-muted flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm">Henter arrangementer...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 bg-surface rounded-2xl border border-border text-center text-foreground-muted space-y-2">
          <AlertCircle className="w-8 h-8 text-foreground-subtle mx-auto" />
          <h3 className="font-semibold text-foreground">Ingen arrangementer funnet</h3>
          <p className="text-xs">Prøv et annet søkeord eller en annen kategori.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {filtered.map((event) => (
            <div
              key={event.id}
              className="bg-surface rounded-2xl border border-border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4
                         hover:shadow-md transition-all group"
            >
              <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="shrink-0 w-16 h-16 rounded-xl bg-primary/10 flex flex-col items-center justify-center border border-primary/20">
                  <CalendarIcon className="w-4 h-4 text-primary mb-0.5" />
                  <span className="text-[11px] font-bold text-primary text-center px-1 leading-tight">
                    {event.date}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-foreground text-sm sm:text-base leading-snug">
                      {event.title}
                    </h3>
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-full flex items-center gap-1">
                      <Ticket className="w-3 h-3" /> Ticketmaster
                    </span>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded-full">
                      {event.category}
                    </span>
                  </div>

                  <p className="text-xs text-foreground-muted flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-primary" /> {event.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-primary" /> {event.location}
                    </span>
                    {event.priceRange && (
                      <span className="text-foreground font-semibold">
                        {event.priceRange}
                      </span>
                    )}
                  </p>

                  {event.description && (
                    <p className="text-xs text-foreground-muted line-clamp-1 mt-1 opacity-80">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border shrink-0">
                {event.ticketUrl && (
                  <a
                    href={event.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary-hover transition-colors"
                  >
                    Billettside <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
