'use client';

import { useState } from 'react';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Skjema for partnerskapshenvendelser.
 *
 * Ligger som egen klientkomponent fordi /om-oss/partnere er en serverkomponent.
 * Skjemaet som lå inne i siden hadde felter uten state, uten `name` og en
 * «Send partnerskapshenvendelse»-knapp av typen button uten onClick – den
 * sendte ingenting. Her kobles feltene til /api/partner-application, som
 * lagrer i PartnerApplication-tabellen.
 */
export function PartnerApplicationForm() {
  const [contactName, setContactName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const [sender, setSender] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [sendt, setSendt] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSender(true);
    setFeil(null);

    try {
      const res = await fetch('/api/partner-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName,
          businessName,
          email,
          phone: phone.trim() || undefined,
          message: message.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setFeil(data?.error || 'Kunne ikke sende henvendelsen. Prøv igjen om litt.');
        return;
      }

      setSendt(true);
      setContactName('');
      setBusinessName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch {
      setFeil('Kunne ikke kontakte serveren. Sjekk nettverket og prøv igjen.');
    } finally {
      setSender(false);
    }
  };

  if (sendt) {
    return (
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8 text-center space-y-3">
        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
        <h3 className="font-bold text-foreground">Takk for henvendelsen!</h3>
        <p className="text-sm text-foreground-muted max-w-md mx-auto">
          Den er registrert hos oss, og daglig leder tar kontakt for en uforpliktende
          kaffeprat så snart vi kan.
        </p>
        <button
          type="button"
          onClick={() => setSendt(false)}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Send en ny henvendelse
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="partner-navn" className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
            Ditt navn
          </label>
          <input
            id="partner-navn"
            name="contactName"
            type="text"
            required
            minLength={2}
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none text-foreground text-sm"
            placeholder="Ola Nordmann"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="partner-bedrift" className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
            Bedriftsnavn
          </label>
          <input
            id="partner-bedrift"
            name="businessName"
            type="text"
            required
            minLength={2}
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none text-foreground text-sm"
            placeholder="Firma AS"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="partner-epost" className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
            E-postadresse
          </label>
          <input
            id="partner-epost"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none text-foreground text-sm"
            placeholder="ola@firma.no"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="partner-telefon" className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
            Telefonnummer <span className="font-normal normal-case">(valgfritt)</span>
          </label>
          <input
            id="partner-telefon"
            name="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none text-foreground text-sm"
            placeholder="+47 900 00 000"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="partner-melding" className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
          Hva ønsker dere ut av partnerskapet? <span className="font-normal normal-case">(valgfritt)</span>
        </label>
        <textarea
          id="partner-melding"
          name="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-3.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none text-foreground text-sm"
          placeholder="Fortell oss litt om bedriften din og ambisjonene..."
        />
      </div>

      {feil && (
        <div className="flex items-start gap-2 p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{feil}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={sender}
        className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl shadow-md transition-all text-sm disabled:opacity-60 inline-flex items-center justify-center gap-2"
      >
        {sender && <RefreshCw className="w-4 h-4 animate-spin" />}
        {sender ? 'Sender …' : 'Send partnerskapshenvendelse'}
      </button>
    </form>
  );
}
