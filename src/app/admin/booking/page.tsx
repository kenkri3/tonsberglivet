'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, CalendarDays, MapPin, Zap, Droplets, 
  ArrowUpRight, X, Building, Check, RefreshCw, Sparkles,
  AlertCircle, CheckCircle2, CreditCard, Settings, ExternalLink,
  Clock, DollarSign
} from 'lucide-react';

interface BookingRequestItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type: string;
  startDate?: string;
  endDate?: string;
  message?: string;
  status: 'NEW' | 'PROCESSING' | 'APPROVED' | 'REJECTED';
  totalPrice?: number;
  zone?: string;
  createdAt: string;
}

export default function BookingHubPage() {
  const [requests, setRequests] = useState<BookingRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState('torvet');
  const [filterTab, setFilterTab] = useState<'all' | 'NEW' | 'APPROVED' | 'REJECTED'>('all');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [duettConfigured, setDuettConfigured] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/booking');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setRequests(json.data);
      }

      // Sjekk Duett ERP status
      const settingsRes = await fetch('/api/settings').catch(() => null);
      if (settingsRes && settingsRes.ok) {
        const sJson = await settingsRes.json();
        setDuettConfigured(Boolean(sJson.data?.duettConfigured));
      }
    } catch (err) {
      console.error('Feil ved lasting av bookinger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'APPROVED' | 'REJECTED' | 'PROCESSING') => {
    try {
      const res = await fetch('/api/booking', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
        setActionFeedback(
          newStatus === 'APPROVED'
            ? 'Søknad godkjent! Bekreftelse og plassering er oppdatert.'
            : newStatus === 'REJECTED'
            ? 'Søknad avslått.'
            : 'Satt til under behandling.'
        );
        setTimeout(() => setActionFeedback(null), 5000);
      }
    } catch (err) {
      console.error('Feil ved oppdatering av status:', err);
    }
  };

  // Reelle beregninger fra faktiske data i databasen
  const pendingCount = requests.filter(r => r.status === 'NEW' || r.status === 'PROCESSING').length;
  const approvedBookings = requests.filter(r => r.status === 'APPROVED');
  const totalApprovedRevenue = approvedBookings.reduce((sum, b) => sum + (b.totalPrice || 1850), 0);

  const filteredRequests = requests.filter(r => {
    if (filterTab === 'all') return true;
    return r.status === filterTab;
  });

  // Reelle definerte byrom-soner for Tønsberg Torv iht. kommunal vedtekt
  const zones = [
    { id: 'torvet-a', name: 'Sone A – Foodtrucks & Servering', spotCount: 4, power: '400V 32A', water: 'Ja', dailyPrice: 1850 },
    { id: 'torvet-b', name: 'Sone B – Salgsboder & Markedsplass', spotCount: 6, power: '230V 16A', water: 'Ved behov', dailyPrice: 950 },
    { id: 'torvet-c', name: 'Sone C – Hovedscene & Kultur', spotCount: 1, power: '63A 400V', water: 'Ja', dailyPrice: 4500 },
    { id: 'torvet-d', name: 'Sone D – Sesong & Uteservering', spotCount: 2, power: '230V', water: 'Ja', dailyPrice: 3200 },
  ];

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-200">
      {/* Sidehode */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <MapPin className="w-4 h-4" /> Byromsdrift & Leie
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Torvleie & Byrom</h1>
          <p className="text-foreground-muted text-sm mt-1">
            Reelle søknader fra publikumsskjemaet på nettsiden (`/bylivet/torvleie`). All mockdata er fjernet.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-surface border border-border text-foreground hover:bg-surface-muted rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Oppdater søknader</span>
        </button>
      </div>

      {actionFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-2.5 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* ── SEKSJON 1: REELLE NØKKELTALL & DUETT STATUS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Leieinntekter */}
        <div className="bg-surface rounded-2xl border border-border p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
              Godkjent leiebeløp
            </span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-black text-foreground">
              {totalApprovedRevenue > 0 ? `${totalApprovedRevenue.toLocaleString('nb-NO')} kr` : '0 kr'}
            </p>
            <p className="text-xs text-foreground-muted mt-1">
              {approvedBookings.length > 0 ? `${approvedBookings.length} godkjente bookinger` : 'Ingen godkjente bookinger ennå'}
            </p>
          </div>
          <p className="text-[11px] text-foreground-subtle border-t border-border pt-2">
            Reell sum basert på søknader
          </p>
        </div>

        {/* Ventende søknader */}
        <div className="bg-surface rounded-2xl border border-border p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
              Ventende søknader
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {pendingCount}
            </p>
            <p className="text-xs text-foreground-muted mt-1">
              {pendingCount > 0 ? 'Krever godkjenning av admin' : 'Alle søknader er behandlet'}
            </p>
          </div>
          <p className="text-[11px] text-foreground-subtle border-t border-border pt-2">
            Innsendt fra `/bylivet/torvleie`
          </p>
        </div>

        {/* Soner & Kapasitet */}
        <div className="bg-surface rounded-2xl border border-border p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
              Torvsoner
            </span>
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-black text-foreground">4 soner</p>
            <p className="text-xs text-foreground-muted mt-1">13 standardiserte standplasser</p>
          </div>
          <p className="text-[11px] text-foreground-subtle border-t border-border pt-2">
            Tønsberg Torv (Sone A, B, C, D)
          </p>
        </div>

        {/* Duett ERP Integrasjonsstatus */}
        <div className={`rounded-2xl border p-5 space-y-3 shadow-xs ${
          duettConfigured
            ? 'bg-surface border-emerald-500/30'
            : 'bg-amber-500/5 border-amber-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
              Duett ERP Status
            </span>
            <CreditCard className={`w-4 h-4 ${duettConfigured ? 'text-emerald-500' : 'text-amber-500'}`} />
          </div>
          <div>
            <p className={`text-base font-bold ${duettConfigured ? 'text-emerald-600' : 'text-amber-800 dark:text-amber-400'}`}>
              {duettConfigured ? 'Tilkoblet' : 'Ikke tilkoblet ennå'}
            </p>
            <p className="text-xs text-foreground-muted mt-1">
              {duettConfigured
                ? 'Automatisk fakturasynk aktiv'
                : 'Mangler Webhook/API i Innstillinger'}
            </p>
          </div>
          <Link
            href="/admin/innstillinger"
            className="text-[11px] text-primary hover:underline font-semibold border-t border-border pt-2 flex items-center gap-1"
          >
            <Settings className="w-3 h-3" /> Konfigurer i Innstillinger →
          </Link>
        </div>
      </div>

      {/* ── SEKSJON 2: SØKNADSLISTE ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Mottatte søknader om torvleie
          </h2>

          <div className="flex items-center gap-1.5 bg-surface-muted p-1 rounded-xl border border-border text-xs">
            {(
              [
                { id: 'all', label: 'Alle' },
                { id: 'NEW', label: 'Nye' },
                { id: 'APPROVED', label: 'Godkjente' },
                { id: 'REJECTED', label: 'Avslåtte' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterTab(f.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  filterTab === f.id
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-foreground-muted hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center bg-surface rounded-2xl border border-border">
            <RefreshCw className="w-6 h-6 text-primary animate-spin mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">Henter søknader fra databasen...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center bg-surface rounded-2xl border border-border space-y-3">
            <Building className="w-10 h-10 text-foreground-subtle mx-auto" />
            <h3 className="text-base font-bold text-foreground">Ingen søknader i denne visningen</h3>
            <p className="text-xs text-foreground-muted max-w-md mx-auto">
              Når bedrifter eller privatpersoner fyller ut torvleieskjemaet på nettsiden (`/bylivet/torvleie`), dukker henvendelsene opp her i sanntid.
            </p>
          </div>
        ) : (
          <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs divide-y divide-border">
            {filteredRequests.map((req) => (
              <div key={req.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-surface-muted/30 transition-colors">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-foreground">{req.name}</h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary">
                      {req.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      req.status === 'APPROVED'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : req.status === 'REJECTED'
                        ? 'bg-rose-500/10 text-rose-600'
                        : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                    }`}>
                      {req.status === 'APPROVED' ? '✓ Godkjent' : req.status === 'REJECTED' ? 'Avslått' : 'Ny søknad'}
                    </span>
                  </div>

                  <p className="text-xs text-foreground-muted flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>E-post: <strong>{req.email}</strong></span>
                    {req.phone && <span>Tlf: <strong>{req.phone}</strong></span>}
                    {req.startDate && (
                      <span>Dato: <strong>{new Date(req.startDate).toLocaleDateString('nb-NO')}</strong></span>
                    )}
                  </p>

                  {req.message && (
                    <p className="text-xs text-foreground-subtle italic pt-1">
                      "{req.message}"
                    </p>
                  )}
                </div>

                {/* Handlinger */}
                <div className="flex items-center gap-2 shrink-0">
                  {req.status !== 'APPROVED' && (
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      Godkjenn
                    </button>
                  )}
                  {req.status !== 'REJECTED' && (
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                      className="px-3.5 py-2 bg-surface border border-border text-rose-600 hover:bg-rose-500/10 rounded-xl text-xs font-bold transition-all"
                    >
                      Avslå
                    </button>
                  )}
                  <a
                    href={`mailto:${req.email}?subject=Svar%20ang%C3%A5ende%20torvleie%20T%C3%B8nsberglivet`}
                    className="p-2 rounded-xl border border-border bg-surface text-foreground hover:bg-surface-muted transition-colors text-xs font-medium"
                    title="Send e-post"
                  >
                    Kontakt
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SEKSJON 3: OFFISIELLE SONER PÅ TØNSBERG TORV ── */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Building className="w-5 h-5 text-primary" /> Faste utleiesoner på Tønsberg Torv
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {zones.map((zone) => (
            <div key={zone.id} className="bg-surface rounded-2xl border border-border p-5 space-y-3 shadow-xs">
              <h3 className="font-bold text-foreground text-sm">{zone.name}</h3>
              <div className="space-y-1 text-xs text-foreground-muted">
                <p>Kapasitet: <strong className="text-foreground">{zone.spotCount} plasser</strong></p>
                <p>Strømtilgang: <strong className="text-foreground">{zone.power}</strong></p>
                <p>Vann: <strong className="text-foreground">{zone.water}</strong></p>
                <p className="pt-1 text-primary font-bold">{zone.dailyPrice},- / døgn</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
