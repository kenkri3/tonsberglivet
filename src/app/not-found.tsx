import Link from 'next/link';
import { ArrowLeft, Compass, Newspaper, Ticket } from 'lucide-react';

/**
 * Global 404-side. Uten denne viser Next sin engelske standardside
 * («This page could not be found»), som skurrer på et norsk nettsted.
 */
export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-lg w-full bg-surface border border-border rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xs">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Compass className="w-6 h-6 text-primary" />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">404 – siden finnes ikke</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Her fant vi ingenting
          </h1>
          <p className="text-sm text-foreground-muted leading-relaxed">
            Lenken kan være utdatert eller skrevet feil. Ta en titt på det som skjer i byen i stedet.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Til forsiden
          </Link>
          <Link
            href="/nyheter"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-muted hover:bg-border text-foreground text-sm font-bold rounded-xl border border-border transition-colors"
          >
            <Newspaper className="w-4 h-4 text-primary" /> Siste nyheter
          </Link>
          <Link
            href="/eventer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-muted hover:bg-border text-foreground text-sm font-bold rounded-xl border border-border transition-colors"
          >
            <Ticket className="w-4 h-4 text-primary" /> Hva skjer?
          </Link>
        </div>
      </div>
    </main>
  );
}
