import { getSetting } from './settings';

export interface TicketmasterEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  venueName: string;
  category: string;
  description?: string;
  imageUrl: string;
  ticketUrl: string;
  priceRange?: string;
  source: 'TICKETMASTER' | 'MANUAL';
}

const TM_DISCOVER_URLS = [
  'https://www.ticketmaster.no/discover/tonsberg',
  'https://www.ticketmaster.no/artist/foynhagen-billetter/1280904',
  'https://www.ticketmaster.no/artist/teigen-scene-billetter/1291343',
];

const TONSBERG_LAT = '59.2675';
const TONSBERG_LON = '10.4076';

const VESTFOLD_AREAS = [
  'tønsberg', 'tonsberg',
  'færder', 'faerder',
  'nøtterøy', 'notteroy',
  'tjøme', 'tjome',
  'horten',
  'sem',
  'åsgårdstrand', 'asgardstrand',
  'holmestrand',
  'sandefjord',
  'larvik',
  'stavern',
  'vestfold'
];

/**
 * Format ticket URLs with direct affiliate and tracking parameters (Impact Radius)
 */
export function formatAffiliateTicketUrl(originalUrl?: string): string {
  const targetUrl = originalUrl && originalUrl.trim().length > 0
    ? originalUrl.trim()
    : 'https://www.ticketmaster.no/discover/tonsberg';

  if (targetUrl.includes('ticketmaster.evyy.net')) {
    return targetUrl;
  }

  try {
    const parsed = new URL(targetUrl);
    parsed.searchParams.set('language', 'no-no');
    
    const partnerId = process.env.TICKETMASTER_AFFILIATE_PARTNER_ID || '7597621';
    const campaignId = process.env.TICKETMASTER_AFFILIATE_CAMPAIGN_ID || '1958977';
    const actionTrackerId = process.env.TICKETMASTER_AFFILIATE_ACTION_ID || '23900';
    
    return `https://ticketmaster.evyy.net/c/${partnerId}/${campaignId}/${actionTrackerId}?u=${encodeURIComponent(parsed.toString())}`;
  } catch {
    return `https://ticketmaster.evyy.net/c/7597621/1958977/23900?u=${encodeURIComponent(targetUrl)}`;
  }
}

/**
 * Normalize venue names (e.g. Oseberg Kulturhus -> Teigen Scene, Kaldnes Mek, Foynhagen)
 */
export function normalizeVenueName(venueName: string = '', city: string = 'Tønsberg'): string {
  if (/oseberg kulturhus|teigen scene/i.test(venueName)) {
    return `Teigen Scene, ${city || 'Tønsberg'}`;
  }
  if (/foynhagen/i.test(venueName)) {
    return `Foynhagen, ${city || 'Tønsberg'}`;
  }
  if (/kaldnes/i.test(venueName)) {
    return `Kaldnes Mek., ${city || 'Tønsberg'}`;
  }
  if (/domkirke/i.test(venueName)) {
    return `Tønsberg Domkirke`;
  }
  if (venueName) {
    return city && !venueName.toLowerCase().includes(city.toLowerCase()) ? `${venueName}, ${city}` : venueName;
  }
  return city || 'Tønsberg';
}

/**
 * Map classification or title to human friendly category
 */
export function mapClassificationToCategory(titleOrCat: string = ''): string {
  const t = (titleOrCat || '').toLowerCase();
  if (t.includes('fight') || t.includes('cup') || t.includes('løp') || t.includes('sport')) return 'Aktiviteter';
  if (t.includes('mat') || t.includes('vin') || t.includes('øl') || t.includes('smaking') || t.includes('food')) return 'Mat & Drikke';
  if (t.includes('standup') || t.includes('humor') || t.includes('show') || t.includes('revy') || t.includes('teater')) return 'Teater';
  if (t.includes('konsert') || t.includes('live') || t.includes('musikk') || t.includes('tour') || t.includes('jul') || t.includes('disco') || t.includes('band') || t.includes('music')) return 'Konsert';
  return 'Kultur';
}

export function formatDisplayDate(dateInput: string): string {
  try {
    const d = new Date(dateInput);
    if (!isNaN(d.getTime())) {
      const months = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];
      const day = d.getDate();
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      return `${day}. ${month} ${year}`;
    }
  } catch {}
  return dateInput;
}

export function formatDisplayTime(dateInput: string, explicitTime?: string): string {
  if (explicitTime && explicitTime.includes(':')) {
    return explicitTime.slice(0, 5);
  }
  try {
    const d = new Date(dateInput);
    if (!isNaN(d.getTime())) {
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      if (hours !== '00' || mins !== '00') {
        return `${hours}:${mins}`;
      }
    }
  } catch {}
  return '19:00';
}

/**
 * Fallback-bilde når Ticketmaster ikke leverer artwork.
 * Skal alltid være et ekte bilde fra Tønsberg – aldri et internasjonalt arkivbilde.
 */
export const TONSBERG_EVENT_FALLBACK_IMAGE = '/images/tonsberg/generelt-ticketmaster.jpg';

/** Normalizes raw Ticketmaster API response into standardized portal event objects.
 */
export function normalizeTicketmasterEvent(item: any): TicketmasterEvent {
  const dates = item?.dates?.start;
  const venue = item?._embedded?.venues?.[0];
  const image = item?.images?.find((img: any) => img.ratio === '16_9' && img.width >= 1000)?.url ||
                item?.images?.find((img: any) => img.width > 600)?.url ||
                item?.images?.[0]?.url ||
                TONSBERG_EVENT_FALLBACK_IMAGE;
  const price = item?.priceRanges?.[0];
  const dateIso = dates?.dateTime || (dates?.localDate ? `${dates.localDate}T19:00:00Z` : new Date().toISOString());
  const vName = normalizeVenueName(venue?.name || '', venue?.city?.name || 'Tønsberg');

  return {
    id: `tm-${item.id}`,
    title: item.name || 'Arrangement i Tønsberg',
    date: formatDisplayDate(dateIso),
    time: formatDisplayTime(dateIso, dates?.localTime),
    location: vName,
    venueName: vName,
    category: mapClassificationToCategory(item.name || item.classifications?.[0]?.segment?.name),
    description: item.pleaseNote || item.info || `${item.name} på ${vName}. Kjøp billetter på Ticketmaster og opplev fantastisk stemning!`,
    imageUrl: image,
    ticketUrl: formatAffiliateTicketUrl(item.url),
    priceRange: price ? `Fra ${price.min} ${price.currency || 'NOK'}` : undefined,
    source: 'TICKETMASTER',
  };
}

interface ScrapedRawEvent {
  rawId: string;
  directUrl: string;
  title: string;
  rawDate: string;
  venueName: string;
  category: string;
  imageUrl: string;
  priceRange?: string;
  description?: string;
}

/**
 * Scrapes direct events from Ticketmaster Discover / Artist landing pages.
 * Extracts initial Redux state from Next.js hydration payload.
 */
async function scrapeDirectTmPageEvents(url: string): Promise<ScrapedRawEvent[]> {
  const results: ScrapedRawEvent[] = [];
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'no,nb;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml',
      },
      cache: 'force-cache',
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(12000), // Bounded: a hung upstream must not park the handler
    });
    if (!res.ok) {
      console.warn(`Ticketmaster-siden ${url} svarte HTTP ${res.status}.`);
      return results;
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('html')) {
      // En JSON-/feilside har ingen hydreringspayload og skal ikke tolkes som arrangementer.
      console.warn(`Ticketmaster-siden ${url} svarte med ikke-HTML (${contentType || 'ukjent'}) – avvises.`);
      return results;
    }

    const html = await res.text();
    const matches = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)];

    for (const m of matches) {
      const c = m[1].trim();
      if (c.startsWith('{"props"') || c.includes('"pageProps"')) {
        try {
          const data = JSON.parse(c);
          const reduxQueries = data.props?.pageProps?.initialReduxState?.api?.queries || {};
          for (const [, qVal] of Object.entries(reduxQueries)) {
            const rawEvents = (qVal as any)?.data?.events;
            if (Array.isArray(rawEvents)) {
              for (const item of rawEvents) {
                const title = (item.title || item.name || '').trim();
                if (!title) continue;
                const directUrl = item.url
                  ? (item.url.startsWith('http') ? item.url : `https://www.ticketmaster.no${item.url}`)
                  : '';
                if (!directUrl.includes('/event/')) continue;

                let image = TONSBERG_EVENT_FALLBACK_IMAGE;
                if (item.artists && Array.isArray(item.artists)) {
                  for (const a of item.artists) {
                    const img = a.imageUrls;
                    if (img) {
                      image = img.RETINA_LANDSCAPE_16_9 || img.RETINA_PORTRAIT_16_9 || img.TABLET_LANDSCAPE_16_9 || img.ARTIST_PAGE_3_2 || image;
                      break;
                    }
                  }
                }

                const startIso = item.dates?.startDate || item.dates?.start?.dateTime || (item.dates?.start?.localDate ? `${item.dates.start.localDate}T19:00:00Z` : new Date().toISOString());
                const vName = normalizeVenueName(item.venue?.name || '', item.venue?.city || 'Tønsberg');

                results.push({
                  rawId: String(item.id || item.discoveryId || title),
                  directUrl,
                  title,
                  rawDate: startIso,
                  venueName: vName,
                  category: mapClassificationToCategory(title),
                  imageUrl: image,
                  description: `${title} på ${vName}. Gled deg til fantastisk stemning og minnerike opplevelser i Tønsberg!`
                });
              }
            }
          }
        } catch {
          // ignore parse errors for non-json scripts
        }
      }
    }
  } catch (err: any) {
    console.warn(`Feil ved direkte Ticketmaster-skraping av ${url}:`, err.message);
  }
  return results;
}

/**
 * Fetches events from Ticketmaster Discovery API v2 when API key is configured.
 */
async function fetchTicketmasterApiEvents(apiKey: string): Promise<ScrapedRawEvent[]> {
  const results: ScrapedRawEvent[] = [];
  try {
    const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey.trim()}&latlong=${TONSBERG_LAT},${TONSBERG_LON}&radius=40&unit=km&countryCode=NO&sort=date,asc&size=100`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Tonsberglivet/2.0 post@tonsberglivet.no',
      },
      cache: 'force-cache',
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(12000), // Bounded: a hung upstream must not park the handler
    });
    if (!res.ok) {
      console.warn(`Ticketmaster Discovery API svarte HTTP ${res.status}.`);
      return results;
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('json')) {
      console.warn(`Ticketmaster Discovery API svarte med ikke-JSON (${contentType || 'ukjent'}) – avvises.`);
      return results;
    }

    const data = await res.json();
    const rawEvents = data._embedded?.events || [];

    const localEvents = rawEvents.filter((item: any) => {
      const venue = item._embedded?.venues?.[0];
      const city = (venue?.city?.name || '').toLowerCase();
      const vName = (venue?.name || '').toLowerCase();
      const evtName = (item.name || '').toLowerCase();
      if (VESTFOLD_AREAS.some(area => city.includes(area) || vName.includes(area) || evtName.includes(area))) {
        return true;
      }
      return !city;
    });

    for (const item of localEvents) {
      const venue = item._embedded?.venues?.[0];
      const vName = normalizeVenueName(venue?.name || '', venue?.city?.name || 'Tønsberg');
      const bestImage = item.images?.find((img: any) => img.ratio === '16_9' && img.width >= 1000)?.url ||
                        item.images?.find((img: any) => img.ratio === '16_9' && img.width >= 600)?.url ||
                        item.images?.find((img: any) => img.width >= 600)?.url ||
                        item.images?.[0]?.url ||
                        TONSBERG_EVENT_FALLBACK_IMAGE;
      const priceRange = item.priceRanges?.[0]
        ? `Fra ${item.priceRanges[0].min} ${item.priceRanges[0].currency || 'kr'}`
        : undefined;
      const startIso = item.dates?.start?.dateTime || 
        (item.dates?.start?.localDate ? `${item.dates.start.localDate}T19:00:00Z` : new Date().toISOString());

      results.push({
        rawId: String(item.id || item.name),
        directUrl: item.url,
        title: item.name,
        rawDate: startIso,
        venueName: vName,
        category: mapClassificationToCategory(item.name || item.classifications?.[0]?.segment?.name),
        imageUrl: bestImage,
        priceRange,
        description: item.info || item.pleaseNote || `${item.name} på ${vName}. Gled deg til fantastisk stemning og minnerike opplevelser i Tønsberg.`,
      });
    }
  } catch (err: any) {
    console.warn('Ticketmaster Discovery API v2 feil:', err.message);
  }
  return results;
}

// In-memory cache for ultra-fast (<50ms) serving
let inMemoryCachedEvents: TicketmasterEvent[] | null = null;
let lastSyncTimestamp: number = 0;

export type TicketmasterSource = 'LIVE_API' | 'LIVE_TICKETMASTER_DIRECT' | 'CACHE' | 'UNAVAILABLE';

export interface TicketmasterFeed {
  events: TicketmasterEvent[];
  source: TicketmasterSource;
  isLive: boolean;
  usedDiscoveryApi: boolean;
  /** Satt når ingen fersk data kunne hentes, med norsk forklaring. */
  note?: string;
  lastSync: number;
}

export const TICKETMASTER_UNAVAILABLE_NOTE =
  'Ticketmaster svarte ikke. Vi viser ingen arrangementer i stedet for kuraterte eksempelarrangementer ' +
  'med antatte datoer. Se ticketmaster.no for gjeldende program.';

/**
 * Fetch live events for Tønsberg combining Ticketmaster direct landing hubs & Discovery API.
 * Returnerer alltid kildeinformasjon slik at konsumentene kan skille ekte treff fra tomt svar.
 */
export async function fetchLiveTicketmasterFeed(forceRefresh = false): Promise<TicketmasterFeed> {
  // If cached and fresh (within 1 hour) and no forced refresh, return cache immediately
  if (!forceRefresh && inMemoryCachedEvents && inMemoryCachedEvents.length > 0 && (Date.now() - lastSyncTimestamp < 3600000)) {
    return {
      events: inMemoryCachedEvents,
      source: 'CACHE',
      isLive: true,
      usedDiscoveryApi: false,
      lastSync: lastSyncTimestamp,
    };
  }

  const dynamicKey = await getSetting('ticketmaster_api_key');
  const apiKey = dynamicKey || process.env.TICKETMASTER_API_KEY;
  const hasUsableKey = Boolean(apiKey && apiKey !== 'YOUR_TICKETMASTER_KEY');
  const usedDiscoveryApi = hasUsableKey;

  try {
    const directPromises = TM_DISCOVER_URLS.map(url => scrapeDirectTmPageEvents(url));
    const apiPromise = hasUsableKey
      ? fetchTicketmasterApiEvents(apiKey as string)
      : Promise.resolve([]);

    const [directSettled, apiSettled] = await Promise.all([
      Promise.allSettled(directPromises),
      apiPromise
    ]);

    const directItems: ScrapedRawEvent[] = [];
    for (const res of directSettled) {
      if (res.status === 'fulfilled') {
        directItems.push(...res.value);
      }
    }

    const allRaw = [...directItems, ...apiSettled];

    if (allRaw.length > 0) {
      // Deduplicate by clean direct URL or normalized title
      const seenUrls = new Set<string>();
      const seenTitles = new Set<string>();
      const deduplicated: ScrapedRawEvent[] = [];

      for (const item of allRaw) {
        if (!item.title) continue;
        const cleanUrl = item.directUrl ? item.directUrl.split('?')[0].toLowerCase() : '';
        const normTitle = item.title.toLowerCase().replace(/[^a-z0-9æøå]/g, '');

        if (cleanUrl && !seenUrls.has(cleanUrl)) {
          seenUrls.add(cleanUrl);
          seenTitles.add(normTitle);
          deduplicated.push(item);
        } else if (!cleanUrl && !seenTitles.has(normTitle)) {
          seenTitles.add(normTitle);
          deduplicated.push(item);
        }
      }

      // Sort chronologically ascending
      deduplicated.sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime());

      // Map to standard TicketmasterEvent interface
      const finalEvents: TicketmasterEvent[] = deduplicated.map(item => ({
        id: `tm-${item.rawId}`,
        title: item.title,
        date: formatDisplayDate(item.rawDate),
        time: formatDisplayTime(item.rawDate),
        location: item.venueName,
        venueName: item.venueName,
        category: item.category,
        description: item.description || `${item.title} på ${item.venueName}.`,
        imageUrl: item.imageUrl,
        ticketUrl: formatAffiliateTicketUrl(item.directUrl),
        priceRange: item.priceRange,
        source: 'TICKETMASTER',
      }));

      inMemoryCachedEvents = finalEvents;
      lastSyncTimestamp = Date.now();
      return {
        events: finalEvents,
        // Kildevalget gjenspeiler hva som FAKTISK ble brukt – også når nøkkelen kommer fra
        // databaseinnstillingen (BYOK via /api/settings) og ikke fra process.env.
        source: usedDiscoveryApi ? 'LIVE_API' : 'LIVE_TICKETMASTER_DIRECT',
        isLive: true,
        usedDiscoveryApi,
        lastSync: lastSyncTimestamp,
      };
    }

    // Ingen ferske treff: er kilden i det hele tatt tilgjengelig?
    return {
      events: [],
      source: 'UNAVAILABLE',
      isLive: false,
      usedDiscoveryApi,
      note: TICKETMASTER_UNAVAILABLE_NOTE,
      lastSync: lastSyncTimestamp,
    };
  } catch (error) {
    console.warn('Live Ticketmaster event fetch failed:', error);
  }

  // If in-memory cache exists from before, return it – tydelig merket som cache.
  if (inMemoryCachedEvents && inMemoryCachedEvents.length > 0) {
    return {
      events: inMemoryCachedEvents,
      source: 'CACHE',
      isLive: true,
      usedDiscoveryApi,
      note: `Viser siste vellykkede henting (${new Date(lastSyncTimestamp).toLocaleString('no-NO')}).`,
      lastSync: lastSyncTimestamp,
    };
  }

  // Ingen kuratert «fallback» lenger: oppdiktede arrangementer med antatte datoer og
  // affiliate-lenker ble tidligere servert som success:true.
  return {
    events: [],
    source: 'UNAVAILABLE',
    isLive: false,
    usedDiscoveryApi,
    note: TICKETMASTER_UNAVAILABLE_NOTE,
    lastSync: lastSyncTimestamp,
  };
}

/**
 * Bakoverkompatibel innpakning: returnerer kun arrangementslisten.
 */
export async function fetchLiveTicketmasterEvents(forceRefresh = false): Promise<TicketmasterEvent[]> {
  const feed = await fetchLiveTicketmasterFeed(forceRefresh);
  return feed.events;
}

export interface DoOHPlaylistItem {
  screenId: string;
  screenName: string;
  location: string;
  spotTitle: string;
  headline: string;
  durationSeconds: number;
  imageUrl: string;
  eventDate?: string;
}

let activeScreenPlaylist: DoOHPlaylistItem[] = [
  {
    screenId: 'torvet-1',
    screenName: 'Torvet Storskjerm',
    location: 'Tønsberg Torv (Sone C)',
    spotTitle: 'Dagens Program på Torvet',
    headline: 'Sommer & Kultur i Norges eldste by',
    durationSeconds: 20,
    imageUrl: '/images/tonsberg/dagens-program-paa-torvet-sommer-k.jpg',
  },
  {
    screenId: 'kanalen-2',
    screenName: 'Kanalen & Brygga Display',
    location: 'Nedre Langgate / Brygga',
    spotTitle: 'Konsert i Foynhagen',
    headline: 'Livemusikk ved bryggekanten kl. 20:00',
    durationSeconds: 15,
    imageUrl: '/images/tonsberg/konsert-i-foynhagen-livemusikk-ved.jpg',
  },
  {
    screenId: 'kaldnes-3',
    screenName: 'Kaldnes Gangbru Display',
    location: 'Kaldnes Brygge',
    spotTitle: 'Matmarked & Lokale Råvarer',
    headline: 'Besøk bodene og spisestedene i sentrum',
    durationSeconds: 15,
    imageUrl: '/images/tonsberg/matmarked-lokale-raavarer-besok-bo.jpg',
  },
];

/**
 * Henter hurtigbufrede Ticketmaster-events dersom tilgjengelig.
 */
export function getCachedTicketmasterEvents(): { events: TicketmasterEvent[]; isCached: boolean; lastSync: number } {
  if (inMemoryCachedEvents && inMemoryCachedEvents.length > 0) {
    return { events: inMemoryCachedEvents, isCached: true, lastSync: lastSyncTimestamp };
  }
  return { events: [], isCached: false, lastSync: 0 };
}

/**
 * Oppdaterer hurtigbufferen for arrangementer.
 */
export function setCachedTicketmasterEvents(events: TicketmasterEvent[]): void {
  inMemoryCachedEvents = events;
  lastSyncTimestamp = Date.now();
}

/**
 * Henter og oppdaterer DoOH-byskjermenes spilleliste.
 */
export function getDoOHScreenPlaylist(): DoOHPlaylistItem[] {
  return activeScreenPlaylist;
}

export function setDoOHScreenPlaylist(playlist: DoOHPlaylistItem[]): void {
  activeScreenPlaylist = playlist;
}
