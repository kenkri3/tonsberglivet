/**
 * Typer, kategorier og formateringshjelpere for nyhetssaker.
 *
 * Denne filen er bevisst fri for data og for database-import, slik at både
 * klient- og serverkomponenter kan bruke den uten at hele saksarkivet
 * (src/data/news-archive.json) havner i nettleserbundelen.
 *
 * Selve sakene ligger i:
 *  - src/lib/news.ts        → det redaksjonelle arkivet (ekte saker fra gamle tonsberglivet.no)
 *  - src/lib/news-server.ts → publiserte saker fra databasen (CMS)
 */

export type NewsCategoryKey =
  | 'BYLIVET'
  | 'HVERDAGSLIVET'
  | 'NAERINGSLIVET'
  | 'REISELIVET'
  | 'STUDENTLIVET'
  | 'TONSBERGLIVET';

/** Prisma-enumet ArticleCategory er fasit for de fem seksjonene; siste verdi er husets egne saker. */
export const NEWS_CATEGORY_LABELS: Record<NewsCategoryKey, string> = {
  BYLIVET: 'Bylivet',
  HVERDAGSLIVET: 'Hverdagslivet',
  NAERINGSLIVET: 'Næringslivet',
  REISELIVET: 'Reiselivet',
  STUDENTLIVET: 'Studentlivet',
  TONSBERGLIVET: 'Tønsberglivet',
};

/** Rekkefølgen kategorifiltrene vises i på /nyheter. */
export const NEWS_CATEGORY_ORDER: NewsCategoryKey[] = [
  'BYLIVET',
  'HVERDAGSLIVET',
  'NAERINGSLIVET',
  'REISELIVET',
  'STUDENTLIVET',
  'TONSBERGLIVET',
];

/** Innholdet i en sak, i den rekkefølgen det skal leses. */
export type NewsBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'image'; src: string; alt?: string; width?: number; height?: number }
  | { type: 'link'; text: string; href: string };

/** Hvor en sak kommer fra. «database» = publisert i CMS, «arkiv» = migrert fra den gamle siden. */
export type NewsOrigin = 'database' | 'arkiv';

export interface NewsArticle {
  /** Stabil id. En sak kan slås opp både på id og på slug. */
  id: string;
  /** Kanonisk URL-segment: /nyheter/<slug>. */
  slug: string;
  title: string;
  category: NewsCategoryKey;
  categoryLabel: string;
  /** Ferdig formatert visningsdato, f.eks. «18. august 2026». */
  date: string;
  /** Samme dato på ISO-form (YYYY-MM-DD), trygg å rendre på server og klient. */
  isoDate: string;
  /** Full ISO-tidsstempel. Brukes til sortering og JSON-LD. */
  publishedAt: string;
  author: string;
  excerpt: string;
  /** Ren tekstversjon av innholdet. */
  content: string[];
  /** Strukturert innhold med mellomtitler, sitater, lister, bilder og lenker. */
  blocks: NewsBlock[];
  tags: string[];
  readTime: string;
  imageUrl?: string;
  imageAlt?: string;
  origin: NewsOrigin;
  /** Original URL hos kilden, for sporing under migreringen. */
  sourceUrl?: string;
}

/**
 * Feltene listesiden trenger for å vise et kort. Vi sender bare dette til
 * klienten – ikke hele saken med brødtekst og bilder – ellers ville
 * /nyheter-siden slept hele arkivet inn i nettleseren.
 */
export interface NewsCardData {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: NewsCategoryKey;
  categoryLabel: string;
  imageUrl?: string;
  imageAlt?: string;
}

export function toNewsCard(article: NewsArticle): NewsCardData {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    date: article.date,
    category: article.category,
    categoryLabel: article.categoryLabel,
    imageUrl: article.imageUrl,
    imageAlt: article.imageAlt,
  };
}

const MONTHS_NB = [
  'januar',
  'februar',
  'mars',
  'april',
  'mai',
  'juni',
  'juli',
  'august',
  'september',
  'oktober',
  'november',
  'desember',
];

/**
 * Henter YYYY-MM-DD i norsk tid. Uten dette ville en sak publisert sent på
 * kvelden fått feil dato, siden serveren kjører på UTC.
 */
export function toOsloIsoDate(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Oslo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** «2026-08-18» → «18. august 2026». Returnerer tom streng for ugyldig dato. */
export function formatIsoDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return '';
  const [, year, month, day] = match;
  const monthName = MONTHS_NB[Number(month) - 1];
  if (!monthName) return '';
  return `${Number(day)}. ${monthName} ${year}`;
}

/** Dato + klokkeslett i norsk tid, f.eks. «2026-08-18T08:00:00+02:00». */
export function toOsloTimestamp(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  const iso = toOsloIsoDate(date);
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Oslo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
  const offset = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Oslo',
    timeZoneName: 'longOffset',
  })
    .formatToParts(date)
    .find((part) => part.type === 'timeZoneName')?.value;
  const normalizedOffset = offset && offset !== 'GMT' ? offset.replace('GMT', '') : '+00:00';
  return `${iso}T${time}:00${normalizedOffset}`;
}

/** Grovt lesetidsanslag – 200 ord i minuttet, alltid minst ett minutt. */
export function estimateReadTime(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min lesetid`;
}

/**
 * Deler CMS-innhold i avsnitt og fjerner lett markdown-støy, slik at
 * AI-genererte utkast ikke viser «## » og «**» rett i teksten.
 */
export function toParagraphs(content: string): string[] {
  return content
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .flatMap((block) => (block.includes('\n') && block.length < 240 ? block.split('\n') : [block]))
    .map((paragraph) =>
      paragraph
        .replace(/^\s{0,3}#{1,6}\s+/, '')
        .replace(/^\s*[-*+]\s+/, '• ')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/(^|\s)\*(?!\s)(.+?)(?<!\s)\*/g, '$1$2')
        .replace(/^\s*>\s?/, '')
        .trim(),
    )
    .filter(Boolean);
}

/** Nettadresser next/image faktisk får hente (se next.config.ts → images.remotePatterns). */
const ALLOWED_IMAGE_HOSTS = new Set([
  'res.cloudinary.com',
  'tonsberglivet.no',
  'images.unsplash.com',
]);

/**
 * Bilder fra bildebanken kan peke på en hvilken som helst vert. Er verten ikke
 * whitelistet i next.config.ts, kaster next/image – da er det bedre å vise
 * gradienten i kortet enn å velte hele siden.
 */
export function safeImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith('/')) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') return undefined;
    return ALLOWED_IMAGE_HOSTS.has(parsed.hostname) ? trimmed : undefined;
  } catch {
    return undefined;
  }
}

/** Nyeste sak først. Saker uten dato havner sist. */
export function sortNewsNewestFirst(a: NewsArticle, b: NewsArticle): number {
  const aTime = Date.parse(a.publishedAt || `${a.isoDate}T00:00:00Z`) || 0;
  const bTime = Date.parse(b.publishedAt || `${b.isoDate}T00:00:00Z`) || 0;
  if (aTime === bTime) return a.title.localeCompare(b.title, 'nb');
  return bTime - aTime;
}

/** Kategorinavn fra en rå enum-verdi, med fornuftig fallback for ukjente verdier. */
export function categoryLabelOf(value: string): string {
  return NEWS_CATEGORY_LABELS[value as NewsCategoryKey] ?? value;
}

/**
 * Finner kategorinøkkelen ut fra det som står i URL-en, f.eks.
 * «?kategori=bylivet», «?kategori=Næringslivet» eller «?kategori=naeringslivet».
 * «alle» og ukjente verdier gir undefined (= vis alt).
 */
export function resolveCategoryKey(value: string | null | undefined): NewsCategoryKey | undefined {
  if (!value) return undefined;

  const normalize = (input: string) =>
    input
      .trim()
      .toLowerCase()
      .replace(/æ/g, 'ae')
      .replace(/ø/g, 'o')
      .replace(/å/g, 'a')
      .replace(/[^a-z0-9]/g, '');

  const needle = normalize(value);
  if (!needle || needle === 'alle') return undefined;

  return (Object.keys(NEWS_CATEGORY_LABELS) as NewsCategoryKey[]).find(
    (key) => normalize(key) === needle || normalize(NEWS_CATEGORY_LABELS[key]) === needle,
  );
}
