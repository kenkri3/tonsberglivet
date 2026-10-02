import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { ShoppingBag, Gift, MapPin, Sparkles, Store, CreditCard } from 'lucide-react';
import Link from 'next/link';

import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Shopping & Sentrumshandel | Tønsberglivet',
  description: 'Utforsk over 300 butikker, koselige nisjebutikker og Farmandstredet i Tønsberg sentrum.',
};

const shoppingCategories = [
  {
    title: 'Nisjebutikker & Mote',
    desc: 'Bogart, Klara, Mondi & Seven, lokal kvalitet og unik mote i koselige sentrumsgater.',
    count: '45+ butikker',
    image: '/images/tonsberg/fotograf_varpe_tonsberg.jpg',
  },
  {
    title: 'Farmandstredet Kjøpesenter',
    desc: 'Vestfolds største kjøpesenter midt i hjertet av Tønsberg med over 80 spennende butikker.',
    count: '80+ butikker',
    image: '/images/tonsberg/torvet_tonsberg.jpg',
  },
  {
    title: 'Tønsberg Torv & Markedsplass',
    desc: 'Bonde- og sesongmarkeder, blomster, lokalt håndverk og yrende folkeliv hele uken.',
    count: 'Torvhandel',
    image: '/images/tonsberg/handel_marked.jpg',
  },
  {
    title: 'Matglede, Interiør & Design',
    desc: 'Skandinavisk interiør, håndverk og delikatesser i gågater og historiske kvartaler.',
    count: '25+ butikker',
    image: '/images/food.jpg',
  },
];

export default function ShoppingPage() {
  return (
    <main className="min-h-screen pb-20">
      <HeroSection
        title="Shopping i Tønsberg"
        subtitle="Unike nisjebutikker & Farmandstredet"
        description="I Tønsberg finner du en perfekt miks av tradisjonsrik sentrumshandel, spennende nisjebutikker og moderne kjøpesentre."
        backgroundGradient="linear-gradient(135deg, #1D4ED8, #0E7490)"
        backgroundImage="/images/shopping.jpg"
        imageAlt="Folkeliv og handel i Tønsberg sentrum"
        priority
        compact={true}
      />

      <div className="container mx-auto px-4 mt-12 space-y-16 max-w-6xl">
        {/* Sentrumsgavekort Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
              <Gift className="w-4 h-4" /> Sentrumsgavekortet
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Gi en opplevelse i gave!</h2>
            <p className="text-amber-100 max-w-xl text-sm md:text-base leading-relaxed">
              Gavekortet kan brukes i over 300 butikker, restauranter og kulturtilbud i Tønsberg sentrum.
            </p>
          </div>
          <Link
            href="/bylivet/gavekort"
            className="px-6 py-3.5 bg-white text-amber-700 font-bold rounded-xl hover:bg-amber-50 transition-all shrink-0 shadow-lg hover:shadow-xl hover:-translate-y-0.5 relative z-10"
          >
            Kjøp Gavekort Nå
          </Link>
        </div>

        {/* Kategorier med ekte foto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {shoppingCategories.map((cat, idx) => (
            <div
              key={idx}
              className="group bg-surface rounded-3xl border border-border overflow-hidden hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col"
            >
              <div className="relative h-56 w-full overflow-hidden bg-surface-muted">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <span className="absolute top-4 right-4 text-xs font-bold text-white bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                  {cat.count}
                </span>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-bold text-xl text-white drop-shadow-sm">{cat.title}</h3>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-sm text-foreground-muted leading-relaxed">{cat.desc}</p>
                <div className="pt-2">
                  <span className="inline-flex items-center text-xs font-bold text-primary group-hover:gap-2 gap-1.5 transition-all">
                    Utforsk utvalg &rarr;
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Torvleie & Næring CTA */}
        <div className="bg-surface-muted border border-border rounded-3xl p-8 text-center space-y-4">
          <h3 className="text-xl font-bold text-foreground">Vil du selge varer på Tønsberg Torv?</h3>
          <p className="text-sm text-foreground-muted max-w-xl mx-auto">
            Lei torvplass for dag, sesong eller helår. Lag og foreninger kan leie gratis stand for profilering.
          </p>
          <Link
            href="/bylivet/torvleie"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold text-sm rounded-xl hover:bg-primary-hover transition-colors shadow-sm"
          >
            <MapPin className="w-4 h-4" /> Les mer om Torvleie
          </Link>
        </div>
      </div>
    </main>
  );
}
