'use client';

import { useState, useEffect } from 'react';
import { BookOpen, MapPin, Calendar, Clock, Sparkles, ExternalLink } from 'lucide-react';
import type { LibraryEvent } from '@/lib/libraryEvents';

export function LibraryEventsWidget() {
  const [events, setEvents] = useState<LibraryEvent[]>([]);

  useEffect(() => {
    fetch('/api/library-events')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setEvents(json.data);
        }
      })
      .catch((e) => console.error('Feil ved biblioteksarrangementer:', e));
  }, []);

  return (
    <div className="bg-surface rounded-3xl border border-border p-6 md:p-8 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Tønsberg og Færder Bibliotek Feed</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-foreground">
            Lokal debatt, kultur & familieaktiviteter
          </h3>
          <p className="text-foreground-muted text-sm mt-1">
            Faste ukentlige arrangementer, advokatvakt, filosofisk hjørne og lesestunder.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="p-6 rounded-2xl bg-surface-muted/50 border border-border hover:border-primary/50 transition-all flex flex-col justify-between group hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-700 bg-rose-50 dark:bg-rose-950 px-2.5 py-0.5 rounded-full">
                  {ev.category}
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                  {ev.price}
                </span>
              </div>

              <h4 className="font-bold text-foreground text-base group-hover:text-primary transition-colors">
                {ev.title}
              </h4>

              <p className="text-xs text-foreground-muted leading-relaxed line-clamp-3">
                {ev.description}
              </p>
            </div>

            <div className="pt-4 border-t border-border mt-4 space-y-2 text-xs text-foreground-subtle">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> {ev.dateStr}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-foreground-muted" /> {ev.timeStr}
                </span>
              </div>

              <div className="flex items-start justify-between gap-2 pt-1">
                {/* Stedsnavnet får bryte over to linjer i stedet for å kuttes. */}
                <span className="flex items-start gap-1 min-w-0">
                  <MapPin className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                  <span className="min-w-0 line-clamp-2 leading-snug break-words">{ev.location}</span>
                </span>
                <a
                  href={ev.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-bold flex items-center gap-1 shrink-0"
                >
                  <span>Info</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
