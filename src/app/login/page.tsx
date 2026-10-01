'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, ArrowRight, KeyRound } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Feil ved innlogging.');
        setLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err: any) {
      setError('Nettverksfeil ved innlogging. Prøv igjen.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      {error && (
        <div className="p-3 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl">
          {error}
        </div>
      )}
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-xs font-bold text-foreground uppercase tracking-wider">
          E-postadresse
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary outline-none font-medium"
            placeholder="navn@tonsberglivet.no"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-xs font-bold text-foreground uppercase tracking-wider">
          Passord
        </label>
        <div className="relative">
          <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary outline-none font-medium"
            placeholder="••••••••••••"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:bg-primary-hover transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? 'Logger inn...' : 'Logg inn'}
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-[85vh] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md space-y-8 bg-surface border border-border p-8 rounded-3xl shadow-xl animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-primary-light text-primary rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Logg inn i Admin Hub</h1>
          <p className="text-sm text-foreground-muted">
            Tilgang for Tønsberglivet AS ansatte, redaktører og styre.
          </p>
        </div>

        {/* Skjema pakket inn i Suspense */}
        <Suspense fallback={<div className="text-center text-xs text-foreground-subtle py-4">Laster inn innlogging...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
