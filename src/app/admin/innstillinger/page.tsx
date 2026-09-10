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
} from 'lucide-react';

export default function InnstillingerPage() {
  const [activeTab, setActiveTab] = useState<'byok' | 'agent' | 'general'>('byok');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // BYOK & Keys
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [ticketmasterApiKey, setTicketmasterApiKey] = useState('');
  const [geminiConfigured, setGeminiConfigured] = useState(false);
  const [ticketmasterConfigured, setTicketmasterConfigured] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [testingAi, setTestingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<string | null>(null);

  // Agent & Webhooks
  const [slackWebhookUrl, setSlackWebhookUrl] = useState('');
  const [teamsWebhookUrl, setTeamsWebhookUrl] = useState('');
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState('');
  const [slackConfigured, setSlackConfigured] = useState(false);
  const [teamsConfigured, setTeamsConfigured] = useState(false);
  const [discordConfigured, setDiscordConfigured] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState<string | null>(null);

  // General & Automation
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
        setTicketmasterApiKey(json.data.ticketmasterApiKey || '');
        setTicketmasterConfigured(json.data.ticketmasterConfigured);
        setSlackWebhookUrl(json.data.slackWebhookUrl || '');
        setSlackConfigured(json.data.slackConfigured);
        setTeamsWebhookUrl(json.data.teamsWebhookUrl || '');
        setTeamsConfigured(json.data.teamsConfigured);
        setDiscordWebhookUrl(json.data.discordWebhookUrl || '');
        setDiscordConfigured(json.data.discordConfigured);
        setNotificationEmail(json.data.notificationEmail || 'hei@tonsberglivet.no');
        setAutoApproveBookings(!!json.data.autoApproveBookings);
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
          ticketmasterApiKey,
          slackWebhookUrl,
          teamsWebhookUrl,
          discordWebhookUrl,
          notificationEmail,
          autoApproveBookings,
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
        setAiTestResult('✅ Nøkkel er verifisert og aktiv! Gemini svarte uten problemer.');
      } else {
        setAiTestResult('❌ Test feilet: ' + (data.error || 'Ugyldig nøkkel'));
      }
    } catch (err) {
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
    } catch (err) {
      setWebhookTestResult('❌ Kunne ikke teste agent-endepunktet.');
    } finally {
      setTestingWebhook(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      {/* Topp-header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">System & Integrasjoner</h2>
          <p className="text-foreground-muted text-sm mt-1">
            Administrer egne API-nøkler (BYOK), den autonome mobilagenten og varslingsrutiner for Tønsberglivet.
          </p>
        </div>
        <button
          onClick={() => handleSave()}
          disabled={saving || loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Lagre endringer
        </button>
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
      <div className="flex border-b border-border gap-2">
        <button
          onClick={() => setActiveTab('byok')}
          className={`flex items-center gap-2 px-4 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'byok'
              ? 'border-primary text-primary'
              : 'border-transparent text-foreground-muted hover:text-foreground'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          KI & API-nøkler (BYOK)
          {geminiConfigured && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block ml-1" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('agent')}
          className={`flex items-center gap-2 px-4 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'agent'
              ? 'border-primary text-primary'
              : 'border-transparent text-foreground-muted hover:text-foreground'
          }`}
        >
          <Bot className="w-4 h-4" />
          Autonom Mobilagent (Slack / Teams)
          {(slackConfigured || teamsConfigured || discordConfigured) && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block ml-1" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'general'
              ? 'border-primary text-primary'
              : 'border-transparent text-foreground-muted hover:text-foreground'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Automatisering & Rutiner
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
                  Google Gemini API (Kunstig Intelligens)
                </h3>
                <p className="text-sm text-foreground-muted mt-1">
                  Brukes av redaksjonell Copilot, SoMe-generering og automatisk bildeanalyse med GDPR-tagging.
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
                Google Gemini API-nøkkel
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-subtle hover:text-foreground p-1"
                >
                  {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <span className="text-foreground-muted">
                  Nøkkelen lagres trygt på serveren og benyttes kun for Tønsberglivet.
                </span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-bold inline-flex items-center gap-1"
                >
                  Hent gratis Gemini-nøkkel fra Google AI Studio <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-muted border border-border text-xs text-foreground-muted space-y-2">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <ShieldAlert className="w-4 h-4 text-primary" />
                Null kostnader & Gratis kvote:
              </div>
              <p>
                Google AI Studio tilbyr en gratis kvote for Gemini 2.5 Flash som tillater opptil 15 forespørsler per minutt.
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

          <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">Ticketmaster Discovery API</h3>
                <p className="text-sm text-foreground-muted mt-1">
                  Brukes for sanntidssynkronisering av konserter og kulturarrangementer i Tønsberg og Foynhagen.
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
              <input
                type="text"
                value={ticketmasterApiKey}
                onChange={(e) => setTicketmasterApiKey(e.target.value)}
                placeholder="Valgfri Ticketmaster Developer API-nøkkel..."
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-mono text-foreground focus:ring-2 focus:ring-primary outline-none"
              />
              <p className="text-xs text-foreground-muted">
                Dersom denne utelates, benytter portalen den innebygde arrangementsfeeden for Vestfold.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AGENT */}
      {activeTab === 'agent' && (
        <div className="space-y-6">
          <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                Autonom Mobilagent (Slack / Microsoft Teams / Discord)
              </h3>
              <p className="text-sm text-foreground-muted mt-1">
                La damene styre portalen direkte fra mobiltelefonen. Motta godkjenningsknapper for torvleie, svarutkast på meldinger og generer innhold rett fra chat.
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
                Hvordan damene bruker agenten på mobilen:
              </div>
              <ul className="space-y-1.5 text-foreground-muted pl-1">
                <li>• <strong className="text-foreground">/tb status</strong> — Se dagens ventende henvendelser og bookinger.</li>
                <li>• <strong className="text-foreground">/tb godkjenn [id]</strong> — Godkjenner torvleie, sender leiekontrakt og klargjør Duett ERP faktura.</li>
                <li>• <strong className="text-foreground">/tb post [idé/stikkord]</strong> — Lager komplett artikkel, Instagram, Facebook og skjerm-tekst.</li>
                <li>• <strong className="text-foreground">/tb arrangementer</strong> — Viser helgens konserter og show fra Ticketmaster.</li>
              </ul>
              <div className="pt-2 text-foreground-subtle border-t border-border">
                Webhook mottaks-URL for Slack Event Subscriptions: <code className="bg-background px-2 py-0.5 rounded font-mono text-foreground">https://tonsberglivet.no/api/agent/webhook</code>
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

      {/* TAB 3: GENERAL */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-foreground">Varslingsrutiner og Byrom</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                  Hoved-epostadresse for varsler
                </label>
                <input
                  type="email"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  className="w-full max-w-md px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary outline-none"
                />
                <p className="text-xs text-foreground-muted">
                  Alle bekreftelser og varsler til leietakere og publikum sendes fra eller via denne adressen.
                </p>
              </div>

              <div className="pt-4 border-t border-border space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
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
          </div>
        </div>
      )}
    </div>
  );
}
