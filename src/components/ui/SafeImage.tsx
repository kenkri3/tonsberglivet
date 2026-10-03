'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';

/**
 * Bilde med innebygd reserve.
 *
 * Noen bilder fra migreringen finnes ikke lokalt: de lå bak Cloudflare på det
 * gamle anlegget og svarte 403 da vi hentet dem. Databasen peker fortsatt på
 * dem, og en vanlig <img> viser da et brutt bildeikon med alt-teksten som
 * løs tekst – det ser ut som en feil i nettstedet, ikke som et bilde vi ikke
 * har.
 *
 * Her bytter vi i stedet til et designet felt med arrangementets ikon. Det
 * skjer bare når bildet faktisk feiler, så bilder som virker er urørt – også
 * de som fortsatt lastes fra den gamle siden.
 */
export function SafeImage({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  const [feilet, setFeilet] = useState(false);

  if (!src || feilet) {
    return (
      <div
        className={`${className ?? ''} bg-gradient-to-br from-primary/15 via-primary/5 to-transparent flex items-center justify-center`}
        role="img"
        aria-label={alt}
      >
        <Calendar className="w-8 h-8 text-primary/40" aria-hidden="true" />
      </div>
    );
  }

  return (
    // Vanlig <img>: kildene er blandet, og noen er eksterne verter som ikke er
    // kjent for next/image på forhånd.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setFeilet(true)}
    />
  );
}
