'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface Props {
  /** Tittel som deles. */
  title: string;
  /** Valgfri tekst. */
  text?: string;
  className?: string;
}

/**
 * Del-knapp for arrangements- og nyhetssider.
 *
 * Knappene på disse sidene var tidligere `<button>` uten onClick, så de gjorde
 * ingenting. Denne bruker Web Share API der det finnes (mobil og Safari), og
 * faller tilbake til å kopiere lenken til utklippstavlen.
 */
export function ShareButton({ title, text, className }: Props) {
  const [kopiert, setKopiert] = useState(false);

  const del = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';

    // 1. Innfødt delingsark der det er tilgjengelig.
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err: unknown) {
        // Brukeren avbrøt – ikke en feil, og vi skal ikke falle tilbake til
        // utklippstavlen da.
        if (err instanceof DOMException && err.name === 'AbortError') return;
      }
    }

    // 2. Fallback: kopier lenken.
    try {
      await navigator.clipboard.writeText(url);
      setKopiert(true);
      setTimeout(() => setKopiert(false), 2500);
    } catch {
      // Siste utvei: marker og be brukeren kopiere selv.
      window.prompt('Kopier lenken:', url);
    }
  };

  return (
    <button
      type="button"
      onClick={del}
      className={
        className ??
        'inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline'
      }
      title="Del denne lenken"
    >
      {kopiert ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
      {kopiert ? 'Lenken er kopiert' : 'Del'}
    </button>
  );
}
