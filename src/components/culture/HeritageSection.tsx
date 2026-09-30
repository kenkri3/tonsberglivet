'use client';

import { useState, useEffect } from 'react';
import { Landmark, Compass, MapPin, Calendar, Sparkles, BookOpen } from 'lucide-react';
import Image from 'next/image';
import type { HeritageSite } from '@/lib/heritage';

export function HeritageSection() {
  const [sites, setSites] = useState<HeritageSite[]>([]);

  useEffect(() => {
    fetch('/api/heritage')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setSites(json.data);
        }
      })
      .catch((e) => console.error('Feil ved kulturarv:', e));
  }, []);

  return (
    <div className="bg-surface rounded-3xl border border-border p-6 md:p-8 space-y-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Landmark className="w-3.5 h-3.5" />
            <span>Riksantikvaren & Kulturminnesøk</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-foreground">
            Kulturarv & Historiske Tønsberg
          </h3>
          <p className="text-foreground-muted text-sm mt-1">
            Opplev Norges eldste by gjennom bevarte festninger, vikingskipsgraver og middelalderklostre.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.map((site) => (
          <div
            key={site.id}
            className="bg-surface-muted/40 rounded-2xl border border-border overflow-hidden hover:border-primary/50 transition-all flex flex-col justify-between group hover:shadow-lg"
          >
            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                  {site.epoch}
                </span>
                <span className="text-[11px] font-mono text-foreground-muted">
                  {site.heritageId}
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-lg text-foreground group-hover:text-primary transition-colors">
                  {site.name}
                </h4>
                <p className="text-xs text-primary font-semibold mt-0.5">
                  {site.yearBuilt} • {site.category}
                </p>
              </div>

              <p className="text-xs text-foreground-muted leading-relaxed">
                {site.fullDesc}
              </p>

              <div className="p-3 rounded-xl bg-surface border border-border/80 text-xs space-y-1">
                <span className="font-bold text-foreground flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Tips for besøket:
                </span>
                <p className="text-foreground-muted text-[11px] leading-relaxed">
                  {site.tips}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-border bg-surface text-xs text-foreground-subtle flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">{site.location}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
