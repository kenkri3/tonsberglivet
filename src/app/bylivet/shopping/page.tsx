import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { ShoppingBag, Gift, MapPin, Sparkles, Store, CreditCard } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Shopping & Sentrumshandel | Tønsberglivet',
  description: 'Utforsk over 300 butikker, koseligenisjebutikker og Farmandstredet i Tønsberg sentrum.',
};

const shoppingCategories = [
  { title: 'Nisjebutikker & Mote', desc: 'Bogart, Klara, Mondi & Seven, lokal kvalitet og unik mote.', count: '45+ butikker' },
  { title: 'Farmandstredet', desc: 'Vestfolds største kjøpesenter midt i hjertet av Tønsberg sentrum.', count: '80+ butikker' },
  { title: 'Tønsberg Torv', desc: 'Markedsplassen for blomster, lokalt håndverk og sesongvarer.', count: 'Torvhandel' },
  { title: 'Interiør & Design', desc: 'Skandinavisk interiør, kunst og håndverk for hjemmet.', count: '25+ butikker' },
];

export default function ShoppingPage() {
  return (
    <main className="min-h-screen pb-20">
      <HeroSection
        title="Shopping i Tønsberg"
        subtitle="Unike nisjebutikker & Farmandstredet"
        description="I Tønsberg finner du en perfekt miks av tradisjonsrik sentrumshandel, spennende nisjebutikker og moderne kjøpesentre."
        backgroundGradient="linear-gradient(135deg, #1D4ED8, #0E7490)"
        compact={true}
      />

      <div className="container mx-auto px-4 mt-12 space-y-16 max-w-6xl">
        {/* Sentrumsgavekort Banner */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider">
              <Gift className="w-4 h-4" /> Sentrumsgavekortet
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold">Gi en opplevelse i gaver!</h2>
            <p className="text-amber-100 max-w-xl text-sm md:text-base">
              Gavekortet kan brukes i over 300 butikker, restauranter og kulturtilbud i Tønsberg.
            </p>
          </div>
          <Link
            href="/bylivet/gavekort"
            className="px-6 py-3.5 bg-white text-amber-700 font-bold rounded-xl hover:bg-amber-50 transition-colors shrink-0 shadow-md"
          >
            Kjøp Gavekort Nå
          </Link>
        </div>

        {/* Kategorier */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shoppingCategories.map((cat, idx) => (
            <div key={idx} className="bg-surface rounded-2xl border border-border p-6 space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-primary-light text-primary rounded-xl">
                  <Store className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-primary bg-primary-light px-3 py-1 rounded-full">
                  {cat.count}
                </span>
              </div>
              <h3 className="font-bold text-xl text-foreground">{cat.title}</h3>
              <p className="text-sm text-foreground-muted leading-relaxed">{cat.desc}</p>
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
