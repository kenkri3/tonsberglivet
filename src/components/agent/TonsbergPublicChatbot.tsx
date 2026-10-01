'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  MapPin,
  Calendar,
  Utensils,
  Waves,
  Store,
  ChevronDown,
  Bot,
  User,
  ArrowRight,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  quickReplies?: Array<{ title: string; payload: string }>;
  timestamp: string;
}

export function TonsbergPublicChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial velkomsthilsen
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: 'Hei! ☀️ Jeg er **Tønsberg-Guiden**. Spør meg om konserter, restauranter langs Brygga, badetemperatur eller hvordan du leier stand på Torvet!',
          quickReplies: [
            { title: '🎉 Hva skjer i dag?', payload: 'Hva skjer i Tønsberg i dag?' },
            { title: '🍽️ Spisesteder på Brygga', payload: 'Hvilke restauranter anbefales på Brygga?' },
            { title: '🌊 Badetemperatur', payload: 'Hva er badevannstemperaturen i Tønsberg i dag?' },
            { title: '🏛️ Leie stand på Torvet', payload: 'Hvordan kan jeg leie salgsbod på Tønsberg Torv?' },
          ],
          timestamp: new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [messages.length]);

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
        body: JSON.stringify({ message: text }),
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
          content: 'Beklager, jeg hadde et lite øyeblikks forstyrrelse. Prøv gjerne igjen!',
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
      {/* Flytende åpne-knapp */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 lg:bottom-6 right-5 lg:right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-primary text-primary-foreground rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-primary-foreground/10 group"
          aria-label="Åpne Tønsberg-Guiden"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="font-bold text-sm tracking-tight hidden sm:inline">
            Tønsberg-Guiden
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
        </button>
      )}

      {/* Chat-vindu */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 w-full sm:w-[400px] h-[90vh] sm:h-[600px] max-h-[85vh] bg-surface border border-border sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="px-5 py-4 bg-primary text-primary-foreground flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-black text-sm tracking-tight flex items-center gap-1.5">
                  Tønsberg-Guiden
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                </h3>
                <p className="text-[11px] text-white/70">
                  Din lokale byvert for Tønsberglivet
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
              aria-label="Lukk chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Meldinger */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-xs'
                      : 'bg-surface border border-border text-foreground rounded-tl-xs'
                  }`}
                >
                  <div className="whitespace-pre-line">{m.content}</div>

                  {/* Hurtigknapper */}
                  {m.quickReplies && m.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-border/50">
                      {m.quickReplies.map((qr, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(qr.payload)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-muted hover:bg-primary hover:text-primary-foreground text-foreground transition-colors border border-border"
                        >
                          {qr.title}
                        </button>
                      ))}
                    </div>
                  )}

                  <span
                    className={`block text-[10px] mt-1 text-right ${
                      m.role === 'user' ? 'text-white/60' : 'text-foreground-muted'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-surface border border-border rounded-2xl rounded-tl-xs px-4 py-2.5 text-xs text-foreground-muted flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1">Sjekker Tønsberg-data...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input-felt */}
          <div className="p-3 bg-surface border-t border-border">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputVal);
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Spør om konserter, mat, bading..."
                className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={!inputVal.trim() || isLoading}
                className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary-hover disabled:opacity-40 transition-colors shrink-0"
                aria-label="Send melding"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="flex items-center justify-between text-[10px] text-foreground-muted px-1 mt-1.5">
              <span>Drevet av Tønsberglivet OS</span>
              <a href="/kontakt" className="hover:underline text-primary">
                Kontakt oss direkte
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
