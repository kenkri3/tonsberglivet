import Link from 'next/link';
import { MapPin, Phone, Globe, Clock, Mail } from 'lucide-react';
import type { BedriftKort } from '@/lib/business-directory';

/**
 * Kortgrid for bedrifter fra databasen.
 *
 * Erstatter de håndskrevne listene som sto i JSX-en på landingssidene. Viser
 * bare felter som faktisk har innhold – mange av bedriftene fra kildesiden
 * mangler telefon eller nettside, og tomme rader ser ut som feil.
 */

const OMRADE_ETIKETT: Record<string, string> = {
  TONSBERG_SENTRUM: 'Tønsberg sentrum',
  TONSBERG_KOMMUNE: 'Tønsberg kommune',
  FAERDER_KOMMUNE: 'Færder kommune',
};

const KATEGORI_ETIKETT: Record<string, string> = {
  SHOPPING: 'Shopping',
  MAT_DRIKKE: 'Mat & drikke',
  AKTIVITET: 'Aktivitet',
  OVERNATTING: 'Overnatting',
  FRISOR_VELVERE: 'Frisør & velvære',
  KULTUR: 'Kultur',
  BARN: 'Barn',
  ANNET: 'Annet',
};

interface Props {
  bedrifter: BedriftKort[];
  /** Skjul kategorimerket når alle i listen har samme kategori. */
  visKategori?: boolean;
  /** Tekst når listen er tom. */
  tomTekst?: string;
  aksent?: string;
}

export function BusinessGrid({
  bedrifter,
  visKategori = true,
  tomTekst = 'Ingen bedrifter er publisert i denne kategorien ennå.',
  aksent = 'text-amber-600',
}: Props) {
  if (bedrifter.length === 0) {
    return (
      <div className="p-8 rounded-3xl border border-dashed border-border text-center">
        <p className="text-sm text-foreground-muted">{tomTekst}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {bedrifter.map((b) => (
        <article
          key={b.id}
          className="bg-surface rounded-3xl border border-border/80 p-6 sm:p-7 space-y-3 hover:shadow-xl hover:border-primary/30 transition-all flex flex-col"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-bold text-lg text-foreground leading-snug">{b.navn}</h3>
            {visKategori && KATEGORI_ETIKETT[b.kategori] && (
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-surface-muted ${aksent} shrink-0`}>
                {KATEGORI_ETIKETT[b.kategori]}
              </span>
            )}
          </div>

          {b.beskrivelse && (
            <p className="text-sm text-foreground-muted leading-relaxed font-light line-clamp-4">
              {b.beskrivelse}
            </p>
          )}

          <dl className="mt-auto pt-4 border-t border-border/40 space-y-1.5 text-xs text-foreground-subtle">
            {b.adresse && (
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                <span>{b.adresse}</span>
              </div>
            )}
            {b.apningstider && (
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                <span>{b.apningstider}</span>
              </div>
            )}
            {b.telefon && (
              <div className="flex items-start gap-2">
                <Phone className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                <a href={`tel:${b.telefon.replace(/\s/g, '')}`} className="hover:text-foreground transition-colors">
                  {b.telefon}
                </a>
              </div>
            )}
            {b.epost && (
              <div className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                <a href={`mailto:${b.epost}`} className="hover:text-foreground transition-colors break-all">
                  {b.epost}
                </a>
              </div>
            )}
            {b.nettside && (
              <div className="flex items-start gap-2">
                <Globe className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                <a
                  href={b.nettside}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="hover:text-foreground transition-colors break-all"
                >
                  {b.nettside.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              </div>
            )}
          </dl>

          {OMRADE_ETIKETT[b.omrade] && (
            <p className="text-[11px] text-foreground-subtle">{OMRADE_ETIKETT[b.omrade]}</p>
          )}
        </article>
      ))}
    </div>
  );
}

/** Rad med kategorilenker og antall, bygget fra databasen. */
export function CategoryPills({
  tellinger,
  baseSti,
  aktiv,
  etiketter,
}: {
  tellinger: Record<string, number>;
  baseSti: string;
  aktiv?: string;
  etiketter: Record<string, { label: string; href: string }>;
}) {
  const rader = Object.entries(etiketter).filter(([nokkel]) => tellinger[nokkel]);
  if (rader.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {rader.map(([nokkel, { label, href }]) => (
        <Link
          key={nokkel}
          href={href}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${
            aktiv === nokkel
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-surface border-border text-foreground hover:border-primary/40'
          }`}
        >
          {label}
          <span className="text-xs opacity-70">{tellinger[nokkel]}</span>
        </Link>
      ))}
    </div>
  );
}
