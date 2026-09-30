'use client';

import { useState, useEffect } from 'react';
import { Wind, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import type { AirQualityData } from '@/lib/airquality';

export function AirQualityWidget() {
  const [data, setData] = useState<AirQualityData | null>(null);

  useEffect(() => {
    fetch('/api/airquality')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setData(json.data);
        }
      })
      .catch((e) => console.error('Feil ved luftkvalitet:', e));
  }, []);

  if (!data) return null;

  return (
    <div className="bg-surface rounded-3xl border border-border p-6 md:p-8 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Wind className="w-3.5 h-3.5 text-emerald-500" />
            <span>NILU & Miljødirektoratet Live</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-foreground">
            Luftkvalitet i Tønsberg
          </h3>
          <p className="text-foreground-muted text-sm mt-1">
            Sanntidsmåling fra Tønsberg målestasjon for trygg ferdsel og friluftsliv.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto px-4 py-2 rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-wider">{data.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-surface-muted border border-border space-y-1">
          <span className="text-xs font-bold uppercase text-foreground-muted">Svevestøv (PM10)</span>
          <div className="text-2xl font-black text-foreground">{data.pm10} µg/m³</div>
          <p className="text-[11px] text-emerald-600 font-semibold">Under grenseverdi (Godt)</p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-muted border border-border space-y-1">
          <span className="text-xs font-bold uppercase text-foreground-muted">Finstøv (PM2.5)</span>
          <div className="text-2xl font-black text-foreground">{data.pm25} µg/m³</div>
          <p className="text-[11px] text-emerald-600 font-semibold">Lave verdier (Optimalt)</p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-muted border border-border space-y-1">
          <span className="text-xs font-bold uppercase text-foreground-muted">Nitrogendioksid (NO2)</span>
          <div className="text-2xl font-black text-foreground">{data.no2} µg/m³</div>
          <p className="text-[11px] text-emerald-600 font-semibold">Ren kystby-luft</p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-surface-muted/60 border border-border flex items-center gap-3 text-xs text-foreground-muted">
        <Heart className="w-5 h-5 text-rose-500 shrink-0" />
        <p>
          <strong className="text-foreground">Helseanbefaling:</strong> {data.healthAdvice}
        </p>
      </div>
    </div>
  );
}
