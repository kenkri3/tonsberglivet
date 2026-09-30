'use client';

import { useState, useEffect } from 'react';
import { Waves, Thermometer, ArrowUp, ArrowDown, Droplets, Compass, Wind } from 'lucide-react';
import type { OceanConditions } from '@/lib/ocean';

export function OceanConditionsWidget() {
  const [data, setData] = useState<OceanConditions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ocean')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setData(json.data);
        }
      })
      .catch((e) => console.error('Feil ved sjødata:', e))
      .finally(() => setLoading(false));
  }, []);

  if (!data) return null;

  return (
    <div className="bg-surface rounded-3xl border border-border p-6 md:p-8 space-y-6 shadow-sm">
      {/* Tittel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Waves className="w-3.5 h-3.5 text-cyan-500" />
            <span>MET Norway & Yr Havvarsel API</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-foreground">
            Badevann, Flo & Sjøforhold
          </h3>
          <p className="text-foreground-muted text-sm mt-1">
            Sanntids hav- og badevannstemperaturer for Tønsberg Havn, Ringshaug og Færder.
          </p>
        </div>
      </div>

      {/* Hovedtall grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sjøtemperatur */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/40 dark:to-blue-950/30 border border-cyan-200 dark:border-cyan-800 space-y-2">
          <div className="flex items-center justify-between text-cyan-800 dark:text-cyan-300 text-xs font-bold uppercase">
            <span>Sjøtemperatur</span>
            <Thermometer className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-3xl font-black text-cyan-900 dark:text-cyan-100">
            {data.seaTemperature}°C
          </div>
          <p className="text-xs text-cyan-700 dark:text-cyan-400">
            Målt i Tønsbergfjorden
          </p>
        </div>

        {/* Tidevann status */}
        <div className="p-5 rounded-2xl bg-surface-muted border border-border space-y-2">
          <div className="flex items-center justify-between text-foreground-muted text-xs font-bold uppercase">
            <span>Tidevann</span>
            {data.isRising ? (
              <ArrowUp className="w-4 h-4 text-emerald-500" />
            ) : (
              <ArrowDown className="w-4 h-4 text-amber-500" />
            )}
          </div>
          <div className="text-xl font-extrabold text-foreground">
            {data.tideState}
          </div>
          <p className="text-xs text-foreground-muted">
            Høyvann: {data.nextHighTide.time} ({data.nextHighTide.height})
          </p>
        </div>

        {/* Bølgehøyde */}
        <div className="p-5 rounded-2xl bg-surface-muted border border-border space-y-2">
          <div className="flex items-center justify-between text-foreground-muted text-xs font-bold uppercase">
            <span>Bølgehøyde</span>
            <Waves className="w-4 h-4 text-primary" />
          </div>
          <div className="text-3xl font-black text-foreground">
            {data.waveHeight} m
          </div>
          <p className="text-xs text-foreground-muted">
            Rolige bølgeforhold ved brygga
          </p>
        </div>

        {/* Strøm */}
        <div className="p-5 rounded-2xl bg-surface-muted border border-border space-y-2">
          <div className="flex items-center justify-between text-foreground-muted text-xs font-bold uppercase">
            <span>Fjordstrøm</span>
            <Wind className="w-4 h-4 text-primary" />
          </div>
          <div className="text-3xl font-black text-foreground">
            {data.currentSpeedKnots} knop
          </div>
          <p className="text-xs text-foreground-muted">
            Gunstige seil- og båtforhold
          </p>
        </div>
      </div>

      {/* Badevannsoversikt for populære strender */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
          Vanntemperaturer på populære badeplasser
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {data.beaches.map((b, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-surface-muted/50 border border-border text-center space-y-1 hover:border-primary/40 transition-colors"
            >
              <span className="block text-xs font-bold text-foreground truncate">
                {b.name}
              </span>
              <span className="block text-xl font-black text-primary">
                {b.waterTemp}°C
              </span>
              <span className="inline-block text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.2 rounded-full">
                {b.suitability}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
