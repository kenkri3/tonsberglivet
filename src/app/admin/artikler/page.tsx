'use client';

import { useState } from 'react';
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
  const [search, setSearch] = useState('');
  const [activeArticle, setActiveArticle] = useState<typeof demoArticles[0] | null>(null);

  const filtered = demoArticles.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {activeArticle && (
        <SoMeModal
          title={activeArticle.title}
          category={activeArticle.category}
          onClose={() => setActiveArticle(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Artikler</h2>
          <p className="text-foreground-muted text-sm mt-1">{demoArticles.length} artikler totalt</p>
        </div>
        <Link
          href="/admin/artikler/ny"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground
                     rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Ny artikkel
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
        <input
          type="search"
          placeholder="Søk i artikler..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm
                     text-foreground placeholder:text-foreground-subtle
                     focus:outline-none focus:ring-2 focus:ring-primary transition-all"
        />
      </div>

      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted">
              <th className="text-left px-6 py-3 font-medium text-foreground-muted">Tittel</th>
              <th className="text-left px-6 py-3 font-medium text-foreground-muted hidden sm:table-cell">Kategori</th>
              <th className="text-left px-6 py-3 font-medium text-foreground-muted hidden md:table-cell">Dato</th>
              <th className="text-left px-6 py-3 font-medium text-foreground-muted">Status</th>
              <th className="w-24">Handlinger</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((article) => (
              <tr key={article.id} className="hover:bg-surface-muted transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">{article.title}</td>
                <td className="px-6 py-4 text-foreground-muted hidden sm:table-cell">
                  <span className="px-2.5 py-1 text-xs bg-primary-light text-primary rounded-full">
                    {article.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-foreground-muted hidden md:table-cell">{article.date}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    article.status === 'Publisert' ? 'bg-success-light text-success' :
                    article.status === 'Utkast' ? 'bg-surface-muted text-foreground-muted' :
                    'bg-accent-light text-accent'
                  }`}>
                    {article.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActiveArticle(article)}
                      className="p-1.5 text-primary hover:bg-primary-light rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                      title="Generer SoMe-innlegg med AI"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> SoMe
                    </button>
                    <Link href={`/nyheter/${article.id}`} className="p-1.5 text-foreground-subtle hover:text-foreground rounded-lg hover:bg-surface-muted">
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
