'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, ArrowRight, Train, Waves, Car, Wind,
  CheckCircle, Radio
} from 'lucide-react';

export function CityPulseBar({ eventCount = 14 }: { eventCount?: number }) {
  const [pulseData, setPulseData] = useState<{
    nextTrain?: string;
    waterTemp?: number;
    bridgeStatus?: string;
    airLabel?: string;
  }>({
    nextTrain: 'RE11 Oslo S: 6 min',
    waterTemp: 17.5,
    bridgeStatus: 'Kanalbrua: Åpen',
    airLabel: 'Luft: God',
  });

  useEffect(() => {
    // Parallel fetch of live Tønsberg pulse APIs
    Promise.allSettled([
      fetch('/api/entur?stop=tog').then((r) => r.json()),
      fetch('/api/ocean').then((r) => r.json()),
      fetch('/api/traffic').then((r) => r.json()),
      fetch('/api/airquality').then((r) => r.json()),
    ]).then(([enturRes, oceanRes, trafficRes, airRes]) => {
      const updates: typeof pulseData = { ...pulseData };

      if (enturRes.status === 'fulfilled' && enturRes.value.success) {
        const firstDep = enturRes.value.data?.departures?.[0];
        if (firstDep) {
          updates.nextTrain = `${firstDep.line} ${firstDep.destination.split('/')[0].trim()}: ${firstDep.minutesUntil}`;
        }
      }

      if (oceanRes.status === 'fulfilled' && oceanRes.value.success) {
        updates.waterTemp = oceanRes.value.data?.seaTemperature;
      }

      if (trafficRes.status === 'fulfilled' && trafficRes.value.success) {
        updates.bridgeStatus = trafficRes.value.data?.kanalbrua?.isCarPassable
          ? 'Kanalbrua: Åpen'
          : 'Kanalbrua: Broåpning';
      }

      if (airRes.status === 'fulfilled' && airRes.value.success) {
        updates.airLabel = `Luft: ${airRes.value.data?.index === 'LAV' ? 'God' : 'Moderat'}`;
      }

      setPulseData(updates);
    });
  }, []);

  const quickCategories = [
    { label: 'Uteservering & Mat', href: '/bylivet/mat-og-drikke', icon: '🍽️' },
    { label: 'Sentrumsshopping', href: '/bylivet/shopping', icon: '🛍️' },
    { label: 'Slottsfjellet', href: '/reiselivet/opplevelser', icon: '🏰' },
    { label: 'Verdens Ende', href: '/reiselivet/opplevelser', icon: '🌊' },
    { label: 'Kollektiv & Avganger', href: '/bylivet', icon: '🚆' },
    { label: 'Sentrumsgavekort', href: '/bylivet/gavekort', icon: '🎁' },
    { label: 'Bedrifter & Brreg', href: '/naeringslivet/bedrifter', icon: '🏢' },
  ];

  return (
    <div className="bg-surface/95 dark:bg-slate-900/95 backdrop-blur-xl border border-border rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
      {/* ── Topprad: Puls-indikator og Sanntids API-chips ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-border/60 pb-3">
        {/* Venstre status-indikator */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-foreground">
              <span>Tønsberg Pulsen</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                Live API
              </span>
            </div>
          </div>
        </div>

        {/* Midt: Live API Sensor Chips */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-[11px] font-semibold text-foreground-muted">
          <Link
            href="/bylivet"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500 shrink-0 transition-colors"
            title="Entur sanntid tog"
          >
            <Train className="w-3.5 h-3.5 text-emerald-600" />
            <span>{pulseData.nextTrain}</span>
          </Link>

          <Link
            href="/bylivet"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 hover:border-blue-500 shrink-0 transition-colors"
            title="Statens vegvesen Datex status"
          >
            <Car className="w-3.5 h-3.5 text-blue-600" />
            <span>{pulseData.bridgeStatus}</span>
          </Link>

          <Link
            href="/reiselivet/opplevelser"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 hover:border-cyan-500 shrink-0 transition-colors"
            title="MET Norway sjøtemperatur"
          >
            <Waves className="w-3.5 h-3.5 text-cyan-600" />
            <span>Badevann {pulseData.waterTemp}°C</span>
          </Link>

          <Link
            href="/hverdagslivet"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 hover:border-purple-500 shrink-0 transition-colors"
            title="NILU luftkvalitet"
          >
            <Wind className="w-3.5 h-3.5 text-purple-600" />
            <span>{pulseData.airLabel}</span>
          </Link>
        </div>

        {/* Høyre: Arrangementskalender-snarvei */}
        <Link
          href="/eventer"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition-colors shrink-0 shadow-xs self-start lg:self-auto"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Hva skjer i dag?</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ── Bunndel: Hurtigsnarveier ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {quickCategories.map((cat, idx) => (
          <Link
            key={idx}
            href={cat.href}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-muted hover:bg-primary hover:text-white text-xs font-semibold text-foreground transition-all shrink-0 border border-border/60 hover:border-primary shadow-2xs hover:scale-105"
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
