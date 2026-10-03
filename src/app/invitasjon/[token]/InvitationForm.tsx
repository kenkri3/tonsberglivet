'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Mail, User } from 'lucide-react';

const MIN_PASSWORD_LENGTH = 8;

interface Props {
  token: string;
  email: string;
  suggestedName: string;
  expiresAt: string;
}

/**
 * Skjemaet den inviterte bruker for å velge passord. Passordet sendes bare til
 * /api/auth/invitations/accept – vi lagrer det aldri i klienten.
 */
export function InvitationForm({ token, email, suggestedName, expiresAt }: Props) {
  const [name, setName] = useState(suggestedName);
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const expires = new Date(expiresAt).toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Passordet må ha minst ${MIN_PASSWORD_LENGTH} tegn.`);
      return;
    }
    if (password !== repeat) {
      setError('Passordene er ikke like. Skriv dem inn på nytt.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, name, password }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setError(json?.error || `Kunne ikke aktivere kontoen (HTTP ${res.status}).`);
        return;
      }
      setDone(true);
    } catch {
      setError('Nettverksfeil: kontoen ble ikke aktivert. Prøv igjen.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-sm text-foreground">
            <p className="font-bold">Kontoen er aktivert</p>
            <p className="text-foreground-muted mt-0.5">
              Du kan nå logge inn på {email} med passordet du valgte.
            </p>
          </div>
        </div>
        <Link
          href="/login"
          className="block w-full text-center py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary-hover transition-colors"
        >
          Gå til innlogging
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">E-post</label>
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-foreground">
          <Mail className="w-4 h-4 text-foreground-subtle shrink-0" />
          <span className="truncate">{email}</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="invite-name" className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
          Navn
        </label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
          <input
            id="invite-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Fornavn Etternavn"
            autoComplete="name"
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="invite-password" className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
          Velg passord
        </label>
        <div className="relative">
          <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
          <input
            id="invite-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={`Minst ${MIN_PASSWORD_LENGTH} tegn`}
            autoComplete="new-password"
            className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-foreground-subtle hover:text-foreground"
            aria-label={showPassword ? 'Skjul passord' : 'Vis passord'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="invite-repeat" className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
          Gjenta passordet
        </label>
        <div className="relative">
          <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
          <input
            id="invite-repeat"
            type={showPassword ? 'text' : 'password'}
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
            placeholder="Skriv passordet én gang til"
            autoComplete="new-password"
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {error && (
        <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3.5 py-2.5">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {submitting ? 'Aktiverer …' : 'Aktiver kontoen'}
      </button>

      <p className="text-[11px] text-foreground-subtle text-center">
        Lenken er personlig og gyldig til {expires}.
      </p>
    </form>
  );
}
