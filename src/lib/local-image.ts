import { existsSync } from 'node:fs';
import path from 'node:path';

/**
 * Velger bildefilen som faktisk ligger i public/, uansett hvilken filendelse
 * lenken i databasen oppgir.
 *
 * HVORFOR: en tidligere import skrev .webp der den faktiske filen er .jpg.
 * Next.js' bildeoptimalisering svarer 400 når kildefilen mangler, og nettleseren
 * viser et brutt bildeikon i stedet for bildet. Feilen er usynlig i databasen –
 * raden ser komplett ut – og vises bare i nettleseren.
 *
 * Dette rammet først nyhetene, deretter arrangementene, og begge steder fordi
 * oppslaget bare var tatt i bruk i én av flere kodeveier. Det bor derfor her,
 * ett sted, og brukes av alle som viser et bilde fra databasen.
 *
 * Server-only: bruker node:fs.
 */

const CACHE = new Map<string, string>();

const ENDELSER = ['.webp', '.jpg', '.jpeg', '.png', '.avif'];

export function resolveLocalImage(src: string | undefined | null): string | undefined {
  if (!src) return undefined;
  if (!src.startsWith('/images/')) return src;

  const cached = CACHE.get(src);
  if (cached) return cached;

  const dot = src.lastIndexOf('.');
  const stamme = dot > src.lastIndexOf('/') ? src.slice(0, dot) : src;
  const kandidater = [src, ...ENDELSER.map((e) => `${stamme}${e}`)];

  for (const kandidat of kandidater) {
    if (existsSync(path.join(process.cwd(), 'public', kandidat))) {
      CACHE.set(src, kandidat);
      return kandidat;
    }
  }

  // Ingen treff: behold originalen så feilen er synlig i loggen, ikke skjult.
  console.warn(`[bilde] Filen mangler på disk: ${src}`);
  return src;
}

/** Bare for tester: tømmer hurtiglageret. */
export function clearLocalImageCache(): void {
  CACHE.clear();
}
