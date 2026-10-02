'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, ArrowRight, Train, Waves, Car, Wind,
  UtensilsCrossed, ShoppingBag, Landmark, Compass, Gift, Building2
} from 'lucide-react';

export function CityPulseBar({ eventCount = 14 }: { eventCount?: number }) {
  /**
   * Viktig: ingen oppdiktede startverdier. Denne baren presenteres som
   * «Bypulsen akkurat nå», og viste tidligere fabrikkerte verdier
   * (neste tog, 17,5 °C badevann, «Kanalbrua: Åpen», «Luft: God») helt til
   * API-ene svarte. Nå vises en verdi KUN når kilden faktisk er levende.
   */
  const [pulseData, setPulseData] = useState<{
    nextTrain?: string;
    waterTemp?: number;
    bridgeStatus?: string;
    airLabel?: string;
  }>({});

  useEffect(() => {
    Promise.allSettled([
      fetch('/api/entur?stop=tog').then((r) => r.json()),
      fetch('/api/ocean').then((r) => r.json()),
      fetch('/api/traffic').then((r) => r.json()),
      fetch('/api/airquality').then((r) => r.json()),
    ]).then(([enturRes, oceanRes, trafficRes, airRes]) => {
      const updates: {
        nextTrain?: string;
        waterTemp?: number;
        bridgeStatus?: string;
        airLabel?: string;
      } = {};

      // Entur: kun ekte avgangsdata.
      if (enturRes.status === 'fulfilled' && enturRes.value?.isLive) {
        const firstDep = enturRes.value.data?.departures?.[0];
        if (firstDep?.line && firstDep?.minutesUntil) {
          const destination = String(firstDep.destination ?? '').split('/')[0].trim();
          updates.nextTrain = destination
            ? `${firstDep.line} ${destination}: ${firstDep.minutesUntil}`
            : `${firstDep.line}: ${firstDep.minutesUntil}`;
        }
      }

      // MET oceanforecast: vanntemperatur kan være null når kilden ikke svarer.
      if (oceanRes.status === 'fulfilled' && typeof oceanRes.value?.data?.seaTemperature === 'number') {
        updates.waterTemp = oceanRes.value.data.seaTemperature;
      }

      // Statens vegvesen: isCarPassable er null når vi ikke har sanntidskilde.
      const passable = trafficRes.status === 'fulfilled' ? trafficRes.value?.data?.kanalbrua?.isCarPassable : null;
      if (typeof passable === 'boolean') {
        updates.bridgeStatus = passable ? 'Kanalbrua: Åpen' : 'Kanalbrua: Åpning pågår';
      }

      // Miljødirektoratet: kun når målingen er levende. Nivåene kommer fra
      // API-ets egen indeks (LITE/MODERAT/HØY/SVÆRT HØY), ikke fra NILU lenger.
      if (airRes.status === 'fulfilled' && airRes.value?.isLive) {
        const level = airRes.value.data?.index;
        const label =
          level === 'LITE' ? 'God'
          : level === 'MODERAT' ? 'Moderat'
          : level === 'HØY' ? 'Høy'
          : level === 'SVÆRT HØY' ? 'Svært høy'
          : null;
        if (label) updates.airLabel = `Luft: ${label}`;
      }

      setPulseData(updates);
    });
  }, []);

  const hasAnyLiveValue = Boolean(
    pulseData.nextTrain || pulseData.bridgeStatus || typeof pulseData.waterTemp === 'number' || pulseData.airLabel,
  );

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
          {!hasAnyLiveValue && (
            <span
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-muted border border-border/70 text-foreground-subtle shrink-0"
              title="Sanntidskildene svarte ikke ved denne lasting"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span>Sanntidsdata er ikke tilgjengelig akkurat nå</span>
            </span>
          )}

          {pulseData.nextTrain && (
            <Link
              href="/bylivet"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-muted hover:bg-surface border border-border/70 hover:border-border text-foreground transition-all shrink-0"
              title="Entur sanntid tog"
            >
              <Train className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>{pulseData.nextTrain}</span>
            </Link>
          )}

          {pulseData.bridgeStatus && (
            <Link
              href="/bylivet"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-muted hover:bg-surface border border-border/70 hover:border-border text-foreground transition-all shrink-0"
              title="Kanalbrua status"
            >
              <Car className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>{pulseData.bridgeStatus}</span>
            </Link>
          )}

          {typeof pulseData.waterTemp === 'number' && (
            <Link
              href="/reiselivet/opplevelser"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-muted hover:bg-surface border border-border/70 hover:border-border text-foreground transition-all shrink-0"
              title="Sjø- og badevannstemperatur (MET Norway)"
            >
              <Waves className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>Badevann {pulseData.waterTemp}°C</span>
            </Link>
          )}

          {pulseData.airLabel && (
            <Link
              href="/hverdagslivet"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-muted hover:bg-surface border border-border/70 hover:border-border text-foreground transition-all shrink-0"
              title="Luftkvalitet (Miljødirektoratet)"
            >
              <Wind className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>{pulseData.airLabel}</span>
            </Link>
          )}
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
