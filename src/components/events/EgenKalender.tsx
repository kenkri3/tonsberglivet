import Link from 'next/link';
import { Calendar, MapPin, Clock, Ticket, ArrowRight } from 'lucide-react';

/**
 * Tønsberglivets egen arrangementskalender.
 *
 * `/eventer` viste tidligere bare Ticketmaster-feeden. Den er ekstern og
 * inneholder bare det som selges billetter til. Etter migreringen av kundens
 * nettsted ligger det 1095 arrangementer i vår egen database – konserter,
 * markeder, bibliotekarrangementer og festivaler som aldri har vært synlige
 * på den nye siden.
 *
 * Denne seksjonen viser dem, i tillegg til Ticketmaster-listen under. Ren
 * presentasjonskomponent uten datahenting, så den kan brukes både fra server
 * og klient.
 */

export interface EgetArrangement {
  id: string;
  slug: string;
  tittel: string;
  sted: string | null;
  startDato: string; // ISO
  startTid: string | null;
  kategori: string;
  bilde: string | null;
  billettlenke: string | null;
}

const KATEGORI_ETIKETT: Record<string, string> = {
  ARRANGEMENT: 'Arrangement',
  KONSERT: 'Konsert',
  MARKED: 'Marked',
  KURS: 'Kurs',
  BARN: 'Barn',
  SPORT: 'Sport',
  KULTUR: 'Kultur',
  FESTIVAL: 'Festival',
};

const dato = (iso: string) =>
  new Intl.DateTimeFormat('nb-NO', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(iso));

export function EgenKalender({
  arrangementer,
  antallTotalt,
}: {
  arrangementer: EgetArrangement[];
  antallTotalt?: number;
}) {
  if (arrangementer.length === 0) {
    return (
      <section className="container mx-auto px-4 mt-8">
        <div className="p-6 rounded-3xl border border-dashed border-border text-center">
          <p className="text-sm text-foreground-muted">
            Ingen kommende arrangementer er publisert i Tønsberglivets kalender akkurat nå.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 mt-10 space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Tønsberglivets kalender
          </h2>
          <p className="text-sm text-foreground-muted mt-1">
            {antallTotalt && antallTotalt > arrangementer.length
              ? `Viser de ${arrangementer.length} nærmeste av ${antallTotalt} kommende arrangementer.`
              : `${arrangementer.length} kommende arrangementer fra Tønsberglivets egen kalender.`}
          </p>
        </div>
        <Link href="/eventer?vis=alle" className="text-sm font-semibold text-primary hover:underline">
          Se alle kommende &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {arrangementer.map((a) => (
          <Link
            key={a.id}
            href={`/eventer/${a.slug}`}
            className="group bg-surface rounded-3xl border border-border/80 overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all flex flex-col"
          >
            {a.bilde ? (
              // Vanlig <img>: bildene kommer fra ulike kilder og er ikke
              // nødvendigvis kjent for next/image på forhånd.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={a.bilde}
                alt={a.tittel}
                loading="lazy"
                className="w-full h-40 object-cover group-hover:scale-[1.03] transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-40 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent flex items-center justify-center">
                <Calendar className="w-8 h-8 text-primary/50" />
              </div>
            )}

            <div className="p-5 space-y-2.5 flex-1 flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                {KATEGORI_ETIKETT[a.kategori] ?? 'Arrangement'}
              </span>
              <h3 className="font-bold text-foreground leading-snug line-clamp-2">{a.tittel}</h3>

              <div className="mt-auto pt-3 space-y-1.5 text-xs text-foreground-subtle">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="capitalize">{dato(a.startDato)}</span>
                  {a.startTid && (
                    <>
                      <Clock className="w-3.5 h-3.5 text-primary shrink-0 ml-1" />
                      <span>{a.startTid}</span>
                    </>
                  )}
                </div>
                {a.sted && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">{a.sted}</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {antallTotalt && antallTotalt > arrangementer.length && (
        <div className="text-center pt-2">
          <Link
            href="/eventer?vis=alle"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-hover transition-colors"
          >
            <Ticket className="w-4 h-4" />
            Se alle {antallTotalt} kommende arrangementer
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </section>
  );
}
