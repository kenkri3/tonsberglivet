'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Save, Eye, Image as ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SoMeModal } from '@/components/admin/SoMeModal';

const categories = ['Bylivet', 'Hverdagslivet', 'Næringslivet', 'Reiselivet', 'Studentlivet'];

export default function NyArtikkelPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Bylivet');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [published, setPublished] = useState(true);

  const [loading, setLoading] = useState(false);
  const [aiWorking, setAiWorking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showSoMeModal, setShowSoMeModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          excerpt,
          content,
          imageUrl: imageUrl || undefined,
          published,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatusMessage({ type: 'success', text: 'Artikkelen er publisert!' });
        setTimeout(() => {
          router.push('/admin/artikler');
        }, 1200);
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Feil ved lagring av artikkel' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Nettverksfeil. Prøv igjen.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAiDraft = async () => {
    if (!title) {
      setStatusMessage({ type: 'error', text: 'Skriv inn en tittel først slik at AI-en vet hva saken gjelder!' });
      return;
    }

    setAiWorking(true);
    try {
      const res = await fetch('/api/ai/generate-some', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        if (!excerpt) setExcerpt(data.data.newsletter || `Oppdag det nyeste innen ${category} i Tønsberg!`);
        if (!content) setContent(`## ${title}\n\nDet skjer spennende ting i Tønsberg innen ${category.toLowerCase()}.\n\n${data.data.facebook}\n\nVelkommen til å lese mer på Tønsberglivet-portalen.`);
      }
    } catch (e) {
      console.error('AI draft failed:', e);
    } finally {
      setAiWorking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {showSoMeModal && (
        <SoMeModal
          title={title || 'Ny artikkel'}
          category={category}
          excerpt={excerpt}
          onClose={() => setShowSoMeModal(false)}
        />
      )}

      {/* Header med Tilbake-knapp */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <Link
            href="/admin/artikler"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground-muted hover:text-foreground mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Tilbake til artikler
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Skriv ny artikkel</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAiDraft}
            disabled={aiWorking}
            className="px-4 py-2 bg-surface-muted hover:bg-border text-foreground text-xs font-semibold rounded-xl border border-border transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            {aiWorking ? 'AI Skriver...' : 'AI Generer Utkast'}
          </button>

          {title && (
            <button
              type="button"
              onClick={() => setShowSoMeModal(true)}
              className="px-4 py-2 bg-primary-light text-primary hover:bg-primary hover:text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" /> SoMe-generator
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-2 animate-slide-down ${
            statusMessage.type === 'success' ? 'bg-success-light text-success' : 'bg-error-light text-error'
          }`}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          {statusMessage.text}
        </div>
      )}

      {/* Skjema */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface rounded-2xl border border-border p-6 space-y-6 shadow-sm">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Artikkel-tittel *</label>
            <input
              type="text"
              required
              placeholder="F.eks. Tønsbergdagen slår alle rekorder"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-base text-foreground font-medium focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Kategori *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Bilde URL (valgfri)</label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Ingress / Sammendrag</label>
            <textarea
              rows={2}
              placeholder="En kort ingress som oppsummerer saken for leseren..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary outline-none resize-none"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Brødtekst / Innhold *</label>
            <textarea
              rows={12}
              required
              placeholder="Skriv selve artikkelen her..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary outline-none font-sans leading-relaxed"
            ></textarea>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
            />
            <label htmlFor="published" className="text-sm font-medium text-foreground cursor-pointer">
              Publiser artikkelen umiddelbart på nettsiden
            </label>
          </div>
        </div>

        {/* Handlinger */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/admin/artikler"
            className="px-6 py-3 text-sm font-medium text-foreground-muted hover:text-foreground transition-colors"
          >
            Avbryt
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-primary text-primary-foreground font-semibold text-sm rounded-xl hover:bg-primary-hover transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Publiserer...' : 'Publiser artikkel'}
          </button>
        </div>
      </form>
    </div>
  );
}
