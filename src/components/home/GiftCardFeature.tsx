'use client';

import Link from 'next/link';
import { Gift, CreditCard, ArrowRight, Check, Smartphone } from 'lucide-react';
import { TonsberglivetLogo } from '@/components/brand/BrandLogos';

export function GiftCardFeature() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#0c1222] text-white p-8 sm:p-12 md:p-16 border border-white/10 shadow-2xl">
      {/* Subtile luksuriøse lysrefleksjoner */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        
        {/* Venstre kolonne: Tekst og fordeler */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-amber-200 text-xs font-medium tracking-wide">
            <Gift className="w-3.5 h-3.5 text-amber-300" />
            <span>Sentrumsgavekortet Tønsberg</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.08]">
            Gaven som åpner <br />
            <span className="font-serif italic font-normal text-amber-200/95">over 300 dører i byen.</span>
          </h2>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-xl font-light">
            Enten det er en kveld på Brygga, sesongens mote på Farmandstredet, teaterbilletter på Oseberg eller håndverksbakst på Torvet — Sentrumsgavekortet samler hele Tønsberg i ett eksklusivt kort.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 max-w-lg">
            <div className="flex items-center gap-3 text-xs text-slate-200">
              <div className="w-5 h-5 rounded-full bg-white/10 border border-white/15 text-amber-300 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span className="font-light">Gyldig i 300+ butikker og serveringssteder</span>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-slate-200">
              <div className="w-5 h-5 rounded-full bg-white/10 border border-white/15 text-amber-300 flex items-center justify-center shrink-0">
                <Smartphone className="w-3 h-3" />
              </div>
              <span className="font-light">Apple Wallet, Google Pay & fysisk gavekort</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-200">
              <div className="w-5 h-5 rounded-full bg-white/10 border border-white/15 text-amber-300 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span className="font-light">Favorittgaven for bedrifter og ansatte</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-200">
              <div className="w-5 h-5 rounded-full bg-white/10 border border-white/15 text-amber-300 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span className="font-light">100% verdiskaping i lokalsamfunnet</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href="/bylivet/gavekort"
              className="px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
            >
              <span>Bestill gavekort på nett</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/bylivet/gavekort#utsalgssteder"
              className="px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white rounded-full font-medium text-sm transition-all"
            >
              Hvor kan det brukes?
            </Link>
          </div>
        </div>

        {/* Høyre kolonne: Autentisk, eksklusivt fysisk/digitalt gavekort */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-sm aspect-[1.586/1] rounded-2xl p-6 bg-gradient-to-br from-[#1b253b] via-[#101726] to-[#0a0f1a] border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex flex-col justify-between hover:scale-[1.02] transition-all duration-500 group select-none">
            
            {/* Top row: Chip og kontaktløs symbol */}
            <div className="flex items-center justify-between">
              {/* EMV Microchip Graphic */}
              <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-0.5 shadow-inner flex flex-col justify-around">
                <div className="h-[1px] bg-amber-800/40 w-full" />
                <div className="h-[1px] bg-amber-800/40 w-full" />
                <div className="h-[1px] bg-amber-800/40 w-full" />
              </div>

              {/* Contactless waves symbol */}
              <div className="flex items-center gap-1 opacity-70">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M8.5 16.5a5 5 0 0 1 0-9" />
                  <path d="M12 19a8.5 8.5 0 0 1 0-14" />
                  <path d="M15.5 21.5a12 12 0 0 1 0-19" />
                </svg>
              </div>
            </div>

            {/* Logo og tittel i foliepreg */}
            <div className="space-y-1 my-auto py-2">
              <TonsberglivetLogo className="h-6 w-auto text-white drop-shadow" />
              <div className="text-[10px] font-mono tracking-[0.25em] uppercase text-amber-200/90 pt-1">
                Sentrumsgavekortet • Tønsberg
              </div>
            </div>

            {/* Bunn: Kortnummer og gyldighet */}
            <div className="border-t border-white/10 pt-3 flex items-end justify-between text-slate-300">
              <div>
                <span className="text-[8px] font-mono uppercase tracking-widest text-slate-400 block">Gyldig i</span>
                <span className="font-semibold text-white text-xs tracking-wide">300+ butikker & servering</span>
              </div>
              <div className="text-[10px] font-mono tracking-widest text-slate-400">
                NORGES ELDSTE BY
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
