'use client';

import { useState, useEffect } from 'react';
import {
  FileText, Plus, Search, Trash2, Pencil, X, ExternalLink,
  Eye, EyeOff, RefreshCw, AlertCircle, CheckCircle2,
} from 'lucide-react';

interface Side {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type Filter = 'ALLE' | 'PUBLISERT' | 'UTKAST';

const TOM_FORM = { id: '', title: '', slug: '', content: '', published: false };

export default function SiderPage() {
  const [sider, setSider] = useState<Side[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('ALLE');

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(TOM_FORM);
  const [saving, setSaving] = useState(false);
  const [lagrerFeil, setLagrerFeil] = useState<string | null>(null);
  const [melding, setMelding] = useState<{ tekst: string; feil: boolean } | null>(null);

  const erRedigering = Boolean(form.id);

  const hentSider = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pages', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setSider(json.data);
      } else {
        setMelding({ tekst: json.error ?? 'Kunne ikke hente sider.', feil: true });
      }
    } catch {
      setMelding({ tekst: 'Kunne ikke kontakte serveren.', feil: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    hentSider();
  }, []);

  useEffect(() => {
    if (!melding) return;
    const t = setTimeout(() => setMelding(null), 6000);
    return () => clearTimeout(t);
  }, [melding]);

  const apneNy = () => {
    setForm(TOM_FORM);
    setLagrerFeil(null);
    setModalOpen(true);
  };

  const apneRedigering = (side: Side) => {
    setForm({
      id: side.id,
      title: side.title,
      slug: side.slug,
      content: side.content,
      published: side.published,
    });
    setLagrerFeil(null);
    setModalOpen(true);
  };

  const lagre = async (e: React.FormEvent) => {
    e.preventDefault();
    setLagrerFeil(null);

    if (!form.title.trim()) return setLagrerFeil('Tittel er påkrevd.');
    if (!form.content.trim()) return setLagrerFeil('Innhold er påkrevd.');

    setSaving(true);
    try {
      const res = await fetch('/api/pages', {
        method: erRedigering ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          erRedigering
            ? { id: form.id, title: form.title, slug: form.slug, content: form.content, published: form.published }
            : { title: form.title, slug: form.slug, content: form.content, published: form.published },
        ),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setLagrerFeil(json.error ?? `Lagring feilet (HTTP ${res.status}).`);
        return;
      }

      setModalOpen(false);
      setMelding({ tekst: json.message ?? 'Lagret.', feil: false });
      await hentSider();
    } catch {
      setLagrerFeil('Kunne ikke kontakte serveren. Ingenting er lagret.');
    } finally {
      setSaving(false);
    }
  };

  const slett = async (side: Side) => {
    if (!confirm(`Slette siden «${side.title}»? Dette kan ikke angres.`)) return;
    try {
      const res = await fetch(`/api/pages?id=${encodeURIComponent(side.id)}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setMelding({ tekst: json.error ?? 'Sletting feilet.', feil: true });
        return;
      }
      setMelding({ tekst: json.message ?? 'Siden er slettet.', feil: false });
      await hentSider();
    } catch {
      setMelding({ tekst: 'Kunne ikke kontakte serveren.', feil: true });
    }
  };

  const byttPublisert = async (side: Side) => {
    try {
      const res = await fetch('/api/pages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: side.id, published: !side.published }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setMelding({ tekst: json.error ?? 'Kunne ikke endre status.', feil: true });
        return;
      }
      setSider((prev) => prev.map((s) => (s.id === side.id ? { ...s, published: !side.published } : s)));
    } catch {
      setMelding({ tekst: 'Kunne ikke kontakte serveren.', feil: true });
    }
  };

  const synlige = sider.filter((s) => {
    if (filter === 'PUBLISERT' && !s.published) return false;
    if (filter === 'UTKAST' && s.published) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return s.title.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q);
  });

  const antallPublisert = sider.filter((s) => s.published).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Sider
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            {sider.length} sider · {antallPublisert} publisert · {sider.length - antallPublisert} utkast
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={hentSider}
            className="p-2 rounded-xl border border-border text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors"
            title="Oppdater"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={apneNy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ny side
          </button>
        </div>
      </div>

      {melding && (
        <div
          className={`flex items-start gap-2 p-3 rounded-xl border text-sm ${
            melding.feil
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {melding.feil ? <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> : <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />}
          <span>{melding.tekst}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Søk i tittel eller slug…"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface border border-border text-sm text-foreground placeholder:text-foreground-muted/60 focus:outline-none focus:border-primary/50"
          />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-muted border border-border">
          {(['ALLE', 'PUBLISERT', 'UTKAST'] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === f ? 'bg-primary text-primary-foreground' : 'text-foreground-muted hover:text-foreground'
              }`}
            >
              {f === 'ALLE' ? 'Alle' : f === 'PUBLISERT' ? 'Publisert' : 'Utkast'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-foreground-muted">Laster sider…</p>
      ) : synlige.length === 0 ? (
        <div className="p-8 rounded-2xl border border-dashed border-border text-center">
          <p className="text-sm text-foreground-muted">
            {sider.length === 0 ? 'Ingen sider ennå. Opprett den første.' : 'Ingen sider passer søket.'}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {synlige.map((side) => (
            <li
              key={side.id}
              className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-surface border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{side.title}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      side.published
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    }`}
                  >
                    {side.published ? 'Publisert' : 'Utkast'}
                  </span>
                </div>
                <p className="text-xs text-foreground-muted mt-0.5 font-mono">/{side.slug}</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => byttPublisert(side)}
                  className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors"
                  title={side.published ? 'Avpubliser' : 'Publiser'}
                >
                  {side.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <a
                  href={`/${side.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors"
                  title="Åpne på nettstedet"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => apneRedigering(side)}
                  className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors"
                  title="Rediger"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => slett(side)}
                  className="p-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Slett"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={lagre}
            className="bg-surface border border-border rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {erRedigering ? 'Rediger side' : 'Ny side'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-foreground-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {lagrerFeil && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{lagrerFeil}</span>
              </div>
            )}

            <div className="space-y-3">
              <label className="block">
                <span className="text-xs font-semibold text-foreground-muted">Tittel</span>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary/50"
                  placeholder="Om oss"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-foreground-muted">Slug (URL)</span>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:border-primary/50"
                  placeholder="om-oss"
                />
                <span className="text-[11px] text-foreground-muted">
                  Tomt felt lager slug automatisk fra tittelen.
                </span>
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-foreground-muted">Innhold</span>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={12}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary/50 resize-y"
                  placeholder="Skriv innholdet her. Markdown støttes."
                />
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm text-foreground">Publiser med en gang</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-border text-sm font-semibold text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors"
              >
                Avbryt
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                {saving ? 'Lagrer…' : erRedigering ? 'Lagre endringer' : 'Opprett side'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
