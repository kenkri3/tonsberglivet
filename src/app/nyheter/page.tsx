import { Metadata } from 'next';
import NyheterClient from './NyheterClient';
import { getNewsArticles } from '@/lib/news-server';
import { toNewsCard } from '@/lib/news-meta';

// Sakene kommer fra databasen (CMS) og det redaksjonelle arkivet. Uten dette
// ville listen blitt frosset ved byggtid, og nye saker ikke dukket opp.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Nyheter - Tønsberglivet',
  description: 'Siste nytt fra Tønsberg. Les om bylivet, hverdagslivet, næringslivet og reiselivet i Tønsberg.',
};

export default async function NyheterPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const [{ kategori }, articles] = await Promise.all([searchParams, getNewsArticles()]);

  // Bare kortfeltene sendes til klienten – ikke hele saken med brødtekst.
  return <NyheterClient articles={articles.map(toNewsCard)} initialCategory={kategori} />;
}
