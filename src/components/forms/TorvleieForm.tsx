'use client';

import { useState } from 'react';
import { CheckCircle2, AlertCircle, Send, Building2, Search, Loader2 } from 'lucide-react';
import type { Company } from '@/lib/brreg';

export function TorvleieForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    orgNr: '',
    email: '',
    phone: '',
    type: 'DAGPLASS',
    startDate: '',
    message: '',
  });

  const [companySearch, setCompanySearch] = useState('');
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [isSearchingCompany, setIsSearchingCompany] = useState(false);
  const [showCompanySearch, setShowCompanySearch] = useState(false);

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearchCompany = async (q: string) => {
    setCompanySearch(q);
    if (q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearchingCompany(true);
    try {
      const res = await fetch(`/api/brreg?q=${encodeURIComponent(q)}&limit=5`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setSearchResults(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearchingCompany(false);
    }
  };

  const handleSelectCompany = (comp: Company) => {
    setFormData((prev) => ({
      ...prev,
      companyName: comp.name,
      orgNr: comp.orgNr,
      message: prev.message || `Foretak: ${comp.name} (${comp.orgForm}), Bransje: ${comp.industry}`
    }));
    setSearchResults([]);
    setShowCompanySearch(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          companyName: formData.companyName,
          orgNr: formData.orgNr,
          email: formData.email,
          phone: formData.phone,
          type: formData.type,
          startDate: formData.startDate,
          message: formData.companyName
            ? `[Bedrift: ${formData.companyName} - Org.nr: ${formData.orgNr}]\n${formData.message}`
            : formData.message,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setFormData({
          firstName: '',
          lastName: '',
          companyName: '',
          orgNr: '',
          email: '',
          phone: '',
          type: 'DAGPLASS',
          startDate: '',
          message: '',
        });
      } else {
        setStatus('error');
        setErrorMessage(typeof data.error === 'string' ? data.error : 'Feil ved innsending');
      }
    } catch (e) {
      setStatus('error');
      setErrorMessage('Nettverksfeil. Prøv igjen senere.');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-success-light/50 border border-success/30 p-8 rounded-2xl text-center space-y-4 animate-slide-up">
        <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
        <h3 className="text-xl font-bold text-foreground">Forespørsel mottatt!</h3>
        <p className="text-sm text-foreground-muted max-w-md mx-auto">
          Takk for din forespørsel om torvleie. Vi gjennomgår søknaden din og tar kontakt på e-post innen kort tid.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-xl text-sm hover:bg-primary-hover transition-colors"
        >
          Send en ny forespørsel
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {status === 'error' && (
        <div className="p-4 bg-error-light text-error rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* Brønnøysund Oppslag Hurtig-knapp */}
      <div className="p-3 bg-surface-muted/60 border border-border rounded-2xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-purple-600" />
            <span>Representerer du en bedrift?</span>
          </span>
          <button
            type="button"
            onClick={() => setShowCompanySearch(!showCompanySearch)}
            className="text-xs font-bold text-primary hover:underline"
          >
            {showCompanySearch ? 'Lukk oppslag' : 'Hent fra Brønnøysund'}
          </button>
        </div>

        {showCompanySearch && (
          <div className="space-y-2 pt-1 relative">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
              <input
                type="text"
                placeholder="Skriv bedriftsnavn eller org.nr..."
                value={companySearch}
                onChange={(e) => handleSearchCompany(e.target.value)}
                className="w-full pl-8 pr-4 py-2 rounded-xl text-xs border border-border bg-background focus:ring-1 focus:ring-primary outline-none"
              />
              {isSearchingCompany && (
                <Loader2 className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-primary" />
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="bg-surface border border-border rounded-xl shadow-lg divide-y divide-border overflow-hidden">
                {searchResults.map((c) => (
                  <button
                    key={c.orgNr}
                    type="button"
                    onClick={() => handleSelectCompany(c)}
                    className="w-full text-left p-2.5 hover:bg-surface-muted transition-colors text-xs space-y-0.5 block"
                  >
                    <div className="font-bold text-foreground">{c.name}</div>
                    <div className="text-[11px] text-foreground-muted">
                      Org.nr: {c.orgNr} • {c.city || 'Tønsberg'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {formData.companyName && (
          <div className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 p-2 rounded-xl flex items-center justify-between">
            <span>Valgt bedrift: <strong>{formData.companyName}</strong> ({formData.orgNr})</span>
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, companyName: '', orgNr: '' }))}
              className="text-[11px] underline text-foreground-muted"
            >
              Fjern
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Fornavn *</label>
          <input
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Etternavn *</label>
          <input
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">E-post *</label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Telefon *</label>
        <input
          type="tel"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Type leie *</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none"
        >
          <option value="DAGPLASS">Dagplass på Torvet</option>
          <option value="SESONG">Sesongplass (vår/sommer)</option>
          <option value="HELAAR">Helårsplass</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Ønsket dato/periode</label>
        <input
          type="text"
          placeholder="F.eks. 15. august 2026"
          value={formData.startDate}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Hva skal du selge/stille ut?</label>
        <textarea
          rows={3}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none resize-none"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full py-3 mt-2 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Send className="w-4 h-4" />
        {status === 'submitting' ? 'Sender forespørsel...' : 'Send forespørsel'}
      </button>
    </form>
  );
}
