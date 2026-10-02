import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSection } from '@/components/ui/HeroSection';
import { 
  Palette, 
  ShoppingBag, 
  Sparkles, 
  UtensilsCrossed, 
  Store, 
  Recycle, 
  CalendarDays, 
  HeartHandshake, 
  Leaf,
  ArrowRight,
  Lightbulb
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Våre Prosjekter | Tønsberglivet',
  description: 'Se hvilke prosjekter og initiativer Tønsberglivet driver frem for å skape en enda bedre by.',
};

const prosjekter = [
  { 
    id: 1, 
    title: 'Barn i byen', 
    desc: 'Kunst- og kulturprosjekter i samarbeid med lokale barnehager og skoler for å inkludere barna aktivt i byrommet.', 
    status: 'Pågår',
    icon: Palette,
    image: '/images/tonsberg/borggardsfest.png'
  },
  { 
    id: 2, 
    title: 'Bondens marked på Torvet', 
    desc: 'Lokale matprodusenter fyller Tønsberg Torv med ferske grønnsaker, ost, bakst og kortreiste spesialiteter.', 
    status: 'Årlig',
    icon: ShoppingBag,
    image: '/images/tonsberg/marked_mat.jpg'
  },
  { 
    id: 3, 
    title: 'Høstfest på Slottsfjellet', 
    desc: 'Feiring av høsten med markedsboder, musikk, historiske innslag og aktiviteter for hele storfamilien.', 
    status: 'Årlig',
    icon: Leaf,
    image: '/images/tonsberg/hostfest_slottsfjell.png'
  },
  { 
    id: 4, 
    title: 'Tønsbergdagen', 
    desc: 'Årets største handels- og folkefest med tradisjoner helt tilbake til 1974. Yrende liv fra tidlig morgen til kveld.', 
    status: 'Årlig',
    icon: CalendarDays,
    image: '/images/tonsberg/brygga_folk.jpg'
  },
  { 
    id: 5, 
    title: 'Nyt Tønsberg — Spis Ute Uka', 
    desc: 'Mat- og opplevelsesuker som feirer den rike gastronomien i Tønsberg med spesialmenyer og felles måltider.', 
    status: 'Gjennomført',
    icon: UtensilsCrossed,
    image: '/images/tonsberg/spisuteuka.jpg'
  },
  { 
    id: 6, 
    title: 'Jul i Tønsberg', 
    desc: 'Skaper magisk førjulsstemning med glitrende lysgater, julemarked på Torvet, skøytebane og julekonserter.', 
    status: 'Årlig',
    icon: Sparkles,
    image: '/images/tonsberg/brygge_kveldsstemning.jpg'
  },
  { 
    id: 7, 
    title: 'Handelens dager', 
    desc: 'Gode sommertilbud, underholdning og aktiviteter som støtter de unike butikkene i sentrum.', 
    status: 'Årlig',
    icon: Store,
    image: '/images/shopping.jpg'
  },
  { 
    id: 8, 
    title: 'Gjenbruksmarked', 
    desc: 'Bærekraftige markeder med gjenbruk av klær, vintage og redesign som samler både unge og voksne.', 
    status: 'Pågår',
    icon: Recycle,
    image: '/images/tonsberg/handel_marked.jpg'
  },
  { 
    id: 9, 
    title: 'Innflytterfesten', 
    desc: 'En varm og uformell velkomstfest for alle som nylig har flyttet til Tønsberg- og Færderregionen.', 
    status: 'Planlagt',
    icon: HeartHandshake,
    image: '/images/tonsberg/folkefest.jpg'
  }
];

export default function ProsjekterPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background pb-20">
      <HeroSection 
        title="Våre prosjekter"
        subtitle="Tønsberglivet"
        description="Vi initierer, støtter og gjennomfører små og store prosjekter som gjør Tønsbergregionen til et mer levende, attraktivt og samlende sted å bo, besøke og drive næring i."
        backgroundGradient="linear-gradient(135deg, #16193d 0%, #1D4ED8 100%)"
        backgroundImage="/images/tonsberg/folkefest.jpg"
        imageAlt="Folkefest i Tønsberg"
        priority
        compact={true}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-primary block mb-2">
            Byutvikling & Samhold
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            Initiativer som skaper liv i byen
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {prosjekter.map((prosjekt) => {
            const Icon = prosjekt.icon;
            return (
              <div 
                key={prosjekt.id} 
                className="bg-surface rounded-3xl shadow-sm border border-border/80 overflow-hidden flex flex-col hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 group"
              >
                {prosjekt.image && (
                  <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
                    <Image
                      src={prosjekt.image}
                      alt={prosjekt.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                    <span className="absolute top-3 right-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-surface/90 backdrop-blur-md text-primary shadow-sm">
                      {prosjekt.status}
                    </span>
                  </div>
                )}

                <div className="p-6 sm:p-7 flex flex-col flex-1">
                  {!prosjekt.image && (
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-surface-muted text-foreground-muted">
                        {prosjekt.status}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-2">
                    {prosjekt.image && (
                      <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {prosjekt.title}
                    </h3>
                  </div>

                  <p className="text-foreground-muted text-sm leading-relaxed flex-1 mt-2">
                    {prosjekt.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div className="mt-16 bg-gradient-to-r from-primary/10 via-surface to-accent/10 rounded-3xl p-8 sm:p-12 border border-border flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Lightbulb className="w-4 h-4" />
              <span>Har du en idé?</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">Vil du starte et initiativ i Tønsberg?</h3>
            <p className="text-foreground-muted text-sm max-w-xl">
              Tønsberglivet bistår aktører, frivillige og næringsliv med rådgivning, koordinering og synlighet for arrangementer og byromsaktiviteter.
            </p>
          </div>
          <Link
            href="/kontakt"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-2xl shadow-md transition-all shrink-0"
          >
            <span>Ta kontakt med oss</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
