/**
 * Det redaksjonelle saksarkivet: de ekte nyhetssakene fra den gamle nettsiden
 * (tonsberglivet.no/nyheter/), migrert med scripts/import-wp-news.mjs.
 *
 * Ingenting her er oppdiktet – tittel, ingress, brødtekst, datoer og bilder
 * kommer ordrett fra kilden. Bildene ligger i public/images/nyheter/.
 *
 * Typer og hjelpefunksjoner ligger i src/lib/news-meta.ts, slik at
 * klientkomponenter kan bruke dem uten å dra inn hele arkivet i bundelen.
 * Publiserte saker fra CMS-et hentes i src/lib/news-server.ts.
 */

import archiveData from '@/data/news-archive.json';
import {
  formatIsoDate,
  estimateReadTime,
  sortNewsNewestFirst,
  toOsloIsoDate,
  toOsloTimestamp,
  NEWS_CATEGORY_LABELS,
  type NewsArticle,
  type NewsBlock,
  type NewsCategoryKey,
} from '@/lib/news-meta';

export * from '@/lib/news-meta';

interface ArchiveImage {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface ArchiveEntry {
  id: string;
  slug: string;
  title: string;
  category: NewsCategoryKey;
  publishedAt: string;
  author: string;
  excerpt: string;
  blocks: NewsBlock[];
  featuredImage: ArchiveImage | null;
  sourceUrl?: string;
}

const ARCHIVE_ENTRIES = archiveData as unknown as ArchiveEntry[];

function blocksToPlainText(blocks: NewsBlock[]): string[] {
  const lines: string[] = [];
  for (const block of blocks) {
    if (block.type === 'paragraph' || block.type === 'quote' || block.type === 'heading') {
      lines.push(block.text);
    } else if (block.type === 'list') {
      lines.push(...block.items);
    }
  }
  return lines;
}

export const ARCHIVED_NEWS: NewsArticle[] = ARCHIVE_ENTRIES.map((entry) => {
  const isoDate = toOsloIsoDate(entry.publishedAt);
  const label = NEWS_CATEGORY_LABELS[entry.category] ?? entry.category;
  const plainText = blocksToPlainText(entry.blocks);

  return {
    id: entry.id,
    slug: entry.slug,
    title: entry.title,
    category: entry.category,
    categoryLabel: label,
    date: formatIsoDate(isoDate),
    isoDate,
    publishedAt: toOsloTimestamp(entry.publishedAt) || entry.publishedAt,
    author: entry.author,
    excerpt: entry.excerpt,
    content: plainText,
    blocks: entry.blocks,
    tags: [],
    readTime: estimateReadTime(plainText.join(' ')),
    imageUrl: entry.featuredImage?.src,
    imageAlt: entry.featuredImage?.alt ?? entry.title,
    origin: 'arkiv' as const,
    sourceUrl: entry.sourceUrl,
  };
});

/** Slår opp i arkivet på slug eller id (ufølsomt for store/små bokstaver). */
export function findArchivedNews(key: string): NewsArticle | undefined {
  const needle = key.trim().toLowerCase();
  if (!needle) return undefined;
  return ARCHIVED_NEWS.find(
    (article) => article.slug.toLowerCase() === needle || article.id.toLowerCase() === needle,
  );
}

export { sortNewsNewestFirst };
