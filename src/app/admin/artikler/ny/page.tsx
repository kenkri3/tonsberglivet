'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Save, Eye, Image as ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SoMeModal } from '@/components/admin/SoMeModal';

// Etikettene normaliseres til ArticleCategory-enumet i src/app/api/articles/route.ts.
const categories = ['Bylivet', 'Hverdagslivet', 'Næringslivet', 'Reiselivet', 'Studentlivet'];

interface BildeOption {
  id: string;
  title: string;
  url: string;
}

export default function NyArtikkelPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Bylivet');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageId, setImageId] = useState('');
  const [images, setImages] = useState<BildeOption[]>([]);
  const [published, setPublished] = useState(true);

  const [loading, setLoading] = useState(false);
  const [aiWorking, setAiWorking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showSoMeModal, setShowSoMeModal] = useState(false);

  // Artikkelbildet er en ekte relasjon (Article.imageId) — hent valgene fra bildebanken.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/images');
        const json = await res.json();
        if (!cancelled && json.success && Array.isArray(json.data)) {
          setImages(json.data);
        }
      } catch (e) {
        console.error('Kunne ikke hente bildebanken:', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedImage = images.find((img) => img.id === imageId) || null;

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
          imageId: imageId || undefined,
          published,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
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
    if (!title || !title.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Vennligst skriv inn en tittel først slik at AI-en vet hva saken handler om!',
      });
      return;
    }

    setAiWorking(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/ai/article-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category,
          notes: content.trim(),
          existingExcerpt: excerpt.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.excerpt) setExcerpt(data.excerpt);
        if (data.content) setContent(data.content);
        setStatusMessage({
          type: 'success',
          text: '✨ Komplett artikkelutkast og ingress er generert av AI!',
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Feil ved generering av artikkelutkast. Vennligst prøv igjen.',
        });
      }
    } catch (e: any) {
      console.error('AI draft failed:', e);
      setStatusMessage({
        type: 'error',
        text: 'Nettverksfeil ved kontakt med AI-tjenesten. Sjekk internettforbindelsen eller prøv på nytt.',
      });
    } finally {
      setAiWorking(false);
    }
  };

  const handleOpenSoMe = () => {
    if (!title || !title.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Skriv inn en artikkel-tittel før du åpner SoMe-generatoren!',
      });
      return;
    }
    setShowSoMeModal(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {showSoMeModal && (
        <SoMeModal
          title={title.trim() || 'Ny artikkel'}
          category={category}
          excerpt={excerpt.trim() || content.trim().slice(0, 300)}
          imageUrl={selectedImage?.url || ''}
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
            className="px-4 py-2 bg-surface-muted hover:bg-border text-foreground text-xs font-semibold rounded-xl border border-border transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-xs"
          >
            <Sparkles className={`w-4 h-4 text-primary ${aiWorking ? 'animate-spin' : ''}`} />
            {aiWorking ? 'AI Skriver utkast...' : 'AI Generer Utkast'}
          </button>

          <button
            type="button"
            onClick={handleOpenSoMe}
            className="px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-xs font-semibold rounded-xl border border-primary/20 hover:border-primary transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-4 h-4" /> SoMe-generator
          </button>
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
              <label className="block text-sm font-semibold text-foreground mb-2">Bilde fra bildebanken (valgfritt)</label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
                <select
                  value={imageId}
                  onChange={(e) => setImageId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="">Ingen bilde valgt</option>
                  {images.map((img) => (
                    <option key={img.id} value={img.id}>
                      {img.title}
                    </option>
                  ))}
                </select>
              </div>
              {images.length === 0 ? (
                <p className="text-xs text-foreground-subtle mt-1.5">
                  Bildebanken er tom. Last opp bilder under Bildebank for å knytte et bilde til saken.
                </p>
              ) : (
                <p className="text-xs text-foreground-subtle mt-1.5">
                  Bildet lagres som en ekte kobling til bildebanken.
                </p>
              )}
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
