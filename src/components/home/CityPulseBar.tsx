'use client';

import Link from 'next/link';
import { Calendar, Sparkles, MapPin, ArrowRight, Ticket, Compass, Utensils, ShoppingBag } from 'lucide-react';

export function CityPulseBar({ eventCount = 14 }: { eventCount?: number }) {
  const quickCategories = [
    { label: 'Uteservering & Mat', href: '/bylivet/mat-og-drikke', icon: '🍽️' },
    { label: 'Sentrumsshopping', href: '/bylivet/shopping', icon: '🛍️' },
    { label: 'Slottsfjellet', href: '/reiselivet/opplevelser', icon: '🏰' },
    { label: 'Verdens Ende', href: '/reiselivet/opplevelser', icon: '🌊' },
    { label: 'Konserter & Show', href: '/eventer', icon: '🎟️' },
    { label: 'Sentrumsgavekort', href: '/bylivet/gavekort', icon: '🎁' },
    { label: 'Leie Torvplass', href: '/bylivet/torvleie', icon: '🎪' },
  ];

  return (
    <div className="bg-surface/90 dark:bg-slate-900/90 backdrop-blur-xl border border-border rounded-3xl p-4 sm:p-5 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
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
                Live
              </span>
            </div>
            <p className="text-xs text-foreground-muted">
              {eventCount} store kulturarrangementer & konserter i sesongen
            </p>
          </div>
        </div>

        {/* Midt: Horisontal rullefelt med hurtigvalg */}
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

        {/* Høyre: Arrangementskalender-snarvei */}
        <Link
          href="/eventer"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition-colors shrink-0 shadow-sm"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Hva skjer i dag?</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

      </div>
    </div>
  );
}
