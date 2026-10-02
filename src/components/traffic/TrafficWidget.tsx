'use client';

import { useState, useEffect } from 'react';
import { Car, AlertTriangle, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import type { TbgTrafficStatus } from '@/lib/traffic';

export function TrafficWidget() {
  const [data, setData] = useState<TbgTrafficStatus | null>(null);

  useEffect(() => {
    fetch('/api/traffic')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setData(json.data);
        }
      })
      .catch((e) => console.error('Feil ved trafikkstatus:', e));
  }, []);

  if (!data) return null;

  const hasVerifiedBridgeStatus = data.kanalbrua.isCarPassable !== null;

  return (
    <div className="bg-surface rounded-3xl border border-border p-6 md:p-8 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
              data.isLive
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>{data.isLive ? 'Statens vegvesen (live)' : 'Statens vegvesen: ikke tilkoblet'}</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-foreground">
            Kanalbrua & Trafikkflyt
          </h3>
          <p className="text-foreground-muted text-sm mt-1">
            {data.isLive
              ? 'Status for Kanalbrua mellom Tønsberg og Nøtterøy/Tjøme samt innfartsårer.'
              : 'Ingen verifisert sanntidskilde for Kanalbrua eller E18 er tilkoblet.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-surface-muted px-4 py-2 rounded-2xl border border-border">
          <span className="relative flex h-3 w-3">
            {data.isLive && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                data.isLive ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            ></span>
          </span>
          <span className="text-xs font-extrabold text-foreground">{data.trafficFlowOverview}</span>
        </div>
      </div>

      {!data.isLive && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          {data.note}
        </div>
      )}

      {/* Kanalbrua fokus-boks */}
      <div
        className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          hasVerifiedBridgeStatus
            ? 'bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20'
            : 'bg-surface-muted/50 border-border'
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
              hasVerifiedBridgeStatus ? 'bg-emerald-500 text-white' : 'bg-amber-500/80 text-white'
            }`}
          >
            {hasVerifiedBridgeStatus ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-lg text-foreground">
                Kanalbrua (Fv. 308)
              </h4>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  hasVerifiedBridgeStatus
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {data.kanalbrua.status}
              </span>
            </div>
            <p className="text-xs text-foreground-muted mt-0.5">
              {data.kanalbrua.details}
            </p>
          </div>
        </div>

        <div className="shrink-0 bg-surface px-4 py-2 rounded-xl border border-border text-xs text-foreground-muted flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span>
            Neste rutemessige åpning: <strong className="text-foreground">{data.kanalbrua.nextScheduledOpening}</strong>
          </span>
        </div>
      </div>

      {/* Veimeldinger liste */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
          Aktuelle veimeldinger
        </h4>
        {data.alerts.length === 0 ? (
          <p className="text-xs text-foreground-muted p-4 rounded-xl bg-surface-muted/50 border border-border">
            Ingen veimeldinger er tilgjengelige fordi kilden ikke er tilkoblet. Vi viser ikke oppdiktede meldinger.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {data.alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-xl bg-surface-muted/50 border border-border space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground">{alert.road}</span>
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    OK
                  </span>
                </div>
                <h5 className="font-semibold text-xs text-foreground">{alert.heading}</h5>
                <p className="text-[11px] text-foreground-muted leading-relaxed">
                  {alert.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
