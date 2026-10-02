'use client';

import { useState, useEffect } from 'react';
import { 
  Users, Plus, ExternalLink, Search, RefreshCw, 
  Trash2, CheckCircle2, ShieldCheck, Building2,
  X, AlertCircle
} from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  description: string | null;
  level: 'PREMIUM' | 'STANDARD' | 'BASIC';
  published: boolean;
  createdAt?: string;
}

export default function PartnerePage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'ALL' | 'PREMIUM' | 'STANDARD' | 'BASIC'>('ALL');
  
  // Modal for ny partner
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newWebsite, setNewWebsite] = useState('');
  const [newLevel, setNewLevel] = useState<'PREMIUM' | 'STANDARD' | 'BASIC'>('STANDARD');
  const [newDescription, setNewDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/partners');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPartners(json.data);
      }
    } catch (e) {
      console.error('Feil ved lasting av partnere:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setSaving(true);
    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          website: newWebsite,
          level: newLevel,
          description: newDescription,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setIsModalOpen(false);
        setNewName('');
        setNewWebsite('');
        setNewDescription('');
        setStatusMessage(json.message || 'Partner lagret!');
        setTimeout(() => setStatusMessage(null), 4000);
        fetchPartners();
      } else {
        alert(json.error || 'Feil ved lagring');
      }
    } catch (e) {
      alert('Nettverksfeil under lagring av partner');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePartner = async (id: string, name: string) => {
    if (!confirm(`Er du sikker på at du vil fjerne «${name}» som samarbeidspartner?`)) return;

    try {
      const res = await fetch(`/api/partners?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setPartners((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      alert('Kunne ikke slette partner');
    }
  };

  const filtered = partners.filter((p) => {
    const matchesLevel = selectedLevel === 'ALL' || p.level === selectedLevel;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const premiumCount = partners.filter((p) => p.level === 'PREMIUM').length;
  const standardCount = partners.filter((p) => p.level === 'STANDARD').length;

  return (
    <div className="space-y-6">
      {/* Header med sanntidsteller og handlinger */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Samarbeidspartnere</h2>
          <p className="text-foreground-muted text-sm mt-1">
            {partners.length} offisielle partnere • {premiumCount} Premium partnere • Sanntidsregister
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={fetchPartners}
            disabled={loading}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-surface border border-border
                       rounded-xl text-xs sm:text-sm font-semibold text-foreground hover:bg-surface-muted transition-colors shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 text-primary ${loading ? 'animate-spin' : ''}`} />
            Oppdater
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground
                       rounded-xl text-xs sm:text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Ny partner
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs sm:text-sm flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {statusMessage}
        </div>
      )}

      {/* Infokort for partnerskap */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface rounded-2xl border border-border p-4.5 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="text-xs text-foreground-muted font-medium">Offisielle Partnere</div>
            <div className="text-xl font-bold text-foreground">{partners.length} etablerte</div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-4.5 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <div className="text-xs text-foreground-muted font-medium">Premium Allianse</div>
            <div className="text-xl font-bold text-foreground">{premiumCount} strategiske</div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-4.5 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <div className="text-xs text-foreground-muted font-medium">Standard Partnere</div>
            <div className="text-xl font-bold text-foreground">{standardCount} næringsaktører</div>
          </div>
        </div>
      </div>

      {/* Søk og filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
          <input
            type="search"
            placeholder="Søk i partnere, sektor eller beskrivelse..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm
                       text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(['ALL', 'PREMIUM', 'STANDARD', 'BASIC'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedLevel === lvl
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-surface border border-border text-foreground-muted hover:text-foreground hover:bg-surface-muted'
              }`}
            >
              {lvl === 'ALL' ? 'Alle nivåer' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Partner-rutenett */}
      {loading ? (
        <div className="p-12 text-center text-foreground-muted flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm">Laster inn offisielle partnere...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 bg-surface rounded-2xl border border-border text-center text-foreground-muted space-y-2">
          <AlertCircle className="w-8 h-8 text-foreground-subtle mx-auto" />
          <h3 className="font-semibold text-foreground">Ingen partnere funnet</h3>
          <p className="text-xs">Prøv et annet søkeord eller legg til en ny partner.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="bg-surface rounded-2xl border border-border p-5 flex flex-col justify-between
                         hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-start justify-between mb-3.5">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {p.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                        p.level === 'PREMIUM'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-surface-muted text-foreground-muted border border-border'
                      }`}
                    >
                      {p.level}
                    </span>
                    <button
                      onClick={() => handleDeletePartner(p.id, p.name)}
                      className="p-1 text-foreground-subtle hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                      title="Slett partner"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-foreground text-base mb-1">{p.name}</h3>
                <p className="text-xs text-foreground-muted line-clamp-3 leading-relaxed mb-4">
                  {p.description}
                </p>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                {p.website ? (
                  <a
                    href={p.website.startsWith('http') ? p.website : `https://${p.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 font-medium"
                  >
                    Besøk nettside <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-foreground-subtle">Ingen nettside</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Ny Partner */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" /> Legg til ny samarbeidspartner
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-foreground-muted hover:text-foreground rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePartner} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Partnernavn *</label>
                <input
                  type="text"
                  required
                  placeholder="f.eks. Tønsberg Næringspark AS"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Partnerskapsnivå</label>
                <select
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value as any)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="PREMIUM">Premium</option>
                  <option value="STANDARD">Standard</option>
                  <option value="BASIC">Basic</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Nettside URL</label>
                <input
                  type="url"
                  placeholder="https://example.no"
                  value={newWebsite}
                  onChange={(e) => setNewWebsite(e.target.value)}
                  className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Beskrivelse</label>
                <textarea
                  rows={3}
                  placeholder="Kort beskrivelse av samarbeidet og verdi for Tønsberg..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-surface hover:bg-surface-muted border border-border rounded-xl text-xs font-semibold"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary-hover transition-colors"
                >
                  {saving ? 'Lagrer...' : 'Opprett partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
