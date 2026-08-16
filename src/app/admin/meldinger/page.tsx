'use client';

import { useState, useEffect } from 'react';
import { Mail, RefreshCw, ChevronDown, ChevronUp, User, Clock } from 'lucide-react';

interface Message {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  read: boolean;
  createdAt?: string;
}

export default function AdminMeldingerPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact');
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (e) {
      console.error('Failed to load messages:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Innboks & Meldinger</h2>
          <p className="text-foreground-muted text-sm mt-1">
            {unreadCount} uleste henvendelser av {messages.length} totalt
          </p>
        </div>
        <button
          onClick={fetchMessages}
          className="p-2.5 bg-surface-muted hover:bg-border rounded-xl text-foreground-muted transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Oppdater
        </button>
      </div>

      <div className="bg-surface rounded-2xl border border-border overflow-hidden divide-y divide-border shadow-sm">
        {messages.map((m) => {
          const isSelected = selectedId === m.id;
          return (
            <div key={m.id} className="transition-colors">
              <div
                onClick={() => setSelectedId(isSelected ? null : m.id)}
                className={`px-6 py-4 flex items-center gap-4 hover:bg-surface-muted cursor-pointer ${
                  !m.read ? 'bg-primary-light/20' : ''
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    !m.read ? 'bg-primary text-primary-foreground' : 'bg-surface-muted text-foreground-muted'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${!m.read ? 'font-bold text-foreground' : 'font-medium text-foreground'}`}>
                      {m.name}
                    </span>
                    <span className="text-xs text-foreground-subtle">
                      {m.createdAt ? new Date(m.createdAt).toLocaleDateString('nb-NO') : 'Nylig'}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${!m.read ? 'text-foreground font-medium' : 'text-foreground-muted'}`}>
                    {m.subject || 'Ingen emne'}
                  </p>
                  <p className="text-xs text-foreground-subtle">{m.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!m.read && <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />}
                  {isSelected ? <ChevronUp className="w-4 h-4 text-foreground-subtle" /> : <ChevronDown className="w-4 h-4 text-foreground-subtle" />}
                </div>
              </div>

              {/* Full melding innhold */}
              {isSelected && (
                <div className="px-6 py-4 bg-surface-muted/60 border-t border-border/60 space-y-3 animate-slide-down">
                  <div className="flex items-center justify-between text-xs text-foreground-muted">
                    <span className="flex items-center gap-1 font-semibold"><User className="w-3.5 h-3.5 text-primary" /> {m.name} &lt;{m.email}&gt;</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-primary" /> {m.createdAt}</span>
                  </div>
                  <div className="p-4 bg-surface rounded-xl border border-border text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {m.message}
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <a
                      href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || 'Henvendelse til Tønsberglivet')}`}
                      className="px-4 py-2 bg-primary text-primary-foreground font-medium text-xs rounded-xl hover:bg-primary-hover transition-colors"
                    >
                      Svar på e-post
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
