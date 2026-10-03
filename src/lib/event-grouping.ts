import type { TicketmasterEvent } from './ticketmaster';

/**
 * Én forestilling av samme produksjon.
 */
export interface EventPerformance {
  id: string;
  /** Visningsdato, f.eks. «14. nov 2026». */
  date: string;
  /** Klokkeslett, f.eks. «15:00». */
  time: string;
  ticketUrl: string;
  priceRange?: string;
}

/**
 * En produksjon med én eller flere forestillinger.
 */
export interface GroupedEvent {
  key: string;
  title: string;
  location: string;
  category: string;
  description?: string;
  /**
   * Arrangementets eget artwork. Tom streng når kilden ikke har noe bilde, og
   * også når bildet allerede er brukt på et tidligere kort (se
   * {@link dedupeEventImages}) – kortet viser da sin egen merkevareflate.
   */
  imageUrl: string;
  /** Den tidligste forestillingen – den kortet lenker til. */
  next: EventPerformance;
  /** Alle forestillinger, stigende etter dato. */
  performances: EventPerformance[];
  /** Antall forestillinger utover den første. */
  extraCount: number;
}

/** Nøkkel som slår sammen samme produksjon på samme sted. */
function groupKey(event: TicketmasterEvent): string {
  const norm = (value: string) =>
    String(value || '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^a-z0-9æøå ]/g, '')
      .trim();
  return `${norm(event.title)}|${norm(event.venueName || event.location || '')}`;
}

/**
 * Identitet for et bilde, uavhengig av størrelsesvariant og query-streng.
 *
 * Ticketmaster leverer samme foto i flere varianter
 * (`..._RETINA_PORTRAIT_16_9.jpg`, `..._RETINA_LANDSCAPE_16_9.jpg`), og
 * bilde-CDN-er legger bredde og format i query-strengen. Uten normalisering
 * ville to kort med nøyaktig samme foto blitt vurdert som to ulike bilder.
 */
export function eventImageIdentity(imageUrl?: string | null): string {
  const raw = String(imageUrl || '').trim();
  if (!raw) return '';

  let path = raw;
  try {
    path = new URL(raw).pathname;
  } catch {
    path = raw.split(/[?#]/)[0];
  }

  const lower = path.toLowerCase();
  const dot = lower.lastIndexOf('.');
  const extension = dot > 0 ? lower.slice(dot) : '';
  const base = dot > 0 ? lower.slice(0, dot) : lower;

  return `${base.replace(/_(retina|tablet|mobile|desktop|artist|default|hero|card|large|medium|small|thumb)[a-z0-9_]*$/, '')}${extension}`;
}

/**
 * Sikrer at hvert bilde brukes på maks ett kort.
 *
 * Kilden kan gi samme foto til flere arrangementer – samme artist eller
 * arrangør, eller én delt markedsføringsflate. Da sto flere kort med nøyaktig
 * samme bilde og så ut som duplikater. Første kort i rekkefølgen (tidligste
 * forestilling) beholder bildet; senere kort får tom `imageUrl` og viser sin
 * egen merkevareflate i stedet for å gjenta et foto leseren alt har sett.
 *
 * Funksjonen er idempotent og muterer ikke inndataene.
 */
export function dedupeEventImages(groups: GroupedEvent[]): GroupedEvent[] {
  const used = new Set<string>();
  let changed = false;

  const deduped = groups.map((group) => {
    const identity = eventImageIdentity(group.imageUrl);
    if (!identity) return group;
    if (used.has(identity)) {
      changed = true;
      return { ...group, imageUrl: '' };
    }
    used.add(identity);
    return group;
  });

  return changed ? deduped : groups;
}

/**
 * Slår sammen forestillinger av samme produksjon til ett kort.
 *
 * Ticketmaster lister hver forestilling som et eget arrangement. Uten
 * gruppering fylte «Snedronningen» fire nesten identiske kort og «Julegalla»
 * fem. Vi beholder alle forestillingene – de har egne datoer og billettlenker –
 * men viser dem på ett kort med antall og en dato-liste.
 *
 * Inndata forutsettes sortert stigende på dato (det gjør API-et), så første
 * forekomst av en gruppe er den tidligste forestillingen.
 *
 * Returen er alltid bilde-deduplisert, slik at ingen rutenett kan vise samme
 * foto to ganger – uansett hva kilden måtte sende.
 */
export function groupEventPerformances(events: TicketmasterEvent[]): GroupedEvent[] {
  const groups = new Map<string, GroupedEvent>();

  for (const event of events) {
    if (!event?.title) continue;

    const key = groupKey(event);
    const performance: EventPerformance = {
      id: event.id,
      date: event.date,
      time: event.time,
      ticketUrl: event.ticketUrl,
      priceRange: event.priceRange,
    };

    const existing = groups.get(key);
    if (!existing) {
      groups.set(key, {
        key,
        title: event.title,
        location: event.venueName || event.location || '',
        category: event.category,
        description: event.description,
        imageUrl: event.imageUrl || '',
        next: performance,
        performances: [performance],
        extraCount: 0,
      });
      continue;
    }

    existing.performances.push(performance);
    existing.extraCount = existing.performances.length - 1;
    // Behold artwork dersom en senere forekomst har det og den første manglet.
    if (!existing.imageUrl && event.imageUrl) existing.imageUrl = event.imageUrl;
    if (!existing.description && event.description) existing.description = event.description;
  }

  return dedupeEventImages([...groups.values()]);
}

/** Kort, lesbar dato uten årstall: «14. nov 2026» → «14. nov». */
export function shortDateLabel(date: string): string {
  return String(date || '').replace(/\s*\d{4}\s*$/, '').trim();
}
