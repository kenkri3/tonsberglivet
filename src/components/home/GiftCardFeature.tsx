'use client';

import Link from 'next/link';
import { Gift, Sparkles, Store, CreditCard, Check, ArrowRight } from 'lucide-react';
import { TonsberglivetLogo } from '@/components/brand/BrandLogos';

export function GiftCardFeature() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#16193d] via-[#1a1f4c] to-[#0c0e24] text-white p-8 md:p-14 border border-blue-900/50 shadow-2xl">
      {/* Bakgrunns-glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Venstre kolonne: Tekst & fordeler */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-amber-300 border border-white/15 text-xs font-bold uppercase tracking-wider">
            <Gift className="w-3.5 h-3.5" />
            <span>Sentrumsgavekortet Tønsberg</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Gaven som åpner <br />
            <span className="font-serif italic font-normal text-amber-200">over 300 dører i byen.</span>
          </h2>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-xl font-light">
            Enten det er en romantisk middag på Brygga, nye klær hos Bogart, teaterbilletter på Oseberg eller shopping på Farmandstredet — med Sentrumsgavekortet gir du hele Tønsberg i gave.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-w-lg">
            <div className="flex items-center gap-2.5 text-xs text-slate-200">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span>Gyldig i 300+ butikker & restauranter</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-200">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span>Fysisk kort & digitalt i appen</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-200">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span>Populær gave for bedrifter</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-200">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span>Støtter lokalt næringsliv 100%</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href="/bylivet/gavekort"
              className="px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 group"
            >
              <span>Kjøp gavekort på nett</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/bylivet/gavekort#utsalgssteder"
              className="px-6 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full font-bold text-sm transition-all"
            >
              Her kan det brukes
            </Link>
          </div>
        </div>

        {/* Høyre kolonne: 3D-inspirert gavekortmockup */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-sm aspect-[1.586/1] rounded-3xl p-6 bg-gradient-to-br from-amber-300/30 via-white/10 to-blue-600/30 backdrop-blur-2xl border border-white/30 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] flex flex-col justify-between hover:rotate-1 hover:scale-105 transition-all duration-500 group">
            
            {/* Kort-top */}
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-slate-950" />
              </div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-white/80 bg-black/30 px-2 py-0.5 rounded-full border border-white/10">
                PREMIUM EDITION
              </span>
            </div>

            {/* Kort-midte med logo */}
            <div className="space-y-1 my-auto py-4">
              <TonsberglivetLogo className="h-6 w-auto text-white drop-shadow-md" />
              <p className="text-[11px] font-semibold text-amber-200 tracking-wider uppercase">
                Sentrumsgavekortet • Norges eldste by
              </p>
            </div>

            {/* Kort-bunn */}
            <div className="flex items-end justify-between border-t border-white/20 pt-3 text-[11px]">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-300 block">Gyldig i</span>
                <span className="font-bold text-white">300+ butikker & servering</span>
              </div>
              <CreditCard className="w-6 h-6 text-white/80" />
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
