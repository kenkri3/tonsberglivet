import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tonsberglivet.no';

  // Statiske kjerne-huber og overordnede kategorier
  const staticRoutes = [
    { url: '', priority: 1.0, changeFrequency: 'daily' as const },
    // Bylivet
    { url: '/bylivet', priority: 0.9, changeFrequency: 'daily' as const },
    { url: '/bylivet/torvleie', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/bylivet/gavekort', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/bylivet/mat-og-drikke', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/bylivet/shopping', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/bylivet/aktiviteter', priority: 0.8, changeFrequency: 'weekly' as const },
    // Arrangementer & Eventer (Sweet Spot)
    { url: '/eventer', priority: 0.9, changeFrequency: 'daily' as const },
    { url: '/eventer/1', priority: 0.8, changeFrequency: 'daily' as const },
    { url: '/eventer/2', priority: 0.8, changeFrequency: 'daily' as const },
    { url: '/eventer/3', priority: 0.8, changeFrequency: 'daily' as const },
    // Nyheter & Artikler
    { url: '/nyheter', priority: 0.9, changeFrequency: 'daily' as const },
    { url: '/nyheter/1', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/nyheter/2', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/nyheter/3', priority: 0.8, changeFrequency: 'weekly' as const },
    // Reiselivet
    { url: '/reiselivet', priority: 0.85, changeFrequency: 'weekly' as const },
    { url: '/reiselivet/opplevelser', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/reiselivet/overnatting', priority: 0.8, changeFrequency: 'weekly' as const },
    // Næringslivet
    { url: '/naeringslivet', priority: 0.85, changeFrequency: 'weekly' as const },
    { url: '/naeringslivet/bedrifter', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/naeringslivet/etablering', priority: 0.8, changeFrequency: 'weekly' as const },
    // Studentlivet
    { url: '/studentlivet', priority: 0.85, changeFrequency: 'weekly' as const },
    { url: '/studentlivet/bolig-og-rabatter', priority: 0.8, changeFrequency: 'weekly' as const },
    // Hverdagslivet
    { url: '/hverdagslivet', priority: 0.8, changeFrequency: 'weekly' as const },
    // Om oss & Informasjon
    { url: '/om-oss', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/om-oss/partnere', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/om-oss/presserom', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/prosjekter', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/kontakt', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/personvern', priority: 0.3, changeFrequency: 'yearly' as const },
    { url: '/informasjonskapsler', priority: 0.3, changeFrequency: 'yearly' as const },
  ];

  const sitemapItems: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Hent dynamisk publiserte artikler fra databasen
  try {
    const dbArticles = await prisma.article.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      take: 50,
    });

    for (const art of dbArticles) {
      if (art.slug) {
        sitemapItems.push({
          url: `${baseUrl}/nyheter/${art.slug}`,
          lastModified: art.updatedAt || new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }
  } catch (e) {
    // Fortsett uten DB-artikler ved feil
  }

  return sitemapItems;
}
