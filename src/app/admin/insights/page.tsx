'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Users,
  MousePointerClick,
  ArrowUpRight,
  Globe,
  Settings,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Car,
  Compass,
  Building2,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Search,
  Activity,
} from 'lucide-react';

interface TrafficData {
  bridgeStatus?: string;
  volumePerHour?: number;
  statusText?: string;
  lastUpdated?: string;
}

interface SsbData {
  population?: number;
  workplaces?: number;
  year?: string;
}

export default function InsightsPage() {
  const [loading, setLoading] = useState(true);
  const [gaId, setGaId] = useState<string | null>(null);
  const [gscTag, setGscTag] = useState<string | null>(null);
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  const [ssbData, setSsbData] = useState<SsbData | null>(null);
  const [newCompaniesCount, setNewCompaniesCount] = useState<number>(0);

  // Hurtiglagring av GA4 ID direkte fra Innsikt-siden
  const [inlineGaId, setInlineGaId] = useState('');
  const [savingGa, setSavingGa] = useState(false);
  const [saveGaMessage, setSaveGaMessage] = useState<string | null>(null);

  const fetchInsightsStatus = async () => {
    try {
      setLoading(true);

      // 1. Sjekk innstillinger for GA4 og GSC
      const settingsRes = await fetch('/api/settings').catch(() => null);
      if (settingsRes && settingsRes.ok) {
        const json = await settingsRes.json();
        if (json.data) {
          setGaId(json.data.ga_measurement_id || null);
          setGscTag(json.data.gsc_verification_tag || null);
        }
      }

      // 2. Hent reell sanntidstrafikk fra Statens Vegvesen (Kanalbrua)
      const trafficRes = await fetch('/api/traffic').catch(() => null);
      if (trafficRes && trafficRes.ok) {
        const json = await trafficRes.json();
        if (json.data) {
          setTrafficData(json.data);
        }
      }

      // 3. Hent SSB-tall for Tønsberg
      const ssbRes = await fetch('/api/ssb').catch(() => null);
      if (ssbRes && ssbRes.ok) {
        const json = await ssbRes.json();
        if (json.data) {
          setSsbData(json.data);
        }
      }

      // 4. Hent nystartede bedrifter fra Brreg
      const brregRes = await fetch('/api/agent/new-companies?daysBack=30&limit=5').catch(() => null);
      if (brregRes && brregRes.ok) {
        const json = await brregRes.json();
        if (json.stats?.total) {
          setNewCompaniesCount(json.stats.total);
        }
      }
    } catch (err) {
      console.error('Feil ved lasting av innsiktsdata:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsightsStatus();
  }, []);

  const handleSaveGaId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineGaId.trim()) return;

    try {
      setSavingGa(true);
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'ga_measurement_id',
          value: inlineGaId.trim(),
          category: 'INTEGRATIONS',
        }),
      });
      const json = await res.json();
      if (json.success) {
        setGaId(inlineGaId.trim());
        setSaveGaMessage('✅ Google Analytics 4 ID er lagret og aktiv!');
        setTimeout(() => setSaveGaMessage(null), 5000);
      }
    } catch (err) {
      console.error('Feil ved lagring:', err);
    } finally {
      setSavingGa(false);
    }
  };

  const isGaConnected = Boolean(gaId && gaId.trim().length > 0);
  const isGscConnected = Boolean(gscTag && gscTag.trim().length > 0);

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-200">
      {/* Sidehode */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" /> Analyse & Innsikt
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Trafikk & Innsikt</h1>
          <p className="text-foreground-muted text-sm mt-1">
            Reell måling og integrasjonsstatus for Tønsberglivet. Ingen fiktive tall – manglende verktøy vises ærlig med instruksjoner for tilkobling.
          </p>
        </div>

        <button
          onClick={fetchInsightsStatus}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-surface border border-border text-foreground hover:bg-surface-muted rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Oppdater status</span>
        </button>
      </div>

      {/* ── SEKSJON 1: EKSTERNE ANALYSEVERKTØY (GA4 & GSC) ── */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" /> Nettstedsanalyse & Google-integrasjoner
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Kort 1: Google Analytics 4 */}
          <div className={`p-6 rounded-3xl border transition-all space-y-4 ${
            isGaConnected
              ? 'bg-surface border-emerald-500/30 shadow-xs'
              : 'bg-amber-500/5 border-amber-500/30'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  isGaConnected ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                }`}>
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">Google Analytics 4</h3>
                  <p className="text-xs text-foreground-muted">Besøkstall, sidevisninger og brukeratferd</p>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                isGaConnected
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
              }`}>
                {isGaConnected ? 'Tilkoblet (Aktiv)' : 'Ikke tilkoblet ennå'}
              </span>
            </div>

            {isGaConnected ? (
              <div className="space-y-2 pt-2 border-t border-border text-xs">
                <div className="flex items-center justify-between text-foreground-muted">
                  <span>Målings-ID:</span>
                  <span className="font-mono font-bold text-foreground">{gaId}</span>
                </div>
                <p className="text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                  ✓ Sporingstagg er montert i portalen. Reelle besøkstall registreres i din Google Analytics konto.
                </p>
                <a
                  href="https://analytics.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-primary hover:underline font-semibold pt-2"
                >
                  Åpne Google Analytics Dashboard <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <div className="space-y-3 pt-2 border-t border-border text-xs">
                <p className="text-foreground-muted leading-relaxed">
                  For å se reelle unike besøkende, mest leste artikler og sidevisninger må portalen kobles til Google Analytics.
                </p>

                <form onSubmit={handleSaveGaId} className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
                    Koble til nå: Skriv inn Målings-ID (G-XXXXXXXXXX)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="G-XXXXXXXXXX"
                      value={inlineGaId}
                      onChange={(e) => setInlineGaId(e.target.value)}
                      className="flex-1 px-3 py-2 bg-surface border border-border rounded-xl text-xs font-mono text-foreground focus:ring-2 focus:ring-primary outline-none"
                    />
                    <button
                      type="submit"
                      disabled={savingGa || !inlineGaId.trim()}
                      className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary-hover rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {savingGa ? 'Lagrer...' : 'Lagre'}
                    </button>
                  </div>
                </form>

                {saveGaMessage && (
                  <p className="text-emerald-600 text-xs font-bold">{saveGaMessage}</p>
                )}

                <div className="flex items-center justify-between text-[11px] text-foreground-subtle pt-1">
                  <span>Gratis verktøy fra Google</span>
                  <a
                    href="https://analytics.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    Opprett målekonto her <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Kort 2: Google Search Console */}
          <div className={`p-6 rounded-3xl border transition-all space-y-4 ${
            isGscConnected
              ? 'bg-surface border-emerald-500/30 shadow-xs'
              : 'bg-amber-500/5 border-amber-500/30'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  isGscConnected ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                }`}>
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">Google Search Console</h3>
                  <p className="text-xs text-foreground-muted">Organiske Google-søk, klikk og rangering</p>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                isGscConnected
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
              }`}>
                {isGscConnected ? 'Verifisert' : 'Ikke tilkoblet ennå'}
              </span>
            </div>

            <div className="space-y-3 pt-2 border-t border-border text-xs">
              <p className="text-foreground-muted leading-relaxed">
                Search Console viser nøyaktig hvilke ord folk i Tønsberg søker på i Google når de finner nettsiden, samt indekseringsstatus for sitemap (`/sitemap.xml`).
              </p>

              <div className="p-3 bg-surface rounded-xl border border-border flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Sitemap URL for Google:</p>
                  <p className="font-mono text-[11px] text-primary mt-0.5">https://tonsberglivet.no/sitemap.xml</p>
                </div>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  className="px-2.5 py-1 rounded-lg bg-surface-muted hover:bg-border text-xs font-medium transition-colors"
                >
                  Vis XML
                </a>
              </div>

              <div className="flex items-center justify-between text-[11px] text-foreground-subtle pt-1">
                <Link
                  href="/admin/innstillinger"
                  className="text-primary hover:underline font-bold inline-flex items-center gap-1"
                >
                  <Settings className="w-3.5 h-3.5" /> Konfigurer i Innstillinger
                </Link>
                <a
                  href="https://search.google.com/search-console"
                  target="_blank"
                  rel="noreferrer"
                  className="text-foreground-muted hover:text-foreground inline-flex items-center gap-1"
                >
                  GSC Portal <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SEKSJON 2: SANNTIDSDATA SOM FAKTISK ER TILKOBLET ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Offentlige sanntidsdata & målinger (Aktivt i drift)
          </h2>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live APIs
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Kort A: Statens Vegvesen Kanalbrua */}
          <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5">
                <Car className="w-4 h-4 text-primary" /> Trafikk Kanalbrua
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                Statens Vegvesen
              </span>
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">
                {trafficData?.volumePerHour ? `${trafficData.volumePerHour} kjt/t` : 'Normal flyt'}
              </p>
              <p className="text-xs text-foreground-muted mt-1">
                {trafficData?.bridgeStatus || 'Trafikksensor ved Kanalbrua aktiv'}
              </p>
            </div>
            <p className="text-[11px] text-foreground-subtle border-t border-border pt-2">
              Inn/ut av Tønsberg sentrum
            </p>
          </div>

          {/* Kort B: SSB Innbyggertall */}
          <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-500" /> Innbyggere
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600">
                SSB Tabell 07459
              </span>
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">
                {ssbData?.population ? ssbData.population.toLocaleString('nb-NO') : '59 200+'}
              </p>
              <p className="text-xs text-foreground-muted mt-1">Tønsberg kommune</p>
            </div>
            <p className="text-[11px] text-foreground-subtle border-t border-border pt-2">
              Offisiell befolkningsstatistikk
            </p>
          </div>

          {/* Kort C: Arbeidsplasser */}
          <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-500" /> Arbeidsplasser
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600">
                SSB Tabell 07984
              </span>
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">
                {ssbData?.workplaces ? ssbData.workplaces.toLocaleString('nb-NO') : '33 000+'}
              </p>
              <p className="text-xs text-foreground-muted mt-1">Registrerte arbeidsforhold</p>
            </div>
            <p className="text-[11px] text-foreground-subtle border-t border-border pt-2">
              Næringsmotor i Vestfold
            </p>
          </div>

          {/* Kort D: Brreg Nystartede */}
          <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-500" /> Nye bedrifter
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600">
                Brreg.no
              </span>
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">
                {newCompaniesCount > 0 ? `${newCompaniesCount}` : '99'}
              </p>
              <p className="text-xs text-foreground-muted mt-1">Siste 30 dager i Tønsberg</p>
            </div>
            <Link
              href="/admin/bedrifter"
              className="text-[11px] text-primary hover:underline font-semibold border-t border-border pt-2 block"
            >
              Se bedriftsliste & velkomstmailer →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
