'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Eye, Pencil, Sparkles, RefreshCw, FileText, CheckCircle2, Clock } from 'lucide-react';
import { SoMeModal } from '@/components/admin/SoMeModal';

interface ArticleItem {
  id: string;
  title: string;
  category: string;
  status: string;
  date: string;
  slug?: string;
  published?: boolean;
}

export default function ArtiklerPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeArticle, setActiveArticle] = useState<ArticleItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Alle');
  const [aiAlert, setAiAlert] = useState<string | null>(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/articles');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped = json.data.map((a: any) => ({
          id: a.id,
          title: a.title,
          category: a.category || 'Bylivet',
          status: a.published ? 'Publisert' : 'Utkast',
          date: a.createdAt ? new Date(a.createdAt).toISOString().split('T')[0] : 'Nylig',
          slug: a.slug,
          published: a.published,
        }));
        setArticles(mapped);
      }
    } catch (err) {
      console.error('Feil ved henting av artikler:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Sanntidssynk med AI Co-Pilot / Autonom Agent
  useEffect(() => {
    const handleAction = (e: any) => {
      if (e.detail?.action === 'article_created' || e.detail?.action === 'create_article') {
        const title = e.detail?.result?.title || 'Ny AI-generert artikkel: Helgeguide';
        const newArt: ArticleItem = {
          id: `ai-${Date.now()}`,
          title: title,
          category: 'Bylivet',
          status: 'Utkast',
          date: new Date().toISOString().split('T')[0],
          published: false,
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
    const matchesCategory = selectedCategory === 'Alle' || a.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Artikler & CMS</h1>
          <p className="text-foreground-muted text-sm mt-1">
            {articles.length} artikler i databasen • Redaksjonell publiseringshub for Tønsberglivet
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchArticles}
            disabled={loading}
            className="p-2.5 rounded-xl border border-border bg-surface text-foreground hover:bg-surface-muted transition-colors"
            title="Oppdater liste"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/admin/artikler/ny"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground
                       rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Ny artikkel
          </Link>
        </div>
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

      {/* Artikkelliste */}
      {loading ? (
        <div className="p-12 text-center bg-surface rounded-2xl border border-border">
          <RefreshCw className="w-6 h-6 text-primary animate-spin mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">Henter artikler fra databasen...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-surface rounded-2xl border border-border space-y-4">
          <FileText className="w-10 h-10 text-foreground-subtle mx-auto" />
          <div>
            <h3 className="text-base font-bold text-foreground">Ingen artikler funnet</h3>
            <p className="text-xs text-foreground-muted max-w-sm mx-auto mt-1">
              Det er ingen publiserte artikler i denne kategorien ennå. Opprett din første artikkel eller be AI Co-Pilot om å lage et utkast.
            </p>
          </div>
          <Link
            href="/admin/artikler/ny"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" /> Skriv første artikkel
          </Link>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs">
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
              {filtered.map((art) => (
                <tr key={art.id} className="hover:bg-surface-muted/40 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">
                    <span className="font-semibold">{art.title}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full">
                      {art.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-foreground-muted text-xs font-mono">
                    {art.date}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      art.published
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                    }`}>
                      {art.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setActiveArticle(art)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border text-foreground hover:bg-surface-muted text-xs font-bold transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-primary" /> SoMe AI
                      </button>
                      <Link
                        href={`/nyheter/${art.slug || art.id}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors"
                        title="Forhåndsvis"
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
      )}
    </div>
  );
}
