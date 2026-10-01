'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Eye, Pencil, Sparkles } from 'lucide-react';
import { SoMeModal } from '@/components/admin/SoMeModal';

const demoArticles = [
  { id: '1', title: 'Ny kafé åpner i Nedre Langgate', category: 'Bylivet', status: 'Publisert', date: '2026-08-12' },
  { id: '2', title: 'Gründerhuset Hi5 feirer 5 år', category: 'Næringslivet', status: 'Publisert', date: '2026-08-10' },
  { id: '3', title: '10 grunner til å besøke Færder i sommer', category: 'Reiselivet', status: 'Publisert', date: '2026-08-08' },
  { id: '4', title: 'Studentene inntar Tønsberg', category: 'Studentlivet', status: 'Utkast', date: '2026-08-07' },
  { id: '5', title: 'Bondens marked — Rekordbesøk i juli', category: 'Bylivet', status: 'Publisert', date: '2026-08-05' },
  { id: '6', title: 'Kaldnes Vest tar form', category: 'Næringslivet', status: 'Under arbeid', date: '2026-08-03' },
];

export default function ArtiklerPage() {
  const [articles, setArticles] = useState(demoArticles);
  const [search, setSearch] = useState('');
  const [activeArticle, setActiveArticle] = useState<typeof demoArticles[0] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Alle');
  const [aiAlert, setAiAlert] = useState<string | null>(null);

  // Sanntidssynk med AI Co-Pilot / Autonom Agent
  useEffect(() => {
    const handleAction = (e: any) => {
      if (e.detail?.action === 'article_created' || e.detail?.action === 'create_article') {
        const title = e.detail?.result?.title || 'Ny AI-generert artikkel: Helgeguide';
        const newArt = {
          id: `ai-${Date.now()}`,
          title: title,
          category: 'Bylivet',
          status: 'Utkast',
          date: new Date().toISOString().split('T')[0],
        };
        setArticles((prev) => [newArt, ...prev]);
        setAiAlert(`Agenten opprettet nettopp «${title}» i CMS!`);
        setTimeout(() => setAiAlert(null), 5000);
      }
    };
    window.addEventListener('tonsberg:action-completed', handleAction);
    return () => window.removeEventListener('tonsberg:action-completed', handleAction);
  }, []);

  const categories = ['Alle', 'Bylivet', 'Næringslivet', 'Reiselivet', 'Studentlivet'];

  const filtered = articles.filter((a) => {
    const matchesCategory = selectedCategory === 'Alle' || a.category === selectedCategory;
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {activeArticle && (
        <SoMeModal
          title={activeArticle.title}
          category={activeArticle.category}
          onClose={() => setActiveArticle(null)}
        />
      )}

      {aiAlert && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 animate-pulse" />
          <span>{aiAlert}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Artikler & CMS</h2>
          <p className="text-foreground-muted text-sm mt-1">{demoArticles.length} artikler totalt • Publiseringshub</p>
        </div>
        <Link
          href="/admin/artikler/ny"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground
                     rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Ny artikkel
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
          <input
            type="search"
            placeholder="Søk i artikler og kategorier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm
                       text-foreground placeholder:text-foreground-subtle
                       focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>
        {/* Kategori-piller */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-surface border border-border text-foreground-muted hover:text-foreground hover:bg-surface-muted'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Mobil Visning (Native Cards) */}
      <div className="sm:hidden space-y-3">
        {filtered.map((article) => (
          <div
            key={article.id}
            className="bg-surface rounded-2xl border border-border p-4 space-y-3 shadow-xs"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="px-2.5 py-0.5 text-[11px] font-bold bg-primary/10 text-primary rounded-full">
                {article.category}
              </span>
              <span
                className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                  article.status === 'Publisert'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : article.status === 'Utkast'
                    ? 'bg-surface-muted text-foreground-muted'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}
              >
                {article.status}
              </span>
            </div>

            <div>
              <h3 className="font-semibold text-foreground text-sm leading-snug">{article.title}</h3>
              <p className="text-xs text-foreground-muted mt-1">{article.date}</p>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between">
              <button
                onClick={() => setActiveArticle(article)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                SoMe AI
              </button>
              <Link
                href={`/nyheter/${article.id}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                Vis
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Tabell */}
      <div className="hidden sm:block bg-surface rounded-2xl border border-border overflow-hidden shadow-xs">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted/60">
              <th className="text-left px-6 py-3 font-semibold text-foreground-muted text-xs uppercase tracking-wider">Tittel</th>
              <th className="text-left px-6 py-3 font-semibold text-foreground-muted text-xs uppercase tracking-wider">Kategori</th>
              <th className="text-left px-6 py-3 font-semibold text-foreground-muted text-xs uppercase tracking-wider">Dato</th>
              <th className="text-left px-6 py-3 font-semibold text-foreground-muted text-xs uppercase tracking-wider">Status</th>
              <th className="text-right px-6 py-3 font-semibold text-foreground-muted text-xs uppercase tracking-wider">Handlinger</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((article) => (
              <tr key={article.id} className="hover:bg-surface-muted/40 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">{article.title}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full">
                    {article.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-foreground-muted text-xs">{article.date}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      article.status === 'Publisert'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : article.status === 'Utkast'
                        ? 'bg-surface-muted text-foreground-muted'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {article.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveArticle(article)}
                      className="px-2.5 py-1.5 text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-semibold"
                      title="Generer SoMe-innlegg med AI"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> SoMe AI
                    </button>
                    <Link
                      href={`/nyheter/${article.id}`}
                      className="p-1.5 text-foreground-muted hover:text-foreground rounded-lg hover:bg-surface-muted transition-colors"
                      title="Vis artikkel"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
