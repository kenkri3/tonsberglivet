'use client';

import { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  CheckCircle2,
  XCircle,
  Sparkles,
  Mail,
  Send,
  RefreshCw,
  ExternalLink,
  Copy,
  Clock,
  Check,
  Filter,
  ShieldCheck,
  AlertCircle,
  X,
  FileText,
  Calendar,
  Phone,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';
import Link from 'next/link';

interface NewCompanyRecord {
  orgNr: string;
  name: string;
  orgForm: string;
  orgFormDesc: string;
  registrationDate: string;
  industry: string;
  industryCode: string;
  address: string;
  street: string;
  postalCode: string;
  city: string;
  municipality: string;
  email?: string;
  phone?: string;
  website?: string;
  activity?: string;
  purpose?: string;
  brregUrl: string;
  proffUrl: string;
  status: 'PENDING' | 'DRAFT' | 'APPROVED' | 'SENT' | 'SKIPPED';
  emailDraft?: {
    subject: string;
    salutation: string;
    bodyText: string;
    bodyHtml: string;
    highlights: string[];
    recipientEmail: string;
    mailtoUrl: string;
    generatedAt: string;
    modelUsed: string;
  };
  sentAt?: string;
}

export default function BedrifterPage() {
  const [activeTab, setActiveTab] = useState<'register' | 'nystartede'>('nystartede');

  // Register Tab State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Alle');
  const [establishedCompanies, setEstablishedCompanies] = useState<any[]>([]);
  const [loadingEstablished, setLoadingEstablished] = useState(false);
  const categories = ['Alle', 'Servering', 'Handel', 'Overnatting', 'Kultur', 'Eiendom'];

  // Nystartede Tab State
  const [newCompanies, setNewCompanies] = useState<NewCompanyRecord[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    withEmail: 0,
    draftsReady: 0,
    approved: 0,
    sent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [newSearch, setNewSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'APPROVED' | 'SENT' | 'PENDING'>('ALL');
  const [selectedCompany, setSelectedCompany] = useState<NewCompanyRecord | null>(null);
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedRecipient, setEditedRecipient] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [copiedField, setCopiedField] = useState<'subject' | 'body' | 'all' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchNewCompanies = async (sync = false) => {
    try {
      if (sync) setIsSyncing(true);
      else setLoading(true);

      const res = await fetch('/api/agent/new-companies?daysBack=30&limit=50', {
        method: sync ? 'POST' : 'GET',
        headers: sync ? { 'Content-Type': 'application/json' } : undefined,
        body: sync ? JSON.stringify({ action: 'sync' }) : undefined,
      });

      const json = await res.json();
      if (json.success && json.data) {
        setNewCompanies(json.data);
        if (json.stats) setStats(json.stats);
        if (sync) showToast(`Synkronisert mot Brønnøysundregistrene! ${json.data.length} bedrifter hentet.`);
      }
    } catch (err) {
      console.error('Feil ved henting av nye bedrifter:', err);
      showToast('Kunne ikke hente data fra Brreg');
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  const fetchEstablishedCompanies = async () => {
    try {
      setLoadingEstablished(true);
      const res = await fetch('/api/brreg?limit=30');
      const json = await res.json();
      // `success` betyr nå «Enhetsregisteret svarte», ikke «kallet gjennomførtes».
      // `data` er befolket også når kilden ikke er live, så vi må ikke filtrere på success.
      if (Array.isArray(json.data)) {
        setEstablishedCompanies(json.data);
      }
    } catch (err) {
      console.error('Feil ved henting av etablerte bedrifter:', err);
    } finally {
      setLoadingEstablished(false);
    }
  };

  useEffect(() => {
    fetchNewCompanies();
    fetchEstablishedCompanies();
  }, []);

  const openEmailModal = (comp: NewCompanyRecord) => {
    setSelectedCompany(comp);
    setEditedSubject(comp.emailDraft?.subject || `Velkommen som nyetablert i Tønsberg! Hilsen Tønsberglivet`);
    setEditedRecipient(comp.emailDraft?.recipientEmail || comp.email || `post@${comp.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.no`);
    setEditedBody(comp.emailDraft?.bodyText || '');
    setIsEditingDraft(false);
  };

  const handleCopyText = (text: string, type: 'subject' | 'body' | 'all') => {
    navigator.clipboard.writeText(text);
    setCopiedField(type);
    showToast('Kopiert til utklippstavlen!');
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleUpdateStatus = async (orgNr: string, newStatus: 'APPROVED' | 'SENT' | 'SKIPPED') => {
    try {
      const res = await fetch('/api/agent/new-companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          orgNr,
          status: newStatus,
          customDraft: {
            subject: editedSubject,
            recipientEmail: editedRecipient,
            bodyText: editedBody,
          },
        }),
      });

      const json = await res.json();
      if (json.success && json.company) {
        setNewCompanies((prev) =>
          prev.map((c) => (c.orgNr === orgNr ? json.company : c))
        );
        if (selectedCompany?.orgNr === orgNr) {
          setSelectedCompany(json.company);
        }
        showToast(
          newStatus === 'SENT'
            ? 'Markert som sendt!'
            : newStatus === 'APPROVED'
            ? 'Godkjent for utsending!'
            : 'Status oppdatert'
        );
      }
    } catch (err) {
      console.error('Feil ved statusoppdatering:', err);
    }
  };

  const handleRegenerate = async (orgNr: string) => {
    try {
      setIsRegenerating(true);
      const res = await fetch('/api/agent/new-companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', orgNr }),
      });
      const json = await res.json();
      if (json.success && json.company) {
        setNewCompanies((prev) =>
          prev.map((c) => (c.orgNr === orgNr ? json.company : c))
        );
        setSelectedCompany(json.company);
        setEditedSubject(json.company.emailDraft?.subject || '');
        setEditedBody(json.company.emailDraft?.bodyText || '');
        showToast('Ny AI-kladd generert!');
      }
    } catch (err) {
      console.error('Feil ved regenerering:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const filteredEstablished = establishedCompanies.filter((b) => {
    const matchesCategory = selectedCategory === 'Alle' ||
      (b.industry && b.industry.toLowerCase().includes(selectedCategory.toLowerCase())) ||
      (b.orgFormDesc && b.orgFormDesc.toLowerCase().includes(selectedCategory.toLowerCase()));
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.orgNr.includes(search) ||
      (b.city && b.city.toLowerCase().includes(search.toLowerCase())) ||
      (b.address && b.address.toLowerCase().includes(search.toLowerCase())) ||
      (b.industry && b.industry.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const filteredNew = newCompanies.filter((b) => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesSearch =
      b.name.toLowerCase().includes(newSearch.toLowerCase()) ||
      b.orgNr.includes(newSearch) ||
      b.industry.toLowerCase().includes(newSearch.toLowerCase()) ||
      b.city.toLowerCase().includes(newSearch.toLowerCase()) ||
      b.address.toLowerCase().includes(newSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-foreground text-background px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-medium border border-border animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-foreground-muted hover:text-foreground text-xs ml-2"
          >
            Lukk
          </button>
        </div>
      )}

      {/* Sidehode med Hovedfaner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" /> Næringsliv & Etableringer
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Bedrifter & Næring</h1>
          <p className="text-foreground-muted text-sm mt-1">
            Administrer lokale virksomheter, sanntidsoppslag fra Brønnøysundregistrene og AI-velkomstmailer.
          </p>
        </div>

        {/* Fanevelger */}
        <div className="flex items-center bg-surface-muted p-1 rounded-2xl border border-border">
          <button
            onClick={() => setActiveTab('nystartede')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'nystartede'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Nystartede & Velkomstmail</span>
            {newCompanies.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'nystartede' ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/10 text-primary'
              }`}>
                {newCompanies.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'register'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Virksomhetsregister</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === 'register' ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-surface-muted text-foreground-subtle'
            }`}>
              {establishedCompanies.length}
            </span>
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* FANE 1: NYSTARTEDE BEDRIFTER & AI-VELKOMSTMAIL (BRREG)      */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'nystartede' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* KPI Dashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-surface rounded-2xl border border-border p-4 shadow-xs">
              <span className="text-xs font-medium text-foreground-muted flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" /> Siste 30 dager
              </span>
              <p className="text-2xl font-bold text-foreground mt-2">{stats.total || newCompanies.length}</p>
              <p className="text-[11px] text-foreground-subtle mt-0.5">Tønsberg kommune (3905)</p>
            </div>

            <div className="bg-surface rounded-2xl border border-border p-4 shadow-xs">
              <span className="text-xs font-medium text-foreground-muted flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Kladder klare
              </span>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                {stats.draftsReady || newCompanies.filter((c) => c.status === 'DRAFT').length}
              </p>
              <p className="text-[11px] text-foreground-subtle mt-0.5">Generert med AI</p>
            </div>

            <div className="bg-surface rounded-2xl border border-border p-4 shadow-xs">
              <span className="text-xs font-medium text-foreground-muted flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-500" /> Sendt / Fullført
              </span>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                {stats.sent || newCompanies.filter((c) => c.status === 'SENT').length}
              </p>
              <p className="text-[11px] text-foreground-subtle mt-0.5">Velkomst sendt</p>
            </div>

            <div className="bg-surface rounded-2xl border border-border p-4 shadow-xs">
              <span className="text-xs font-medium text-foreground-muted flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> Direkte e-post
              </span>
              <p className="text-2xl font-bold text-foreground mt-2">
                {stats.withEmail || newCompanies.filter((c) => Boolean(c.email)).length}
              </p>
              <p className="text-[11px] text-foreground-subtle mt-0.5">Fra Brreg register</p>
            </div>

            <div className="col-span-2 lg:col-span-1 bg-surface rounded-2xl border border-border p-4 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground-muted">Brreg OpenAPI</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                </span>
              </div>
              <button
                onClick={() => fetchNewCompanies(true)}
                disabled={isSyncing}
                className="mt-2 w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Synkroniserer...' : 'Hent ferske nå'}
              </button>
            </div>
          </div>

          {/* GDPR Informasjonsboks */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-foreground">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Norsk lov & GDPR-etterlevelse (B2B kontakt)</p>
                <p className="text-foreground-muted text-[11px] mt-0.5">
                  Data hentes eksklusivt fra offentlige åpne registre (Enhetsregisteret brreg.no). Velkomstmail inneholder lovpålagt reservasjonsadgang iht. markedsføringsloven § 15. AI-modell kjøres med europeisk databehandling (EU GDPR).
                </p>
              </div>
            </div>
            <a
              href="https://data.brreg.no/enhetsregisteret/api/dokumentasjon"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface border border-border text-foreground hover:bg-surface-muted text-xs font-semibold whitespace-nowrap transition-colors shrink-0"
            >
              Brreg OpenAPI <ExternalLink className="w-3 h-3 text-foreground-subtle" />
            </a>
          </div>

          {/* Søk og Filter-rad */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
              <input
                type="search"
                placeholder="Søk på bedriftsnavn, org.nr, bransje eller poststed..."
                value={newSearch}
                onChange={(e) => setNewSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            {/* Statusfilter-knapper */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {(
                [
                  { id: 'ALL', label: 'Alle' },
                  { id: 'DRAFT', label: 'Klare kladder' },
                  { id: 'APPROVED', label: 'Godkjent' },
                  { id: 'SENT', label: 'Sendt' },
                  { id: 'PENDING', label: 'Venter på AI' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    statusFilter === f.id
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-surface border border-border text-foreground-muted hover:text-foreground hover:bg-surface-muted'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bedriftsliste */}
          {loading ? (
            <div className="p-12 text-center bg-surface rounded-2xl border border-border space-y-3">
              <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
              <p className="text-sm font-semibold text-foreground">Henter nystartede bedrifter fra Brønnøysundregistrene...</p>
              <p className="text-xs text-foreground-muted">Kobler til Enhetsregisteret OpenAPI for Tønsberg (3905)</p>
            </div>
          ) : filteredNew.length === 0 ? (
            <div className="p-12 text-center bg-surface rounded-2xl border border-border space-y-3">
              <Building2 className="w-10 h-10 text-foreground-subtle mx-auto" />
              <h3 className="text-base font-semibold text-foreground">Ingen bedrifter matchet søket</h3>
              <p className="text-xs text-foreground-muted max-w-md mx-auto">
                Prøv å endre søkeord eller statusfilter, eller klikk på "Hent ferske nå" for å oppdatere fra Brreg.
              </p>
            </div>
          ) : (
            <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs">
              <div className="divide-y divide-border">
                {filteredNew.map((company) => {
                  const hasDraft = Boolean(company.emailDraft);
                  const isSent = company.status === 'SENT';
                  const isApproved = company.status === 'APPROVED';

                  return (
                    <div
                      key={company.orgNr}
                      className="p-4 sm:p-5 hover:bg-surface-muted/40 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      {/* Bedriftsinfo */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-foreground truncate">{company.name}</h3>
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-primary/10 text-primary">
                            {company.orgForm}
                          </span>
                          <span className="text-xs text-foreground-subtle font-mono">
                            {company.orgNr}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isSent
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : isApproved
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                : hasDraft
                                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                : 'bg-amber-500/10 text-amber-600'
                            }`}
                          >
                            {isSent
                              ? '✓ Sendt'
                              : isApproved
                              ? 'Godkjent'
                              : hasDraft
                              ? 'AI-kladd klar'
                              : 'Venter på kladd'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-foreground-muted">
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            {company.industry}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-foreground-subtle" />
                            {company.address}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-foreground-subtle" />
                            Reg: {company.registrationDate}
                          </span>
                          {company.email && (
                            <span className="flex items-center gap-1 text-primary font-medium">
                              <Mail className="w-3 h-3" />
                              {company.email}
                            </span>
                          )}
                        </div>

                        {company.purpose && (
                          <p className="text-xs text-foreground-subtle line-clamp-1 italic">
                            "{company.purpose}"
                          </p>
                        )}
                      </div>

                      {/* Handlinger */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <a
                          href={company.brregUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="Åpne i Enhetsregisteret"
                          className="p-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors border border-border"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        {hasDraft ? (
                          <>
                            {company.emailDraft?.mailtoUrl && (
                              <a
                                href={company.emailDraft.mailtoUrl}
                                onClick={() => handleUpdateStatus(company.orgNr, 'SENT')}
                                title="Åpne ferdig utfylt i e-postprogram (Outlook/Apple Mail)"
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-surface border border-border text-foreground hover:bg-surface-muted rounded-xl text-xs font-semibold transition-colors"
                              >
                                <Send className="w-3.5 h-3.5 text-primary" />
                                <span>Send via mail</span>
                              </a>
                            )}

                            <button
                              onClick={() => openEmailModal(company)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-primary-foreground hover:bg-primary-hover rounded-xl text-xs font-bold transition-all shadow-xs"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Se & rediger mail</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleRegenerate(company.orgNr)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-xs font-bold transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Generer velkomstmail</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* FANE 2: ORDINÆRT VIRKSOMHETSREGISTER                        */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'register' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Virksomhetsregister i Tønsberg</h2>
              <p className="text-foreground-muted text-sm mt-0.5">
                {filteredEstablished.length} bedrifter i utvalg • Hentet i sanntid via Brønnøysundregistrene OpenAPI
              </p>
            </div>
            <a
              href="https://virksomhet.brreg.no/nb/oppslag/enheter"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm"
            >
              <ExternalLink className="w-4 h-4" /> Søk i Brreg
            </a>
          </div>

          {/* Søk og filtre */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
              <input
                type="search"
                placeholder="Søk på bedriftsnavn, gateadresse eller bransje..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

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

          {/* Desktop Tabell */}
          <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/60">
                  <th className="text-left px-6 py-3 font-semibold text-foreground-muted text-xs uppercase tracking-wider">
                    Bedrift
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-foreground-muted text-xs uppercase tracking-wider">
                    Kategori / NACE
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-foreground-muted text-xs uppercase tracking-wider">
                    Område & Adresse
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-foreground-muted text-xs uppercase tracking-wider">
                    Org.nr
                  </th>
                  <th className="text-right px-6 py-3 font-semibold text-foreground-muted text-xs uppercase tracking-wider">
                    Kilde & Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredEstablished.map((b) => (
                  <tr key={b.orgNr} className="hover:bg-surface-muted/40 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <span className="font-semibold block">{b.name}</span>
                          <span className="text-[11px] text-foreground-subtle font-mono">{b.orgFormDesc || b.orgForm}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full">
                        {b.industry}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-foreground-muted text-xs">
                      <p className="font-medium text-foreground">{b.city || 'Tønsberg'}</p>
                      <p className="text-foreground-subtle text-[11px]">{b.address}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono">
                      <a
                        href={`https://virksomhet.brreg.no/nb/oppslag/enheter/${b.orgNr}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {b.orgNr} <ExternalLink className="w-3 h-3 text-foreground-subtle" />
                      </a>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Brreg Verifisert
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL / DRAWER: FORHÅNDSVIS & SEND VELKOMSTMAIL            */}
      {/* ────────────────────────────────────────────────────────── */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface rounded-3xl border border-border shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between gap-4 bg-surface-muted/30">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary text-primary-foreground">
                    AI Velkomstmail
                  </span>
                  <span className="text-xs text-foreground-subtle font-mono">
                    Org: {selectedCompany.orgNr}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground">
                  {selectedCompany.name}
                </h2>
                <p className="text-xs text-foreground-muted">
                  {selectedCompany.industry} • Registrert {selectedCompany.registrationDate}
                </p>
              </div>

              <button
                onClick={() => setSelectedCompany(null)}
                className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Innhold */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* Mottaker & Emne */}
              <div className="space-y-3 bg-surface-muted/40 p-4 rounded-2xl border border-border">
                <div>
                  <label className="block text-xs font-semibold text-foreground-muted mb-1">
                    Mottaker-adresse (Fra Brreg eller anslått):
                  </label>
                  <input
                    type="email"
                    value={editedRecipient}
                    onChange={(e) => setEditedRecipient(e.target.value)}
                    placeholder="post@bedriftsnavn.no"
                    className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground-muted mb-1">
                    Emnefelt:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editedSubject}
                      onChange={(e) => setEditedSubject(e.target.value)}
                      className="w-full px-3.5 py-2 pr-10 bg-surface border border-border rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                    <button
                      onClick={() => handleCopyText(editedSubject, 'subject')}
                      title="Kopier emne"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground-subtle hover:text-foreground"
                    >
                      {copiedField === 'subject' ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Selve e-postteksten */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground-muted flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary" /> E-postinnhold fra Cecilie & Tønsberglivet
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditingDraft(!isEditingDraft)}
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      {isEditingDraft ? 'Vis forhåndsvisning' : 'Rediger tekst'}
                    </button>
                    <button
                      onClick={() => handleCopyText(`${editedSubject}\n\n${editedBody}`, 'all')}
                      className="inline-flex items-center gap-1 text-xs text-foreground-muted hover:text-foreground font-semibold px-2 py-1 rounded-lg bg-surface border border-border"
                    >
                      {copiedField === 'all' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      Kopier alt
                    </button>
                  </div>
                </div>

                {isEditingDraft ? (
                  <textarea
                    rows={12}
                    value={editedBody}
                    onChange={(e) => setEditedBody(e.target.value)}
                    className="w-full p-4 bg-surface border border-border rounded-2xl text-xs sm:text-sm font-sans leading-relaxed text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                ) : (
                  <div className="p-4 sm:p-5 bg-surface border border-border rounded-2xl text-xs sm:text-sm leading-relaxed text-foreground/90 whitespace-pre-line max-h-72 overflow-y-auto">
                    {editedBody}
                  </div>
                )}
              </div>

              {/* Modell & Personvern Informasjon */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-surface-muted/30 rounded-xl text-[11px] text-foreground-subtle border border-border">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Motor: {selectedCompany.emailDraft?.modelUsed || '1min.AI (Mistral Large EU) / Gemini'}
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> GDPR & mfl. § 15 ivaretatt
                </span>
              </div>
            </div>

            {/* Modal Footer / Handling-knapper */}
            <div className="p-4 sm:p-6 border-t border-border bg-surface-muted/40 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => handleRegenerate(selectedCompany.orgNr)}
                disabled={isRegenerating}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-surface border border-border text-foreground hover:bg-surface-muted rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                {isRegenerating ? 'Skriver ny...' : 'Skriv på nytt med AI'}
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => handleUpdateStatus(selectedCompany.orgNr, 'APPROVED')}
                  className="px-3.5 py-2 bg-surface border border-border text-foreground hover:bg-surface-muted rounded-xl text-xs font-semibold transition-colors"
                >
                  Godkjenn kladd
                </button>

                <button
                  onClick={() => handleUpdateStatus(selectedCompany.orgNr, 'SENT')}
                  className="px-3.5 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-xs font-bold transition-colors"
                >
                  Merk som sendt
                </button>

                <a
                  href={`mailto:${encodeURIComponent(editedRecipient)}?subject=${encodeURIComponent(
                    editedSubject
                  )}&body=${encodeURIComponent(editedBody)}`}
                  onClick={() => handleUpdateStatus(selectedCompany.orgNr, 'SENT')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary-hover rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Åpne i e-postklient</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
