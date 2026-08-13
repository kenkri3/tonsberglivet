'use client';

import { useState } from 'react';
import { HeroSection } from '@/components/ui/HeroSection';
import { NewsCard } from '@/components/ui/Cards';

const categories = ['Alle', 'Bylivet', 'Hverdagslivet', 'Næringslivet', 'Reiselivet'];

const demoNews = [
  { id: 1, title: 'Ny festival kommer til Tønsberg', category: 'Bylivet', date: '15. aug 2026', excerpt: 'En helt ny musikkfestival vil finne sted på brygga neste sommer.', imageAlt: 'Festival på brygga' },
  { id: 2, title: 'Ny bedrift åpner i sentrum', category: 'Næringslivet', date: '12. aug 2026', excerpt: 'Spennende tech-startup etablerer seg midt i byen.', imageAlt: 'Kontorlokaler' },
  { id: 3, title: 'Tips for en perfekt helg', category: 'Reiselivet', date: '10. aug 2026', excerpt: 'Slik får du mest ut av en weekend-tur til Norges eldste by.', imageAlt: 'Tønsberg sentrum' },
  { id: 4, title: 'Høstmarked på torvet', category: 'Hverdagslivet', date: '05. aug 2026', excerpt: 'Gjør deg klar for årets store høstmarked med lokale råvarer.', imageAlt: 'Torvet med boder' },
  { id: 5, title: 'Samarbeid for grønnere by', category: 'Næringslivet', date: '01. aug 2026', excerpt: 'Lokale bedrifter går sammen om nytt bærekraftsprosjekt.', imageAlt: 'Grønn park' },
  { id: 6, title: 'Gatekunst i nye farger', category: 'Bylivet', date: '28. jul 2026', excerpt: 'Nye veggmalerier pryder bybildet takket være lokale kunstnere.', imageAlt: 'Gatekunst' },
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
        compact={true}
      />
      
      <div className="container mx-auto px-4 mt-8 md:mt-12">
        <div className="flex flex-wrap gap-2 mb-8 justify-center md:justify-start">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}
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
            />
          ))}
        </div>
      </div>
    </main>
  );
}
