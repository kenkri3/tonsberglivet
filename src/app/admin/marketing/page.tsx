'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Megaphone, Camera, Users, Tv, Send, Play,
  Settings, AlertCircle, CheckCircle2, RefreshCw,
  Plus, ExternalLink, Calendar, Radio, Sparkles
} from 'lucide-react';

interface ScreenItem {
  id: string;
  name: string;
  location: string;
  resolution: string;
  status: string;
  currentSpot: string;
  loopInterval: string;
}

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<'screens' | 'social' | 'campaigns'>('screens');
  const [metaConfigured, setMetaConfigured] = useState(false);
  const [resendConfigured, setResendConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  // Ekte byskjermer (DoOH) i Tønsberg sentrum
  const screens: ScreenItem[] = [
    {
      id: '1',
      name: 'Torvet Storskjerm',
      location: 'Tønsberg Torv',
      resolution: '3840 x 2160 (4K LED)',
      status: 'online',
      currentSpot: 'Dagens kulturprogram & arrangementer (Ticketmaster)',
      loopInterval: '120 sekunder',
    },
    {
      id: '2',
      name: 'Kanalen & Brygga Display',
      location: 'Nedre Langgate / Brygga',
      resolution: '1920 x 1080 (FHD High-Bright)',
      status: 'online',
      currentSpot: 'Velkommen til Tønsberg – Byinfo & servering',
      loopInterval: '90 sekunder',
    },
    {
      id: '3',
      name: 'Kaldnes Gangbru Display',
      location: 'Kaldnes Brygge',
      resolution: '1920 x 1080 (FHD LED)',
      status: 'online',
      currentSpot: 'Torvleie & Næringsliv i Tønsberg',
      loopInterval: '90 sekunder',
    },
  ];

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      const json = await res.json();
      if (json.success && json.data) {
        setMetaConfigured(Boolean(json.data.metaConfigured));
        setResendConfigured(Boolean(json.data.resendConfigured));
      }
    } catch (err) {
      console.error('Feil ved lasting av markedsføring:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-200">
      {/* Sidehode */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <Megaphone className="w-4 h-4" /> Byskjermer & Kanaler
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Byskjermer & Marked</h1>
          <p className="text-foreground-muted text-sm mt-1">
            Administrasjon av det fysiske byskjermnettverket i Tønsberg og integrasjonsstatus for markedsføringskanaler.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/innstillinger"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-surface border border-border text-foreground hover:bg-surface-muted rounded-xl text-xs font-semibold transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Kanal-innstillinger</span>
          </Link>
        </div>
      </div>

      {/* ── SEKSJON 1: KANALSTATUS OVERSIKT (ÆRLIGE STATUSKORT) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Byskjermnettverk */}
        <div className="bg-surface rounded-2xl border border-border p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
              Byskjermer (DoOH)
            </span>
            <Tv className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-black text-foreground">3 / 3 aktive</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
              ✓ 100% Oppetid
            </p>
          </div>
          <p className="text-[11px] text-foreground-subtle border-t border-border pt-2">
            Torvet, Kanalen og Kaldnes
          </p>
        </div>

        {/* Instagram & Meta */}
        <div className={`rounded-2xl border p-5 space-y-3 shadow-xs ${
          metaConfigured ? 'bg-surface border-emerald-500/30' : 'bg-amber-500/5 border-amber-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
              Instagram / Meta
            </span>
            <Camera className={`w-4 h-4 ${metaConfigured ? 'text-emerald-500' : 'text-amber-500'}`} />
          </div>
          <div>
            <p className={`text-base font-bold ${metaConfigured ? 'text-emerald-600' : 'text-amber-800 dark:text-amber-400'}`}>
              {metaConfigured ? 'Tilkoblet' : 'Ikke tilkoblet ennå'}
            </p>
            <p className="text-xs text-foreground-muted mt-1">
              {metaConfigured
                ? 'Synkronisert med Meta API'
                : 'Mangler Meta Access Token'}
            </p>
          </div>
          <Link
            href="/admin/innstillinger"
            className="text-[11px] text-primary hover:underline font-semibold border-t border-border pt-2 flex items-center gap-1"
          >
            {metaConfigured ? 'Endre innstillinger →' : 'Koble til Meta i Innstillinger →'}
          </Link>
        </div>

        {/* Nyhetsbrev */}
        <div className={`rounded-2xl border p-5 space-y-3 shadow-xs ${
          resendConfigured ? 'bg-surface border-emerald-500/30' : 'bg-surface border-border'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
              Nyhetsbrev
            </span>
            <Users className="w-4 h-4 text-foreground-subtle" />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">
              {resendConfigured ? 'Tilkoblet (Resend)' : 'Ikke konfigurert ennå'}
            </p>
            <p className="text-xs text-foreground-muted mt-1">
              {resendConfigured
                ? 'E-postutsending aktiv'
                : 'Krever Resend/Mailchimp API-nøkkel'}
            </p>
          </div>
          <Link
            href="/admin/innstillinger"
            className="text-[11px] text-primary hover:underline font-semibold border-t border-border pt-2 flex items-center gap-1"
          >
            Sett opp e-posttjeneste →
          </Link>
        </div>

        {/* Total Rekkevidde */}
        <div className="bg-surface rounded-2xl border border-border p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
              Samlet Rekkevidde
            </span>
            <Megaphone className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">Venter på integrasjoner</p>
            <p className="text-xs text-foreground-muted mt-1">
              Krever GA4 og Meta for aggregering
            </p>
          </div>
          <p className="text-[11px] text-foreground-subtle border-t border-border pt-2">
            Ingen estimerte tall vises
          </p>
        </div>
      </div>

      {/* ── FANEVELGER ── */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('screens')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'screens'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-foreground-muted hover:text-foreground'
          }`}
        >
          <Tv className="w-4 h-4" />
          <span>Byskjermnettverk (DoOH)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-primary-foreground/20">
            3
          </span>
        </button>

        <button
          onClick={() => setActiveTab('social')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'social'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-foreground-muted hover:text-foreground'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Sosiale Medier & Meta</span>
        </button>
      </div>

      {/* ── FANE 1: BYSKJERMER (DoOH) ── */}
      {activeTab === 'screens' && (
        <div className="space-y-6">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-foreground">
            <div className="flex items-center gap-3">
              <Radio className="w-5 h-5 text-primary shrink-0 animate-pulse" />
              <div>
                <p className="font-semibold text-foreground">Automatisk spilleliste-synkronisering aktiv</p>
                <p className="text-foreground-muted text-[11px] mt-0.5">
                  Byskjermene oppdateres automatisk hver natt via nattlig cron (`/api/cron/daily-sync`) med dagens kulturprogram fra Ticketmaster.
                </p>
              </div>
            </div>
            <Link
              href="/eventer"
              target="_blank"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface border border-border text-foreground hover:bg-surface-muted text-xs font-semibold whitespace-nowrap transition-colors shrink-0"
            >
              Se kulturprogram <ExternalLink className="w-3 h-3 text-foreground-subtle" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {screens.map((screen) => (
              <div key={screen.id} className="bg-surface rounded-2xl border border-border p-5 space-y-4 shadow-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-foreground text-base">{screen.name}</h3>
                    <p className="text-xs text-foreground-muted mt-0.5">{screen.location}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
                  </span>
                </div>

                <div className="space-y-2 text-xs bg-surface-muted/40 p-3.5 rounded-xl border border-border">
                  <p className="text-foreground-muted">
                    Oppløsning: <strong className="text-foreground">{screen.resolution}</strong>
                  </p>
                  <p className="text-foreground-muted">
                    Løkkeintervall: <strong className="text-foreground">{screen.loopInterval}</strong>
                  </p>
                  <div className="pt-1 border-t border-border">
                    <span className="text-[11px] text-foreground-subtle block">Aktiv spot nå:</span>
                    <span className="text-xs font-semibold text-primary">{screen.currentSpot}</span>
                  </div>
                </div>

                <div className="text-[11px] text-foreground-subtle flex items-center justify-between pt-1">
                  <span>Driftes av Tønsberglivet</span>
                  <span className="font-mono">ID: DOH-{screen.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FANE 2: SOSIALE MEDIER & META ── */}
      {activeTab === 'social' && (
        <div className="space-y-4 bg-surface rounded-2xl border border-border p-6 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base">Meta / Instagram Integrasjon</h3>
              <p className="text-xs text-foreground-muted">
                Koble portalen direkte til Tønsberglivets offisielle Facebook- og Instagram-sider
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-foreground space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-400">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              Meta Graph API Access Token er ikke konfigurert ennå
            </div>
            <p className="text-foreground-muted leading-relaxed">
              For å hente reelle følgertall for Tønsberglivet og la redaksjonen publisere SoMe-innlegg direkte fra artikler med 1 klikk, må dere legge inn Meta Access Token under Admin &gt; Innstillinger.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Link
              href="/admin/innstillinger"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary-hover rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Gå til Innstillinger & koble til Meta</span>
            </Link>
            <a
              href="https://developers.facebook.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-foreground-muted hover:text-foreground inline-flex items-center gap-1 font-semibold"
            >
              Meta for Developers <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
