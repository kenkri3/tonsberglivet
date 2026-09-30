'use client';

import { useState, useEffect } from 'react';
import { Bus, Train, RefreshCw, Clock, MapPin, Radio, Compass } from 'lucide-react';
import type { StopDepartures } from '@/lib/entur';

interface PublicTransportWidgetProps {
  initialStop?: 'tog' | 'rutebil' | 'bakkenteigen' | 'kanalen';
  compact?: boolean;
}

const STOPS = [
  { id: 'tog', label: 'Togstasjon (Vy)', icon: Train, stopName: 'Tønsberg Stasjon' },
  { id: 'rutebil', label: 'Rutebilstasjon', icon: Bus, stopName: 'Tønsberg Rutebilstasjon' },
  { id: 'bakkenteigen', label: 'USN Campus Bakkenteigen', icon: Compass, stopName: 'Bakkenteigen' },
  { id: 'kanalen', label: 'Kanalen', icon: Bus, stopName: 'Kanalen' },
];

export function PublicTransportWidget({ initialStop = 'tog', compact = false }: PublicTransportWidgetProps) {
  const [activeStop, setActiveStop] = useState(initialStop);
  const [data, setData] = useState<StopDepartures | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDepartures = async (stop: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/entur?stop=${stop}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (e) {
      console.error('Feil ved lasting av Entur-avganger:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartures(activeStop);
    const interval = setInterval(() => {
      fetchDepartures(activeStop);
    }, 60000); // 1 min auto-refresh
    return () => clearInterval(interval);
  }, [activeStop]);

  return (
    <div className="bg-surface rounded-3xl border border-border p-6 md:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
            <span>Entur Nasjonal Sanntid Live</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-foreground">
            Kollektivtrafikk & Avganger
          </h3>
          <p className="text-foreground-muted text-sm mt-1">
            Sanntidsinformasjon for tog (RE11) og busser i Tønsberg og omegn.
          </p>
        </div>

        <button
          onClick={() => fetchDepartures(activeStop)}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 bg-surface-muted hover:bg-border rounded-xl text-xs font-bold text-foreground transition-colors border border-border"
          title="Oppdater avganger"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
          <span>Oppdater nå</span>
        </button>
      </div>

      {/* Holdeplass-knapper */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STOPS.map((s) => {
          const Icon = s.icon;
          const isActive = activeStop === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveStop(s.id as any)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-muted text-foreground hover:bg-surface-muted/80 border border-border'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Avgangs-tavle */}
      <div className="space-y-2.5">
        <div className="text-xs text-foreground-subtle flex items-center justify-between px-2">
          <span>Holdeplass: <strong className="text-foreground">{data?.stopName || 'Tønsberg'}</strong></span>
          <span>Sist oppdatert: {data?.updatedAt || 'Nå'}</span>
        </div>

        <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden bg-surface-muted/30">
          {data?.departures?.map((dep, idx) => (
            <div
              key={idx}
              className="p-4 flex items-center justify-between gap-4 hover:bg-surface-muted/60 transition-colors"
            >
              {/* Linje og destinasjon */}
              <div className="flex items-center gap-3">
                <span
                  className={`w-11 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-2xs ${
                    dep.mode === 'rail'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-primary text-white'
                  }`}
                >
                  {dep.line}
                </span>
                <div>
                  <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    <span>{dep.destination}</span>
                    {dep.platform && (
                      <span className="text-[10px] font-mono font-normal text-foreground-muted bg-surface px-1.5 py-0.2 rounded border border-border">
                        {dep.platform}
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-foreground-subtle">
                    {dep.modeNorwegian} • Rutetid {dep.timeFormatted}
                  </p>
                </div>
              </div>

              {/* Nedtelling */}
              <div className="text-right shrink-0">
                <span
                  className={`inline-block px-3 py-1 rounded-xl text-xs font-extrabold shadow-2xs ${
                    dep.minutesUntil === 'Nå'
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-surface border border-border text-primary font-bold'
                  }`}
                >
                  {dep.minutesUntil}
                </span>
              </div>
            </div>
          ))}

          {(!data?.departures || data.departures.length === 0) && (
            <div className="p-8 text-center text-foreground-muted text-sm">
              Ingen aktive avganger funnet for denne holdeplassen i øyeblikket.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
