// NAV Arbeidsplassen – Job Vacancy Feed for Tønsberglivet
//
// Det gamle nøkkelfrie endepunktet (`arbeidsplassen.nav.no/public-feed/api/v1/ads`)
// ble avviklet 1. mai 2025 og svarer nå 404. Erstatningen er «NAV Job Vacancy Feed»
// på https://pam-stilling-feed.nav.no, som er gratis for alle, men krever et signert
// JWT-token i Authorization-headeren.
//
// Viktig: dette er en ENDRINGSSTRØM for hele Norge – ikke et søk. Det finnes ingen
// kommunefilter på serversiden, så vi må filtrere selv og huske tilstanden vår.
// Derfor: feed-endringer -> filtrer på kommune -> lagre i Postgres -> les derfra.
//
// Vilkår (https://arbeidsplassen.nav.no/vilkar-api): annonser vi republiserer skal
// fjernes fra vår liste så snart de blir inaktive hos NAV, og oppdateringer skal
// speiles. `syncNavVacancies()` sletter derfor ved INACTIVE i stedet for å flagge.

import { prisma } from './prisma';
import { getSetting, setSetting } from './settings';

const NAV_FEED_HOST = 'https://pam-stilling-feed.nav.no';
const NAV_FEED_PATH = '/api/v1/feed';
const NAV_PUBLIC_TOKEN_PATH = '/api/publicToken';
const NAV_USER_AGENT = 'TonsberglivetPortal/1.0 (hei@tonsberglivet.no)';

/** Kommunene vi viser stillinger for. NAV skriver dem i versaler med Æ/Ø/Å. */
const NAV_MUNICIPALITIES = ['TØNSBERG', 'FÆRDER'];

/** En annonse kan aldri være aktiv lengre enn 6 måneder (NAV-dokumentasjonen). */
const BACKFILL_DAYS = 182;
/** Sikkerhetsmargin ved inkrementell synk, så vi ikke mister endringer i grenseland. */
const DELTA_OVERLAP_DAYS = 2;

/**
 * Hvor gammelt lagret innhold kan være før vi heller henter ferske tall fra NAV.
 * Cron-jobben kjører daglig, så 36 timer gir margin uten å bli unødig streng.
 */
const STALE_AFTER_MS = 36 * 3_600_000;

const SETTING_LAST_SYNCED = 'nav_feed_last_synced';
const SETTING_BACKFILL_CURSOR = 'nav_feed_backfill_cursor';
const SETTING_TOKEN = 'nav_feed_token';

const REQUEST_TIMEOUT_MS = 15_000;
/**
 * NAV svarer nesten umiddelbart på en direkte sidehenting (`/api/v1/feed/{id}`),
 * men selve oppslaget med If-Modified-Since kan ta over ett minutt – vi har målt
 * 57 sekunder og 504 etter 120 sekunder. Derfor tre separate tidsavbrudd:
 * cron kan vente lenge, en nettleserforespørsel kan ikke.
 */
const FEED_PAGE_TIMEOUT_MS = 30_000;
const FEED_SEARCH_TIMEOUT_MS = 180_000;
const LIVE_FEED_TIMEOUT_MS = 25_000;
const PUBLIC_TOKEN_TTL_MS = 10 * 60 * 1000;
/** Hvor lenge et live-uttrekk huskes i minnet, så ikke hver sidevisning venter. */
const LIVE_CACHE_TTL_MS = 10 * 60 * 1000;

const UNAVAILABLE_NOTE =
  'NAV Arbeidsplassen svarte ikke med stillingsdata. Vi viser derfor ingen stillinger ' +
  'i stedet for oppdiktede annonser. Se arbeidsplassen.nav.no/stillinger.';

export type JobsSource = 'LIVE' | 'UNAVAILABLE';

export interface JobVacancy {
  id: string;
  title: string;
  employer: string;
  location: string;
  municipality: string;
  engagementType: string; // Fast, Vikariat, Sesong, Engasjement
  extent: string; // Heltid, Deltid
  applicationDeadline: string;
  published: string;
  link: string;
  isStudentFriendly: boolean;
  descriptionSnippet?: string;
  sector?: string;
  /** Dyp lenke til kildens søknadsfunksjon, jf. vilkårene punkt 4. */
  applicationUrl?: string;
}

export interface JobsResult {
  jobs: JobVacancy[];
  source: JobsSource;
  isLive: boolean;
  /** Norsk forklaring når kilden ikke er tilgjengelig. */
  note?: string;
  /** Hvor tallene kom fra – nyttig for feilsøking og ærlig kildemerking. */
  origin?: 'DATABASE' | 'FEED';
  totalActive?: number;
}

// ─────────────────────────────────────────────────────────────
// Rå former fra NAVs feed
// ─────────────────────────────────────────────────────────────

interface NavFeedEntry {
  uuid?: string;
  status?: string;
  title?: string;
  businessName?: string;
  municipal?: string;
  sistEndret?: string;
}

interface NavFeedItem {
  id?: string;
  url?: string;
  title?: string;
  date_modified?: string;
  _feed_entry?: NavFeedEntry;
}

interface NavFeedPage {
  version?: string;
  next_url?: string | null;
  next_id?: string | null;
  items?: NavFeedItem[];
}

interface NavWorkLocation {
  city?: string;
  municipal?: string;
  county?: string;
}

interface NavAdContent {
  uuid?: string;
  title?: string;
  description?: string;
  published?: string;
  expires?: string;
  applicationDue?: string;
  applicationUrl?: string;
  link?: string;
  engagementtype?: string;
  extent?: string;
  sector?: string;
  workLocations?: NavWorkLocation[];
  employer?: { name?: string; orgnr?: string; homepage?: string };
}

// ─────────────────────────────────────────────────────────────
// Token-håndtering
// ─────────────────────────────────────────────────────────────

let publicTokenCache: { value: string; fetchedAt: number } | null = null;

/**
 * NAV roterer det offentlige tokenet uregelmessig. Vi henter det derfor på nytt
 * ved behov og cacher det kort, i stedet for å anta at det varer.
 */
function invalidatePublicToken(): void {
  publicTokenCache = null;
}

async function resolveFeedToken(): Promise<string | null> {
  // 1. Egen token fra miljøet (anbefalt i produksjon).
  const envToken = process.env.NAV_FEED_TOKEN?.trim();
  if (envToken) return envToken;

  // 2. Egen token lagret i Innstillinger.
  try {
    const stored = (await getSetting(SETTING_TOKEN))?.trim();
    if (stored) return stored;
  } catch {
    // Innstillinger er valgfritt – fall videre til det offentlige tokenet.
  }

  // 3. NAVs offentlige token, ment for eksperimenter. Fungerer i dag, men kan
  //    rotere. Be om et privat token på nav.team.arbeidsplassen@nav.no for drift.
  if (publicTokenCache && Date.now() - publicTokenCache.fetchedAt < PUBLIC_TOKEN_TTL_MS) {
    return publicTokenCache.value;
  }

  try {
    const res = await fetch(`${NAV_FEED_HOST}${NAV_PUBLIC_TOKEN_PATH}`, {
      headers: { 'User-Agent': NAV_USER_AGENT, Accept: 'text/plain' },
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) {
      console.warn(`NAV publicToken svarte HTTP ${res.status}.`);
      return null;
    }
    const body = await res.text();
    const match = body.match(/eyJ[A-Za-z0-9_\-.]{20,}/);
    if (!match) {
      console.warn('NAV publicToken svarte uten et gjenkjennelig JWT.');
      return null;
    }
    publicTokenCache = { value: match[0], fetchedAt: Date.now() };
    return match[0];
  } catch (err) {
    console.warn('Kunne ikke hente NAV publicToken:', err);
    return null;
  }
}

/**
 * Henter fra feeden med Bearer-token. Ved 401 (typisk fordi det offentlige
 * tokenet nettopp roterte) forkaster vi tokenet og prøver nøyaktig én gang til.
 */
async function navFetch(
  urlOrPath: string,
  init: RequestInit = {},
  retryOn401 = true,
  timeoutMs: number = REQUEST_TIMEOUT_MS
): Promise<Response | null> {
  const token = await resolveFeedToken();
  if (!token) return null;

  const url = urlOrPath.startsWith('http') ? urlOrPath : `${NAV_FEED_HOST}${urlOrPath}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      'User-Agent': NAV_USER_AGENT,
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (res.status === 401 && retryOn401) {
    invalidatePublicToken();
    return navFetch(urlOrPath, init, false, timeoutMs);
  }

  return res;
}

// ─────────────────────────────────────────────────────────────
// Feed-vandring
// ─────────────────────────────────────────────────────────────

/**
 * NAV ignorerer `If-Modified-Since` i stillhet dersom ukedagen ikke stemmer med
 * datoen. `toUTCString()` gir korrekt RFC-1123-streng, så vi bruker den.
 */
function rfc1123(date: Date): string {
  return date.toUTCString();
}

interface FeedWalkResult {
  matches: Map<string, NavFeedEntry>;
  inactive: Set<string>;
  pagesFetched: number;
  completed: boolean;
  cursor: string | null;
  lastModified: string | null;
}

/**
 * Går gjennom feed-sider og plukker ut endringer for våre kommuner.
 *
 * `startCursor` lar en avbrutt backfill fortsette der den slapp, slik at en
 * full 182-dagers gjennomgang kan deles over flere cron-kjøringer i stedet for
 * å måtte fullføre i én lang HTTP-forespørsel.
 */
async function walkFeed(options: {
  since: Date | null;
  startCursor?: string | null;
  maxPages: number;
  onProgress?: (page: number, matches: number) => void;
  /**
   * Tidsavbrudd for oppslaget som bærer If-Modified-Since. Direkte sidehentinger
   * via next_url bruker alltid det kortere FEED_PAGE_TIMEOUT_MS.
   */
  searchTimeoutMs?: number;
}): Promise<FeedWalkResult> {
  const { since, startCursor = null, maxPages, onProgress } = options;
  const searchTimeoutMs = options.searchTimeoutMs ?? FEED_SEARCH_TIMEOUT_MS;

  const matches = new Map<string, NavFeedEntry>();
  const inactive = new Set<string>();
  let pagesFetched = 0;
  let cursor: string | null = startCursor;
  let lastModified: string | null = null;
  let completed = false;

  let url = cursor || NAV_FEED_PATH;
  // If-Modified-Since gjelder bare første side; resten følger next_url.
  let headers: Record<string, string> = since ? { 'If-Modified-Since': rfc1123(since) } : {};

  while (pagesFetched < maxPages) {
    // Selve oppslaget med If-Modified-Since er den dyre delen hos NAV. Når vi
    // først har en side-id, er hentingen en direkte oppslag og går raskt.
    const timeoutMs = headers['If-Modified-Since'] ? searchTimeoutMs : FEED_PAGE_TIMEOUT_MS;

    let res: Response | null;
    try {
      res = await navFetch(url, { headers }, true, timeoutMs);
    } catch (err) {
      console.warn('NAV stillingsfeed feilet under sidehenting:', err);
      break;
    }

    if (!res) break;

    if (res.status === 404 || res.status === 410) {
      // Kursor-siden har utløpt. Start backfillen på nytt fra `since`.
      if (cursor) {
        console.warn('NAV feed-kursor er utløpt – starter backfill på nytt.');
        return walkFeed({ ...options, startCursor: null });
      }
      console.warn(`NAV stillingsfeed svarte HTTP ${res.status}.`);
      break;
    }

    if (!res.ok) {
      console.warn(`NAV stillingsfeed svarte HTTP ${res.status}.`);
      break;
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('json')) {
      console.warn(`NAV stillingsfeed svarte med ikke-JSON (${contentType || 'ukjent'}) – avvises.`);
      break;
    }

    lastModified = res.headers.get('last-modified') || lastModified;

    let page: NavFeedPage;
    try {
      page = await readJsonUtf8<NavFeedPage>(res);
    } catch (err) {
      console.warn('Kunne ikke tolke NAV-feed-siden som JSON:', err);
      break;
    }

    const items = Array.isArray(page.items) ? page.items : [];
    for (const item of items) {
      const entry = item?._feed_entry;
      const uuid = entry?.uuid;
      if (!uuid) continue;

      const municipality = (entry?.municipal || '').toUpperCase();
      // Tom kommune kan bety at NAV har maskert en stoppet annonse, men også at
      // feltet mangler. Vi tar den med som kandidat og verifiserer i detaljen.
      const relevant = NAV_MUNICIPALITIES.includes(municipality) || municipality === '';
      if (!relevant) continue;

      if ((entry?.status || '').toUpperCase() === 'ACTIVE') {
        // Kan ha vært inaktiv tidligere i samme gjennomgang (ACTIVE -> INACTIVE
        // -> ACTIVE). Siste observasjon skal gjelde, så vi angrer slettingen.
        matches.set(uuid, entry);
        inactive.delete(uuid);
      } else {
        // Sist sett inaktiv vinner – samme uuid kan forekomme flere ganger.
        matches.delete(uuid);
        inactive.add(uuid);
      }
    }

    pagesFetched++;
    onProgress?.(pagesFetched, matches.size);

    const next = page.next_url || null;
    if (!next || !page.next_id) {
      completed = true;
      cursor = null;
      break;
    }

    cursor = next;
    url = next;
    headers = {}; // If-Modified-Since gjelder bare den første siden.
  }

  return { matches, inactive, pagesFetched, completed, cursor, lastModified };
}

// ─────────────────────────────────────────────────────────────
// Detaljer og mapping
// ─────────────────────────────────────────────────────────────

interface NavFeedEntryDetail {
  uuid?: string;
  status?: string;
  sistEndret?: string;
  ad_content?: NavAdContent;
}

function parseDate(value: unknown): Date | null {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function stripHtml(value: string | undefined): string | undefined {
  if (typeof value !== 'string') return undefined;
  const text = value.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
  return text.length > 0 ? text : undefined;
}

/**
 * `engagementtype`/`extent`/`title` er de feltene NAV faktisk fyller ut.
 * Vi er bevisst romslige her, men merker aldri en stilling som studentvennlig
 * uten at det finnes et holdepunkt i dataene.
 */
function looksStudentFriendly(engagementType: string, extent: string, title: string): boolean {
  const haystack = `${engagementType} ${extent} ${title}`.toLowerCase();
  return /deltid|vikariat|sesong|engasjement|student|sommer|ekstrahjelp|tilkalling/.test(haystack);
}

interface StoredVacancy {
  id: string;
  title: string;
  employer: string;
  municipality: string;
  city: string | null;
  engagementType: string | null;
  extent: string | null;
  applicationDeadline: string | null;
  published: Date | null;
  expires: Date | null;
  link: string;
  applicationUrl: string | null;
  isStudentFriendly: boolean;
  descriptionSnippet: string | null;
  sector: string | null;
  navStatus: string;
  navUpdatedAt: Date | null;
  lastSyncedAt: Date;
}

function mapAdContent(uuid: string, ad: NavAdContent, sistEndret?: string): StoredVacancy {
  const workLocation = Array.isArray(ad.workLocations) ? ad.workLocations[0] : undefined;
  const title = (ad.title || '').trim() || 'Ledig stilling';
  const employer = (ad.employer?.name || '').trim() || 'Ikke oppgitt';
  const engagementType = (ad.engagementtype || '').trim() || null;
  const extent = (ad.extent || '').trim() || null;

  return {
    id: uuid,
    title,
    employer,
    municipality: (workLocation?.municipal || '').toUpperCase(),
    city: workLocation?.city?.trim() || null,
    engagementType,
    extent,
    // applicationDue er upålitelig (kan være «Snarest» eller mangle offset), men
    // den er den teksten NAV selv viser, så vi bevarer den rått.
    applicationDeadline: (ad.applicationDue || '').trim() || null,
    published: parseDate(ad.published),
    expires: parseDate(ad.expires),
    link: (ad.link || '').trim() || `https://arbeidsplassen.nav.no/stillinger/stilling/${uuid}`,
    applicationUrl: (ad.applicationUrl || '').trim() || null,
    isStudentFriendly: looksStudentFriendly(engagementType || '', extent || '', title),
    descriptionSnippet: stripHtml(ad.description)?.slice(0, 200) ?? null,
    sector: (ad.sector || '').trim() || null,
    navStatus: 'ACTIVE',
    navUpdatedAt: parseDate(sistEndret),
    lastSyncedAt: new Date(),
  };
}

/**
 * Leser JSON som UTF-8, uavhengig av hva oppstrøms har deklarert i Content-Type.
 *
 * NAVs feed oppgir et tegnsett som gjorde at `res.json()` dekodet byte-ene som
 * Latin-1. Da ble «TØNSBERG» til «TÃ˜NSBERG» og «Seniorrådgiver» til
 * «SeniorrÃ¥dgiver» i samtlige stillingstitler, arbeidsgivere og steder.
 * Vi leser derfor byte-ene selv og dekoder dem eksplisitt som UTF-8.
 */
async function readJsonUtf8<T>(res: Response): Promise<T> {
  const buffer = await res.arrayBuffer();
  return JSON.parse(new TextDecoder('utf-8').decode(buffer)) as T;
}

async function fetchAdDetail(uuid: string): Promise<NavFeedEntryDetail | null> {
  try {
    const res = await navFetch(`${NAV_FEED_PATH}entry/${uuid}`);
    if (!res || !res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('json')) return null;
    return await readJsonUtf8<NavFeedEntryDetail>(res);
  } catch (err) {
    console.warn(`Kunne ikke hente detaljer for stilling ${uuid}:`, err);
    return null;
  }
}

/** Kjører oppgaver med begrenset parallellitet, så vi ikke hamrer på NAV. */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  let index = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const current = index++;
      results[current] = await worker(items[current]);
    }
  });
  await Promise.all(runners);
  return results;
}

// ─────────────────────────────────────────────────────────────
// Database (tåler at tabellen ennå ikke er migrert)
// ─────────────────────────────────────────────────────────────

let tableAvailable: boolean | null = null;

async function hasVacancyTable(): Promise<boolean> {
  if (tableAvailable !== null) return tableAvailable;
  try {
    await (prisma as any).jobVacancy.count();
    tableAvailable = true;
  } catch {
    // Tabellen finnes ikke ennå (migrering ikke kjørt). Vi fortsetter uten
    // lagring i stedet for å krasje – widgeten faller da tilbake til live-søk.
    tableAvailable = false;
  }
  return tableAvailable;
}

/**
 * `applicationDue` fra NAV er upålitelig: den kan være «Snarest», tom, en ren
 * dato eller ISO med og uten offset. Vi viser derfor teksten rått når den ikke
 * er en dato, og formaterer den pent når den faktisk er det – og faller tilbake
 * på `expires`, som alltid er ISO-8601 med offset.
 */
function formatDeadline(raw: string | null, expires: Date | null): string {
  if (raw) {
    const parsed = parseDate(raw);
    if (parsed) return parsed.toLocaleDateString('no-NO');
    return raw; // f.eks. «Snarest»
  }
  return expires ? expires.toLocaleDateString('no-NO') : 'Snarest';
}

function toApiShape(row: StoredVacancy | any): JobVacancy {
  const expires = row.expires ? new Date(row.expires) : null;
  const published = row.published ? new Date(row.published) : null;

  return {
    id: row.id,
    title: row.title,
    employer: row.employer,
    location: row.city || row.municipality || 'Tønsberg',
    municipality: row.municipality || 'TØNSBERG',
    engagementType: row.engagementType || 'Fast',
    extent: row.extent || 'Heltid',
    applicationDeadline: formatDeadline(row.applicationDeadline ?? null, expires),
    published: published ? published.toLocaleDateString('no-NO') : 'Nylig',
    link: row.link,
    isStudentFriendly: Boolean(row.isStudentFriendly),
    descriptionSnippet: row.descriptionSnippet || undefined,
    sector: row.sector || undefined,
    applicationUrl: row.applicationUrl || undefined,
  };
}

// ─────────────────────────────────────────────────────────────
// Synk (brukes av cron)
// ─────────────────────────────────────────────────────────────

export interface NavSyncStats {
  mode: 'BACKFILL' | 'DELTA';
  pagesFetched: number;
  candidates: number;
  stored: number;
  removed: number;
  pruned: number;
  backfillComplete: boolean;
  durationMs: number;
  note?: string;
}

export interface NavSyncOptions {
  /** Hvor mange feed-sider én kjøring maksimalt henter. */
  maxPages?: number;
  /** Hvor mange annonsedetaljer én kjøring maksimalt beriker. */
  maxDetails?: number;
  /** Tving en full backfill selv om vi har synket før. */
  forceBackfill?: boolean;
}

/**
 * Synkroniserer stillinger fra NAV til databasen.
 *
 * Første kjøring gjør en backfill over 182 dager (annonser kan ikke leve lenger).
 * Fordi det er mange sider, kan kjøringen deles over flere cron-innkallinger:
 * vi lagrer en kursor og fortsetter der vi slapp. Etterpå holder det med korte
 * inkrementelle kjøringer.
 */
export async function syncNavVacancies(options: NavSyncOptions = {}): Promise<NavSyncStats> {
  const startedAt = Date.now();
  const maxPages = Math.max(1, options.maxPages ?? 60);
  const maxDetails = Math.max(1, options.maxDetails ?? 400);

  if (!(await hasVacancyTable())) {
    return {
      mode: 'DELTA',
      pagesFetched: 0,
      candidates: 0,
      stored: 0,
      removed: 0,
      pruned: 0,
      backfillComplete: false,
      durationMs: Date.now() - startedAt,
      note:
        'Tabellen job_vacancies finnes ikke. Kjør `npx prisma db push` for å opprette den ' +
        '– til da viser widgeten et live-uttrekk fra NAV i stedet for hele det aktive settet.',
    };
  }

  // Fortsett en avbrutt backfill hvis vi har en kursor.
  let cursor: string | null = null;
  if (!options.forceBackfill) {
    const raw = await getSetting(SETTING_BACKFILL_CURSOR);
    if (raw) {
      try {
        cursor = (JSON.parse(raw) as { next?: string | null }).next ?? null;
      } catch {
        cursor = null;
      }
    }
  }

  const backfill = Boolean(cursor) || options.forceBackfill || !(await getSetting(SETTING_LAST_SYNCED));

  let since: Date | null = null;
  if (backfill) {
    since = cursor ? null : new Date(Date.now() - BACKFILL_DAYS * 86_400_000);
  } else {
    const last = parseDate(await getSetting(SETTING_LAST_SYNCED));
    since = last
      ? new Date(last.getTime() - DELTA_OVERLAP_DAYS * 86_400_000)
      : new Date(Date.now() - DELTA_OVERLAP_DAYS * 86_400_000);
  }

  const walk = await walkFeed({ since, startCursor: cursor, maxPages });

  // 1. Inaktive annonser skal bort umiddelbart (vilkårene punkt 1).
  let removed = 0;
  if (walk.inactive.size > 0) {
    try {
      const result = await (prisma as any).jobVacancy.deleteMany({
        where: { id: { in: [...walk.inactive] } },
      });
      removed = result.count;
    } catch (err) {
      console.warn('Kunne ikke slette inaktive stillinger:', err);
    }
  }

  // 2. Berik og lagre aktive annonser.
  const uuids = [...walk.matches.keys()].slice(0, maxDetails);
  const details = await mapWithConcurrency(uuids, 6, (uuid) => fetchAdDetail(uuid));

  let stored = 0;
  for (let i = 0; i < uuids.length; i++) {
    const uuid = uuids[i];
    const detail = details[i];
    const ad = detail?.ad_content;
    if (!ad) continue;

    const row = mapAdContent(uuid, ad, detail?.sistEndret ?? walk.matches.get(uuid)?.sistEndret);

    // Kommunen i detaljen er autoritativ – feed-elementet kan mangle den.
    if (!NAV_MUNICIPALITIES.includes(row.municipality)) continue;

    try {
      await (prisma as any).jobVacancy.upsert({
        where: { id: uuid },
        update: { ...row, navStatus: 'ACTIVE' },
        create: row,
      });
      stored++;
    } catch (err) {
      console.warn(`Kunne ikke lagre stilling ${uuid}:`, err);
    }
  }

  // 3. Fjern annonser som har utløpt, og gamle inaktive rader.
  let pruned = 0;
  try {
    const expired = await (prisma as any).jobVacancy.deleteMany({
      where: {
        OR: [{ expires: { lt: new Date() } }, { navStatus: { not: 'ACTIVE' } }],
      },
    });
    pruned = expired.count;
  } catch (err) {
    console.warn('Kunne ikke rydde utløpte stillinger:', err);
  }

  // 4. Husk hvor langt vi kom.
  const backfillComplete = walk.completed;
  try {
    if (backfillComplete) {
      await setSetting(SETTING_BACKFILL_CURSOR, '');
      await setSetting(SETTING_LAST_SYNCED, new Date().toISOString(), 'INTEGRATIONS');
    } else if (walk.cursor) {
      await setSetting(SETTING_BACKFILL_CURSOR, JSON.stringify({ next: walk.cursor }), 'INTEGRATIONS');
    }
  } catch (err) {
    console.warn('Kunne ikke lagre synk-status for NAV-feeden:', err);
  }

  const stats: NavSyncStats = {
    mode: backfill ? 'BACKFILL' : 'DELTA',
    pagesFetched: walk.pagesFetched,
    candidates: walk.matches.size,
    stored,
    removed,
    pruned,
    backfillComplete,
    durationMs: Date.now() - startedAt,
  };

  if (!backfillComplete) {
    stats.note = `Backfillen er ikke ferdig – kjør igjen for å fortsette (${walk.pagesFetched} sider denne gangen).`;
  }

  return stats;
}

// ─────────────────────────────────────────────────────────────
// Lesing (brukes av /api/jobs)
// ─────────────────────────────────────────────────────────────

/**
 * Henter stillinger for Tønsberg og Færder.
 *
 * Foretrukket vei er databasen, som inneholder hele det aktive settet etter at
 * backfillen har kjørt. Er tabellen tom, mangler den, eller er innholdet for
 * gammelt, gjør vi et begrenset live-uttrekk fra feeden i stedet.
 *
 * Ferskhetskravet er ikke kosmetisk: vilkårene krever at annonser som har blitt
 * inaktive hos NAV fjernes fra vår liste. Slutter cron-jobben å kjøre, ville en
 * gammel database ellers vist stillinger som ikke finnes lenger.
 */
export async function fetchLiveJobs(onlyStudent = false, limit = 10): Promise<JobsResult> {
  const safeLimit = Math.min(Math.max(Math.trunc(limit) || 10, 1), 50);

  // ── 1. Fra databasen, men bare hvis innholdet er ferskt nok ──
  let storedResult: JobsResult | null = null;

  if (await hasVacancyTable()) {
    try {
      const now = new Date();
      const rows = await (prisma as any).jobVacancy.findMany({
        where: {
          navStatus: 'ACTIVE',
          municipality: { in: NAV_MUNICIPALITIES },
          OR: [{ expires: null }, { expires: { gt: now } }],
        },
        orderBy: [{ published: 'desc' }, { lastSyncedAt: 'desc' }],
        take: 200,
      });

      if (Array.isArray(rows) && rows.length > 0) {
        const freshest = rows.reduce((newest: number, row: any) => {
          const at = row.lastSyncedAt ? new Date(row.lastSyncedAt).getTime() : 0;
          return at > newest ? at : newest;
        }, 0);

        const all = rows.map(toApiShape);
        const filtered = onlyStudent ? all.filter((j) => j.isStudentFriendly) : all;
        storedResult = {
          jobs: filtered.slice(0, safeLimit),
          source: 'LIVE',
          isLive: true,
          origin: 'DATABASE',
          totalActive: all.length,
        };

        if (Date.now() - freshest <= STALE_AFTER_MS) {
          return storedResult;
        }

        console.warn(
          'Stillingsdatabasen er eldre enn ferskhetskravet – henter ferske tall fra NAV i stedet.'
        );
      }
    } catch (err) {
      console.warn('Kunne ikke lese stillinger fra databasen:', err);
    }
  }

  // ── 2. Live uttrekk fra feeden (begrenset vindu) ──
  try {
    const live = await fetchJobsFromFeed(onlyStudent, safeLimit);
    // Et tomt live-svar kan bety «ingen endringer i vinduet», ikke «ingen
    // stillinger». Da er det bedre å vise det vi har lagret.
    if (live.jobs.length > 0) return live;
    if (storedResult) return storedResult;
    return live;
  } catch (err) {
    console.warn('NAV Arbeidsplassen API feilet:', err);
    if (storedResult) return storedResult;
    return { jobs: [], source: 'UNAVAILABLE', isLive: false, note: UNAVAILABLE_NOTE };
  }
}

/**
 * Henter alle annonser fra én feed-side, og beriker dem til stillinger.
 * Delt av begge live-veiene under.
 */
async function collectFromPage(
  pageUrl: string,
  since: Date | null,
  maxPages: number,
  searchTimeoutMs: number,
  safeLimit: number
): Promise<JobsResult | null> {
  const walk = await walkFeed({
    since,
    startCursor: pageUrl === NAV_FEED_PATH ? null : pageUrl,
    maxPages,
    searchTimeoutMs,
  });

  if (walk.pagesFetched === 0 || walk.matches.size === 0) return null;

  // Berik nok kandidater til å kunne filtrere og fortsatt fylle listen.
  const uuids = [...walk.matches.keys()].slice(0, Math.max(safeLimit * 4, 40));
  const details = await mapWithConcurrency(uuids, 6, (uuid) => fetchAdDetail(uuid));

  const rows: StoredVacancy[] = [];
  for (let i = 0; i < uuids.length; i++) {
    const ad = details[i]?.ad_content;
    if (!ad) continue;
    const row = mapAdContent(uuids[i], ad, details[i]?.sistEndret);
    if (!NAV_MUNICIPALITIES.includes(row.municipality)) continue;
    if (row.expires && row.expires.getTime() < Date.now()) continue;
    rows.push(row);
  }

  if (rows.length === 0) return null;

  rows.sort((a, b) => (b.published?.getTime() ?? 0) - (a.published?.getTime() ?? 0));

  const all = rows.map(toApiShape);

  return {
    jobs: all,
    source: 'LIVE',
    isLive: true,
    origin: 'FEED',
    totalActive: all.length,
  };
}

let liveCache: { key: string; result: JobsResult; at: number } | null = null;

/**
 * Live-uttrekk når vi ikke har en fersk database.
 *
 * Primært et avgrenset vindu (48 timer) med If-Modified-Since. Det oppslaget kan
 * være tregt hos NAV, så vi gir det en romslig frist og faller tilbake til
 * `?last=true`, som er raskt og alltid gir de nyeste endringene.
 */
async function fetchJobsFromFeed(onlyStudent: boolean, safeLimit: number): Promise<JobsResult> {
  const cacheKey = `${onlyStudent}:${safeLimit}`;
  if (liveCache && liveCache.key === cacheKey && Date.now() - liveCache.at < LIVE_CACHE_TTL_MS) {
    return liveCache.result;
  }

  const finish = (result: JobsResult): JobsResult => {
    // collectFromPage returnerer hele det aktive settet – filtrer og begrens her.
    const filtered = onlyStudent ? result.jobs.filter((j) => j.isStudentFriendly) : result.jobs;
    const finalResult: JobsResult = { ...result, jobs: filtered.slice(0, safeLimit) };
    if (finalResult.jobs.length > 0) {
      liveCache = { key: cacheKey, result: finalResult, at: Date.now() };
    }
    return finalResult;
  };

  // 1. Avgrenset vindu – gir best bredde når NAV svarer raskt.
  try {
    const windowed = await collectFromPage(
      NAV_FEED_PATH,
      new Date(Date.now() - 48 * 3_600_000),
      12,
      LIVE_FEED_TIMEOUT_MS,
      safeLimit
    );
    if (windowed) return finish(windowed);
  } catch (err) {
    console.warn('NAV live-vindu feilet – prøver siste feed-side i stedet:', err);
  }

  // 2. Siste side i feeden. Rask (målt ~0,2 s), men inneholder bare de nyeste
  //    endringene – og kan være nesten tom rett etter en sideovergang.
  try {
    const last = await collectFromPage(`${NAV_FEED_PATH}?last=true`, null, 1, LIVE_FEED_TIMEOUT_MS, safeLimit);
    if (last) return finish(last);
  } catch (err) {
    console.warn('NAV siste feed-side feilet:', err);
  }

  return { jobs: [], source: 'UNAVAILABLE', isLive: false, note: UNAVAILABLE_NOTE };
}
