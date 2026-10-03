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
import { existsSync } from 'node:fs';
import path from 'node:path';
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

/**
 * Bildestiene i arkivet er tekst, og en ny import kan laste ned samme bilde med
 * en annen filendelse. Da peker arkivet på en fil som ikke finnes, og kortet
 * viser et ødelagt bilde. Her velger vi filen som faktisk ligger på disk.
 *
 * Kjøres én gang per serverprosess (ARCHIVED_NEWS bygges ved modullasting).
 */
const LOCAL_IMAGE_CACHE = new Map<string, string>();

export function resolveLocalImage(src: string | undefined): string | undefined {
  if (!src) return undefined;
  if (!src.startsWith('/images/')) return src;

  const cached = LOCAL_IMAGE_CACHE.get(src);
  if (cached) return cached;

  const dot = src.lastIndexOf('.');
  const stem = dot > src.lastIndexOf('/') ? src.slice(0, dot) : src;
  const candidates = [
    src,
    `${stem}.webp`,
    `${stem}.jpg`,
    `${stem}.jpeg`,
    `${stem}.png`,
    `${stem}.avif`,
  ];

  for (const candidate of candidates) {
    if (existsSync(path.join(process.cwd(), 'public', candidate))) {
      LOCAL_IMAGE_CACHE.set(src, candidate);
      return candidate;
    }
  }

  // Ingen treff: behold originalen så feilen er synlig i loggen, ikke skjult.
  console.warn(`[nyheter] Bilde mangler på disk: ${src}`);
  return src;
}

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
    blocks: entry.blocks.map((block) =>
      block.type === 'image' ? { ...block, src: resolveLocalImage(block.src) ?? block.src } : block,
    ),
    tags: [],
    readTime: estimateReadTime(plainText.join(' ')),
    imageUrl: resolveLocalImage(entry.featuredImage?.src),
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
