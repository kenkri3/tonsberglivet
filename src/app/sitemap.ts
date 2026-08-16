import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tonsberglivet.no';

  const routes = [
    '',
    '/bylivet',
    '/bylivet/gavekort',
    '/bylivet/torvleie',
    '/eventer',
    '/hverdagslivet',
    '/naeringslivet',
    '/nyheter',
    '/om-oss',
    '/om-oss/partnere',
    '/om-oss/presserom',
    '/prosjekter',
    '/reiselivet',
    '/studentlivet',
    '/kontakt',
    '/personvern',
    '/informasjonskapsler',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/eventer' || route === '/nyheter' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route.startsWith('/bylivet') || route === '/eventer' ? 0.9 : 0.8,
  }));
}
