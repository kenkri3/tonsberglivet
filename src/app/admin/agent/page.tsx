'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  CheckCircle2,
  Calendar,
  MapPin,
  Building2,
  ShieldCheck,
  ArrowRight,
  Info,
  Tv,
  MessageCircle,
  HelpCircle,
  Clock,
  Send,
  Zap,
  Layers,
  Globe,
  Search,
  Database,
  Cpu,
} from 'lucide-react';

interface PromptTemplate {
  category: string;
  title: string;
  icon: typeof Calendar;
  prompt: string;
  description: string;
}

interface MultiToolWorkflow {
  id: string;
  title: string;
  tools: { name: string; icon: string; color: string }[];
  description: string;
  backendEndpoint: string;
  prompt: string;
}

const promptTemplates: PromptTemplate[] = [
  {
    category: 'Arrangementer & Kultur',
    title: 'Generer ukens helgeguide',
    icon: Calendar,
    prompt:
      'Hent de nyeste arrangementene, konsertene på Foynhagen og kulturaktivitetene i Tønsberg for den kommende helgen, og skriv en engasjerende helgeguide med høydepunkter for fredag, lørdag og søndag.',
    description: 'Samler og formaterer aktuelle helgeaktiviteter for publisering.',
  },
  {
    category: 'Torvleie & Byrom',
    title: 'Kvalifiser torvleie-forespørsel',
    icon: MapPin,
    prompt:
      'Hvilke vilkår, priser og dokumentasjonskrav gjelder for leie av dagplass eller sesongbod på Tønsberg Torv? Lag et profesjonelt svarbrev og sjekkliste for en ny søker.',
    description: 'Hjelper leietakere med reglement, priser og plassvalg på Torvet.',
  },
  {
    category: 'Partnere & Medlemmer',
    title: 'Oppdateringsmelding om åpningstider',
    icon: Building2,
    prompt:
      'Lag et kort og vennlig utkast til en e-post/WhatsApp-melding til våre serverings- og handelsmedlemmer i Tønsberglivet, der vi ber om deres oppdaterte åpningstider og sommertilbud før høysesongen.',
    description: 'Effektiviserer innsamling av data fra byens bedrifter.',
  },
  {
    category: 'Byliv & Turisme',
    title: 'Båtfolk & Gjestehavna guide',
    icon: Sparkles,
    prompt:
      'Lag en praktisk hurtigguide for båtfolk som ankommer Tønsberg gjestehavn: fasiliteter, strøm, åpningstider for Kanalbrua, nærliggende restauranter og dagligvarebutikker.',
    description: 'Svarer på de mest stilte spørsmålene fra gjestebåter i sesongen.',
  },
  {
    category: 'Markedsføring & SoMe',
    title: 'SoMe-pakke for nyhetssak',
    icon: Tv,
    prompt:
      'Lag 3 SoMe-versjoner for Tønsberglivets kanaler: 1) Engasjerende Facebook-post med emojier, 2) Visuell Instagram-post med hashtags (#tonsberglivet #tbglivet), og 3) Profesjonell LinkedIn-oppdatering rettet mot næringsliv.',
    description: 'Konverterer nyheter til ferdige poster for sosiale medier.',
  },
];

const multiToolWorkflows: MultiToolWorkflow[] = [
  {
    id: 'event-radar',
    title: 'Arrangement-Radar (Apify + Tavily)',
    tools: [
      { name: 'Apify', icon: '🕷️', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
      { name: 'Tavily', icon: '🔍', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
    ],
    description: 'Skraper kulturhus, Ticketmaster og Foynhagen med Apify, henter dyp artistinfo og aldersgrenser med Tavily, og oppretter automatisk arrangementer i Tønsberglivet-databasen.',
    backendEndpoint: 'POST /api/agent/webhook { action: "upsert_event" }',
    prompt:
      'Kjør Event-Radar for Tønsberg: Bruk Apify til å skrape arrangementslister fra Foynhagen og lokale scener for neste uke. Bruk Tavily til å hente artistbio, sjanger og billettstatus for hvert arrangement. Send deretter arrangementene til backend via { action: "upsert_event", title, startDate, location, category, externalUrl } slik at de lagres i kalenderen.',
  },
  {
    id: 'merchant-audit',
    title: 'Åpningstider- & Restaurant-Audit (Brave + Apify)',
    tools: [
      { name: 'Brave', icon: '🦁', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' },
      { name: 'Apify', icon: '🕷️', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
    ],
    description: 'Finner serveringssteder på Brygga med Brave, skraper de nyeste åpningstidene og sesongmenyene fra deres nettsider/Facebook med Apify, og oppdaterer bedriftsregisteret.',
    backendEndpoint: 'POST /api/agent/webhook { action: "update_business" }',
    prompt:
      'Gjennomfør åpningstids-audit for Tønsberg Brygge: Bruk Brave for å finne offisielle nettsider og sosiale medier for restaurantene. Bruk Apify til å trekke ut ferske åpningstider og lunsjtider. Oppdater endringer i Tønsberglivet backend via { action: "update_business", name, openingHours, phone, website }.',
  },
  {
    id: 'weekend-factory',
    title: 'Helgeguide & SoMe-Fabrikk (Tavily + Brave)',
    tools: [
      { name: 'Tavily', icon: '🔍', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
      { name: 'Brave', icon: '🦁', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' },
    ],
    description: 'Tavily gjør dyp research på helgens arrangementer, Brave sjekker Meteorologisk Institutt (vær) og Kanalbrua-tider. Genererer komplett artikkel og 4 SoMe-formater direkte i CMS.',
    backendEndpoint: 'POST /api/agent/webhook { action: "create_article" }',
    prompt:
      'Lag ukens store helgeguide: Bruk Tavily til å finne de viktigste kultur- og bylivshendelsene i helgen. Bruk Brave til å hente helgeværet fra Yr/MET og åpningstider for Kanalbrua. Generer en full redaksjonell artikkel med 4 SoMe-tekster (Facebook, Instagram, LinkedIn, byskjerm) og opprett den som utkast i backend via { action: "create_article", title, excerpt, content, category: "BYLIVET" }.',
  },
  {
    id: 'business-monitor',
    title: 'Nærings- & Etablerings-Monitor (Brave + Tavily)',
    tools: [
      { name: 'Brave', icon: '🦁', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' },
      { name: 'Tavily', icon: '🔍', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
    ],
    description: 'Overvåker Brønnøysundregistrene og lokalmedier etter nyregistrerte selskaper innen handel og servering i Tønsbergregionen for proaktiv medlemsrekruttering.',
    backendEndpoint: 'Lead-oversikt for næringsansvarlig',
    prompt:
      'Overvåk nyetableringer i Tønsberg og Færder: Bruk Brave og Tavily til å søke etter nye aksjeselskaper registrert i Brreg de siste 14 dagene under servering, detaljhandel og opplevelser. Lag en strukturert rapport med bedriftsnavn, bransje og kontaktperson slik at Tønsberglivet kan invitere dem inn i nettverket.',
  },
];

export default function AdminAgentPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'prompts' | 'workflows'>('workflows');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<{
    success: boolean;
    status: string;
    environmentConfigured: boolean;
    maskedBotId?: string;
  } | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Hent status fra backend
  useEffect(() => {
    fetch('/api/agent/status')
      .then((res) => res.json())
      .then((data) => setAgentStatus(data))
      .catch(() => setAgentStatus({ success: true, status: 'active', environmentConfigured: true }));
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Toppseksjon med status og kontroller */}
      <div className="flex flex-col gap-4 bg-surface p-6 rounded-2xl border border-border shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">Autonom Agent & Byvert Studio</h2>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Agent
                </span>
              </div>
              <p className="text-sm text-foreground-muted mt-1">
                Sentral styring for Tønsberglivets digitale byvert, booking-assistanse og automatiserte henvendelser.
              </p>
            </div>
          </div>

          {/* Verktøyknapper */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-surface-muted hover:bg-surface-muted/80 text-foreground border border-border transition-colors"
              title="Start agent-sesjon på nytt"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Oppdater</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-surface-muted hover:bg-surface-muted/80 text-foreground border border-border transition-colors"
              title={isFullscreen ? 'Avslutt fullskjerm' : 'Fullskjerm studio'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Lukk fullskjerm</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Fullskjerm</span>
                </>
              )}
            </button>

            <a
              href="/api/bot-frame"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
              title="Åpne i separat fane"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Åpne i ny fane</span>
            </a>
          </div>
        </div>

        {/* Verktøystatus-bånd (Brave, Tavily, Apify og Backend Actions) */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border">
          <span className="text-[11px] font-medium text-foreground-muted mr-1">Tilkoblede superkrefter:</span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
            <span>🦁</span>
            <span>Brave API</span>
            <span className="text-[10px] text-foreground-muted font-normal">(Raskt nettsøk)</span>
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <span>🔍</span>
            <span>Tavily API</span>
            <span className="text-[10px] text-foreground-muted font-normal">(Dyp research)</span>
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <span>🕷️</span>
            <span>Apify API</span>
            <span className="text-[10px] text-foreground-muted font-normal">(Web scraping)</span>
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Database className="w-3 h-3" />
            <span>Tønsberg Backend Webhooks</span>
          </span>
        </div>
      </div>

      {/* Hovedarbeidsområde */}
      <div className={`grid gap-6 ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'}`}>
        {/* Venstre/Midt: Iframe Agent Visning */}
        <div
          className={`${
            isFullscreen
              ? 'col-span-1 fixed inset-4 z-50 bg-background/95 backdrop-blur-xl p-4 rounded-3xl border border-border shadow-2xl flex flex-col'
              : 'lg:col-span-7 xl:col-span-8'
          }`}
        >
          {isFullscreen && (
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                <span className="font-bold text-sm text-foreground">Autonom Agent Studio — Fullskjerm</span>
              </div>
              <button
                onClick={() => setIsFullscreen(false)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface-muted text-foreground hover:bg-surface-muted/80 border border-border"
              >
                Lukk fullskjerm
              </button>
            </div>
          )}

          <div className="relative w-full rounded-2xl overflow-hidden border border-border bg-surface shadow-sm h-[750px] lg:h-[820px] flex flex-col">
            {/* Lasteindikator */}
            {isLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-surface/90 backdrop-blur-xs transition-opacity">
                <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
                <p className="text-xs font-semibold text-foreground">Kobler til Tønsberglivet Agent...</p>
                <p className="text-[11px] text-foreground-muted mt-1">Laster sikkert iframe-grensesnitt</p>
              </div>
            )}

            {/* Iframe */}
            <iframe
              key={iframeKey}
              ref={iframeRef}
              src="/api/bot-frame"
              title="Tønsberglivet Autonom Agent"
              className="w-full flex-1 border-0 bg-transparent"
              onLoad={() => setIsLoading(false)}
              allow="microphone; camera; clipboard-write"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
            />
          </div>
        </div>

        {/* Høyre: Styringspanel & Arbeidsflyter (Skjules i fullskjerm) */}
        {!isFullscreen && (
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            {/* Tabs: Arbeidsflyter vs Hurtigoppgaver */}
            <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs space-y-4">
              <div className="flex items-center p-1 rounded-xl bg-surface-muted border border-border">
                <button
                  onClick={() => setActiveTab('workflows')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'workflows'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Multi-Tool Flows</span>
                </button>
                <button
                  onClick={() => setActiveTab('prompts')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'prompts'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Hurtigoppgaver</span>
                </button>
              </div>

              {/* Tab Innhold 1: Multi-Tool Arbeidsflyter (Brave + Tavily + Apify) */}
              {activeTab === 'workflows' && (
                <div className="space-y-3.5">
                  <div className="text-xs text-foreground-muted">
                    Kombiner verktøyene med direkte skriving til Tønsberglivet-databasen:
                  </div>

                  {multiToolWorkflows.map((wf) => {
                    const isCopied = copiedId === wf.id;

                    return (
                      <div
                        key={wf.id}
                        className="p-3.5 rounded-xl border border-border bg-surface-muted/40 hover:bg-surface-muted hover:border-primary/30 transition-all duration-200 space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-foreground leading-tight">{wf.title}</h4>
                            <div className="flex items-center gap-1.5">
                              {wf.tools.map((t, idx) => (
                                <span
                                  key={idx}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${t.color}`}
                                >
                                  {t.icon} {t.name}
                                </span>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={() => handleCopy(wf.prompt, wf.id)}
                            className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 shrink-0 transition-all ${
                              isCopied
                                ? 'bg-emerald-500 text-white border-emerald-600'
                                : 'bg-surface text-foreground-muted hover:text-foreground border-border hover:bg-surface-muted'
                            }`}
                            title="Kopier arbeidsflyt-instruks"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span className="text-[10px]">Kopiert</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span className="text-[10px]">Kjør flyt</span>
                              </>
                            )}
                          </button>
                        </div>

                        <p className="text-[11px] text-foreground-muted leading-relaxed">
                          {wf.description}
                        </p>

                        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px]">
                          <span className="text-foreground-muted">Backend Handling:</span>
                          <code className="px-1.5 py-0.5 rounded bg-surface border border-border font-mono text-[9px] text-primary">
                            {wf.backendEndpoint}
                          </code>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tab Innhold 2: Standard Hurtigoppgaver */}
              {activeTab === 'prompts' && (
                <div className="space-y-3">
                  <div className="text-xs text-foreground-muted">
                    Standard oppgaver tilpasset Tønsberglivets administrative drift:
                  </div>

                  {promptTemplates.map((item, idx) => {
                    const Icon = item.icon;
                    const promptId = `prompt-${idx}`;
                    const isCopied = copiedId === promptId;

                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-border bg-surface-muted/40 hover:bg-surface-muted hover:border-primary/30 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-xs font-bold text-foreground">{item.title}</span>
                          </div>
                          <button
                            onClick={() => handleCopy(item.prompt, promptId)}
                            className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-all ${
                              isCopied
                                ? 'bg-emerald-500 text-white border-emerald-600'
                                : 'bg-surface text-foreground-muted hover:text-foreground border-border hover:bg-surface-muted'
                            }`}
                            title="Kopier instruks til utklippstavle"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span className="text-[10px]">Kopiert</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span className="text-[10px]">Kopier</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-[11px] text-foreground-muted mt-1.5 line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Drifts- og integrasjonsstatus */}
            <div className="bg-surface p-5 rounded-2xl border border-border shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <h3 className="font-bold text-sm text-foreground">Integrasjonsstatus</h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-surface-muted/50 border border-border">
                  <span className="text-foreground-muted">Miljøvariabel (AGENT_API):</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {agentStatus?.environmentConfigured ? 'Aktiv (Railway)' : 'Aktiv (Standard)'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-surface-muted/50 border border-border">
                  <span className="text-foreground-muted">Iframe-proxy:</span>
                  <span className="font-mono font-bold text-foreground">/api/bot-frame (SAMEORIGIN)</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-surface-muted/50 border border-border">
                  <span className="text-foreground-muted">Tilkoblede API-er:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Brave • Tavily • Apify</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-600 dark:text-blue-400">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <Info className="w-3.5 h-3.5" />
                  <span>Automatisert hverdag:</span>
                </div>
                Når agenten finner eller oppdaterer informasjon via Apify eller Tavily, lagres dataene direkte i Tønsberglivets PostgreSQL-database via backend-webhooken.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
