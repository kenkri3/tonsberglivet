'use client';

import { useState, useEffect } from 'react';
import {
  KeyRound,
  Bot,
  Sliders,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Send,
  Eye,
  EyeOff,
  RefreshCw,
  MessageSquare,
  ShieldAlert,
  Zap,
  Mail,
  Calendar,
  Building2,
  Share2,
  Globe,
  Building,
  Users,
  Check,
  ShieldCheck,
} from 'lucide-react';

export default function InnstillingerPage() {
  const [activeTab, setActiveTab] = useState<'byok' | 'email' | 'agent' | 'integrations' | 'social' | 'general'>('byok');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // BYOK & Keys
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [braveApiKey, setBraveApiKey] = useState('');
  const [tavilyApiKey, setTavilyApiKey] = useState('');
  const [apifyApiKey, setApifyApiKey] = useState('');
  const [ticketmasterApiKey, setTicketmasterApiKey] = useState('');
  const [geminiConfigured, setGeminiConfigured] = useState(false);
  const [braveConfigured, setBraveConfigured] = useState(false);
  const [tavilyConfigured, setTavilyConfigured] = useState(false);
  const [apifyConfigured, setApifyConfigured] = useState(false);
  const [ticketmasterConfigured, setTicketmasterConfigured] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showBraveKey, setShowBraveKey] = useState(false);
  const [showTavilyKey, setShowTavilyKey] = useState(false);
  const [showApifyKey, setShowApifyKey] = useState(false);
  const [showTicketmasterKey, setShowTicketmasterKey] = useState(false);
  const [testingAi, setTestingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<string | null>(null);

  // Email (Resend & SMTP)
  const [resendApiKey, setResendApiKey] = useState('');
  const [smtpUrl, setSmtpUrl] = useState('');
  const [resendConfigured, setResendConfigured] = useState(false);
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  const [showResendKey, setShowResendKey] = useState(false);
  const [showSmtpUrl, setShowSmtpUrl] = useState(false);

  // Agent & Webhooks
  const [slackWebhookUrl, setSlackWebhookUrl] = useState('');
  const [teamsWebhookUrl, setTeamsWebhookUrl] = useState('');
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState('');
  const [slackConfigured, setSlackConfigured] = useState(false);
  const [teamsConfigured, setTeamsConfigured] = useState(false);
  const [discordConfigured, setDiscordConfigured] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState<string | null>(null);

  // Integrations (Cron & Duett ERP)
  const [cronSecret, setCronSecret] = useState('tonsberg_cron_secret_2026');
  const [duettWebhookUrl, setDuettWebhookUrl] = useState('');
  const [cronConfigured, setCronConfigured] = useState(false);
  const [duettConfigured, setDuettConfigured] = useState(false);
  const [showCronSecret, setShowCronSecret] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  // Sosiale Medier (Meta & Google Business Profile)
  const [metaPageId, setMetaPageId] = useState('');
  const [metaGroupId, setMetaGroupId] = useState('');
  const [metaInstagramId, setMetaInstagramId] = useState('');
  const [metaAccessToken, setMetaAccessToken] = useState('');
  const [metaConfigured, setMetaConfigured] = useState(false);
  const [showMetaToken, setShowMetaToken] = useState(false);

  const [googleBusinessAccountId, setGoogleBusinessAccountId] = useState('');
  const [googleBusinessLocationId, setGoogleBusinessLocationId] = useState('');
  const [googleBusinessAccessToken, setGoogleBusinessAccessToken] = useState('');
  const [googleBusinessConfigured, setGoogleBusinessConfigured] = useState(false);
  const [showGoogleToken, setShowGoogleToken] = useState(false);

  const [testingSocial, setTestingSocial] = useState(false);
  const [socialTestResult, setSocialTestResult] = useState<string | null>(null);

  // Styringsrett & Autonomi (SEO & CMS Engine)
  const [autonomyMode, setAutonomyMode] = useState<'manual' | 'hybrid' | 'auto'>('manual');
  const [autoPublishArticles, setAutoPublishArticles] = useState(false);
  const [autoPublishEvents, setAutoPublishEvents] = useState(true);
  const [autoRedirectExpired, setAutoRedirectExpired] = useState(true);

  // General & Notifications
  const [notificationEmail, setNotificationEmail] = useState('hei@tonsberglivet.no');
  const [autoApproveBookings, setAutoApproveBookings] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      const json = await res.json();
      if (json.success && json.data) {
        setGeminiApiKey(json.data.geminiApiKey || '');
        setGeminiConfigured(json.data.geminiConfigured);
        setBraveApiKey(json.data.braveApiKey || '');
        setBraveConfigured(json.data.braveConfigured);
        setTavilyApiKey(json.data.tavilyApiKey || '');
        setTavilyConfigured(json.data.tavilyConfigured);
        setApifyApiKey(json.data.apifyApiKey || '');
        setApifyConfigured(json.data.apifyConfigured);
        setTicketmasterApiKey(json.data.ticketmasterApiKey || '');
        setTicketmasterConfigured(json.data.ticketmasterConfigured);
        setResendApiKey(json.data.resendApiKey || '');
        setResendConfigured(json.data.resendConfigured);
        setSmtpUrl(json.data.smtpUrl || '');
        setSmtpConfigured(json.data.smtpConfigured);
        setCronSecret(json.data.cronSecret || 'tonsberg_cron_secret_2026');
        setCronConfigured(json.data.cronConfigured);
        setDuettWebhookUrl(json.data.duettWebhookUrl || '');
        setDuettConfigured(json.data.duettConfigured);
        setSlackWebhookUrl(json.data.slackWebhookUrl || '');
        setSlackConfigured(json.data.slackConfigured);
        setTeamsWebhookUrl(json.data.teamsWebhookUrl || '');
        setTeamsConfigured(json.data.teamsConfigured);
        setDiscordWebhookUrl(json.data.discordWebhookUrl || '');
        setDiscordConfigured(json.data.discordConfigured);
        setNotificationEmail(json.data.notificationEmail || 'hei@tonsberglivet.no');
        setAutoApproveBookings(!!json.data.autoApproveBookings);

        // Autonomi
        setAutonomyMode(json.data.autonomyMode || 'manual');
        setAutoPublishArticles(!!json.data.autoPublishArticles);
        setAutoPublishEvents(json.data.autoPublishEvents !== false);
        setAutoRedirectExpired(json.data.autoRedirectExpired !== false);

        // Meta & SoMe
        setMetaPageId(json.data.metaPageId || '');
        setMetaGroupId(json.data.metaGroupId || '');
        setMetaInstagramId(json.data.metaInstagramId || '');
        setMetaAccessToken(json.data.metaAccessToken || '');
        setMetaConfigured(!!json.data.metaConfigured);

        // Google Business Profile
        setGoogleBusinessAccountId(json.data.googleBusinessAccountId || '');
        setGoogleBusinessLocationId(json.data.googleBusinessLocationId || '');
        setGoogleBusinessAccessToken(json.data.googleBusinessAccessToken || '');
        setGoogleBusinessConfigured(!!json.data.googleBusinessConfigured);
      }
    } catch (e) {
      console.error('Kunne ikke laste innstillinger:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          geminiApiKey,
          braveApiKey,
          tavilyApiKey,
          apifyApiKey,
          ticketmasterApiKey,
          resendApiKey,
          smtpUrl,
          cronSecret,
          duettWebhookUrl,
          slackWebhookUrl,
          teamsWebhookUrl,
          discordWebhookUrl,
          notificationEmail,
          autoApproveBookings,
          autonomyMode,
          autoPublishArticles,
          autoPublishEvents,
          autoRedirectExpired,
          metaPageId,
          metaGroupId,
          metaInstagramId,
          metaAccessToken,
          googleBusinessAccountId,
          googleBusinessLocationId,
          googleBusinessAccessToken,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
        await loadSettings();
      } else {
        setErrorMessage(json.error || 'Feil ved lagring');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Nettverksfeil ved lagring');
    } finally {
      setSaving(false);
    }
  };

  const testAiConnection = async () => {
    setTestingAi(true);
    setAiTestResult(null);
    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Skriv en setning om hvorfor Tønsberg er Norges fineste sommerby.',
          agent: 'TestAgent',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiTestResult('✅ Nøkkel er verifisert og aktiv! AI-en svarte uten problemer.');
      } else {
        setAiTestResult('❌ Test feilet: ' + (data.error || 'Ugyldig nøkkel'));
      }
    } catch {
      setAiTestResult('❌ Test feilet: Kunne ikke kontakte AI-endepunktet.');
    } finally {
      setTestingAi(false);
    }
  };

  const testWebhookDispatch = async () => {
    setTestingWebhook(true);
    setWebhookTestResult(null);
    try {
      const res = await fetch('/api/agent/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: '/tb',
          text: 'status',
        }),
      });
      const data = await res.json();
      if (data.text) {
        setWebhookTestResult('✅ Agent-endepunktet svarer: ' + data.text.slice(0, 70) + '...');
      } else {
        setWebhookTestResult('⚠️ Agent svarte, men uten standard tekst.');
      }
    } catch {
      setWebhookTestResult('❌ Kunne ikke teste agent-endepunktet.');
    } finally {
      setTestingWebhook(false);
    }
  };

  const handleTriggerDailySync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const secret = cronSecret || 'tonsberg_cron_secret_2026';
      const res = await fetch(`/api/cron/daily-sync?key=${encodeURIComponent(secret)}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setSyncResult(`✅ Synk fullført på ${data.executionTimeMs}ms! ${data.data?.message || 'Arrangementer og spillelister oppdatert.'}`);
      } else {
        setSyncResult(`❌ Feil ved synk: ${data.error || 'Ukjent feil'}`);
      }
    } catch (e: any) {
      setSyncResult(`❌ Kunne ikke kalle cron-rute: ${e?.message}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncResult(null), 8000);
    }
  };

  const handleTestSocialPublish = async () => {
    setTestingSocial(true);
    setSocialTestResult(null);
    try {
      const res = await fetch('/api/social/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targets: ['facebook_page', 'facebook_group', 'instagram', 'google_business'],
          text: 'Velkommen til Tønsberglivet! Test-post for API-tilkobling mot sosiale medier og Google Business.',
          title: 'Tønsberglivet Test',
          link: 'https://tonsberglivet.no',
        }),
      });
      const data = await res.json();
      if (data.success && data.results) {
        setSocialTestResult('✅ Test fullført! Sjekk status på hver kanal nedenfor.');
      } else {
        setSocialTestResult(`❌ Feil: ${data.error || 'Ukjent feil'}`);
      }
    } catch (e: any) {
      setSocialTestResult(`❌ Nettverksfeil: ${e.message}`);
    } finally {
      setTestingSocial(false);
    }
  };

  const handleQuickConnectMeta = async () => {
    try {
      const res = await fetch('/api/social/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'connect_mock_meta',
          pageId: metaPageId || 'tonsberg-brygge-offisiell',
          groupId: metaGroupId || 'tonsberg-fellesskap-gruppe',
          instagramId: metaInstagramId || 'tonsberglivet.no',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
        await loadSettings();
      }
    } catch (e: any) {
      setErrorMessage(e.message);
    }
  };

  const handleQuickConnectGoogle = async () => {
    try {
      const res = await fetch('/api/social/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'connect_mock_google',
          accountId: googleBusinessAccountId || 'accounts/tonsberglivet-org',
          locationId: googleBusinessLocationId || 'locations/tonsberg-sentrum-loc',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
        await loadSettings();
      }
    } catch (e: any) {
      setErrorMessage(e.message);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      {/* Topp-header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-foreground tracking-tight">System & Integrasjoner (BYOK)</h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              Bring Your Own Key
            </span>
          </div>
          <p className="text-foreground-muted text-sm mt-1">
            Administrer egne API-nøkler, sosiale medier, Google Business Profile, Ticketmaster og styringsrett.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleSave()}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Lagre endringer
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center gap-3 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          Innstillinger er trygt lagret og trådt i kraft umiddelbart!
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center gap-3 text-sm font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-border gap-2 pb-px scrollbar-none scroll-smooth">
        <button
          onClick={() => setActiveTab('byok')}
          className={`shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 font-bold text-xs sm:text-sm border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'byok'
              ? 'border-primary text-primary'
              : 'border-transparent text-foreground-muted hover:text-foreground'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          KI & API-nøkler
          {geminiConfigured && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block ml-1" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('social')}
          className={`shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 font-bold text-xs sm:text-sm border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'social'
              ? 'border-primary text-primary'
              : 'border-transparent text-foreground-muted hover:text-foreground'
          }`}
        >
          <Share2 className="w-4 h-4" />
          Facebook, Instagram & Google
          {(metaConfigured || googleBusinessConfigured) && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block ml-1" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('email')}
          className={`shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 font-bold text-xs sm:text-sm border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'email'
              ? 'border-primary text-primary'
              : 'border-transparent text-foreground-muted hover:text-foreground'
          }`}
        >
          <Mail className="w-4 h-4" />
          E-post & Leiebekreftelse
          {(resendConfigured || smtpConfigured) && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block ml-1" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('agent')}
          className={`shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 font-bold text-xs sm:text-sm border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'agent'
              ? 'border-primary text-primary'
              : 'border-transparent text-foreground-muted hover:text-foreground'
          }`}
        >
          <Bot className="w-4 h-4" />
          Autonom Mobilagent
          {(slackConfigured || teamsConfigured || discordConfigured) && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block ml-1" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('integrations')}
          className={`shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 font-bold text-xs sm:text-sm border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'integrations'
              ? 'border-primary text-primary'
              : 'border-transparent text-foreground-muted hover:text-foreground'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Duett ERP & Nattlig Synk
          {duettConfigured && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block ml-1" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('general')}
          className={`shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 font-bold text-xs sm:text-sm border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'general'
              ? 'border-primary text-primary'
              : 'border-transparent text-foreground-muted hover:text-foreground'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Styringsrett & Autonomi
        </button>
      </div>

      {/* TAB 1: BYOK */}
      {activeTab === 'byok' && (
        <div className="space-y-6">
          <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI API-nøkkel (1min.ai)
                </h3>
                <p className="text-sm text-foreground-muted mt-1">
                  Brukes av redaksjonell Copilot, SoMe-generering og den autonome mobilagenten for naturlig språk.
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  geminiConfigured
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                }`}
              >
                {geminiConfigured ? 'Tilkoblet (Aktiv)' : 'Nøkkel mangler'}
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                AI API-nøkkel
              </label>
              <div className="relative">
                <input
                  type={showGeminiKey ? 'text' : 'password'}
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full pr-12 pl-4 py-3 bg-background border border-border rounded-xl text-sm font-mono text-foreground focus:ring-2 focus:ring-primary outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground p-1"
                >
                  {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <span className="text-foreground-muted">
                  Nøkkelen lagres kryptert på serveren og benyttes kun for Tønsberglivet.
                </span>
                <a
                  href="https://docs.1min.ai/docs/api/openai-compatible"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-bold inline-flex items-center gap-1"
                >
                  Hent API-nøkkel fra 1min.ai <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-muted border border-border text-xs text-foreground-muted space-y-2">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <ShieldAlert className="w-4 h-4 text-primary" />
                Null kostnader & Gratis kvote:
              </div>
              <p>
                Bruk din 1min.ai API-nøkkel her for å generere SoMe-innlegg og drive chatbot.
                Dette dekker Tønsberglivets månedlige behov fullstendig uten binding eller ekstra kostnader.
              </p>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                type="button"
                onClick={testAiConnection}
                disabled={testingAi || (!geminiApiKey && !geminiConfigured)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-surface-muted hover:bg-border text-foreground font-bold text-xs rounded-xl transition-colors border border-border disabled:opacity-50"
              >
                {testingAi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-primary" />}
                Test KI-forbindelse
              </button>
              {aiTestResult && (
                <span className="text-xs font-medium text-foreground">{aiTestResult}</span>
              )}
            </div>
          </div>

          {/* BRAVE SEARCH API */}
          <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-orange-500" />
                  Brave Search API (Sanntids nettsøk)
                </h3>
                <p className="text-sm text-foreground-muted mt-1">
                  Gir den autonome agenten lynrask tilgang til ferske nyheter om Tønsberg, åpningstider, pressemeldinger og nettkilder.
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  braveConfigured
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                }`}
              >
                {braveConfigured ? 'Aktiv (Tilkoblet)' : 'Valgfri / Ikke satt'}
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                Brave Search API-nøkkel
              </label>
              <div className="relative">
                <input
                  type={showBraveKey ? 'text' : 'password'}
                  value={braveApiKey}
                  onChange={(e) => setBraveApiKey(e.target.value)}
                  placeholder="BSA..."
                  className="w-full pr-12 pl-4 py-3 bg-background border border-border rounded-xl text-sm font-mono text-foreground focus:ring-2 focus:ring-primary outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowBraveKey(!showBraveKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground p-1"
                >
                  {showBraveKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <span className="text-foreground-muted">
                  Gir agenten mulighet til å utføre uavhengige Brave-søk.
                </span>
                <a
                  href="https://brave.com/search/api/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-bold inline-flex items-center gap-1"
                >
                  Hent Brave API-nøkkel (gratis kvote) <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* TAVILY SEARCH API */}
          <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  Tavily AI Search API (Dyp Research)
                </h3>
                <p className="text-sm text-foreground-muted mt-1">
                  Spesialdesignet forsknings- og faktasøkemotor for LLM-agenter. Finner faktabaserte kilder og sammendrag for artikler.
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  tavilyConfigured
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                }`}
              >
                {tavilyConfigured ? 'Aktiv (Tilkoblet)' : 'Valgfri / Ikke satt'}
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                Tavily API-nøkkel
              </label>
              <div className="relative">
                <input
                  type={showTavilyKey ? 'text' : 'password'}
                  value={tavilyApiKey}
                  onChange={(e) => setTavilyApiKey(e.target.value)}
                  placeholder="tvly-..."
                  className="w-full pr-12 pl-4 py-3 bg-background border border-border rounded-xl text-sm font-mono text-foreground focus:ring-2 focus:ring-primary outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowTavilyKey(!showTavilyKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground p-1"
                >
                  {showTavilyKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <span className="text-foreground-muted">
                  Syntetiserer forskningsrapporter og verifiserer kilder automatisk.
                </span>
                <a
                  href="https://tavily.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-bold inline-flex items-center gap-1"
                >
                  Hent gratis Tavily API-nøkkel <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* APIFY WEB SCRAPER API */}
          <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-500" />
                  Apify Web Scraper API (Nettleser- og dokumentskraping)
                </h3>
                <p className="text-sm text-foreground-muted mt-1">
                  Lar agenten skrape og hente komplett innhold fra eksterne nettsider (Foynhagen, Oseberg kulturhus, Tønsberg kommune m.m.).
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  apifyConfigured
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    : 'bg-surface-muted text-foreground-muted border border-border'
                }`}
              >
                {apifyConfigured ? 'Aktiv (Tilkoblet)' : 'Innebygd direkteleser aktiv'}
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                Apify API-token
              </label>
              <div className="relative">
                <input
                  type={showApifyKey ? 'text' : 'password'}
                  value={apifyApiKey}
                  onChange={(e) => setApifyApiKey(e.target.value)}
                  placeholder="apify_api_..."
                  className="w-full pr-12 pl-4 py-3 bg-background border border-border rounded-xl text-sm font-mono text-foreground focus:ring-2 focus:ring-primary outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowApifyKey(!showApifyKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground p-1"
                >
                  {showApifyKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <span className="text-foreground-muted">
                  Systemet har også innebygd resilient direkteleser som fallback.
                </span>
                <a
                  href="https://apify.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-bold inline-flex items-center gap-1"
                >
                  Hent Apify-token <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">Ticketmaster Discovery API</h3>
                <p className="text-sm text-foreground-muted mt-1">
                  Brukes for sanntidssynkronisering av konserter og kulturarrangementer i Tønsberg, Foynhagen og Støperiet.
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  ticketmasterConfigured
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    : 'bg-surface-muted text-foreground-muted border border-border'
                }`}
              >
                {ticketmasterConfigured ? 'Aktiv' : 'Valgfri'}
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                Ticketmaster API-nøkkel
              </label>
              <div className="relative">
                <input
                  type={showTicketmasterKey ? 'text' : 'password'}
                  value={ticketmasterApiKey}
                  onChange={(e) => setTicketmasterApiKey(e.target.value)}
                  placeholder="Valgfri Ticketmaster Developer API-nøkkel..."
                  className="w-full pr-12 pl-4 py-3 bg-background border border-border rounded-xl text-sm font-mono text-foreground focus:ring-2 focus:ring-primary outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowTicketmasterKey(!showTicketmasterKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground p-1"
                >
                  {showTicketmasterKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-foreground-muted">
                Dersom denne utelates, benytter portalen den innebygde arrangementsfeeden for Vestfold.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EMAIL */}
      {activeTab === 'email' && (
        <div className="space-y-6">
          <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  E-posttjeneste for Leiebekreftelser
                </h3>
                <p className="text-sm text-foreground-muted mt-1">
                  Sender automatisk lekker, merkevarebygget HTML-leiebekreftelse til leietakere ved godkjenning av torvplass.
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  resendConfigured || smtpConfigured
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                }`}
              >
                {resendConfigured ? 'Resend Aktiv' : smtpConfigured ? 'SMTP Aktiv' : 'Console Fallback'}
              </span>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
                  <span>Resend API-nøkkel (Anbefalt)</span>
                  {resendConfigured && <span className="text-emerald-500 text-xs lowercase font-semibold">Tilkoblet</span>}
                </label>
                <div className="relative">
                  <input
                    type={showResendKey ? 'text' : 'password'}
                    value={resendApiKey}
                    onChange={(e) => setResendApiKey(e.target.value)}
                    placeholder="re_123456789..."
                    className="w-full pr-12 pl-4 py-3 bg-background border border-border rounded-xl text-sm font-mono text-foreground focus:ring-2 focus:ring-primary outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResendKey(!showResendKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground p-1"
                  >
                    {showResendKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-foreground-muted">Leverer e-post via Resend API (3000 gratis e-poster/mnd).</span>
                  <a
                    href="https://resend.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-bold inline-flex items-center gap-1"
                  >
                    Hent nøkkel på resend.com <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
                  <span>SMTP URL (Valgfri Fallback)</span>
                  {smtpConfigured && <span className="text-emerald-500 text-xs lowercase font-semibold">Tilkoblet</span>}
                </label>
                <div className="relative">
                  <input
                    type={showSmtpUrl ? 'text' : 'password'}
                    value={smtpUrl}
                    onChange={(e) => setSmtpUrl(e.target.value)}
                    placeholder="smtp://bruker:passord@smtp.eksempel.no:587"
                    className="w-full pr-12 pl-4 py-3 bg-background border border-border rounded-xl text-sm font-mono text-foreground focus:ring-2 focus:ring-primary outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSmtpUrl(!showSmtpUrl)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground p-1"
                  >
                    {showSmtpUrl ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-foreground-muted">
                  Dersom verken Resend eller SMTP er konfigurert, logges e-postene i systemloggen for feilsøking.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AGENT */}
      {activeTab === 'agent' && (
        <div className="space-y-6">
          <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                Autonom Mobilagent (Slack / Microsoft Teams / Discord)
              </h3>
              <p className="text-sm text-foreground-muted mt-1">
                La administrasjonen styre portalen direkte fra mobiltelefonen. Motta godkjenningsknapper for torvleie, svarutkast på meldinger og nattlige morgensammendrag.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
                  <span>Slack Incoming Webhook URL</span>
                  {slackConfigured && <span className="text-emerald-500 text-xs lowercase font-semibold">Tilkoblet</span>}
                </label>
                <input
                  type="text"
                  value={slackWebhookUrl}
                  onChange={(e) => setSlackWebhookUrl(e.target.value)}
                  placeholder="https://hooks.slack.com/services/T.../B.../..."
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-mono text-foreground focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
                  <span>Microsoft Teams Webhook URL</span>
                  {teamsConfigured && <span className="text-emerald-500 text-xs lowercase font-semibold">Tilkoblet</span>}
                </label>
                <input
                  type="text"
                  value={teamsWebhookUrl}
                  onChange={(e) => setTeamsWebhookUrl(e.target.value)}
                  placeholder="https://tonsberg.webhook.office.com/webhookb2/..."
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-mono text-foreground focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
                  <span>Discord Webhook URL</span>
                  {discordConfigured && <span className="text-emerald-500 text-xs lowercase font-semibold">Tilkoblet</span>}
                </label>
                <input
                  type="text"
                  value={discordWebhookUrl}
                  onChange={(e) => setDiscordWebhookUrl(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-mono text-foreground focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-muted border border-border text-xs space-y-3">
              <div className="font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Kommandoer i chat:
              </div>
              <ul className="space-y-1.5 text-foreground-muted pl-1">
                <li>• <strong className="text-foreground">/tb status</strong> — Se dagens ventende henvendelser og leieforespørsler.</li>
                <li>• <strong className="text-foreground">/tb godkjenn [id]</strong> — Godkjenner leie, sender e-post og klargjør Duett faktura.</li>
                <li>• <strong className="text-foreground">/tb post [idé/stikkord]</strong> — Genererer redaksjonell artikkel og SoMe-innhold.</li>
                <li>• <strong className="text-foreground">/tb arrangementer</strong> — Viser kommende konserter fra Ticketmaster-synk.</li>
              </ul>
              <div className="pt-2 text-foreground-muted border-t border-border">
                Mottaks-URL for agent-kommandoer: <code className="bg-background px-2 py-0.5 rounded font-mono text-foreground">/api/agent/webhook</code>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                type="button"
                onClick={testWebhookDispatch}
                disabled={testingWebhook}
                className="inline-flex items-center gap-2 px-4 py-2 bg-surface-muted hover:bg-border text-foreground font-bold text-xs rounded-xl transition-colors border border-border disabled:opacity-50"
              >
                {testingWebhook ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-primary" />}
                Test agent-endepunkt
              </button>
              {webhookTestResult && (
                <span className="text-xs font-medium text-foreground">{webhookTestResult}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INTEGRATIONS */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Duett ERP & Faktura-integrasjon
                </h3>
                <p className="text-sm text-foreground-muted mt-1">
                  Genererer automatisk fakturagrunnlag (CSV / EHF 3.0) for godkjente torvleieavtaler med MVA og forfallsdato (+14 dager).
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  duettConfigured
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    : 'bg-surface-muted text-foreground-muted border border-border'
                }`}
              >
                {duettConfigured ? 'Webhook Tilkoblet' : 'Direkte Eksport'}
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                Duett ERP / Regnskap Webhook URL
              </label>
              <input
                type="text"
                value={duettWebhookUrl}
                onChange={(e) => setDuettWebhookUrl(e.target.value)}
                placeholder="https://api.duett.no/webhook/..."
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-mono text-foreground focus:ring-2 focus:ring-primary outline-none"
              />
              <p className="text-xs text-foreground-muted">
                Valgfri webhook. Dersom denne er tom, kan fakturagrunnlaget likevel eksporteres som CSV direkte fra Økonomi-siden.
              </p>
            </div>
          </div>

          <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Nattlig Bakgrunnssynk (Ticketmaster & DoOH Byskjermer)
                </h3>
                <p className="text-sm text-foreground-muted mt-1">
                  Kjøres automatisk kl 04:00 via Cron. Henter nye arrangementer, oppdaterer in-memory hurtigbuffer (&lt;50ms) og klargjør DoOH-spillelister for Torvet og Kaldnes.
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  cronConfigured
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    : 'bg-surface-muted text-foreground-muted border border-border'
                }`}
              >
                {cronConfigured ? 'Sikret' : 'Standard'}
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                CRON_SECRET Sikkerhetsnøkkel
              </label>
              <div className="relative">
                <input
                  type={showCronSecret ? 'text' : 'password'}
                  value={cronSecret}
                  onChange={(e) => setCronSecret(e.target.value)}
                  placeholder="tonsberg_cron_secret_2026"
                  className="w-full pr-12 pl-4 py-3 bg-background border border-border rounded-xl text-sm font-mono text-foreground focus:ring-2 focus:ring-primary outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowCronSecret(!showCronSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground p-1"
                >
                  {showCronSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-foreground-muted">
                Beskytter endepunktet <code className="bg-surface-muted px-1.5 py-0.5 rounded font-mono text-foreground">/api/cron/daily-sync</code> mot uautoriserte kall.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
              <button
                type="button"
                onClick={handleTriggerDailySync}
                disabled={isSyncing}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Kjører synk...' : 'Kjør Nattlig Synk Nå'}
              </button>
              {syncResult && (
                <span className="text-xs font-medium text-foreground">{syncResult}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: SOSIALE MEDIER & GOOGLE BUSINESS */}
      {activeTab === 'social' && (
        <div className="space-y-6">
          {/* Meta: Facebook & Instagram */}
          <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-blue-600" />
                  Meta Business: Facebook-side, Facebook-gruppe & Instagram
                </h3>
                <p className="text-sm text-foreground-muted mt-1">
                  Koble til Tønsberglivets Facebook-konto for direkte eller automatisert kryss-publisering av artikler, nyheter og arrangementer.
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  metaConfigured
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    : 'bg-surface-muted text-foreground-muted border border-border'
                }`}
              >
                {metaConfigured ? 'Meta Tilkoblet' : 'Ikke tilkoblet'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-blue-600" /> Facebook Page ID
                </label>
                <input
                  type="text"
                  value={metaPageId}
                  onChange={(e) => setMetaPageId(e.target.value)}
                  placeholder="f.eks. 109283746592817 eller tonsberglivet"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-mono text-foreground focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" /> Facebook Group ID (Valgfri)
                </label>
                <input
                  type="text"
                  value={metaGroupId}
                  onChange={(e) => setMetaGroupId(e.target.value)}
                  placeholder="f.eks. 987654321098765"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-mono text-foreground focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-pink-600" /> Instagram Business Account ID
                </label>
                <input
                  type="text"
                  value={metaInstagramId}
                  onChange={(e) => setMetaInstagramId(e.target.value)}
                  placeholder="f.eks. 178414000000000"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-mono text-foreground focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
                  <span>Meta Graph API Access Token</span>
                  <a
                    href="https://developers.facebook.com/tools/explorer/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-[11px] font-semibold inline-flex items-center gap-1"
                  >
                    Hent token på Meta Developers <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <div className="relative">
                  <input
                    type={showMetaToken ? 'text' : 'password'}
                    value={metaAccessToken}
                    onChange={(e) => setMetaAccessToken(e.target.value)}
                    placeholder="EAAB..."
                    className="w-full pr-12 pl-4 py-3 bg-background border border-border rounded-xl text-sm font-mono text-foreground focus:ring-2 focus:ring-primary outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMetaToken(!showMetaToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground p-1"
                  >
                    {showMetaToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleQuickConnectMeta}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                Koble til Facebook-bruker (Hurtigoppsett)
              </button>
            </div>
          </div>

          {/* Google Business Profile */}
          <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Building className="w-5 h-5 text-emerald-600" />
                  Google Business Profile (Kart & Lokal SEO)
                </h3>
                <p className="text-sm text-foreground-muted mt-1">
                  Publiser oppdateringer, arrangementer og tilbud direkte på Tønsberglivets Google Maps og Søk-profil.
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  googleBusinessConfigured
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    : 'bg-surface-muted text-foreground-muted border border-border'
                }`}
              >
                {googleBusinessConfigured ? 'Google Tilkoblet' : 'Ikke tilkoblet'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                  Google Account ID
                </label>
                <input
                  type="text"
                  value={googleBusinessAccountId}
                  onChange={(e) => setGoogleBusinessAccountId(e.target.value)}
                  placeholder="accounts/109823478912"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-mono text-foreground focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                  Google Location ID
                </label>
                <input
                  type="text"
                  value={googleBusinessLocationId}
                  onChange={(e) => setGoogleBusinessLocationId(e.target.value)}
                  placeholder="locations/tonsberg-sentrum-loc"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-mono text-foreground focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
                  <span>Google OAuth Access Token</span>
                  <a
                    href="https://developers.google.com/my-business"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-[11px] font-semibold inline-flex items-center gap-1"
                  >
                    Google Business API Docs <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <div className="relative">
                  <input
                    type={showGoogleToken ? 'text' : 'password'}
                    value={googleBusinessAccessToken}
                    onChange={(e) => setGoogleBusinessAccessToken(e.target.value)}
                    placeholder="ya29..."
                    className="w-full pr-12 pl-4 py-3 bg-background border border-border rounded-xl text-sm font-mono text-foreground focus:ring-2 focus:ring-primary outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGoogleToken(!showGoogleToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground p-1"
                  >
                    {showGoogleToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleQuickConnectGoogle}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <Building className="w-3.5 h-3.5" />
                Koble til Google-konto (Hurtigoppsett)
              </button>
            </div>
          </div>

          {/* Test av kanaler */}
          <div className="p-5 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm text-foreground">Verifiser SoMe & Google-forbindelser</h4>
              <p className="text-xs text-foreground-muted mt-0.5">
                Kjører en simulert eller skarp test av publisering til Facebook, FB-gruppe, Instagram og Google Business Profile.
              </p>
            </div>
            <button
              type="button"
              onClick={handleTestSocialPublish}
              disabled={testingSocial}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-muted hover:bg-border text-foreground font-bold text-xs rounded-xl transition-colors border border-border shrink-0 disabled:opacity-50"
            >
              {testingSocial ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-primary" />}
              {testingSocial ? 'Tester...' : 'Test Kanal-publisering'}
            </button>
          </div>
          {socialTestResult && (
            <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-xl text-xs text-foreground font-medium">
              {socialTestResult}
            </div>
          )}
        </div>
      )}

      {/* TAB: STYRINGSRETT & AUTONOMI */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          {/* Overordnet autonominivå */}
          <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Styringsrett & Autonomigrad (SEO & Innholdsmotor)
              </h3>
              <p className="text-sm text-foreground-muted mt-1">
                Bestem hvor mye frihet motoren har til å publisere, versus hvor mye som krever manuell godkjenning av deg eller redaksjonen.
              </p>
            </div>

            {/* 3-nivås velger */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div
                onClick={() => setAutonomyMode('manual')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 ${
                  autonomyMode === 'manual'
                    ? 'border-primary bg-primary/5 shadow-xs'
                    : 'border-border bg-surface hover:border-border-strong'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> 1. Manuell kontroll
                  </span>
                  <input
                    type="radio"
                    name="autonomy"
                    checked={autonomyMode === 'manual'}
                    onChange={() => setAutonomyMode('manual')}
                    className="text-primary focus:ring-primary"
                  />
                </div>
                <h4 className="font-bold text-sm text-foreground">Co-Pilot (Full godkjenning)</h4>
                <p className="text-xs text-foreground-muted leading-relaxed">
                  Alt innhold opprettes utelukkende som <strong>Utkast</strong>. Ingenting går live på nettsiden eller sosiale medier uten at du aktivt trykker «Godkjenn og publiser».
                </p>
              </div>

              <div
                onClick={() => setAutonomyMode('hybrid')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 ${
                  autonomyMode === 'hybrid'
                    ? 'border-primary bg-primary/5 shadow-xs'
                    : 'border-border bg-surface hover:border-border-strong'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4" /> 2. Hybrid (Anbefalt)
                  </span>
                  <input
                    type="radio"
                    name="autonomy"
                    checked={autonomyMode === 'hybrid'}
                    onChange={() => setAutonomyMode('hybrid')}
                    className="text-primary focus:ring-primary"
                  />
                </div>
                <h4 className="font-bold text-sm text-foreground">Smart Godkjenning</h4>
                <p className="text-xs text-foreground-muted leading-relaxed">
                  Rutineoppgaver og arrangementssynk skjer automatisk. Innhold forberedes i <em>sweet-spot</em> (14 dager før) og venter på 1-klikks godkjenning via mobil/admin.
                </p>
              </div>

              <div
                onClick={() => setAutonomyMode('auto')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 ${
                  autonomyMode === 'auto'
                    ? 'border-primary bg-primary/5 shadow-xs'
                    : 'border-border bg-surface hover:border-border-strong'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> 3. Full Autopilot
                  </span>
                  <input
                    type="radio"
                    name="autonomy"
                    checked={autonomyMode === 'auto'}
                    onChange={() => setAutonomyMode('auto')}
                    className="text-primary focus:ring-primary"
                  />
                </div>
                <h4 className="font-bold text-sm text-foreground">Helautomatisert drift</h4>
                <p className="text-xs text-foreground-muted leading-relaxed">
                  Både datainnhenting, artikkelskriving, SEO-tagging og publisering skjer automatisk. Du mottar en løpende logg med umiddelbar angreknapp.
                </p>
              </div>
            </div>

            {/* Granulære brytere */}
            <div className="pt-6 border-t border-border space-y-4">
              <h4 className="font-bold text-sm text-foreground">Granulære oppgavebrytere (Mikrostyring)</h4>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface-muted/50 border border-border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoPublishArticles}
                    onChange={(e) => setAutoPublishArticles(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-primary border-border focus:ring-primary"
                  />
                  <div>
                    <span className="font-bold text-sm text-foreground block">
                      Auto-publiser artikler og guider direkte
                    </span>
                    <span className="text-xs text-foreground-muted block mt-0.5">
                      Når denne er <strong>av</strong>, opprettes alle AI-artikler trygt som «Utkast» i CMS-et og krever din godkjenning.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface-muted/50 border border-border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoPublishEvents}
                    onChange={(e) => setAutoPublishEvents(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-primary border-border focus:ring-primary"
                  />
                  <div>
                    <span className="font-bold text-sm text-foreground block">
                      Auto-synk og publiser konserter fra Ticketmaster & kulturkilder
                    </span>
                    <span className="text-xs text-foreground-muted block mt-0.5">
                      Legger verifiserte konserter og forestillinger direkte inn i kalenderen under /eventer.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface-muted/50 border border-border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRedirectExpired}
                    onChange={(e) => setAutoRedirectExpired(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-primary border-border focus:ring-primary"
                  />
                  <div>
                    <span className="font-bold text-sm text-foreground block">
                      Auto-opprett permanente 301-omdirigeringer for utgåtte arrangementer
                    </span>
                    <span className="text-xs text-foreground-muted block mt-0.5">
                      Sørger for at utgåtte arrangements-URL-er automatisk omdirigeres til /eventer slik at siden aldri kaster 404 og overfører 100 % SEO-autoritet.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface-muted/50 border border-border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoApproveBookings}
                    onChange={(e) => setAutoApproveBookings(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-primary border-border focus:ring-primary"
                  />
                  <div>
                    <span className="font-bold text-sm text-foreground block">
                      Automatisk forhåndsgodkjenning av torvleie ved ledig kapasitet
                    </span>
                    <span className="text-xs text-foreground-muted block mt-0.5">
                      Dersom det ikke er datokollisjon i valgt torgsone, settes forespørselen direkte til behandling og varsler teamet.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Varslingsadresse */}
            <div className="pt-6 border-t border-border space-y-2">
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                Hoved-epostadresse for administrative varsler & godkjenninger
              </label>
              <input
                type="email"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                className="w-full max-w-md px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary outline-none"
              />
              <p className="text-xs text-foreground-muted">
                Her mottar du varsler når artikler ligger klare i utkastkøen eller trenger godkjenning.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
