'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, ArrowRight, Train, Waves, Car, Wind,
  UtensilsCrossed, ShoppingBag, Landmark, Compass, Gift, Building2
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
          : 'Kanalbrua: Åpning pågår';
      }

      if (airRes.status === 'fulfilled' && airRes.value.success) {
        updates.airLabel = `Luft: ${airRes.value.data?.index === 'LAV' ? 'God' : 'Moderat'}`;
      }

      setPulseData(updates);
    });
  }, []);

  const quickCategories = [
    { label: 'Spisesteder & Brygga', href: '/bylivet/mat-og-drikke', icon: UtensilsCrossed },
    { label: 'Sentrumsshopping', href: '/bylivet/shopping', icon: ShoppingBag },
    { label: 'Slottsfjellet', href: '/reiselivet/opplevelser', icon: Landmark },
    { label: 'Verdens Ende', href: '/reiselivet/opplevelser', icon: Compass },
    { label: 'Tog & Kollektiv', href: '/bylivet', icon: Train },
    { label: 'Sentrumsgavekort', href: '/bylivet/gavekort', icon: Gift },
    { label: 'Næringsliv', href: '/naeringslivet/bedrifter', icon: Building2 },
  ];

  return (
    <div className="bg-surface/98 backdrop-blur-2xl border border-border/80 rounded-3xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] space-y-3.5">
      {/* ── Top Bar: Bypulsen Sanntid ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-border/60 pb-3.5">
        
        {/* Puls Header */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground">
              Bypulsen akkurat nå
            </span>
          </div>
        </div>

        {/* Live Status Indicators (Sleek monochromatic styling) */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-[12px] font-medium text-foreground-muted">
          <Link
            href="/bylivet"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-muted hover:bg-surface border border-border/70 hover:border-border text-foreground transition-all shrink-0"
            title="Entur sanntid tog"
          >
            <Train className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{pulseData.nextTrain}</span>
          </Link>

          <Link
            href="/bylivet"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-muted hover:bg-surface border border-border/70 hover:border-border text-foreground transition-all shrink-0"
            title="Kanalbrua status"
          >
            <Car className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{pulseData.bridgeStatus}</span>
          </Link>

          <Link
            href="/reiselivet/opplevelser"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-muted hover:bg-surface border border-border/70 hover:border-border text-foreground transition-all shrink-0"
            title="Sjø- og badevannstemperatur"
          >
            <Waves className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>Badevann {pulseData.waterTemp}°C</span>
          </Link>

          <Link
            href="/hverdagslivet"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-muted hover:bg-surface border border-border/70 hover:border-border text-foreground transition-all shrink-0"
            title="Luftkvalitet"
          >
            <Wind className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{pulseData.airLabel}</span>
          </Link>
        </div>

        {/* Arrangement-knapp */}
        <Link
          href="/eventer"
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary text-white rounded-full text-xs font-semibold hover:bg-primary-hover transition-colors shrink-0 shadow-xs self-start lg:self-auto"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Hva skjer i dag?</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* ── Bottom Bar: Curated Quick Navigation ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {quickCategories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <Link
              key={idx}
              href={cat.href}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-surface-muted/60 hover:bg-surface hover:text-primary text-foreground text-xs font-medium border border-border/60 hover:border-primary/30 transition-all shrink-0 group"
            >
              <Icon className="w-3.5 h-3.5 text-foreground-subtle group-hover:text-primary transition-colors shrink-0" />
              <span>{cat.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
