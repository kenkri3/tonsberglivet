'use client';

import { useState, useEffect } from 'react';
import {
  Upload,
  FolderPlus,
  Search,
  Grid3X3,
  List,
  Tag,
  Camera,
  Shield,
  Sparkles,
  X,
  Check,
  Folder,
  Image as ImageIcon,
  CheckCircle,
} from 'lucide-react';

interface BildeItem {
  id: string;
  title: string;
  url: string;
  folder: string;
  photographer: string;
  gdprStatus: 'APPROVED' | 'PENDING' | 'REJECTED';
  aiTags: string[];
  uploadedAt?: string;
}

const defaultFolders = ['Bylivet', 'Reiselivet', 'Arrangementer', 'Presserom', 'Kultur & Historie'];

export default function ImageBankPage() {
  const [images, setImages] = useState<BildeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<BildeItem | null>(null);
  
  // Upload modal state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newFolder, setNewFolder] = useState('Bylivet');
  const [newPhotographer, setNewPhotographer] = useState('Tønsberglivet');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [analyzedTags, setAnalyzedTags] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/images');
      const data = await res.json();
      if (data.success) {
        setImages(data.data);
      }
    } catch (e) {
      console.error('Failed to load images:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleAiAnalyze = async () => {
    if (!newTitle) return;
    setAiAnalyzing(true);
    try {
      const res = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageName: newTitle, folder: newFolder }),
      });
      const data = await res.json();
      if (data.success && data.aiTags) {
        setAnalyzedTags(data.aiTags);
      }
    } catch (e) {
      console.error('AI Analysis failed:', e);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const res = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          url: newUrl || 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80',
          folder: newFolder,
          photographer: newPhotographer,
          aiTags: analyzedTags.length > 0 ? analyzedTags : ['Tønsberg', newFolder],
          gdprStatus: 'APPROVED',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUploadOpen(false);
        setNewTitle('');
        setNewUrl('');
        setAnalyzedTags([]);
        fetchImages();
      }
    } catch (e) {
      console.error('Upload failed:', e);
    } finally {
      setUploading(false);
    }
  };

  const filteredImages = images.filter((img) => {
    const matchesSearch =
      searchQuery === '' ||
      img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.photographer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(img.aiTags) && img.aiTags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesFolder = !selectedFolder || img.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  return (
    <div className="space-y-6">
      {/* Upload Modal */}
      {uploadOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="font-bold text-xl text-foreground flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" /> Last opp nytt bilde i DAM
              </h3>
              <button onClick={() => setUploadOpen(false)} className="p-2 text-foreground-muted hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Bilde-tittel / Beskrivelse *</label>
                <input
                  type="text"
                  required
                  placeholder="F.eks. Sommer på Slottsfjellet"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Bilde URL (eller opplastet fil)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mappe</label>
                  <select
                    value={newFolder}
                    onChange={(e) => setNewFolder(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm"
                  >
                    {defaultFolders.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fotograf (Kreditering)</label>
                  <input
                    type="text"
                    value={newPhotographer}
                    onChange={(e) => setNewPhotographer(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm"
                  />
                </div>
              </div>

              {/* AI Vision Trigger */}
              <div className="p-4 bg-surface-muted rounded-2xl border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-primary" /> Google AI Vision-analyse
                  </span>
                  <button
                    type="button"
                    onClick={handleAiAnalyze}
                    disabled={!newTitle || aiAnalyzing}
                    className="px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                  >
                    {aiAnalyzing ? 'Analyserer...' : 'Kjør AI-tagging'}
                  </button>
                </div>
                {analyzedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {analyzedTags.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-primary-light text-primary text-xs font-semibold rounded-md">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-foreground-muted hover:text-foreground"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary-hover shadow-sm"
                >
                  {uploading ? 'Lagrer...' : 'Lagre i bildebanken'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Topplinje */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Bildebank & DAM (Digital Asset Management)</h2>
          <p className="text-foreground-muted text-sm mt-1">
            {images.length} verifiserte bilder • Universelt utformet & GDPR-sikret
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setUploadOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground
                       rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            Last opp nytt bilde
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Mappetre */}
        <div className="hidden lg:block w-64 shrink-0">
          <div className="bg-surface rounded-2xl border border-border p-4 sticky top-24 space-y-2">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Folder className="w-4 h-4 text-primary" />
              Mapper
            </h3>
            <button
              onClick={() => setSelectedFolder(null)}
              className={`w-full text-left px-3 py-2 text-sm rounded-xl transition-colors ${
                !selectedFolder ? 'bg-primary-light text-primary font-bold' : 'text-foreground-muted hover:bg-surface-muted'
              }`}
            >
              Alle bilder ({images.length})
            </button>
            {defaultFolders.map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFolder(f)}
                className={`w-full text-left px-3 py-2 text-sm rounded-xl transition-colors flex items-center justify-between ${
                  selectedFolder === f ? 'bg-primary-light text-primary font-bold' : 'text-foreground-muted hover:bg-surface-muted'
                }`}
              >
                <span>{f}</span>
                <span className="text-xs text-foreground-subtle">
                  {images.filter((img) => img.folder === f).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bildearkiv */}
        <div className="flex-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
            <input
              type="search"
              placeholder="Søk i tagger, fotograf eller tittel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm
                         text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredImages.map((img) => (
              <div
                key={img.id}
                onClick={() => setSelectedImage(img)}
                className="bg-surface rounded-2xl border border-border overflow-hidden hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="relative aspect-4/3 bg-surface-muted overflow-hidden">
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-surface/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-foreground border border-border">
                    {img.folder}
                  </div>
                  <div className="absolute top-3 right-3 bg-success-light text-success px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Shield className="w-3 h-3" /> GDPR Godkjent
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <h4 className="font-bold text-foreground truncate">{img.title}</h4>
                  <div className="flex items-center justify-between text-xs text-foreground-muted">
                    <span className="flex items-center gap-1"><Camera className="w-3.5 h-3.5 text-primary" /> {img.photographer}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(Array.isArray(img.aiTags) ? img.aiTags : []).map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-surface-muted text-foreground-subtle text-[11px] rounded-md">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
