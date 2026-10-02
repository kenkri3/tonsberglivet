'use client';

import { useState, useEffect } from 'react';
import { 
  FolderOpen, Plus, Search, RefreshCw, Trash2, 
  CheckCircle2, AlertCircle, Building2,
  X, Compass
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
  published: boolean;
}

export default function ProsjekterAdminPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'UPCOMING' | 'COMPLETED'>('ALL');

  // Modal for nytt prosjekt
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newStatus, setNewStatus] = useState<'ACTIVE' | 'UPCOMING' | 'COMPLETED'>('ACTIVE');
  const [newDescription, setNewDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setProjects(json.data);
      }
    } catch (e) {
      console.error('Feil ved lasting av prosjekter:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSaving(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          status: newStatus,
          description: newDescription,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setIsModalOpen(false);
        setNewTitle('');
        setNewDescription('');
        setStatusMessage(json.message || 'Prosjekt opprettet!');
        setTimeout(() => setStatusMessage(null), 4000);
        fetchProjects();
      } else {
        alert(json.error || 'Feil ved lagring');
      }
    } catch {
      alert('Nettverksfeil under opprettelse av prosjekt');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (id: string, title: string) => {
    if (!confirm(`Vil du fjerne prosjektet «${title}»?`)) return;

    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      alert('Kunne ikke slette prosjekt');
    }
  };

  const filtered = projects.filter((p) => {
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activeCount = projects.filter((p) => p.status === 'ACTIVE').length;
  const upcomingCount = projects.filter((p) => p.status === 'UPCOMING').length;

  return (
    <div className="space-y-6">
      {/* Header med sanntidsteller og handlinger */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Prosjekter & Byutvikling</h2>
          <p className="text-foreground-muted text-sm mt-1">
            {projects.length} strategiske byprosjekter • {activeCount} aktive • {upcomingCount} planlagte
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={fetchProjects}
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
            <Plus className="w-4 h-4" /> Nytt prosjekt
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs sm:text-sm flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {statusMessage}
        </div>
      )}

      {/* Info-bannere for status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface rounded-2xl border border-border p-4.5 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <FolderOpen className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <div className="text-xs text-foreground-muted font-medium">Aktive Gjennomføringer</div>
            <div className="text-xl font-bold text-foreground">{activeCount} under arbeid</div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-4.5 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="text-xs text-foreground-muted font-medium">Kommende Satsinger</div>
            <div className="text-xl font-bold text-foreground">{upcomingCount} planlagt</div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-4.5 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <div className="text-xs text-foreground-muted font-medium">Offentlig Forankring</div>
            <div className="text-xl font-bold text-foreground">Tønsberg Kommune</div>
          </div>
        </div>
      </div>

      {/* Søk og filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
          <input
            type="search"
            placeholder="Søk i prosjekter, formål eller samarbeidspartnere..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm
                       text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(['ALL', 'ACTIVE', 'UPCOMING', 'COMPLETED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-surface border border-border text-foreground-muted hover:text-foreground hover:bg-surface-muted'
              }`}
            >
              {st === 'ALL' ? 'Alle statuser' : st === 'ACTIVE' ? 'Aktive' : st === 'UPCOMING' ? 'Kommende' : 'Fullført'}
            </button>
          ))}
        </div>
      </div>

      {/* Prosjekter rutenett */}
      {loading ? (
        <div className="p-12 text-center text-foreground-muted flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm">Laster inn byprosjekter...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 bg-surface rounded-2xl border border-border text-center text-foreground-muted space-y-2">
          <AlertCircle className="w-8 h-8 text-foreground-subtle mx-auto" />
          <h3 className="font-semibold text-foreground">Ingen prosjekter matcher kriteriene</h3>
          <p className="text-xs">Prøv et annet søkeord eller opprett et nytt byprosjekt.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="bg-surface rounded-2xl border border-border p-6 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                      <FolderOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-base leading-snug">{p.title}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                        p.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : p.status === 'UPCOMING'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-surface-muted text-foreground-muted border border-border'
                      }`}
                    >
                      {p.status === 'ACTIVE' ? 'Aktiv' : p.status === 'UPCOMING' ? 'Kommende' : 'Fullført'}
                    </span>
                    <button
                      onClick={() => handleDeleteProject(p.id, p.title)}
                      className="p-1 text-foreground-subtle hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                      title="Slett prosjekt"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
                  {p.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Nytt Prosjekt */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" /> Opprett nytt byprosjekt
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-foreground-muted hover:text-foreground rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Prosjekttittel *</label>
                <input
                  type="text"
                  required
                  placeholder="f.eks. Tønsberg Torv Lyssetting 2026"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="ACTIVE">Aktiv</option>
                  <option value="UPCOMING">Kommende</option>
                  <option value="COMPLETED">Fullført</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Beskrivelse</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Hva går prosjektet ut på, og hvilken betydning har det for bylivet?..."
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
                  {saving ? 'Lagrer...' : 'Opprett prosjekt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
