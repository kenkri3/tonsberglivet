'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Calendar, ArrowRight, Train, Waves, Car, Wind,
  UtensilsCrossed, ShoppingBag, Landmark, Compass, Gift, Building2,
  type LucideIcon
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
          // Hardt mellomrom i «1 min», så målingen ikke deles over to linjer
          // («… · 1» / «min») i den smale mobilpillen.
          const minutes = String(firstDep.minutesUntil).replace(/\s+/g, '\u00a0');
          updates.nextTrain = destination
            ? `${firstDep.line} ${destination} · ${minutes}`
            : `${firstDep.line} · ${minutes}`;
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

  /**
   * Kategoriraden er en scrollbar stripe på mobil (7 lenker får ikke plass
   * uten å bli tre rader høye). Uten et visuelt hint ser den bare ut som om
   * den er kuttet, så vi toner kantene når det faktisk finnes mer å scrolle.
   */
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ atStart: true, atEnd: false });

  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    // Ingen overlapp betyr ingen scroll: da skal begge toningene være borte.
    const scrollable = el.scrollWidth - el.clientWidth > 4;
    const next = {
      atStart: !scrollable || el.scrollLeft <= 2,
      atEnd: !scrollable || el.scrollLeft + el.clientWidth >= el.scrollWidth - 2,
    };
    setEdges((prev) => (prev.atStart === next.atStart && prev.atEnd === next.atEnd ? prev : next));
  }, []);

  useEffect(() => {
    updateEdges();
    const el = scrollerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(updateEdges);
    observer.observe(el);
    window.addEventListener('resize', updateEdges);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateEdges);
    };
  }, [updateEdges]);

  const statusPills: {
    key: string;
    href: string;
    icon: LucideIcon;
    text: string;
    title: string;
    aria: string;
  }[] = [];

  if (pulseData.nextTrain) {
    statusPills.push({
      key: 'train',
      href: '/bylivet',
      icon: Train,
      text: pulseData.nextTrain,
      title: 'Neste avgang fra Tønsberg stasjon (Entur)',
      aria: `Neste avgang: ${pulseData.nextTrain}. Sanntid fra Entur.`,
    });
  }

  if (pulseData.bridgeStatus) {
    statusPills.push({
      key: 'bridge',
      href: '/bylivet',
      icon: Car,
      text: pulseData.bridgeStatus,
      title: 'Kanalbrua – passerbarhet for bil (Statens vegvesen)',
      aria: `Kanalbrua: ${pulseData.bridgeStatus.replace('Kanalbrua: ', '')}. Sanntid fra Statens vegvesen.`,
    });
  }

  if (typeof pulseData.waterTemp === 'number') {
    // Norsk komma, ikke punktum: kilden oppgir 15.1, leseren skal se 15,1 °C.
    const waterText = `${pulseData.waterTemp.toLocaleString('nb-NO')} °C`;
    statusPills.push({
      key: 'water',
      href: '/reiselivet/opplevelser',
      icon: Waves,
      text: `Badevann ${waterText}`,
      title: 'Sjø- og badevannstemperatur (MET Norway)',
      aria: `Badevannstemperatur: ${waterText}. Sanntid fra Meteorologisk institutt.`,
    });
  }

  if (pulseData.airLabel) {
    statusPills.push({
      key: 'air',
      href: '/hverdagslivet',
      icon: Wind,
      text: pulseData.airLabel,
      title: 'Luftkvalitet (Miljødirektoratet)',
      aria: `${pulseData.airLabel}. Sanntid fra Miljødirektoratet.`,
    });
  }

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
    <div className="rounded-3xl border border-border/80 bg-surface/98 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.08)] backdrop-blur-2xl sm:p-5 dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
      {/* ── Rad 1: etikett til venstre, sanntid + handling til høyre ──
          På mobil legger CTA-en seg på egen full bredde og sanntiden under,
          slik at alt er synlig uten skjult horisontal scroll. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2.5">

        {/* Pulsetikett */}
        <span className="order-1 inline-flex shrink-0 items-center gap-2">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:hidden" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.14em] text-foreground sm:text-[11px] sm:tracking-[0.18em]">
            Bypulsen akkurat nå
          </span>
        </span>

        {/* Sanntidsmålinger – bryter til ny linje i stedet for å skjules i en scroll.
            Mobil: to faste kolonner, så radene blir rette. Desktop: frie piller. */}
        <div className="order-3 grid w-full grid-cols-2 gap-2 sm:order-2 sm:ml-auto sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end">
          {statusPills.length === 0 && (
            <span
              className="col-span-2 inline-flex min-h-11 max-w-full items-center gap-2 rounded-full border border-border/70 bg-surface-muted px-3.5 text-[13px] font-medium text-foreground-subtle sm:col-span-1 sm:min-h-9"
              title="Sanntidskildene svarte ikke ved denne lasting"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden="true" />
              <span>Sanntidsdata utilgjengelig nå</span>
            </span>
          )}

          {statusPills.map((pill) => {
            const Icon = pill.icon;
            return (
              <Link
                key={pill.key}
                href={pill.href}
                title={pill.title}
                aria-label={pill.aria}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border/70 bg-surface-muted px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:border-border hover:bg-surface sm:min-h-9 sm:py-0"
              >
                <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span className="min-w-0">{pill.text}</span>
              </Link>
            );
          })}
        </div>

        {/* Arrangement-knapp */}
        <Link
          href="/eventer"
          className="order-2 inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-4 text-[13px] font-semibold text-white shadow-xs transition-colors hover:bg-primary-hover sm:order-3 sm:h-9 sm:w-auto"
        >
          <Calendar className="h-4 w-4" aria-hidden="true" />
          <span>Hva skjer i dag?</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      {/* ── Rad 2: hurtignavigasjon ──
          Desktop: rad som bryter (alt synlig). Mobil: én stripe med snap og
          tonede kanter, så det er tydelig at det finnes mer. */}
      <div className="mt-3.5 border-t border-border/60 pt-3.5">
        <div className="relative">
          <div
            ref={scrollerRef}
            onScroll={updateEdges}
            className="scrollbar-none -mb-1 flex snap-x gap-2 overflow-x-auto overscroll-x-contain pb-1 lg:flex-wrap lg:overflow-visible lg:pb-0"
          >
            {quickCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className="group inline-flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-full border border-border/60 bg-surface-muted/60 px-4 text-[13px] font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-surface hover:text-primary lg:min-h-10"
                >
                  <Icon className="h-4 w-4 shrink-0 text-foreground-subtle transition-colors group-hover:text-primary" aria-hidden="true" />
                  <span className="whitespace-nowrap">{cat.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Kanttoner: viser at stripen kan scrolles. Skjules på desktop, der raden bryter. */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-surface to-transparent transition-opacity lg:hidden ${edges.atStart ? 'opacity-0' : 'opacity-100'}`}
          />
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-surface to-transparent transition-opacity lg:hidden ${edges.atEnd ? 'opacity-0' : 'opacity-100'}`}
          />
        </div>
      </div>
    </div>
  );
}
