'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Mic,
  MicOff,
  RotateCcw,
  Copy,
  Check,
  Bot,
  User as UserIcon,
  Sparkles,
  RefreshCw,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  MoreVertical,
  Plus,
  Download,
  Keyboard,
  ExternalLink,
  FileText,
  X,
  CheckCircle2,
  Calendar,
  MapPin,
  Building2,
  Tv,
  CreditCard,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { formatAiMarkdown } from '@/lib/formatAiMarkdown';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  quickReplies?: Array<{ title: string; payload: string }>;
  articleData?: {
    title: string;
    category: string;
    excerpt?: string;
    content?: string;
    slug?: string;
  };
}

interface TonsbergAgentChatProps {
  className?: string;
  userName?: string;
  initialPrompt?: string;
  currentModule?: string;
  isSidePanel?: boolean;
  onPromptHandled?: () => void;
  onCloseSidePanel?: () => void;
}

export function TonsbergAgentChat({
  className = '',
  userName = 'Cecilie',
  initialPrompt,
  currentModule,
  isSidePanel = false,
  onPromptHandled,
  onCloseSidePanel,
}: TonsbergAgentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('Kobler til agenten...');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [sessionId] = useState(() => `tb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
  
  // Three-dots dropdown state
  const [menuOpen, setMenuOpen] = useState(false);
  const [showIntegrationsModal, setShowIntegrationsModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // In-Chat Canvas for active article or item preview
  const [activeCanvasItem, setActiveCanvasItem] = useState<{
    type: 'article' | 'booking' | 'some';
    title: string;
    category?: string;
    content?: string;
  } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastUserPromptRef = useRef<HTMLDivElement | null>(null);
  const loadingTimerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  const hasStartedChatting = messages.length > 0;

  // Context-sensitive starter chips
  const moduleChips = React.useMemo(() => {
    switch (currentModule) {
      case 'booking':
        return [
          { label: '📍 Kvalifiser torvleiesøknad', prompt: 'Kvalifiser den nyeste torvleiesøknaden for Foodtruck Spesial, beregn leiesats og utform godkjenningsbrev.' },
          { label: '⚡ Sjekk kapasitet & strøm', prompt: 'Hva er kapasiteten og tilgjengelig strømuttak (400V/32A) på Tønsberg Torv denne uken?' },
          { label: '📋 Reglement for salgsboder', prompt: 'Oppsummer reglement og dokumentasjonskrav for salgsboder på Torvet.' },
        ];
      case 'artikler':
        return [
          { label: '✍️ Skriv ny helgeguide', prompt: 'Hent de nyeste arrangementene, konsertene på Foynhagen og skriv en engasjerende helgeguide for fredag, lørdag og søndag.' },
          { label: '📣 Lag 3 SoMe-versjoner', prompt: 'Lag 3 SoMe-versjoner for siste publiserte nyhet: Facebook, Instagram og LinkedIn.' },
          { label: '🔍 Redaksjonell språkvask', prompt: 'Gjør en redaksjonell gjennomgang og forbedre ingress og overskrift for artikkelutkastene.' },
        ];
      case 'finance':
        return [
          { label: '💳 Eksporter til Duett ERP', prompt: 'Klargjør og overfør godkjente torvleier og DoOH-fakturaer direkte til Duett ERP med Peppol EHF 3.0.' },
          { label: '📊 Omsetningsrapport', prompt: 'Lag en oppsummering over månedens fakturerte leieinntekter for byrom og boder.' },
        ];
      case 'arrangementer':
        return [
          { label: '🎵 Konsert-Radar Foynhagen', prompt: 'Kjør Event-Radar for Foynhagen og Oseberg Kulturhus for neste helg, og oppdater arrangementstabellen.' },
          { label: '🔄 Synk Ticketmaster', prompt: 'Synkroniser de nyeste billettsalgene og arrangementene fra Ticketmaster API.' },
        ];
      case 'bedrifter':
        return [
          { label: '🏢 Åpningstids-audit Brygga', prompt: 'Gjennomfør en åpningstids-audit for restaurantene og serveringsstedene på Tønsberg Brygge.' },
          { label: '📬 Velkomstbrev nye medlemmer', prompt: 'Lag et profesjonelt velkomstbrev for nye bedrifter som etablerer seg i Tønsberg sentrum.' },
        ];
      default:
        return [
          { label: '✨ Skriv Helgeguide', prompt: 'Hent de nyeste arrangementene, konsertene på Foynhagen og kulturaktivitetene for helgen, og lag en helgeguide.' },
          { label: '📍 Sjekk Torvleie', prompt: 'Vis status på ventende torvleiesøknader og klargjør godkjenning.' },
          { label: '🎵 Konsert-Radar', prompt: 'Kjør Event-Radar for Foynhagen og Oseberg for kommende uke.' },
          { label: '🏢 Åpningstider Brygga', prompt: 'Sjekk åpningstider og sesongtilbud for serveringssteder på Brygga.' },
          { label: '💳 Duett EHF Faktura', prompt: 'Sjekk fakturastatus i Duett ERP og verifiser Peppol EHF-sendinger.' },
          { label: '📱 Lag SoMe-pakke', prompt: 'Lag en publiseringsklar SoMe-pakke for Tønsberglivets kanaler.' },
        ];
    }
  }, [currentModule]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollH = textareaRef.current.scrollHeight;
      const targetH = Math.min(Math.max(scrollH, 44), 140);
      textareaRef.current.style.height = `${targetH}px`;
    }
  }, [inputVal]);

  // Håndter initialPrompt
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt.trim());
      onPromptHandled?.();
    }
  }, [initialPrompt]);

  // Lytt på eksterne eventer fra hurtigknapper i portalen
  useEffect(() => {
    const handleExternalPrompt = (e: any) => {
      const text = e?.detail?.prompt || e?.detail?.text;
      if (text && typeof text === 'string' && text.trim()) {
        handleSendMessage(text.trim());
      }
    };
    window.addEventListener('tonsberg:agent-prompt', handleExternalPrompt);
    return () => {
      window.removeEventListener('tonsberg:agent-prompt', handleExternalPrompt);
    };
  }, [isLoading]);

  // Tastatursnarveier (Esc for å lukke menyer/canvas, Ctrl/Cmd+K for å fokusere)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (hasStartedChatting && textareaRef.current) {
          textareaRef.current.focus();
        } else if (heroInputRef.current) {
          heroInputRef.current.focus();
        }
      }
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setShowIntegrationsModal(false);
        setShowShortcutsModal(false);
        setActiveCanvasItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasStartedChatting]);

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    const userMsgId = `u-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
    }
    setIsLoading(true);

    // Scroll smoothly to this user prompt so the user starts reading from the top!
    setTimeout(() => {
      if (lastUserPromptRef.current) {
        lastUserPromptRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);

    const stages = [
      'Kobler til Tønsberglivet Agent...',
      'Analyserer instruksen og henter live systemdata...',
      'Formulerer svar og forbereder handlinger...',
    ];
    setLoadingStatus(stages[0]);

    if (loadingTimerRef.current) clearInterval(loadingTimerRef.current);
    let stageIdx = 0;
    loadingTimerRef.current = setInterval(() => {
      stageIdx++;
      if (stageIdx < stages.length) {
        setLoadingStatus(stages[stageIdx]);
      } else {
        clearInterval(loadingTimerRef.current);
      }
    }, 2200);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          sessionId,
          userName,
          currentModule,
        }),
      });

      if (!res.ok) throw new Error(`Feilkode ${res.status}`);

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Forespørselen er utført.',
        timestamp: new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' }),
        quickReplies: data.quickReplies && data.quickReplies.length > 0 ? data.quickReplies : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If an article or action was executed, broadcast an event so pages update live!
      if (data.actionExecuted) {
        window.dispatchEvent(
          new CustomEvent('tonsberg:action-completed', {
            detail: { action: data.actionExecuted, result: data.actionResult },
          })
        );
      }

      // Check if message mentions created article to optionally preview
      if (data.reply && data.reply.includes('Opprettet som artikkel i CMS')) {
        setActiveCanvasItem({
          type: 'article',
          title: 'Helgeguide — Tønsberglivet',
          category: 'Bylivet',
          content: data.reply,
        });
      }

      // Keep scroll anchored at the top of the interaction (DO NOT auto-scroll to the bottom of long text!)
      setTimeout(() => {
        if (lastUserPromptRef.current) {
          lastUserPromptRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 80);

    } catch (err: any) {
      console.error('Agent chat error:', err);
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Beklager, det oppstod en feil ved tilkobling til agenten. Vennligst prøv igjen om et øyeblikk.`,
        timestamp: new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      if (loadingTimerRef.current) {
        clearInterval(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (typeof window !== 'undefined' && window.innerWidth >= 768) {
        e.preventDefault();
        handleSendMessage(inputVal);
      }
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
    setInputVal('');
    setActiveCanvasItem(null);
    setMenuOpen(false);
  };

  const handleExportChat = () => {
    const text = messages
      .map((m) => `### ${m.role === 'user' ? userName : 'Tønsberglivet Agent'} (${m.timestamp})\n\n${m.content}\n`)
      .join('\n---\n\n');
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tonsberglivet-samtale-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setMenuOpen(false);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleMic = () => {
    if (isListeningMic) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListeningMic(false);
      return;
    }

    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Nettleseren støtter ikke tale-til-tekst.');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'nb-NO';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognitionRef.current = recognition;

      let captured = '';
      recognition.onstart = () => {
        setIsListeningMic(true);
      };

      recognition.onresult = (e: any) => {
        let text = '';
        for (let i = 0; i < e.results.length; i++) {
          text += e.results[i][0]?.transcript || '';
        }
        if (text.trim()) {
          captured = text.trim();
          setInputVal((prev) => (prev.trim() ? `${prev.trim()} ${captured}` : captured));
        }
      };

      recognition.onerror = () => {
        setIsListeningMic(false);
      };

      recognition.onend = () => {
        setIsListeningMic(false);
        recognitionRef.current = null;
        if (captured) {
          handleSendMessage(captured);
        }
      };

      recognition.start();
    } catch {
      setIsListeningMic(false);
    }
  };

  return (
    <div className={`flex flex-col bg-surface rounded-2xl sm:rounded-3xl border border-border shadow-sm overflow-hidden h-full relative ${className}`}>
      
      {/* ── Topplinje med Tittel, Status og Tre-Prikker Meny ── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-surface-muted/40 shrink-0 select-none">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-foreground truncate">
                {isSidePanel ? 'AI Co-Pilot' : 'Tønsberglivet Autonom Agent'}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-[10px] text-foreground-muted truncate">
              {currentModule ? `Kontekst: ${currentModule.toUpperCase()}` : 'Full handlingsmyndighet i systemet'}
            </p>
          </div>
        </div>

        {/* Høyre hjørne med Tre Prikker (...) meny for sekundære funksjoner */}
        <div className="flex items-center gap-1.5 relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-xl border border-border text-foreground-muted hover:text-foreground hover:bg-surface text-xs font-semibold flex items-center justify-center transition-colors"
            title="Flere valg og innstillinger"
            aria-label="Innstillinger"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isSidePanel && onCloseSidePanel && (
            <button
              type="button"
              onClick={onCloseSidePanel}
              className="p-1.5 rounded-xl border border-border text-foreground-muted hover:text-foreground hover:bg-surface text-xs font-semibold flex items-center justify-center transition-colors"
              title="Lukk side-panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Tre-prikker Dropdown Meny */}
          {menuOpen && (
            <div
              className="absolute right-0 top-10 w-56 bg-surface border border-border rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3 py-1.5 border-b border-border text-[11px] font-bold text-foreground-muted uppercase tracking-wider">
                Agent Alternativer
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowIntegrationsModal(true);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-surface-muted flex items-center gap-2.5 transition-colors"
              >
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span>Systemintegrasjoner</span>
              </button>
              <button
                type="button"
                onClick={handleExportChat}
                disabled={messages.length === 0}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-surface-muted flex items-center gap-2.5 transition-colors disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5 text-foreground-muted" />
                <span>Eksporter samtalelogg</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowShortcutsModal(true);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-surface-muted flex items-center gap-2.5 transition-colors"
              >
                <Keyboard className="w-3.5 h-3.5 text-foreground-muted" />
                <span>Hurtigtaster</span>
              </button>
              <div className="my-1 border-t border-border" />
              <button
                type="button"
                onClick={handleClearHistory}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Nullstill samtale</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── HOVEDINNHOLD: Enten Sentrert Hero (Start) ELLER Meldinger + Bunn-Input ── */}
      {!hasStartedChatting ? (
        /* Sentrert Hero-visning (Identisk til Qwen/Gemini/Claude i bildene) */
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 text-center overflow-y-auto">
          <div className="max-w-xl w-full mx-auto space-y-6 animate-in fade-in duration-300">
            {/* Tittel og Ikon */}
            <div className="space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-xs">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Hvor skal vi starte?
              </h2>
              <p className="text-xs sm:text-sm text-foreground-muted max-w-md mx-auto">
                Din autonome byvert og assistent for Tønsberglivet. Spør om arrangementer, lag helgeguider, godkjenn torvleie eller synk med Duett ERP.
              </p>
            </div>

            {/* Sentrert Floating Input Capsule */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputVal);
              }}
              className="relative flex items-center bg-surface border border-border/80 hover:border-primary/50 rounded-2xl sm:rounded-full p-2 sm:px-4 sm:py-2.5 shadow-lg focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all text-left"
            >
              <div className="p-1.5 rounded-full text-foreground-subtle hover:text-foreground hover:bg-surface-muted transition-colors shrink-0 cursor-pointer">
                <Plus className="w-4 h-4" />
              </div>

              <input
                ref={heroInputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Skriv en instruks eller oppgave til agenten..."
                className="flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm text-foreground placeholder:text-foreground-muted/60 outline-none"
              />

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-surface-muted text-[10px] font-bold text-foreground-muted border border-border">
                  Flash 2.5
                </span>

                <button
                  type="button"
                  onClick={toggleMic}
                  className={`p-2 rounded-full transition-all ${
                    isListeningMic
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'text-foreground-muted hover:text-foreground hover:bg-surface-muted'
                  }`}
                  title="Taleopptak på norsk"
                >
                  {isListeningMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  type="submit"
                  disabled={!inputVal.trim() || isLoading}
                  className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary-hover active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Hurtigvalg-chips under kapselen (Som i Claude og Gemini) */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {moduleChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(chip.prompt)}
                  className="px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-muted border border-border text-foreground hover:border-primary/40 text-xs font-semibold transition-all shadow-2xs hover:scale-[1.02] active:scale-95"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Chatte-visning: Meldinger over, fast input-felt i bunnen */
        <div className="flex-1 flex flex-col min-h-0 relative">
          {/* Scrollbart meldingsområde */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-sm"
          >
            {messages.map((m, idx) => {
              const isUser = m.role === 'user';
              const isLatestUser = isUser && idx === messages.map((x) => x.role).lastIndexOf('user');
              const isCopied = copiedId === m.id;

              return (
                <div
                  key={m.id}
                  ref={isLatestUser ? lastUserPromptRef : undefined}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[92%] sm:max-w-[85%] rounded-2xl px-4 py-3.5 transition-all ${
                      isUser
                        ? 'bg-primary text-primary-foreground rounded-br-xs shadow-xs font-medium'
                        : 'bg-surface-muted/70 text-foreground border border-border/80 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-border/40">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                            Autonom Byvert
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleCopy(m.id, m.content)}
                            className="p-1 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface transition-colors"
                            title="Kopier svar"
                          >
                            {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed break-words">
                      {isUser ? (
                        <p className="whitespace-pre-line m-0">{m.content}</p>
                      ) : (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-2.5 last:mb-0">{children}</p>,
                            h3: ({ children }) => (
                              <h3 className="text-xs sm:text-sm font-bold text-foreground mt-3 mb-1 flex items-center gap-1">
                                {children}
                              </h3>
                            ),
                            ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 mb-2.5">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 mb-2.5">{children}</ol>,
                            li: ({ children }) => <li className="leading-snug">{children}</li>,
                            strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                            code: ({ children }) => (
                              <code className="px-1.5 py-0.5 rounded bg-surface border border-border text-primary font-mono text-[11px]">
                                {children}
                              </code>
                            ),
                          }}
                        >
                          {formatAiMarkdown(m.content)}
                        </ReactMarkdown>
                      )}
                    </div>

                    <div
                      className={`text-[9px] mt-2 select-none ${
                        isUser ? 'text-primary-foreground/75 text-right' : 'text-foreground-muted'
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>

                  {/* Hurtigvalg / Quick Replies under svar */}
                  {!isUser && m.quickReplies && m.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[92%] sm:max-w-[85%]">
                      {m.quickReplies.map((qr, qidx) => (
                        <button
                          key={qidx}
                          type="button"
                          onClick={() => handleSendMessage(qr.payload || qr.title)}
                          disabled={isLoading}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-muted border border-border text-foreground hover:border-primary/40 text-[11px] font-semibold transition-all shadow-2xs hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                        >
                          <span>{qr.title}</span>
                          <ArrowRight className="w-3 h-3 text-primary shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Laster-status indikator */}
            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-primary animate-pulse" />
                </div>
                <div className="p-3.5 rounded-2xl rounded-tl-xs bg-surface-muted/60 border border-border flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                  </div>
                  <span className="text-xs font-semibold text-foreground-muted">
                    {loadingStatus}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Hurtigforslag over bunnfeltet */}
          <div className="px-4 py-1.5 flex items-center gap-1.5 overflow-x-auto border-t border-border/50 bg-surface/90 backdrop-blur-sm scrollbar-none">
            {moduleChips.slice(0, 4).map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip.prompt)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-surface-muted hover:bg-surface border border-border text-foreground-muted hover:text-foreground whitespace-nowrap transition-colors"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* FAST BUNNFELT (Bilde 5 - Gemini prompt response view) */}
          <div className="p-3 sm:p-4 border-t border-border bg-surface shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputVal);
              }}
              className="relative flex items-end gap-2 bg-background border border-border rounded-2xl p-1.5 sm:p-2 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-xs"
            >
              <button
                type="button"
                onClick={toggleMic}
                className={`p-2 rounded-xl transition-all shrink-0 ${
                  isListeningMic
                    ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                    : 'text-foreground-muted hover:text-foreground hover:bg-surface-muted'
                }`}
                title={isListeningMic ? 'Stopper opptak...' : 'Snakk inn melding'}
              >
                {isListeningMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <textarea
                ref={textareaRef}
                rows={1}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Spør agenten eller gi en instruks..."
                className="flex-1 max-h-[140px] resize-none bg-transparent py-1.5 px-1 text-xs sm:text-sm text-foreground placeholder:text-foreground-muted/60 outline-none leading-relaxed"
              />

              <button
                type="submit"
                disabled={!inputVal.trim() || isLoading}
                className="p-2 sm:px-4 sm:py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-primary-hover active:scale-95 transition-all shadow-xs disabled:opacity-40 disabled:pointer-events-none shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>

            <div className="flex items-center justify-between px-2 pt-2 text-[10px] text-foreground-muted select-none">
              <span className="hidden sm:inline">
                Trykk <kbd className="px-1 py-0.5 rounded bg-surface-muted border border-border font-mono">Enter</kbd> for å sende. Hold deg øverst i svaret og scroll nedover.
              </span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="w-3 h-3" /> Autonom agent klar
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Systemintegrasjoner (via tre prikker) ── */}
      {showIntegrationsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">Systemintegrasjoner</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIntegrationsModal(false)}
                className="p-1 rounded-lg text-foreground-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-surface-muted flex items-center justify-between border border-border">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-foreground">PostgreSQL & Prisma</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Tilkoblet</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-muted flex items-center justify-between border border-border">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-foreground">Google Gemini 2.5</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Aktiv</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-muted flex items-center justify-between border border-border">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-foreground">Duett ERP (Peppol EHF 3.0)</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Klar</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-muted flex items-center justify-between border border-border">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-foreground">Ticketmaster API</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Synk aktiv</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowIntegrationsModal(false)}
                className="w-full py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-hover transition-colors"
              >
                Lukk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Hurtigtaster (via tre prikker) ── */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">Hurtigtaster</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="p-1 rounded-lg text-foreground-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-border">
                <span className="text-foreground-muted">Fokuser chat</span>
                <kbd className="px-2 py-0.5 rounded bg-surface-muted border border-border font-mono font-bold">Cmd / Ctrl + K</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border">
                <span className="text-foreground-muted">Åpne/lukk Co-Pilot</span>
                <kbd className="px-2 py-0.5 rounded bg-surface-muted border border-border font-mono font-bold">Cmd / Ctrl + J</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border">
                <span className="text-foreground-muted">Send melding</span>
                <kbd className="px-2 py-0.5 rounded bg-surface-muted border border-border font-mono font-bold">Enter</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border">
                <span className="text-foreground-muted">Linjeskift</span>
                <kbd className="px-2 py-0.5 rounded bg-surface-muted border border-border font-mono font-bold">Shift + Enter</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-foreground-muted">Lukk modaler / menyer</span>
                <kbd className="px-2 py-0.5 rounded bg-surface-muted border border-border font-mono font-bold">Esc</kbd>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowShortcutsModal(false)}
              className="w-full py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-hover transition-colors"
            >
              Forstått
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
