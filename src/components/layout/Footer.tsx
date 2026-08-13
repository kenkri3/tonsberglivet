import Link from 'next/link';
import { MapPin, Phone, Mail, ArrowUp } from 'lucide-react';

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z" />
    </svg>
  );
}
import { footerLinks } from '@/lib/navigation';

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-auto">
      {/* Hovedinnhold */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          {/* Kolonne 1 — Om Tønsberglivet */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-xl font-bold tracking-tight text-foreground">
                tønsberglivet
              </span>
            </Link>
            <p className="text-foreground-muted text-sm leading-relaxed mb-6">
              Tønsberglivet er et samarbeid mellom aktører som vil bidra til 
              mer synlighet, mer stolthet, mer liv og mer kraft i hele regionen.
            </p>
            <div className="space-y-3 text-sm text-foreground-muted">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>Rådhusgaten 1, 3126 Tønsberg</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href="tel:+4797169755" className="hover:text-foreground transition-colors">
                  +47 971 69 755
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href="mailto:hei@tonsberglivet.no" className="hover:text-foreground transition-colors">
                  hei@tonsberglivet.no
                </a>
              </div>
            </div>
          </div>

          {/* Kolonne 2 — Om oss */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              Om oss
            </h3>
            <ul className="space-y-3">
              {footerLinks.omOss.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground-muted hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolonne 3 — Utforsk */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              Utforsk
            </h3>
            <ul className="space-y-3">
              {footerLinks.utforsk.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground-muted hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolonne 4 — Tjenester + Nyhetsbrev */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              Tjenester
            </h3>
            <ul className="space-y-3 mb-8">
              {footerLinks.tjenester.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground-muted hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Nyhetsbrev */}
            <div>
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
                Nyhetsbrev
              </h3>
              <p className="text-sm text-foreground-muted mb-3">
                Hold deg oppdatert på det som skjer i Tønsberg.
              </p>
              <form className="flex gap-2" action="#">
                <input
                  type="email"
                  placeholder="Din e-postadresse"
                  className="flex-1 min-w-0 px-3 py-2 text-sm bg-surface-muted border border-border
                             rounded-lg text-foreground placeholder:text-foreground-subtle
                             focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground
                             rounded-lg hover:bg-primary-hover transition-colors whitespace-nowrap"
                >
                  Meld på
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Sosiale medier */}
        <div className="flex items-center gap-4 mt-12 pt-8 border-t border-border">
          <span className="text-sm text-foreground-muted">Følg oss:</span>
          <div className="flex gap-3">
            <a
              href="https://facebook.com/tonsberglivet"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-surface-muted
                         hover:bg-primary hover:text-primary-foreground text-foreground-muted
                         transition-all duration-200"
              aria-label="Facebook"
            >
              <FacebookIcon className="w-4 h-4" />
            </a>
            <a
              href="https://instagram.com/tonsberglivet"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-surface-muted
                         hover:bg-primary hover:text-primary-foreground text-foreground-muted
                         transition-all duration-200"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com/company/tonsberglivet"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-surface-muted
                         hover:bg-primary hover:text-primary-foreground text-foreground-muted
                         transition-all duration-200"
              aria-label="LinkedIn"
            >
              <LinkedinIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Bunnlinje */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-foreground-subtle">
              © {new Date().getFullYear()} Tønsberglivet AS. Alle rettigheter reservert.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/personvern"
                className="text-xs text-foreground-subtle hover:text-foreground-muted transition-colors"
              >
                Personvern
              </Link>
              <Link
                href="/informasjonskapsler"
                className="text-xs text-foreground-subtle hover:text-foreground-muted transition-colors"
              >
                Informasjonskapsler
              </Link>
              <a
                href="#top"
                className="flex items-center gap-1 text-xs text-foreground-subtle hover:text-foreground-muted transition-colors"
              >
                Til toppen
                <ArrowUp className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
