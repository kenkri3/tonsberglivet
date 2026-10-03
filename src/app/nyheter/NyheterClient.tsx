'use client';

import { useEffect, useMemo, useState } from 'react';
import { HeroSection } from '@/components/ui/HeroSection';
import { NewsCard } from '@/components/ui/Cards';
import {
  NEWS_CATEGORY_LABELS,
  NEWS_CATEGORY_ORDER,
  resolveCategoryKey,
  type NewsCardData,
  type NewsCategoryKey,
} from '@/lib/news-meta';

type Filter = 'Alle' | NewsCategoryKey;

/** Antall saker som vises før «Vis flere». */
const PAGE_SIZE = 24;

interface NyheterClientProps {
  /** Kortdata fra serveren (database + redaksjonelt arkiv) – ikke hele saken. */
  articles: NewsCardData[];
  /** Kategori fra URL, f.eks. /nyheter?kategori=bylivet. */
  initialCategory?: string;
}

export default function NyheterClient({ articles, initialCategory }: NyheterClientProps) {
  const [activeCategory, setActiveCategory] = useState<Filter>(
    () => resolveCategoryKey(initialCategory) ?? 'Alle',
  );
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Landingssidene lenker til /nyheter?kategori=... – følg URL-en også når
  // brukeren navigerer videre i samme fane.
  useEffect(() => {
    setActiveCategory(resolveCategoryKey(initialCategory) ?? 'Alle');
    setVisibleCount(PAGE_SIZE);
  }, [initialCategory]);

  // Bare kategorier som faktisk har saker, i fast rekkefølge.
  const categories = useMemo<Filter[]>(() => {
    const present = new Set(articles.map((article) => article.category));
    return ['Alle', ...NEWS_CATEGORY_ORDER.filter((category) => present.has(category))];
  }, [articles]);

  const counts = useMemo(() => {
    const map = new Map<Filter, number>([['Alle', articles.length]]);
    for (const article of articles) {
      map.set(article.category, (map.get(article.category) ?? 0) + 1);
    }
    return map;
  }, [articles]);

  // En kategori kan ha forsvunnet fra listen mens filteret var valgt.
  const activeFilter: Filter = categories.includes(activeCategory) ? activeCategory : 'Alle';

  const filteredNews = useMemo(
    () =>
      activeFilter === 'Alle'
        ? articles
        : articles.filter((article) => article.category === activeFilter),
    [articles, activeFilter],
  );

  const visibleNews = filteredNews.slice(0, visibleCount);
  const remaining = filteredNews.length - visibleNews.length;

  return (
    <main className="min-h-screen pb-20">
      <HeroSection 
        title="Nyheter" 
        subtitle="Siste nytt fra Tønsberg" 
        backgroundGradient="linear-gradient(135deg, #1E293B, #334155)"
        backgroundImage="/images/tonsberg/nyheter-siste-nytt-fra-tonsberg-fo.jpg"
        imageAlt="Folkemengde på brygga i Tønsberg"
        priority
        compact={true}
      />
      
      <div className="container mx-auto px-4 mt-8 md:mt-12">
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8 justify-center md:justify-start">
            {categories.map(cat => {
              const label = cat === 'Alle' ? 'Alle' : NEWS_CATEGORY_LABELS[cat];
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  aria-pressed={activeFilter === cat}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    activeFilter === cat 
                      ? 'bg-primary text-white shadow-md' 
                      : 'bg-surface-muted text-foreground-muted hover:text-foreground hover:bg-border'
                  }`}
                >
                  {label}
                  <span className={`ml-2 text-xs font-bold ${activeFilter === cat ? 'text-white/70' : 'text-foreground-subtle'}`}>
                    {counts.get(cat) ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {visibleNews.length === 0 ? (
          <div className="p-12 text-center bg-surface rounded-3xl border border-border">
            <h2 className="text-base font-bold text-foreground">Ingen saker her ennå</h2>
            <p className="text-sm text-foreground-muted mt-1">
              {activeFilter === 'Alle'
                ? 'Det er ikke publisert noen nyhetssaker ennå.'
                : `Det er ikke publisert saker i kategorien ${NEWS_CATEGORY_LABELS[activeFilter as NewsCategoryKey]} ennå.`}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleNews.map((news) => (
                <NewsCard 
                  key={news.id}
                  title={news.title}
                  date={news.date}
                  category={news.categoryLabel}
                  excerpt={news.excerpt}
                  href={`/nyheter/${news.slug}`}
                  imageUrl={news.imageUrl}
                />
              ))}
            </div>

            {remaining > 0 && (
              <div className="flex flex-col items-center gap-2 mt-12">
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                  className="px-6 py-3 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl transition-colors shadow-xs"
                >
                  Vis flere saker
                </button>
                <span className="text-xs text-foreground-muted">
                  Viser {visibleNews.length} av {filteredNews.length} saker
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
