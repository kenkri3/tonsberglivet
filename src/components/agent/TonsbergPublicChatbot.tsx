'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Compass,
  MapPin,
  Calendar,
  UtensilsCrossed,
  Waves,
  ArrowUpRight,
  Sparkles,
  Bot,
  Headphones,
  CheckCircle2,
  ShieldCheck,
  User,
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'admin';
  senderName?: string;
  content: string;
  quickReplies?: Array<{ title: string; payload: string }>;
  timestamp: string;
}

/**
 * Renser og formaterer Markdown-tekst slik at stjerner (**bold**)
 * rendres som elegant fet tekst og lister med stilrene kulepunkter.
 */
function FormattedMessage({ content, isUser }: { content: string; isUser?: boolean }) {
  const lines = content.split('\n');

  const renderInlineFormatted = (text: string) => {
    // Deler opp teksten etter **fet tekst**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const inner = part.slice(2, -2);
        return (
          <strong
            key={i}
            className={`font-semibold ${isUser ? 'text-white font-bold' : 'text-foreground font-semibold'}`}
          >
            {inner}
          </strong>
        );
      }
      // Fjerner eventuelle enslige eller gjenværende stjerner
      const cleaned = part.replace(/\*/g, '');
      return <React.Fragment key={i}>{cleaned}</React.Fragment>;
    });
  };

  return (
    <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Kulepunkt-linjer (•, -, *)
        if (trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const bulletText = trimmed.replace(/^[•\-\*]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${
                  isUser ? 'bg-white' : 'bg-primary'
                }`}
              />
              <div className="flex-1 min-w-0">
                {renderInlineFormatted(bulletText)}
              </div>
            </div>
          );
        }

        return (
          <p key={idx} className="m-0">
            {renderInlineFormatted(line)}
          </p>
        );
      })}
    </div>
  );
}

export function TonsbergPublicChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [sessionId, setSessionId] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialiser unik sesjon-ID
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let storedId = sessionStorage.getItem('tonsberg_chat_session_id');
      if (!storedId) {
        storedId = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        sessionStorage.setItem('tonsberg_chat_session_id', storedId);
      }
      setSessionId(storedId);
    }
  }, []);

  // Initial velkomsthilsen fra personlig byvert
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content:
            'Velkommen til Tønsberg! Som din personlige byvert hjelper jeg deg med å oppdage det beste byen og skjærgården har å by på – fra bordbestilling på Brygga og kultur på Slottsfjellet, til sanntidsinfo om vær, badetemperatur og arrangementer.',
          quickReplies: [
            { title: '🎉 Hva skjer i dag?', payload: 'Hva skjer i Tønsberg i dag?' },
            { title: '🍽️ Spisesteder på Brygga', payload: 'Beste restauranter langs Tønsberg Brygge' },
            { title: '🌊 Badetemperatur', payload: 'Hva er badevannstemperaturen i Tønsberg akkurat nå?' },
            { title: '🏛️ Leie stand på Torvet', payload: 'Hvordan kan jeg leie plass eller stand på Torvet?' },
          ],
          timestamp: new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [messages.length]);

  // Polling for nye svar fra admin når chatten er åpen
  useEffect(() => {
    if (!isOpen || !sessionId) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/agent/live-chat?sessionId=${sessionId}`);
        const data = await res.json();
        if (data.success && data.session && Array.isArray(data.session.messages)) {
          const remoteMsgs: ChatMessage[] = data.session.messages.map((m: any) => ({
            id: m.id,
            role: m.sender === 'visitor' ? 'user' : m.sender === 'admin' ? 'admin' : 'assistant',
            senderName: m.senderName,
            content: m.content,
            quickReplies: m.quickReplies,
            timestamp: m.timestamp,
          }));

          if (remoteMsgs.length > messages.length) {
            setMessages(remoteMsgs);
          }
        }
      } catch {
        // Ignorer pollingfeil
      }
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [isOpen, sessionId, messages.length]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(() => {
        inputRef.current?.focus();
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/agent/public-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId,
          aiEnabled,
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        const botMsg: ChatMessage = {
          id: `b-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          quickReplies: data.quickReplies,
          timestamp: new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
        if (!isOpen) setUnreadCount((c) => c + 1);
      } else {
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Beklager, et lite øyeblikk med forstyrrelse. Prøv gjerne igjen!',
          timestamp: new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Kunne ikke kontakte serveren akkurat nå. Sjekk nettilkoblingen og prøv igjen.',
        timestamp: new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* ── Floating Launcher ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 lg:bottom-6 right-5 lg:right-6 z-40 flex items-center gap-3 px-4 py-3 bg-[#0d1322]/95 hover:bg-[#141d33] text-white rounded-full shadow-[0_12px_36px_rgba(0,0,0,0.35)] backdrop-blur-xl border border-white/15 hover:border-white/25 transition-all duration-300 group hover:-translate-y-0.5 active:translate-y-0"
          aria-label="Åpne Tønsberg Guiden"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400/20 to-amber-200/10 border border-amber-300/30 text-amber-300 group-hover:scale-105 transition-transform">
            <Compass className="w-4 h-4 text-amber-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-slate-950 text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="text-left hidden sm:block pr-1">
            <div className="text-xs font-semibold text-white tracking-tight flex items-center gap-1.5">
              <span>Tønsberg Guiden</span>
            </div>
            <div className="text-[10px] text-slate-400 font-normal">
              Personlig byvert
            </div>
          </div>
        </button>
      )}

      {/* ── Refined Luxury Concierge Modal ── */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 w-full sm:w-[420px] h-[92vh] sm:h-[640px] max-h-[90vh] bg-surface border border-border sm:rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          
          {/* Header */}
          <div className="px-5 py-4 bg-[#0d1322] text-white flex flex-col gap-2.5 border-b border-white/10 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-300 shadow-inner">
                  <Compass className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm tracking-tight text-white">
                      Tønsberg Guiden
                    </h3>
                    <span className="text-[9px] font-medium tracking-widest uppercase px-2 py-0.5 rounded-full bg-amber-300/10 text-amber-200 border border-amber-300/20">
                      Byvert
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-light mt-0.5">
                    Kuraterte tips og veiledning for Tønsberglivet
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                aria-label="Lukk guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Av/På Bryter */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-300">
                {aiEnabled ? (
                  <Bot className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Headphones className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Modus: <strong>{aiEnabled ? 'AI Byvert' : 'Direkte til Admin'}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => setAiEnabled(!aiEnabled)}
                className={`px-2.5 py-0.5 rounded-full font-medium text-[10px] transition-all flex items-center gap-1.5 ${
                  aiEnabled
                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 hover:bg-emerald-500/30'
                    : 'bg-amber-500/25 text-amber-200 border border-amber-400/40 hover:bg-amber-500/35'
                }`}
                title="Slå AI-svar av eller på for å snakke direkte med administrasjonen"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${aiEnabled ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span>{aiEnabled ? 'AI er PÅ' : 'AI er AV (Admin)'}</span>
              </button>
            </div>
          </div>

          {/* Statusbanner når AI er slått av */}
          {!aiEnabled && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-[11px] text-amber-700 dark:text-amber-300 flex items-center gap-2 shrink-0">
              <Headphones className="w-3.5 h-3.5 shrink-0" />
              <span>AI er satt på pause. Meldingene dine sendes rett til Tønsberglivet-teamet.</span>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-background">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role !== 'user' && (
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
                      m.role === 'admin'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-surface border border-border text-primary'
                    }`}
                  >
                    {m.role === 'admin' ? (
                      <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Compass className="w-3.5 h-3.5 text-primary" />
                    )}
                  </div>
                )}
                
                <div
                  className={`max-w-[84%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    m.role === 'user'
                      ? 'bg-primary text-white rounded-tr-xs font-normal'
                      : m.role === 'admin'
                      ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-500/30 text-foreground rounded-tl-xs'
                      : 'bg-surface border border-border/80 text-foreground rounded-tl-xs'
                  }`}
                >
                  {/* Admin avsenderetikett */}
                  {m.role === 'admin' && (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-1.5 border-b border-emerald-500/20 pb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{m.senderName || 'Cecilie (Tønsberglivet Admin)'}</span>
                    </div>
                  )}

                  {/* Ren Markdown-formatering UTEN rå stjerner */}
                  <FormattedMessage content={m.content} isUser={m.role === 'user'} />

                  {/* Refined Quick Reply Pills */}
                  {m.quickReplies && m.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3.5 pt-3 border-t border-border/60">
                      {m.quickReplies.map((qr, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(qr.payload)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium bg-surface-muted hover:bg-primary hover:text-white text-foreground-muted hover:text-white transition-all border border-border/80 text-left flex items-center gap-1 group"
                        >
                          <span>{qr.title}</span>
                          <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                      ))}
                    </div>
                  )}

                  <span
                    className={`block text-[10px] mt-1.5 text-right font-light ${
                      m.role === 'user' ? 'text-white/60' : 'text-foreground-subtle'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0 shadow-2xs">
                  <Compass className="w-3.5 h-3.5 text-primary animate-pulse" />
                </div>
                <div className="bg-surface border border-border rounded-2xl rounded-tl-xs px-4 py-3 text-xs text-foreground-muted flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.3s]" />
                  <span className="ml-1 text-xs font-light">
                    {aiEnabled ? 'Finner svar for deg...' : 'Sender til administrasjonen...'}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer Footer */}
          <div className="p-4 bg-surface border-t border-border">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputVal);
              }}
              className="relative flex items-center"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={
                  aiEnabled
                    ? 'Spør om konserter, restauranter, bading...'
                    : 'Skriv en melding direkte til administrasjonen...'
                }
                className="w-full pl-4 pr-12 py-3 bg-surface-muted/60 border border-border/80 rounded-2xl text-xs sm:text-sm text-foreground placeholder:text-foreground-subtle outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-light"
              />
              <button
                type="submit"
                disabled={!inputVal.trim() || isLoading}
                className="absolute right-1.5 p-2 bg-primary text-white rounded-xl disabled:opacity-30 hover:opacity-90 active:scale-95 transition-all shadow-xs"
                aria-label="Send melding"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            
            <div className="flex items-center justify-between mt-2.5 px-1 text-[10px] text-foreground-subtle font-light">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                GDPR-beskyttet samtale
              </span>
              <a href="/kontakt" className="hover:text-primary transition-colors">
                Offisiell kontakt
              </a>
            </div>
          </div>

        </div>
      )}
    </>
  );
}
