'use client';

import { useState } from 'react';
import { Sparkles, Copy, Check, X, Share2, Mail, Globe } from 'lucide-react';

interface SoMeModalProps {
  title: string;
  category?: string;
  excerpt?: string;
  onClose: () => void;
}

export function SoMeModal({ title, category, excerpt, onClose }: SoMeModalProps) {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<{
    facebook: string;
    instagram: string;
    linkedin: string;
    newsletter: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate-some', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, text: excerpt }),
      });
      const data = await res.json();
      if (data.success) {
        setPosts(data.data);
      }
    } catch (error) {
      console.error('SoMe generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-border rounded-3xl shadow-2xl max-w-3xl w-full p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <h3 className="font-bold text-xl text-foreground">AI SoMe-Generator (Google Gemini)</h3>
          </div>
          <button onClick={onClose} className="p-2 text-foreground-muted hover:text-foreground rounded-lg hover:bg-surface-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <div className="text-xs text-foreground-subtle uppercase tracking-wider mb-1">Kilde-sak</div>
          <h4 className="font-bold text-base text-foreground mb-2">{title}</h4>
          {excerpt && <p className="text-sm text-foreground-muted bg-surface-muted p-3 rounded-xl">{excerpt}</p>}
        </div>

        {!posts ? (
          <div className="text-center py-8 space-y-4">
            <p className="text-sm text-foreground-muted">
              Trykk på knappen for at AI-en skal skrive tilpassede innlegg for Facebook, Instagram, LinkedIn og nyhetsbrev.
            </p>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Genererer innlegg...' : 'Generer SoMe-innlegg nå'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Facebook */}
            <div className="border border-border rounded-2xl p-4 space-y-2 bg-surface-muted/50">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-600" /> Facebook
                </span>
                <button
                  onClick={() => handleCopy(posts.facebook, 'facebook')}
                  className="px-3 py-1 bg-surface border border-border rounded-lg text-xs font-medium text-foreground hover:bg-surface-muted transition-colors flex items-center gap-1"
                >
                  {copiedKey === 'facebook' ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === 'facebook' ? 'Kopiert!' : 'Kopier'}
                </button>
              </div>
              <p className="text-sm text-foreground-muted whitespace-pre-line leading-relaxed">{posts.facebook}</p>
            </div>

            {/* Instagram */}
            <div className="border border-border rounded-2xl p-4 space-y-2 bg-surface-muted/50">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Globe className="w-4 h-4 text-pink-600" /> Instagram
                </span>
                <button
                  onClick={() => handleCopy(posts.instagram, 'instagram')}
                  className="px-3 py-1 bg-surface border border-border rounded-lg text-xs font-medium text-foreground hover:bg-surface-muted transition-colors flex items-center gap-1"
                >
                  {copiedKey === 'instagram' ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === 'instagram' ? 'Kopiert!' : 'Kopier'}
                </button>
              </div>
              <p className="text-sm text-foreground-muted whitespace-pre-line leading-relaxed">{posts.instagram}</p>
            </div>

            {/* LinkedIn */}
            <div className="border border-border rounded-2xl p-4 space-y-2 bg-surface-muted/50">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-700" /> LinkedIn
                </span>
                <button
                  onClick={() => handleCopy(posts.linkedin, 'linkedin')}
                  className="px-3 py-1 bg-surface border border-border rounded-lg text-xs font-medium text-foreground hover:bg-surface-muted transition-colors flex items-center gap-1"
                >
                  {copiedKey === 'linkedin' ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === 'linkedin' ? 'Kopiert!' : 'Kopier'}
                </button>
              </div>
              <p className="text-sm text-foreground-muted whitespace-pre-line leading-relaxed">{posts.linkedin}</p>
            </div>

            {/* Nyhetsbrev */}
            <div className="border border-border rounded-2xl p-4 space-y-2 bg-surface-muted/50">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-600" /> Nyhetsbrev
                </span>
                <button
                  onClick={() => handleCopy(posts.newsletter, 'newsletter')}
                  className="px-3 py-1 bg-surface border border-border rounded-lg text-xs font-medium text-foreground hover:bg-surface-muted transition-colors flex items-center gap-1"
                >
                  {copiedKey === 'newsletter' ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === 'newsletter' ? 'Kopiert!' : 'Kopier'}
                </button>
              </div>
              <p className="text-sm text-foreground-muted whitespace-pre-line leading-relaxed">{posts.newsletter}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
