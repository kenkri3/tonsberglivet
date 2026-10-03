import Link from 'next/link';
import { ArrowLeft, Newspaper } from 'lucide-react';

/**
 * Vises når en nyhetssak ikke finnes – enten lenken er skrevet feil, eller
 * saken er trukket tilbake. Vi viser aldri en annen sak i stedet.
 */
export default function NewsNotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-lg w-full bg-surface border border-border rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-xs">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Newspaper className="w-6 h-6 text-primary" />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">404 – siden finnes ikke</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Denne saken finnes ikke
          </h1>
          <p className="text-sm text-foreground-muted leading-relaxed">
            Lenken kan være utdatert, eller saken er trukket tilbake. Alle publiserte saker ligger i nyhetsoversikten.
          </p>
        </div>

        <Link
          href="/nyheter"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Til alle nyheter
        </Link>
      </div>
    </main>
  );
}
