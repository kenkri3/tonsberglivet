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
  Zap
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
}

interface TonsbergAgentChatProps {
  className?: string;
  userName?: string;
  initialPrompt?: string;
  onPromptHandled?: () => void;
}

export function TonsbergAgentChat({
  className = '',
  userName = 'Cecilie',
  initialPrompt,
  onPromptHandled,
}: TonsbergAgentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hei ${userName}! 👋 Jeg er Tønsberglivets **autonome byvert og backend-agent**.\n\nJeg er koblet direkte til systemet med full handlingsmyndighet, samt verktøyene **Brave**, **Tavily**, **Apify** og **Tønsberglivet DB**.\n\nHva ønsker du at jeg skal utføre for deg i dag?`,
      timestamp: new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' }),
      quickReplies: [
        { title: '📅 Kjør Event-Radar', payload: 'Kjør Event-Radar for Foynhagen og Ticketmaster for neste uke' },
        { title: '🦁 Åpningstids-audit Brygga', payload: 'Sjekk og oppdater åpningstider for restaurantene på Tønsberg Brygge' },
        { title: '📣 Lag SoMe-pakke', payload: 'Lag en SoMe-pakke for helgens kultur- og handelshøydepunkter' },
        { title: '📊 Vis torvleiestatus', payload: 'Vis status på ventende torvleiesøknader og klargjør fakturering i Duett ERP' },
      ],
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('Kobler til agenten...');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [sessionId] = useState(() => `tb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const loadingTimerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollH = textareaRef.current.scrollHeight;
      const targetH = Math.min(Math.max(scrollH, 44), 140);
      textareaRef.current.style.height = `${targetH}px`;
    }
  }, [inputVal]);

  // Scroll to bottom on new message inside container only (preventing window scroll jump)
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  // Håndter initialPrompt
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt.trim());
      onPromptHandled?.();
    }
  }, [initialPrompt]);

  // Lytt på eksterne eventer fra hurtigknapper i dashboardet
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

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
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

    const stages = [
      'Kobler til Tønsberglivet Agent...',
      'Analyserer oppgaven med Brave & Tavily...',
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
    }, 2400);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          sessionId,
          userName,
        }),
      });

      if (!res.ok) throw new Error(`Feilkode ${res.status}`);

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Forespørselen er behandlet.',
        timestamp: new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' }),
        quickReplies: data.quickReplies && data.quickReplies.length > 0 ? data.quickReplies : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Agent chat error:', err);
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Beklager, det oppstod en feil ved kommunikasjon med agenten. Vennligst sjekk nettverkstilgangen og prøv igjen.`,
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
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: `Samtalen er nullstilt. Hva kan jeg bistå deg med nå, ${userName}?`,
        timestamp: new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' }),
        quickReplies: [
          { title: '📅 Kjør Event-Radar', payload: 'Kjør Event-Radar for Foynhagen og Ticketmaster for neste uke' },
          { title: '🦁 Åpningstids-audit Brygga', payload: 'Sjekk og oppdater åpningstider for restaurantene på Tønsberg Brygge' },
          { title: '📣 Lag SoMe-pakke', payload: 'Lag en SoMe-pakke for helgens kultur- og handelshøydepunkter' },
        ],
      },
    ]);
    setInputVal('');
    if (textareaRef.current) textareaRef.current.style.height = '44px';
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
    <div className={`flex flex-col bg-surface rounded-2xl sm:rounded-3xl border border-border shadow-sm overflow-hidden ${className}`}>
      {/* Header med status og handlinger */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-border bg-surface-muted/40 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-foreground truncate">
                Tønsberglivet Agent
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Agent
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-foreground-muted truncate">
              Brave • Tavily • Apify • Full handlingsmyndighet
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={handleClearHistory}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-border text-foreground-muted hover:text-foreground hover:bg-surface text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Nullstill samtale"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nullstill</span>
          </button>
        </div>
      </div>

      {/* Meldinger (Scrollbart vindu) */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-sm"
      >
        {messages.map((m) => {
          const isUser = m.role === 'user';
          const isCopied = copiedId === m.id;

          return (
            <div
              key={m.id}
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
                  <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-border/40">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                        Autonom Byvert
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(m.id, m.content)}
                      className="p-1 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface transition-colors"
                      title="Kopier svar"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
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

                <div className={`text-[9px] mt-1.5 select-none ${isUser ? 'text-primary-foreground/75 text-right' : 'text-foreground-muted'}`}>
                  {m.timestamp}
                </div>
              </div>

              {/* Hurtigvalg / Quick Replies under svar */}
              {!isUser && m.quickReplies && m.quickReplies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[92%] sm:max-w-[85%]">
                  {m.quickReplies.map((qr, idx) => (
                    <button
                      key={idx}
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

        <div ref={messagesEndRef} />
      </div>

      {/* Chattefelt (Inntastingsområde som i ksmester) */}
      <div className="p-3 sm:p-4 border-t border-border bg-surface shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputVal);
          }}
          className="relative flex items-end gap-2 bg-background border border-border rounded-2xl p-1.5 sm:p-2 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-xs"
        >
          {/* Tale / Mikrofonknapp */}
          <button
            type="button"
            onClick={toggleMic}
            className={`p-2 rounded-xl transition-all shrink-0 ${
              isListeningMic
                ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                : 'text-foreground-muted hover:text-foreground hover:bg-surface-muted'
            }`}
            title={isListeningMic ? 'Stopper opptak...' : 'Snakk inn melding (norsk tale)'}
          >
            {isListeningMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Skriv en instruks eller oppgave til agenten..."
            className="flex-1 max-h-[140px] resize-none bg-transparent py-1.5 px-1 text-xs sm:text-sm text-foreground placeholder:text-foreground-muted/60 outline-none leading-relaxed"
          />

          {/* Send-knapp */}
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
            Trykk <kbd className="px-1 py-0.5 rounded bg-surface-muted border border-border font-mono">Enter</kbd> for å sende, <kbd className="px-1 py-0.5 rounded bg-surface-muted border border-border font-mono">Shift+Enter</kbd> for linjeskift.
          </span>
          <span className="sm:hidden">
            Trykk på mikrofonen for å diktere på norsk.
          </span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="w-3 h-3" /> Sikker intern motor
          </span>
        </div>
      </div>
    </div>
  );
}
