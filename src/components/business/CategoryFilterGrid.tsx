'use client';

import { useState } from 'react';
import { BusinessGrid } from '@/components/business/BusinessGrid';
import type { BedriftKort } from '@/lib/business-directory';

/**
 * Kategorifiltrene på /bylivet var `<button>` uten onClick, og den første så
 * «valgt» ut uansett. De filtrerte ingenting. Her er de koblet til state.
 *
 * Filtreringen skjer i minnet: siden henter allerede hele listen fra
 * bedriftsregisteret, så vi trenger ikke et nytt API-kall per kategori.
 */

const ETIKETTER: Array<{ verdi: string; etikett: string }> = [
  { verdi: 'ALLE', etikett: 'Alle' },
  { verdi: 'SHOPPING', etikett: 'Shopping' },
  { verdi: 'MAT_DRIKKE', etikett: 'Mat & drikke' },
  { verdi: 'AKTIVITET', etikett: 'Aktivitet' },
  { verdi: 'OVERNATTING', etikett: 'Overnatting' },
  { verdi: 'KULTUR', etikett: 'Kultur' },
];

interface Props {
  steder: BedriftKort[];
}

export function CategoryFilterGrid({ steder }: Props) {
  const [valgt, setValgt] = useState('ALLE');

  const tilgjengelige = ETIKETTER.filter(
    (e) => e.verdi === 'ALLE' || steder.some((s) => s.kategori === e.verdi),
  );

  const filtrert =
    valgt === 'ALLE' ? steder : steder.filter((s) => s.kategori === valgt);

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">Utforsk sentrum</h2>
          <p className="text-foreground-muted text-sm mt-0.5">
            {valgt === 'ALLE'
              ? 'Steder å besøke og ting å oppleve'
              : `${filtrert.length} treff i kategorien «${tilgjengelige.find((e) => e.verdi === valgt)?.etikett ?? valgt}»`}
          </p>
        </div>

        <div className="tap-target-list flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto scrollbar-none">
          {tilgjengelige.map((kategori) => {
            const aktiv = valgt === kategori.verdi;
            return (
              <button
                key={kategori.verdi}
                type="button"
                onClick={() => setValgt(kategori.verdi)}
                aria-pressed={aktiv}
                className={`px-4 py-2.5 sm:py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  aktiv
                    ? 'bg-primary text-white'
                    : 'bg-surface text-foreground hover:bg-surface-muted border border-border'
                }`}
              >
                {kategori.etikett}
              </button>
            );
          })}
        </div>
      </div>

      <BusinessGrid
        bedrifter={filtrert}
        tomTekst={
          valgt === 'ALLE'
            ? 'Ingen steder er publisert i registeret ennå.'
            : 'Ingen steder er publisert i denne kategorien ennå.'
        }
      />
    </>
  );
}
