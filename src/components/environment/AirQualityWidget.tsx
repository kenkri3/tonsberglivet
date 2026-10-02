'use client';

import { useState, useEffect } from 'react';
import { Wind, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import type { AirQualityData } from '@/lib/airquality';

/** Én målt komponent. Manglende måling vises som «–», aldri som 0 µg/m³. */
function Measurement({ title, value }: { title: string; value: number | null }) {
  const measured = value !== null;

  return (
    <div className="p-5 rounded-2xl bg-surface-muted border border-border space-y-1 flex flex-col">
      {/* Fast høyde på etiketten slik at tallene står på linje selv når ett
          stoffnavn (Nitrogendioksid (NO2)) bryter over to linjer. */}
      <span className="text-xs font-bold uppercase text-foreground-muted min-h-[2rem] leading-snug">
        {title}
      </span>
      <div className="text-2xl font-black text-foreground leading-none tabular-nums">
        {measured ? (
          <span className="flex items-baseline gap-1">
            <span>{value}</span>
            <span className="text-sm font-bold">µg/m³</span>
          </span>
        ) : (
          '–'
        )}
      </div>
      <p className={`text-[11px] font-semibold pt-1 ${measured ? 'text-emerald-600' : 'text-foreground-muted'}`}>
        {measured ? 'Målt verdi fra Miljødirektoratet' : 'Ikke målt i denne rapporten'}
      </p>
    </div>
  );
}

export function AirQualityWidget() {
  const [data, setData] = useState<AirQualityData | null>(null);
  const [unavailableNote, setUnavailableNote] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/airquality')
      .then((res) => res.json())
      .then((json) => {
        if (json.isLive === true && json.data) {
          setData(json.data);
          setUnavailableNote(null);
        } else {
          // Ingen oppdiktede målinger: vis at kilden mangler i stedet.
          setData(null);
          setUnavailableNote(json.note || 'Luftkvalitetsdata er ikke tilgjengelige akkurat nå.');
        }
      })
      .catch((e) => {
        console.error('Feil ved luftkvalitet:', e);
        setUnavailableNote('Luftkvalitetsdata er ikke tilgjengelige akkurat nå.');
      });
  }, []);

  if (!data) {
    return (
      <div className="bg-surface rounded-3xl border border-border p-6 md:p-8 space-y-4 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Wind className="w-3.5 h-3.5" />
          <span>Miljødirektoratet: ikke tilgjengelig</span>
        </div>
        <h3 className="text-2xl md:text-3xl font-extrabold text-foreground">
          Luftkvalitet i Tønsberg
        </h3>
        <p className="text-foreground-muted text-sm leading-relaxed max-w-3xl">
          {unavailableNote ||
            'Henter luftkvalitetsdata …'}
        </p>
        {/* Uten «www» i adressen: www-varianten løser ikke opp i DNS. */}
        <a
          href="https://luftkvalitet.miljodirektoratet.no/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-xs font-bold text-primary hover:underline"
        >
          Se offisielle målinger hos Miljødirektoratet →
        </a>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-3xl border border-border p-6 md:p-8 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Wind className="w-3.5 h-3.5 text-emerald-500" />
            <span>Miljødirektoratet (live)</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-foreground">
            Luftkvalitet i Tønsberg
          </h3>
          <p className="text-foreground-muted text-sm mt-1">
            Måling fra {data.station}
            {data.updatedAt ? ` – oppdatert kl. ${data.updatedAt}.` : '.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto px-4 py-2 rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-wider">{data.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Measurement title="Svevestøv (PM10)" value={data.pm10} />
        <Measurement title="Finstøv (PM2.5)" value={data.pm25} />
        <Measurement title="Nitrogendioksid (NO2)" value={data.no2} />
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
