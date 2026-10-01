'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Mail,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  User,
  Clock,
  MessageSquare,
  Bot,
  Headphones,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Layers,
} from 'lucide-react';

interface ContactMessageItem {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  read: boolean;
  createdAt?: string;
}

interface ChatMessageItem {
  id: string;
  sender: 'visitor' | 'assistant' | 'admin';
  senderName?: string;
  content: string;
  timestamp: string;
  quickReplies?: Array<{ title: string; payload: string }>;
}

interface ChatSessionItem {
  id: string;
  visitorName?: string;
  visitorEmail?: string;
  aiEnabled: boolean;
  status: 'active' | 'waiting_admin' | 'answered_by_admin' | 'closed';
  topic: string;
  createdAt: string;
  updatedAt: string;
  unreadByAdmin: boolean;
  messages: ChatMessageItem[];
}

export default function AdminMeldingerPage() {
  const [activeTab, setActiveTab] = useState<'livechat' | 'contact'>('livechat');
  
  // Kontaktskjema tilstand
  const [contactMessages, setContactMessages] = useState<ContactMessageItem[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  
  // Live Chat tilstand
  const [chatSessions, setChatSessions] = useState<ChatSessionItem[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [adminSenderName, setAdminSenderName] = useState('Cecilie (Tønsberglivet)');
  const [globalAiEnabled, setGlobalAiEnabled] = useState(true);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [sendingReply, setSendingReply] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Hent data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Kontaktskjema
      const contactRes = await fetch('/api/contact');
      const contactData = await contactRes.json();
      if (contactData.success) {
        setContactMessages(contactData.data || []);
      }

      // 2. Live Chat
      const chatRes = await fetch('/api/agent/live-chat');
      const chatData = await chatRes.json();
      if (chatData.success) {
        setChatSessions(chatData.sessions || []);
        setGlobalAiEnabled(chatData.globalAiEnabled ?? true);
        setUnreadChatCount(chatData.unreadCount || 0);

        // Hvis ingen er valgt, velg den første
        if (!selectedSessionId && chatData.sessions?.length > 0) {
          setSelectedSessionId(chatData.sessions[0].id);
        }
      }
    } catch (e) {
      console.error('Feil ved lasting av meldinger:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Polling hvert 5. sekund for å fange nye chat-meldinger
    const interval = setInterval(async () => {
      try {
        const chatRes = await fetch('/api/agent/live-chat');
        const chatData = await chatRes.json();
        if (chatData.success && Array.isArray(chatData.sessions)) {
          setChatSessions(chatData.sessions);
          setUnreadChatCount(chatData.unreadCount || 0);
          setGlobalAiEnabled(chatData.globalAiEnabled ?? true);
        }
      } catch {
        // Ignorer i bakgrunnen
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedSessionId]);

  // Scroll til bunn når valgt samtale endres
  useEffect(() => {
    if (selectedSessionId) {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [selectedSessionId, chatSessions]);

  // Marker som lest når en samtale åpnes
  const handleSelectSession = async (id: string) => {
    setSelectedSessionId(id);
    try {
      await fetch('/api/agent/live-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read', sessionId: id }),
      });
      setChatSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, unreadByAdmin: false } : s))
      );
      setUnreadChatCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Ignorer
    }
  };

  // Veksle AI globalt
  const handleToggleGlobalAi = async () => {
    const nextState = !globalAiEnabled;
    setGlobalAiEnabled(nextState);
    try {
      await fetch('/api/agent/live-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_global_ai', enabled: nextState }),
      });
    } catch {
      setGlobalAiEnabled(!nextState);
    }
  };

  // Veksle AI for valgt samtale
  const handleToggleSessionAi = async (session: ChatSessionItem) => {
    const nextState = !session.aiEnabled;
    try {
      const res = await fetch('/api/agent/live-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_session_ai',
          sessionId: session.id,
          aiEnabled: nextState,
        }),
      });
      const data = await res.json();
      if (data.success && data.session) {
        setChatSessions((prev) =>
          prev.map((s) => (s.id === session.id ? data.session : s))
        );
      }
    } catch {
      // Ignorer
    }
  };

  // Send admin-svar
  const handleSendAdminReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedSessionId || !adminReplyText.trim() || sendingReply) return;

    setSendingReply(true);
    const textToSend = adminReplyText.trim();
    setAdminReplyText('');

    try {
      const res = await fetch('/api/agent/live-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'admin_reply',
          sessionId: selectedSessionId,
          text: textToSend,
          adminName: adminSenderName,
        }),
      });
      const data = await res.json();
      if (data.success && data.session) {
        setChatSessions((prev) =>
          prev.map((s) => (s.id === selectedSessionId ? data.session : s))
        );
      }
    } catch (err) {
      console.error('Kunne ikke sende admin-svar:', err);
    } finally {
      setSendingReply(false);
    }
  };

  const selectedSession = chatSessions.find((s) => s.id === selectedSessionId);
  const unreadContactCount = contactMessages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      {/* Toppseksjon med fanevelger og Global AI-knapp */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 rounded-2xl border border-border shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            Innboks & Innbyggerhenvendelser
            {unreadChatCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                {unreadChatCount} nye i live chat
              </span>
            )}
          </h2>
          <p className="text-foreground-muted text-xs sm:text-sm mt-1">
            Overvåk publikumssamtaler fra Tønsberg-Guiden og svar direkte som admin.
          </p>
        </div>

        {/* Handlinger */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Global AI Byvert Av/På Knapp */}
          <button
            type="button"
            onClick={handleToggleGlobalAi}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all ${
              globalAiEnabled
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
            }`}
            title="Slå AI-svar av eller på for hele portalens offentlige chatbot"
          >
            {globalAiEnabled ? (
              <Bot className="w-4 h-4 text-emerald-500" />
            ) : (
              <Headphones className="w-4 h-4 text-amber-500" />
            )}
            <span>AI Byvert: <strong>{globalAiEnabled ? 'Aktiv (PÅ)' : 'Pauset (AV)'}</strong></span>
          </button>

          {/* Oppdater-knapp */}
          <button
            onClick={fetchData}
            className="p-2 bg-surface-muted hover:bg-border rounded-xl text-foreground-muted transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Oppdater</span>
          </button>
        </div>
      </div>

      {/* Faner */}
      <div className="flex items-center gap-2 border-b border-border pb-1">
        <button
          onClick={() => setActiveTab('livechat')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'livechat'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-foreground-muted hover:text-foreground hover:bg-surface-muted'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Live Chatbot-samtaler</span>
          {unreadChatCount > 0 && (
            <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'livechat' ? 'bg-white/25 text-white' : 'bg-primary text-primary-foreground'}`}>
              {unreadChatCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'contact'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-foreground-muted hover:text-foreground hover:bg-surface-muted'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Kontaktskjema & E-poster</span>
          {unreadContactCount > 0 && (
            <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'contact' ? 'bg-white/25 text-white' : 'bg-surface-muted text-foreground'}`}>
              {unreadContactCount}
            </span>
          )}
        </button>
      </div>

      {/* FANE 1: LIVE CHATBOT SAMTALER */}
      {activeTab === 'livechat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
          {/* Samtaleliste (Venstre kolonne) */}
          <div className="lg:col-span-4 bg-surface rounded-2xl border border-border overflow-hidden flex flex-col shadow-xs">
            <div className="p-3.5 border-b border-border bg-surface-muted/50 flex items-center justify-between">
              <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                Aktive Samtaler ({chatSessions.length})
              </span>
              <span className="text-[11px] text-foreground-subtle">
                Auto-oppdateres
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {chatSessions.length === 0 ? (
                <div className="p-8 text-center text-xs text-foreground-muted">
                  Ingen samtaler registrert ennå.
                </div>
              ) : (
                chatSessions.map((session) => {
                  const isSelected = selectedSessionId === session.id;
                  const lastMsg = session.messages[session.messages.length - 1];

                  return (
                    <div
                      key={session.id}
                      onClick={() => handleSelectSession(session.id)}
                      className={`p-3.5 transition-colors cursor-pointer flex flex-col gap-1.5 ${
                        isSelected
                          ? 'bg-primary/10 border-l-4 border-l-primary'
                          : session.unreadByAdmin
                          ? 'bg-amber-500/10 hover:bg-amber-500/15'
                          : 'hover:bg-surface-muted'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {session.unreadByAdmin && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-ping" />
                          )}
                          <span className="font-bold text-xs text-foreground truncate">
                            {session.visitorName || session.id.replace('sess-', 'Bruker ')}
                          </span>
                        </div>
                        <span className="text-[10px] text-foreground-subtle shrink-0">
                          {new Date(session.updatedAt).toLocaleTimeString('nb-NO', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-surface-muted text-foreground-muted border border-border">
                          {session.topic}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            session.status === 'waiting_admin'
                              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                              : session.status === 'answered_by_admin'
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                              : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {session.status === 'waiting_admin'
                            ? 'Venter på admin'
                            : session.status === 'answered_by_admin'
                            ? 'Besvart av admin'
                            : session.aiEnabled
                            ? 'AI aktiv'
                            : 'Manuell'}
                        </span>
                      </div>

                      {lastMsg && (
                        <p className="text-xs text-foreground-muted line-clamp-2 mt-0.5">
                          <strong className="text-foreground-subtle font-semibold">
                            {lastMsg.sender === 'visitor' ? 'Bruker: ' : lastMsg.sender === 'admin' ? 'Admin: ' : 'AI: '}
                          </strong>
                          {lastMsg.content.replace(/\*\*/g, '')}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Samtaletråd & Svar (Høyre kolonne) */}
          <div className="lg:col-span-8 bg-surface rounded-2xl border border-border overflow-hidden flex flex-col shadow-xs">
            {selectedSession ? (
              <>
                {/* Header for samtalen */}
                <div className="p-4 border-b border-border bg-surface-muted/30 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-foreground">
                        {selectedSession.visitorName || 'Besøkende fra Tønsberg-Guiden'}
                      </h3>
                      {selectedSession.visitorEmail && (
                        <span className="text-xs text-foreground-muted">
                          ({selectedSession.visitorEmail})
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-foreground-subtle mt-0.5">
                      Sesjons-ID: <code className="font-mono">{selectedSession.id}</code> • Emne: <strong>{selectedSession.topic}</strong>
                    </p>
                  </div>

                  {/* Veksle AI for denne samtalen */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleSessionAi(selectedSession)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                        selectedSession.aiEnabled
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                      }`}
                      title="Skru av AI for å overta samtalen personlig uten at boten avbryter"
                    >
                      {selectedSession.aiEnabled ? (
                        <>
                          <Bot className="w-3.5 h-3.5 text-emerald-500" />
                          <span>AI i denne samtalen: <strong>PÅ</strong></span>
                        </>
                      ) : (
                        <>
                          <Headphones className="w-3.5 h-3.5 text-amber-500" />
                          <span>AI i denne samtalen: <strong>AV (Du styrer)</strong></span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Meldingstråd */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-background/50 max-h-[420px]">
                  {selectedSession.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${
                        m.sender === 'visitor' ? 'items-start' : 'items-end'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[11px] font-bold text-foreground">
                          {m.sender === 'visitor'
                            ? selectedSession.visitorName || 'Besøkende'
                            : m.sender === 'admin'
                            ? m.senderName || 'Cecilie (Tønsberglivet Admin)'
                            : 'Tønsberg-Guiden AI'}
                        </span>
                        {m.sender === 'admin' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500 text-white">
                            ADMIN
                          </span>
                        )}
                        <span className="text-[10px] text-foreground-subtle">
                          {m.timestamp}
                        </span>
                      </div>

                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                          m.sender === 'visitor'
                            ? 'bg-surface border border-border text-foreground rounded-tl-xs'
                            : m.sender === 'admin'
                            ? 'bg-emerald-600 text-white rounded-tr-xs font-medium'
                            : 'bg-primary/10 border border-primary/20 text-foreground rounded-tr-xs'
                        }`}
                      >
                        <div className="whitespace-pre-line">
                          {m.content.replace(/\*\*/g, '')}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Svar-boks for Admin */}
                <div className="p-4 border-t border-border bg-surface">
                  <div className="flex items-center justify-between gap-2 mb-2 text-xs text-foreground-muted">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-primary" />
                      <span>Svarer som:</span>
                      <input
                        type="text"
                        value={adminSenderName}
                        onChange={(e) => setAdminSenderName(e.target.value)}
                        className="px-2 py-0.5 bg-surface-muted border border-border rounded font-semibold text-foreground text-xs"
                      />
                    </div>

                    {/* Hurtigsvar-knapper for admin */}
                    <div className="hidden sm:flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setAdminReplyText(
                            'Hei! Vi har ledig plass på Torvet. Send oss gjerne organisasjonsnummer og ønsket dato, så sender vi leieavtale med en gang!'
                          )
                        }
                        className="px-2 py-0.5 rounded bg-surface-muted hover:bg-border text-[10px] text-foreground font-medium"
                      >
                        + Torvleie svar
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setAdminReplyText(
                            'Takk for henvendelsen! Vi undersøker saken og kommer tilbake til deg i løpet av kort tid.'
                          )
                        }
                        className="px-2 py-0.5 rounded bg-surface-muted hover:bg-border text-[10px] text-foreground font-medium"
                      >
                        + Standard bekreftelse
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSendAdminReply} className="flex gap-2">
                    <textarea
                      rows={2}
                      value={adminReplyText}
                      onChange={(e) => setAdminReplyText(e.target.value)}
                      placeholder="Skriv et svar direkte til den besøkende..."
                      className="flex-1 px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground outline-none focus:ring-2 focus:ring-primary resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendAdminReply();
                        }
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!adminReplyText.trim() || sendingReply}
                      className="px-4 bg-primary text-primary-foreground font-semibold text-xs sm:text-sm rounded-xl hover:bg-primary-hover disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <Send className="w-4 h-4" />
                      <span className="hidden sm:inline">Send svar</span>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-foreground-muted">
                <MessageSquare className="w-12 h-12 text-border mb-3" />
                <h4 className="font-bold text-sm text-foreground">Ingen samtale valgt</h4>
                <p className="text-xs text-foreground-subtle max-w-sm mt-1">
                  Velg en samtale fra listen til venstre for å se dialogen og svare brukeren.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FANE 2: KONTAKTSKJEMA & E-POSTER */}
      {activeTab === 'contact' && (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden divide-y divide-border shadow-sm">
          {contactMessages.length === 0 ? (
            <div className="p-12 text-center text-xs text-foreground-muted">
              Ingen kontaktskjemameldinger mottatt ennå.
            </div>
          ) : (
            contactMessages.map((m) => {
              const isSelected = selectedContactId === m.id;
              return (
                <div key={m.id} className="transition-colors">
                  <div
                    onClick={() => setSelectedContactId(isSelected ? null : m.id)}
                    className={`px-6 py-4 flex items-center gap-4 hover:bg-surface-muted cursor-pointer ${
                      !m.read ? 'bg-primary-light/20' : ''
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        !m.read
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-surface-muted text-foreground-muted'
                      }`}
                    >
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm ${
                            !m.read ? 'font-bold text-foreground' : 'font-medium text-foreground'
                          }`}
                        >
                          {m.name}
                        </span>
                        <span className="text-xs text-foreground-subtle">
                          {m.createdAt ? new Date(m.createdAt).toLocaleDateString('nb-NO') : 'Nylig'}
                        </span>
                      </div>
                      <p
                        className={`text-sm truncate ${
                          !m.read ? 'text-foreground font-medium' : 'text-foreground-muted'
                        }`}
                      >
                        {m.subject || 'Ingen emne'}
                      </p>
                      <p className="text-xs text-foreground-subtle">{m.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!m.read && <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />}
                      {isSelected ? (
                        <ChevronUp className="w-4 h-4 text-foreground-subtle" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-foreground-subtle" />
                      )}
                    </div>
                  </div>

                  {/* Fullt innhold */}
                  {isSelected && (
                    <div className="px-6 py-4 bg-surface-muted/60 border-t border-border/60 space-y-3 animate-slide-down">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-foreground-muted">
                        <span className="flex items-center gap-1 font-semibold">
                          <User className="w-3.5 h-3.5 text-primary" /> {m.name} &lt;{m.email}&gt;
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-primary" />{' '}
                          {m.createdAt
                            ? new Date(m.createdAt).toLocaleString('nb-NO', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })
                            : 'Nylig'}
                        </span>
                      </div>
                      <div className="p-4 bg-surface rounded-xl border border-border text-sm text-foreground leading-relaxed whitespace-pre-line">
                        {m.message}
                      </div>
                      <div className="flex gap-2 justify-end pt-1">
                        <a
                          href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(
                            m.subject || 'Henvendelse til Tønsberglivet'
                          )}`}
                          className="px-4 py-2 bg-primary text-primary-foreground font-medium text-xs rounded-xl hover:bg-primary-hover transition-colors"
                        >
                          Svar på e-post
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
