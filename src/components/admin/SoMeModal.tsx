'use client';

import { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  X,
  Share2,
  Mail,
  Globe,
  Send,
  Users,
  Building,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface SoMeModalProps {
  title: string;
  category?: string;
  excerpt?: string;
  imageUrl?: string;
  onClose: () => void;
}

export function SoMeModal({ title, category, excerpt, imageUrl, onClose }: SoMeModalProps) {
  const [loading, setLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [posts, setPosts] = useState<{
    facebook: string;
    facebookGroup: string;
    instagram: string;
    googleBusiness: string;
    linkedin: string;
    newsletter: string;
  } | null>(null);

  const [selectedTargets, setSelectedTargets] = useState<{
    facebook_page: boolean;
    facebook_group: boolean;
    instagram: boolean;
    google_business: boolean;
  }>({
    facebook_page: true,
    facebook_group: false,
    instagram: true,
    google_business: true,
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [publishResults, setPublishResults] = useState<Record<string, { success: boolean; message: string; simulated?: boolean }> | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setPublishResults(null);
    setPublishError(null);
    try {
      const res = await fetch('/api/ai/generate-some', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, text: excerpt }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setPosts({
          facebook: data.data.facebook || '',
          facebookGroup: data.data.facebookGroup || `Hei alle sammen! ☀️ Hva tenker dere om dette? ${title}\n\nDel gjerne dine innspill!`,
          instagram: data.data.instagram || '',
          googleBusiness: data.data.googleBusiness || `Nyhet fra Tønsberglivet: ${title}. Les mer på nettsiden!`,
          linkedin: data.data.linkedin || '',
          newsletter: data.data.newsletter || '',
        });
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

  const toggleTarget = (key: keyof typeof selectedTargets) => {
    setSelectedTargets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDirectPublish = async () => {
    if (!posts) return;

    const targets: Array<'facebook_page' | 'facebook_group' | 'instagram' | 'google_business'> = [];
    if (selectedTargets.facebook_page) targets.push('facebook_page');
    if (selectedTargets.facebook_group) targets.push('facebook_group');
    if (selectedTargets.instagram) targets.push('instagram');
    if (selectedTargets.google_business) targets.push('google_business');

    if (targets.length === 0) {
      setPublishError('Velg minst én kanal å publisere til.');
      return;
    }

    setIsPublishing(true);
    setPublishError(null);
    setPublishResults(null);

    // Velg mest representativ tekst (eller fallback til facebook-tekst)
    const primaryText = posts.facebook || posts.googleBusiness || title;

    try {
      const res = await fetch('/api/social/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targets,
          text: primaryText,
          title,
          imageUrl,
          link: 'https://tonsberglivet.no',
        }),
      });

      const json = await res.json();
      if (json.success && json.results) {
        setPublishResults(json.results);
      } else {
        setPublishError(json.error || 'Feil ved publisering');
      }
    } catch (e: any) {
      setPublishError(e.message || 'Nettverksfeil ved sending til sosiale medier');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-border rounded-3xl shadow-2xl max-w-4xl w-full p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5 text-primary">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <div>
              <h3 className="font-bold text-xl text-foreground">AI SoMe & Kanal-Publisering</h3>
              <p className="text-xs text-foreground-muted">
                Facebook-side, Facebook-gruppe, Instagram og Google Business Profile
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-foreground-muted hover:text-foreground rounded-lg hover:bg-surface-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Kilde-sak */}
        <div className="bg-surface-muted/50 p-4 rounded-2xl border border-border">
          <div className="text-xs text-foreground-subtle uppercase tracking-wider mb-1 font-semibold">Kilde-sak</div>
          <h4 className="font-bold text-base text-foreground mb-1">{title}</h4>
          {excerpt && <p className="text-sm text-foreground-muted">{excerpt}</p>}
        </div>

        {!posts ? (
          <div className="text-center py-10 space-y-4">
            <p className="text-sm text-foreground-muted max-w-md mx-auto">
              Trykk for å generere tilpassede innlegg for alle dine tilkoblede kanaler. Du kan redigere teksten fritt og godkjenne før sending.
            </p>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Genererer innlegg...' : 'Generer kanalinnhold nå'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Styringskonsoll for direkte publisering */}
            <div className="p-4 sm:p-5 rounded-2xl bg-primary/5 border border-primary/20 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Send className="w-4 h-4 text-primary" />
                    Direkte Publisering (Full kontroll)
                  </h4>
                  <p className="text-xs text-foreground-muted mt-0.5">
                    Huk av hvilke kanaler du vil sende til, og trykk «Publiser nå».
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDirectPublish}
                  disabled={isPublishing}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50"
                >
                  {isPublishing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  {isPublishing ? 'Publiserer...' : 'Publiser direkte til valgte'}
                </button>
              </div>

              {/* Kanalvelgere */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${selectedTargets.facebook_page ? 'bg-surface border-primary text-foreground shadow-xs' : 'bg-surface-muted border-border text-foreground-muted'}`}>
                  <input
                    type="checkbox"
                    checked={selectedTargets.facebook_page}
                    onChange={() => toggleTarget('facebook_page')}
                    className="rounded text-primary focus:ring-primary w-3.5 h-3.5"
                  />
                  <Share2 className="w-3.5 h-3.5 text-blue-600" /> Facebook-side
                </label>

                <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${selectedTargets.facebook_group ? 'bg-surface border-primary text-foreground shadow-xs' : 'bg-surface-muted border-border text-foreground-muted'}`}>
                  <input
                    type="checkbox"
                    checked={selectedTargets.facebook_group}
                    onChange={() => toggleTarget('facebook_group')}
                    className="rounded text-primary focus:ring-primary w-3.5 h-3.5"
                  />
                  <Users className="w-3.5 h-3.5 text-indigo-600" /> FB-gruppe
                </label>

                <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${selectedTargets.instagram ? 'bg-surface border-primary text-foreground shadow-xs' : 'bg-surface-muted border-border text-foreground-muted'}`}>
                  <input
                    type="checkbox"
                    checked={selectedTargets.instagram}
                    onChange={() => toggleTarget('instagram')}
                    className="rounded text-primary focus:ring-primary w-3.5 h-3.5"
                  />
                  <Globe className="w-3.5 h-3.5 text-pink-600" /> Instagram
                </label>

                <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${selectedTargets.google_business ? 'bg-surface border-primary text-foreground shadow-xs' : 'bg-surface-muted border-border text-foreground-muted'}`}>
                  <input
                    type="checkbox"
                    checked={selectedTargets.google_business}
                    onChange={() => toggleTarget('google_business')}
                    className="rounded text-primary focus:ring-primary w-3.5 h-3.5"
                  />
                  <Building className="w-3.5 h-3.5 text-emerald-600" /> Google Business
                </label>
              </div>

              {/* Statusrapportering etter publisering */}
              {publishError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{publishError}</span>
                </div>
              )}

              {publishResults && (
                <div className="space-y-1.5 pt-2 border-t border-primary/20">
                  <span className="text-xs font-bold text-foreground">Resultat per kanal:</span>
                  {Object.entries(publishResults).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2 text-xs">
                      {val.success ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                      <strong className="text-foreground capitalize">{key.replace('_', ' ')}:</strong>
                      <span className={val.success ? 'text-foreground-muted' : 'text-amber-600'}>
                        {val.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Kanal-kort med redigeringsmulighet */}
            <div className="space-y-4">
              {/* 1. Facebook Side */}
              <div className="border border-border rounded-2xl p-4 space-y-2 bg-surface">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-blue-600" /> Facebook-side (Offisiell)
                  </span>
                  <button
                    onClick={() => handleCopy(posts.facebook, 'facebook')}
                    className="px-3 py-1 bg-surface-muted hover:bg-border border border-border rounded-lg text-xs font-medium text-foreground transition-colors flex items-center gap-1"
                  >
                    {copiedKey === 'facebook' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === 'facebook' ? 'Kopiert!' : 'Kopier'}
                  </button>
                </div>
                <textarea
                  value={posts.facebook}
                  onChange={(e) => setPosts({ ...posts, facebook: e.target.value })}
                  rows={4}
                  className="w-full p-3 bg-surface-muted rounded-xl text-sm text-foreground border border-border focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              {/* 2. Facebook Gruppe */}
              <div className="border border-border rounded-2xl p-4 space-y-2 bg-surface">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" /> Facebook-gruppe (Fellesskap & Dialog)
                  </span>
                  <button
                    onClick={() => handleCopy(posts.facebookGroup, 'facebookGroup')}
                    className="px-3 py-1 bg-surface-muted hover:bg-border border border-border rounded-lg text-xs font-medium text-foreground transition-colors flex items-center gap-1"
                  >
                    {copiedKey === 'facebookGroup' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === 'facebookGroup' ? 'Kopiert!' : 'Kopier'}
                  </button>
                </div>
                <textarea
                  value={posts.facebookGroup}
                  onChange={(e) => setPosts({ ...posts, facebookGroup: e.target.value })}
                  rows={3}
                  className="w-full p-3 bg-surface-muted rounded-xl text-sm text-foreground border border-border focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              {/* 3. Instagram */}
              <div className="border border-border rounded-2xl p-4 space-y-2 bg-surface">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Globe className="w-4 h-4 text-pink-600" /> Instagram (Caption & Tagger)
                  </span>
                  <button
                    onClick={() => handleCopy(posts.instagram, 'instagram')}
                    className="px-3 py-1 bg-surface-muted hover:bg-border border border-border rounded-lg text-xs font-medium text-foreground transition-colors flex items-center gap-1"
                  >
                    {copiedKey === 'instagram' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === 'instagram' ? 'Kopiert!' : 'Kopier'}
                  </button>
                </div>
                <textarea
                  value={posts.instagram}
                  onChange={(e) => setPosts({ ...posts, instagram: e.target.value })}
                  rows={4}
                  className="w-full p-3 bg-surface-muted rounded-xl text-sm text-foreground border border-border focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              {/* 4. Google Business Profile */}
              <div className="border border-border rounded-2xl p-4 space-y-2 bg-surface">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Building className="w-4 h-4 text-emerald-600" /> Google Business Profile (Kart & Søk)
                  </span>
                  <button
                    onClick={() => handleCopy(posts.googleBusiness, 'googleBusiness')}
                    className="px-3 py-1 bg-surface-muted hover:bg-border border border-border rounded-lg text-xs font-medium text-foreground transition-colors flex items-center gap-1"
                  >
                    {copiedKey === 'googleBusiness' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === 'googleBusiness' ? 'Kopiert!' : 'Kopier'}
                  </button>
                </div>
                <textarea
                  value={posts.googleBusiness}
                  onChange={(e) => setPosts({ ...posts, googleBusiness: e.target.value })}
                  rows={3}
                  className="w-full p-3 bg-surface-muted rounded-xl text-sm text-foreground border border-border focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              {/* 5. LinkedIn & Nyhetsbrev */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-border rounded-2xl p-4 space-y-2 bg-surface">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-blue-700" /> LinkedIn
                    </span>
                    <button
                      onClick={() => handleCopy(posts.linkedin, 'linkedin')}
                      className="px-3 py-1 bg-surface-muted hover:bg-border border border-border rounded-lg text-xs font-medium text-foreground transition-colors flex items-center gap-1"
                    >
                      {copiedKey === 'linkedin' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      {copiedKey === 'linkedin' ? 'Kopiert!' : 'Kopier'}
                    </button>
                  </div>
                  <textarea
                    value={posts.linkedin}
                    onChange={(e) => setPosts({ ...posts, linkedin: e.target.value })}
                    rows={3}
                    className="w-full p-3 bg-surface-muted rounded-xl text-sm text-foreground border border-border focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <div className="border border-border rounded-2xl p-4 space-y-2 bg-surface">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4 text-amber-600" /> Nyhetsbrev
                    </span>
                    <button
                      onClick={() => handleCopy(posts.newsletter, 'newsletter')}
                      className="px-3 py-1 bg-surface-muted hover:bg-border border border-border rounded-lg text-xs font-medium text-foreground transition-colors flex items-center gap-1"
                    >
                      {copiedKey === 'newsletter' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      {copiedKey === 'newsletter' ? 'Kopiert!' : 'Kopier'}
                    </button>
                  </div>
                  <textarea
                    value={posts.newsletter}
                    onChange={(e) => setPosts({ ...posts, newsletter: e.target.value })}
                    rows={3}
                    className="w-full p-3 bg-surface-muted rounded-xl text-sm text-foreground border border-border focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
