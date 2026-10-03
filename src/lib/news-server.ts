/**
 * Database-oppslag for nyhetssaker. Brukes av /nyheter, /nyheter/[id] og sitemap.
 *
 * Prinsipp: databasen er fasit når den svarer, men en treg eller nede database
 * skal aldri gi tom side eller feil sak. Vi faller derfor tilbake til det
 * redaksjonelle arkivet i src/lib/news.ts, og en ukjent sak gir `undefined`
 * (kalleren svarer 404) – aldri en annen sak.
 */

import { prisma } from '@/lib/prisma';
import {
  ARCHIVED_NEWS,
  categoryLabelOf,
  estimateReadTime,
  findArchivedNews,
  formatIsoDate,
  safeImageUrl,
  sortNewsNewestFirst,
  toOsloIsoDate,
  toOsloTimestamp,
  toParagraphs,
  type NewsArticle,
  type NewsBlock,
  type NewsCategoryKey,
} from '@/lib/news';

/** Hvor lenge vi venter på databasen før vi heller viser arkivet. */
const DB_TIMEOUT_MS = 2500;

const ARTICLE_SELECT = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  content: true,
  category: true,
  publishedAt: true,
  createdAt: true,
  author: { select: { name: true } },
  image: { select: { url: true, alt: true } },
} as const;

interface DbArticleRow {
  id: string;
  slug: string | null;
  title: string;
  excerpt: string | null;
  content: string;
  category: string;
  publishedAt: Date | null;
  createdAt: Date;
  author: { name: string | null } | null;
  image: { url: string; alt: string | null } | null;
}

/**
 * Prisma-promiset avvises uansett om vi slutter å vente på det, så vi fanger
 * avvisningen med en gang og unngår «unhandled rejection» ved tidsavbrudd.
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  void promise.catch(() => {});
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Databasen svarte ikke innen fristen')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function firstSentenceOr(text: string, maxLength = 180): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength).trimEnd()}…`;
}

function mapDbArticle(row: DbArticleRow): NewsArticle | undefined {
  const title = row.title?.trim();
  if (!title) return undefined;

  const publishedAt = row.publishedAt ?? row.createdAt;
  const isoDate = toOsloIsoDate(publishedAt);
  if (!isoDate) return undefined;

  const category = row.category as NewsCategoryKey;
  const content = toParagraphs(row.content ?? '');
  const slug = (row.slug || row.id).trim();

  return {
    id: row.id,
    slug,
    title,
    category,
    categoryLabel: categoryLabelOf(category),
    date: formatIsoDate(isoDate),
    isoDate,
    publishedAt: toOsloTimestamp(publishedAt) || `${isoDate}T00:00:00+02:00`,
    author: row.author?.name?.trim() || 'Tønsberglivet Redaksjon',
    excerpt: row.excerpt?.trim() || firstSentenceOr(content[0] ?? title),
    content: content.length > 0 ? content : [firstSentenceOr(title)],
    blocks: (content.length > 0 ? content : [firstSentenceOr(title)]).map(
      (paragraph): NewsBlock => ({ type: 'paragraph', text: paragraph }),
    ),
    // Artikkelmodellen har ingen tagger; kategorien vises som eget merke i UI-et.
    tags: [],
    readTime: estimateReadTime(row.content ?? ''),
    imageUrl: safeImageUrl(row.image?.url),
    imageAlt: row.image?.alt?.trim() || title,
    origin: 'database',
  };
}

async function fetchPublishedArticles(): Promise<NewsArticle[]> {
  const rows = await withTimeout(
    prisma.article.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: ARTICLE_SELECT,
    }),
    DB_TIMEOUT_MS,
  );

  return rows
    .map((row) => mapDbArticle(row as DbArticleRow))
    .filter((article): article is NewsArticle => Boolean(article));
}

/**
 * Alle saker som skal vises: publiserte CMS-saker først, deretter de
 * redaksjonelle standardsakene. En sak som finnes i databasen erstatter
 * arkivversjonen med samme slug eller id, slik at en publisert sak aldri
 * dukker opp to ganger.
 */
export async function getNewsArticles(): Promise<NewsArticle[]> {
  let dbArticles: NewsArticle[] = [];
  try {
    dbArticles = await fetchPublishedArticles();
  } catch {
    // Databasen er nede, treg eller tom – arkivet nedenfor dekker forsiden.
  }

  const taken = new Set<string>();
  for (const article of dbArticles) {
    taken.add(`slug:${article.slug.toLowerCase()}`);
    taken.add(`id:${article.id.toLowerCase()}`);
  }

  const archived = ARCHIVED_NEWS.filter(
    (article) =>
      !taken.has(`slug:${article.slug.toLowerCase()}`) && !taken.has(`id:${article.id.toLowerCase()}`),
  );

  return [...dbArticles, ...archived].sort(sortNewsNewestFirst);
}

/**
 * Slår opp én sak på slug eller id. Rekkefølgen er:
 * 1. publisert sak i databasen, 2. redaksjonelt arkiv, 3. ingenting (→ 404).
 */
export async function findNewsArticle(key: string): Promise<NewsArticle | undefined> {
  let decoded = key;
  try {
    decoded = decodeURIComponent(key);
  } catch {
    // Ugyldig prosentkoding – bruk råverdien.
  }
  const needle = decoded.trim();
  if (!needle) return undefined;

  try {
    const row = await withTimeout(
      prisma.article.findFirst({
        where: {
          published: true,
          OR: [{ slug: needle }, { id: needle }],
        },
        select: ARTICLE_SELECT,
      }),
      DB_TIMEOUT_MS,
    );
    if (row) {
      const article = mapDbArticle(row as DbArticleRow);
      if (article) return article;
    }
  } catch {
    // Faller gjennom til arkivet under.
  }

  return findArchivedNews(needle);
}
