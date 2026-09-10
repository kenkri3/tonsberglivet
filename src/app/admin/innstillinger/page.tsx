'use client';

import { useState, useEffect } from 'react';
import { 
  Key, Mail, Bot, Bell, Calendar, ShieldCheck, 
  Save, Check, Eye, EyeOff, RefreshCw, Send, Sparkles, Building2
} from 'lucide-react';

interface SettingField {
  key: string;
  label: string;
  description: string;
  category: 'email' | 'ai' | 'notifications' | 'sync' | 'finance';
  isSecret: boolean;
  placeholder: string;
}

const settingFields: SettingField[] = [
  {
    key: 'resend_api_key',
    label: 'Resend API Key',
    description: 'Nøkkel for automatisk utsendelse av leiebekreftelser til torvleietakere.',
    category: 'email',
    isSecret: true,
    placeholder: 're_123456789...',
  },
  {
    key: 'smtp_url',
    label: 'SMTP URL (Fallback)',
    description: 'Valgfri SMTP-forbindelse dersom Resend ikke benyttes.',
    category: 'email',
    isSecret: true,
    placeholder: 'smtp://bruker:passord@smtp.eksempel.no:587',
  },
  {
    key: 'gemini_api_key',
    label: 'Google Gemini API Key',
    description: 'Brukt av Copilot Studio og autonom Slack/Teams-agent for naturlig språk.',
    category: 'ai',
    isSecret: true,
    placeholder: 'AIzaSy...',
  },
  {
    key: 'agent_webhook_url',
    label: 'Slack / Teams / Discord Webhook URL',
    description: 'Mottar interaktive handlingskort ved nye bookinger og nattlig morgensammendrag.',
    category: 'notifications',
    isSecret: false,
    placeholder: 'https://hooks.slack.com/services/...',
  },
  {
    key: 'ticketmaster_api_key',
    label: 'Ticketmaster API Key',
    description: 'Henter sanntids kultur- og konsertarrangementer i Tønsberg for kalender og byskjermer.',
    category: 'sync',
    isSecret: true,
    placeholder: 'tm_api_key...',
  },
  {
    key: 'cron_secret',
    label: 'CRON_SECRET (Nattlig Synk)',
    description: 'Beskytter /api/cron/daily-sync mot uautoriserte kall.',
    category: 'sync',
    isSecret: true,
    placeholder: 'tonsberg_cron_secret_2026',
  },
  {
    key: 'duett_webhook_url',
    label: 'Duett ERP / Regnskap Webhook URL',
    description: 'Oversender automatisk genererte EHF 3.0 fakturagrunnlag til regnskapsfører.',
    category: 'finance',
    isSecret: false,
    placeholder: 'https://api.duett.no/webhook/...',
  },
];

export default function InnstillingerPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'email' | 'ai' | 'notifications' | 'sync' | 'finance'>('all');
  const [values, setValues] = useState<Record<string, string>>({});
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          const map: Record<string, string> = {};
          res.data.forEach((item: any) => {
            map[item.key] = item.value || '';
          });
          setValues(map);
        }
      })
      .catch((e) => console.error('Failed to load settings:', e));
  }, []);

  const handleSave = async (key: string, isSecret: boolean, description: string) => {
    setSavingKey(key);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          value: values[key] || '',
          isSecret,
          description,
        }),
      });
      if (res.ok) {
        setSavedKey(key);
        setTimeout(() => setSavedKey(null), 2500);
      }
    } catch (err) {
      console.error('Save setting error:', err);
    } finally {
      setSavingKey(null);
    }
  };

  const handleTriggerDailySync = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const secret = values['cron_secret'] || 'tonsberg_cron_secret_2026';
      const res = await fetch(`/api/cron/daily-sync?key=${encodeURIComponent(secret)}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setTestResult(`✅ Synk fullført på ${data.executionTimeMs}ms! ${data.data.message}`);
      } else {
        setTestResult(`❌ Feil ved synk: ${data.error || 'Ukjent feil'}`);
      }
    } catch (e: any) {
      setTestResult(`❌ Kunne ikke kalle cron-rute: ${e?.message}`);
    } finally {
      setIsTesting(false);
      setTimeout(() => setTestResult(null), 8000);
    }
  };

  const filteredFields = settingFields.filter((f) => {
    if (activeTab === 'all') return true;
    return f.category === activeTab;
  });

  return (
    <div className="space-y-10 pb-16">
      
      {/* ── Toppseksjon ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-foreground tracking-tight">Systeminnstillinger (BYOK)</h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-light text-primary border border-primary/20">
              Bring Your Own Key
            </span>
          </div>
          <p className="text-xs md:text-sm text-foreground-muted mt-1">
            Konfigurer API-nøkler, e-post, AI-modell, Ticketmaster og regnskapstilkobling for Tønsberglivet.
          </p>
        </div>

        <button
          onClick={handleTriggerDailySync}
          disabled={isTesting}
          className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
          <span>{isTesting ? 'Kjører bakgrunnssynk...' : 'Kjør Nattlig Synk Nå'}</span>
        </button>
      </div>

      {testResult && (
        <div className="p-4 rounded-2xl bg-surface border border-primary/30 text-foreground text-xs font-bold flex items-center justify-between shadow-xs">
          <span>{testResult}</span>
          <button onClick={() => setTestResult(null)} className="text-foreground-muted hover:text-foreground">Lukk</button>
        </div>
      )}

      {/* ── Kategori-velger ── */}
      <div className="flex flex-wrap gap-2 bg-surface-muted p-1.5 rounded-2xl border border-border">
        {[
          { id: 'all', label: 'Alle Innstillinger', icon: Key },
          { id: 'email', label: 'E-post (Resend/SMTP)', icon: Mail },
          { id: 'ai', label: 'AI & Copilot (Gemini)', icon: Bot },
          { id: 'notifications', label: 'Varsler & Webhook', icon: Bell },
          { id: 'sync', label: 'Ticketmaster & Cron', icon: Calendar },
          { id: 'finance', label: 'Duett ERP / Regnskap', icon: Building2 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-xs'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Konfigurasjonskort ── */}
      <div className="grid grid-cols-1 gap-6">
        {filteredFields.map((field) => {
          const isSecret = field.isSecret;
          const isRevealed = showSecret[field.key];
          const isSaving = savingKey === field.key;
          const isSaved = savedKey === field.key;

          return (
            <div
              key={field.key}
              className="bg-surface border border-border rounded-3xl p-6 md:p-8 shadow-xs hover:border-foreground-muted/40 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-foreground">{field.label}</h3>
                    <span className="font-mono text-[11px] text-foreground-muted px-2 py-0.5 rounded-md bg-surface-muted border border-border">
                      {field.key}
                    </span>
                  </div>
                  <p className="text-xs text-foreground-muted mt-1">{field.description}</p>
                </div>

                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider self-start sm:self-auto ${
                  values[field.key] ? 'bg-success-light text-success border border-success/20' : 'bg-surface-muted text-foreground-muted border border-border'
                }`}>
                  {values[field.key] ? 'Konfigurert' : 'Standard Fallback'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <div className="relative flex-1">
                  <input
                    type={isSecret && !isRevealed ? 'password' : 'text'}
                    placeholder={field.placeholder}
                    value={values[field.key] || ''}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-surface-muted border border-border rounded-xl text-xs font-mono text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all pr-10"
                  />
                  {isSecret && (
                    <button
                      type="button"
                      onClick={() =>
                        setShowSecret((prev) => ({ ...prev, [field.key]: !prev[field.key] }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground p-1"
                    >
                      {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleSave(field.key, field.isSecret, field.description)}
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50 shrink-0"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Lagrer...</span>
                    </>
                  ) : isSaved ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Lagret!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Lagre Nøkkel</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
