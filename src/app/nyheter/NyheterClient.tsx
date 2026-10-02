'use client';

import { useState } from 'react';
import { HeroSection } from '@/components/ui/HeroSection';
import { NewsCard } from '@/components/ui/Cards';

const categories = ['Alle', 'Bylivet', 'Hverdagslivet', 'Næringslivet', 'Reiselivet'];

const demoNews = [
  { 
    id: 1, 
    title: 'Ny festival og storsatsing på Brygga', 
    category: 'Bylivet', 
    date: '15. aug 2026', 
    excerpt: 'En spektakulær musikk- og kulturfestival inntar Tønsberg brygge med kjente artister og fantastisk stemning.', 
    imageUrl: '/images/tonsberg/slottsfjell_festival.png' 
  },
  { 
    id: 2, 
    title: 'Ny kreativ tech-bedrift etablerer seg i sentrum', 
    category: 'Næringslivet', 
    date: '12. aug 2026', 
    excerpt: 'Spennende kompetansebedrift velger Tønsberg framfor Oslo for sine 40 ansatte.', 
    imageUrl: '/images/tonsberg/fotograf_varpe_tonsberg.jpg' 
  },
  { 
    id: 3, 
    title: 'Tips til den perfekte helgen ved kysten', 
    category: 'Reiselivet', 
    date: '10. aug 2026', 
    excerpt: 'Slik får du mest ut av en helg fylt med matopplevelser, kyststier og båtliv i Norges eldste by.', 
    imageUrl: '/images/tonsberg/brygge_solnedgang.jpg' 
  },
  { 
    id: 4, 
    title: 'Bondens marked og høstfest på Torvet', 
    category: 'Hverdagslivet', 
    date: '05. aug 2026', 
    excerpt: 'Gjør deg klar for årets store høstmarked med ferske lokale råvarer fra hele Vestfold.', 
    imageUrl: '/images/tonsberg/hostmarked.jpg' 
  },
  { 
    id: 5, 
    title: 'Grønt løft: Felles bærekraftsprosjekt i havneområdet', 
    category: 'Næringslivet', 
    date: '01. aug 2026', 
    excerpt: 'Bedrifter og Tønsberg kommune går sammen for nullutslipp og renere bykjerne.', 
    imageUrl: '/images/tonsberg/byen_fra_luften.jpg' 
  },
  { 
    id: 6, 
    title: 'Kultursommer i Tønsberg med nye arrangementer', 
    category: 'Bylivet', 
    date: '28. jul 2026', 
    excerpt: 'Gallerier, utstillinger og utendørsscener skaper en levende kulturarena for hele familien.', 
    imageUrl: '/images/tonsberg/barnas_faerderfest.jpg' 
  },
];

export default function NyheterClient() {
  const [activeCategory, setActiveCategory] = useState('Alle');

  const filteredNews = activeCategory === 'Alle' 
    ? demoNews 
    : demoNews.filter(n => n.category === activeCategory);

  return (
    <main className="min-h-screen pb-20">
      <HeroSection 
        title="Nyheter" 
        subtitle="Siste nytt fra Tønsberg" 
        backgroundGradient="linear-gradient(135deg, #1E293B, #334155)"
        backgroundImage="/images/tonsberg/byliv_gate.jpg"
        imageAlt="Gatebildet i Tønsberg sentrum"
        priority
        compact={true}
      />
      
      <div className="container mx-auto px-4 mt-8 md:mt-12">
        <div className="flex flex-wrap gap-2 mb-8 justify-center md:justify-start">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-surface-muted text-foreground-muted hover:text-foreground hover:bg-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((news) => (
            <NewsCard 
              key={news.id}
              title={news.title}
              date={news.date}
              category={news.category}
              excerpt={news.excerpt}
              href={`/nyheter/${news.id}`}
              imageUrl={news.imageUrl}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
