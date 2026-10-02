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
        if (json.data) {
          setData(json.data);
        }
      })
      .catch((e) => console.error('Feil ved sjødata:', e))
      .finally(() => setLoading(false));
  }, []);

  // Skjelett mens MET-kallet pågår: uten dette forsvant kortet helt og
  // sidekolonnen sto tom til dataene kom.
  if (!data) {
    return (
      <div className="bg-surface rounded-3xl border border-border p-6 md:p-8 space-y-6 shadow-sm animate-pulse" aria-busy="true">
        <div className="space-y-3 border-b border-border pb-6">
          <div className="h-6 w-52 rounded-full bg-border" />
          <div className="h-8 w-80 max-w-full rounded bg-border" />
          <div className="h-4 w-64 max-w-full rounded bg-border" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-surface-muted border border-border" />
          ))}
        </div>
      </div>
    );
  }

  const hasTemperature = typeof data.seaTemperature === 'number';
  const hasWave = typeof data.waveHeight === 'number';
  const hasCurrent = typeof data.currentSpeedKnots === 'number';

  // «Fjærende (Vannet synker)» → hovedtekst + forklaring på egen linje, slik at
  // hovedtallet ikke brekker over tre linjer i et smalt kort.
  const tideMatch = data.tideState.match(/^([^(]+?)\s*(?:\((.+)\))?$/);
  const tideMain = tideMatch?.[1]?.trim() || data.tideState;
  const tideDetail = tideMatch?.[2]?.trim() || null;

  return (
    /* @container gjør at antall kolonner følger widgetens egen bredde, ikke
       vinduets. Widgeten står i en smal kolonne på /bylivet (ca. 590 px) men
       i full bredde på /reiselivet/opplevelser — med viewport-baserte
       brytepunkter ble det fire ~118 px smale kort og teksten rant ut. */
    <div className="@container bg-surface rounded-3xl border border-border p-6 md:p-8 space-y-6 shadow-sm">
      {/* Tittel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="min-w-0">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
              data.isLive
                ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
            }`}
          >
            <Waves className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
            <span>{data.isLive ? 'MET Norway Havvarsel (live)' : 'MET Norway: ikke tilgjengelig'}</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-foreground">
            Badevann, Flo & Sjøforhold
          </h3>
          <p className="text-foreground-muted text-sm mt-1">
            {data.isLive
              ? 'Hav- og badevannstemperaturer for Tønsberg Havn, Ringshaug og Færder.'
              : 'MET Norway svarte ikke. Vi viser ikke oppdiktede temperaturer – kun lokalt beregnet tidevann.'}
          </p>
        </div>
      </div>

      {!data.isLive && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          {data.note}
        </div>
      )}

      {/* Hovedtall: 1 kolonne på mobil, 2 i smal kolonne, 4 først når det er plass */}
      <div className="grid grid-cols-1 @sm:grid-cols-2 @2xl:grid-cols-4 gap-3 @sm:gap-4">
        {/* Sjøtemperatur */}
        {/* Kortene er flex-kolonner med forklaringen dyttet til bunnen (mt-auto).
            Uten det strekkes det korteste kortet til naboradens høyde og får et
            stort, tomt felt under tallet. */}
        <div className="min-w-0 p-4 @sm:p-5 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/40 dark:to-blue-950/30 border border-cyan-200 dark:border-cyan-800 space-y-1.5 flex flex-col">
          <div className="flex items-center justify-between gap-2 text-cyan-800 dark:text-cyan-300 text-[11px] font-bold uppercase tracking-wide">
            <span className="truncate">Sjøtemperatur</span>
            <Thermometer className="w-4 h-4 text-cyan-600 shrink-0" />
          </div>
          <div className="flex items-baseline gap-1 text-cyan-900 dark:text-cyan-100">
            <span className="text-3xl font-black leading-none tabular-nums">
              {hasTemperature ? data.seaTemperature : '–'}
            </span>
            {hasTemperature && <span className="text-lg font-black leading-none">°C</span>}
          </div>
          <p className="mt-auto text-[11px] text-cyan-700 dark:text-cyan-400 leading-snug">
            {hasTemperature ? 'Målt i Tønsbergfjorden (MET)' : 'Ingen måling tilgjengelig'}
          </p>
        </div>

        {/* Tidevann status */}
        <div className="min-w-0 p-4 @sm:p-5 rounded-2xl bg-surface-muted border border-border space-y-1.5 flex flex-col">
          <div className="flex items-center justify-between gap-2 text-foreground-muted text-[11px] font-bold uppercase tracking-wide">
            <span className="truncate">Tidevann</span>
            {data.isRising ? (
              <ArrowUp className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <ArrowDown className="w-4 h-4 text-amber-500 shrink-0" />
            )}
          </div>
          <div className="text-xl font-extrabold text-foreground leading-tight break-words">
            {tideMain}
          </div>
          {tideDetail && (
            <p className="text-[11px] text-foreground-muted leading-snug break-words">{tideDetail}</p>
          )}
          <p className="text-[11px] text-foreground-muted leading-snug">
            Høyvann {data.nextHighTide.time}
          </p>
          <p className="mt-auto text-[10px] text-foreground-subtle leading-snug break-words">
            {data.nextHighTide.height}
          </p>
        </div>

        {/* Bølgehøyde */}
        <div className="min-w-0 p-4 @sm:p-5 rounded-2xl bg-surface-muted border border-border space-y-1.5 flex flex-col">
          <div className="flex items-center justify-between gap-2 text-foreground-muted text-[11px] font-bold uppercase tracking-wide">
            <span className="truncate">Bølgehøyde</span>
            <Waves className="w-4 h-4 text-primary shrink-0" />
          </div>
          <div className="flex items-baseline gap-1 text-foreground">
            <span className="text-3xl font-black leading-none tabular-nums">
              {hasWave ? data.waveHeight : '–'}
            </span>
            {hasWave && <span className="text-lg font-black leading-none">m</span>}
          </div>
          <p className="mt-auto text-[11px] text-foreground-muted leading-snug">
            {hasWave ? 'Signifikant bølgehøyde (MET)' : 'Ingen måling tilgjengelig'}
          </p>
        </div>

        {/* Strøm */}
        <div className="min-w-0 p-4 @sm:p-5 rounded-2xl bg-surface-muted border border-border space-y-1.5 flex flex-col">
          <div className="flex items-center justify-between gap-2 text-foreground-muted text-[11px] font-bold uppercase tracking-wide">
            <span className="truncate">Fjordstrøm</span>
            <Wind className="w-4 h-4 text-primary shrink-0" />
          </div>
          <div className="flex items-baseline gap-1 text-foreground">
            <span className="text-3xl font-black leading-none tabular-nums">
              {hasCurrent ? data.currentSpeedKnots : '–'}
            </span>
            {hasCurrent && <span className="text-lg font-black leading-none">knop</span>}
          </div>
          <p className="mt-auto text-[11px] text-foreground-muted leading-snug">
            {hasCurrent ? 'Vannstrøm i overflaten (MET)' : 'Ingen måling tilgjengelig'}
          </p>
        </div>
      </div>

      {/* Ærlighetsmerknad flyttet ut av kortet: den presset tidevannskortet
          mye høyere enn de andre og ble klippet midt i ordet. */}
      <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 leading-snug">
        Tidevann er beregnet lokalt – ikke en offisiell tidevannsprognose.
      </p>

      {/* Badevannsoversikt for populære strender */}
      {data.beaches.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
            Vanntemperaturer på populære badeplasser{' '}
            <span className="font-semibold normal-case tracking-normal text-foreground-subtle">
              (anslag ut fra målt sjøtemperatur)
            </span>
          </h4>
          {/* Liggende kort: navn til venstre, temperatur til høyre. Da holder det
              med to kolonner i den smale widget-kolonnen uten at kortene blir
              unødvendig høye, og navnene slipper å bli kuttet. */}
          <div className="grid grid-cols-1 @md:grid-cols-2 @3xl:grid-cols-4 gap-3">
            {data.beaches.map((b, idx) => (
              <div
                key={idx}
                className="min-w-0 p-3.5 rounded-xl bg-surface-muted/50 border border-border flex items-center justify-between gap-3 hover:border-primary/40 transition-colors"
              >
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-foreground leading-snug break-words">
                    {b.name}
                  </span>
                  <span className="mt-1 inline-block text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                    {b.suitability}
                  </span>
                </div>
                <span className="shrink-0 text-xl font-black text-primary tabular-nums leading-none">
                  {b.waterTemp}°C
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
