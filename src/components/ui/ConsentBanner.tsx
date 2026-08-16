'use client';

import { useState, useEffect } from 'react';
import { getStoredConsent, saveConsent, ConsentState } from '@/lib/consent';
import { ShieldCheck, Cookie, Settings, Check, X } from 'lucide-react';
import Link from 'next/link';

export function ConsentBanner() {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    setConsent(stored);
    setAnalytics(stored.analytics);
    setMarketing(stored.marketing);

    const handleConsentEvent = (e: Event) => {
      const customEvent = e as CustomEvent<ConsentState>;
      setConsent(customEvent.detail);
    };

    window.addEventListener('openConsentSettings', () => {
      setShowDetails(true);
    });
    window.addEventListener('consentChange', handleConsentEvent);

    return () => {
      window.removeEventListener('consentChange', handleConsentEvent);
    };
  }, []);

  if (!consent || consent.decided && !showDetails) {
    return null;
  }

  const handleAcceptAll = () => {
    const updated = saveConsent({ analytics: true, marketing: true });
    setConsent(updated);
    setShowDetails(false);
  };

  const handleRejectAll = () => {
    const updated = saveConsent({ analytics: false, marketing: false });
    setConsent(updated);
    setShowDetails(false);
  };

  const handleSaveCustom = () => {
    const updated = saveConsent({ analytics, marketing });
    setConsent(updated);
    setShowDetails(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 bg-surface/98 backdrop-blur-xl border-t border-border shadow-2xl animate-slide-up">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          <div className="flex items-start gap-4 flex-1">
            <div className="p-3 bg-primary-light text-primary rounded-2xl shrink-0 mt-1">
              <Cookie className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                Personvern og informasjonskapsler
                <span className="text-xs font-normal text-success bg-success-light px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> GDPR-Godkjent
                </span>
              </h3>
              <p className="text-sm text-foreground-muted leading-relaxed max-w-3xl">
                Vi bruker informasjonskapsler for å gi deg en trygg og god brukeropplevelse, samt for anonym besøksstatistikk. Du kan velge hvilke kapsler du tillater. Les mer i vår{' '}
                <Link href="/personvern" className="text-primary underline hover:text-primary-hover">
                  personvernerklæring
                </Link>{' '}
                og{' '}
                <Link href="/informasjonskapsler" className="text-primary underline hover:text-primary-hover">
                  informasjonskapsel-retningslinjer
                </Link>.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-4 py-2.5 text-sm font-medium text-foreground-muted hover:text-foreground border border-border rounded-xl hover:bg-surface-muted transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              {showDetails ? 'Skjul tilpass' : 'Tilpass'}
            </button>
            <button
              onClick={handleRejectAll}
              className="px-5 py-2.5 text-sm font-medium text-foreground bg-surface-muted hover:bg-border rounded-xl transition-colors"
            >
              Kun nødvendige
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-6 py-2.5 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary-hover rounded-xl shadow-sm transition-all"
            >
              Godta alle
            </button>
          </div>

        </div>

        {/* Detaljert valg for GDPR */}
        {showDetails && (
          <div className="mt-6 pt-6 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-down">
            <div className="p-4 bg-surface-muted rounded-xl border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-foreground">1. Nødvendige (Påkrevd)</span>
                <span className="text-xs font-semibold text-success bg-success-light px-2 py-0.5 rounded-full">Alltid aktiv</span>
              </div>
              <p className="text-xs text-foreground-muted">
                Påkrevd for at nettsiden, temavelgeren (mørk/lys) og sikkerhetsfunksjoner skal fungere.
              </p>
            </div>

            <div className="p-4 bg-surface-muted rounded-xl border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-foreground">2. Analytiske kapsler</span>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
                />
              </div>
              <p className="text-xs text-foreground-muted">
                Hjelper oss å forbedre portalen ved å hente anonymisert statistikk om bruk.
              </p>
            </div>

            <div className="p-4 bg-surface-muted rounded-xl border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-foreground">3. Markedsføring</span>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
                />
              </div>
              <p className="text-xs text-foreground-muted">
                Brukes for å måle effekten av kampanjer for byens arrangementer.
              </p>
            </div>

            <div className="md:col-span-3 flex justify-end mt-2">
              <button
                onClick={handleSaveCustom}
                className="px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary-hover transition-colors"
              >
                Lagre mine valg
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
