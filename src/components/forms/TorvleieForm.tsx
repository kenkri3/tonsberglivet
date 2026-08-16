'use client';

import { useState } from 'react';
import { CheckCircle2, AlertCircle, Send } from 'lucide-react';

export function TorvleieForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    type: 'DAGPLASS',
    startDate: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

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
          email: formData.email,
          phone: formData.phone,
          type: formData.type,
          startDate: formData.startDate,
          message: formData.message,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setFormData({
          firstName: '',
          lastName: '',
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
          <option value="DAGPLASS">Dagplass</option>
          <option value="SESONG">Sesongplass</option>
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
