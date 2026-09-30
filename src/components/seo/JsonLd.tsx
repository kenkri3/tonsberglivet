import Script from 'next/script';

export function EnterpriseGraphJsonLd({
  id = 'jsonld-graph',
  schema,
}: {
  id?: string;
  schema: any;
}) {
  if (!schema) return null;

  return (
    <Script
      id={id}
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://tonsberglivet.no/#organization',
    name: 'Tønsberglivet AS',
    url: 'https://tonsberglivet.no',
    logo: 'https://tonsberglivet.no/logo.png',
    description: 'Tønsberglivet er et samarbeid mellom aktører som vil bidra til mer synlighet, mer stolthet, mer liv og mer kraft i hele regionen.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rådhusgaten 1',
      addressLocality: 'Tønsberg',
      postalCode: '3126',
      addressCountry: 'NO',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 59.2675,
      longitude: 10.4076,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+47-971-69-755',
      contactType: 'customer service',
      email: 'hei@tonsberglivet.no',
      availableLanguage: ['Norwegian', 'English'],
    },
    sameAs: [
      'https://facebook.com/tonsberglivet',
      'https://instagram.com/tonsberglivet',
      'https://linkedin.com/company/tonsberglivet',
    ],
  };

  return (
    <Script
      id="jsonld-organization"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function EventJsonLd({
  title,
  description,
  startDate,
  endDate,
  locationName,
  locationAddress,
  url,
  price = '0',
}: {
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  locationName: string;
  locationAddress?: string;
  url: string;
  price?: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Event',
        '@id': `${url}#event`,
        name: title,
        description: description,
        startDate: startDate,
        endDate: endDate || startDate,
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        location: {
          '@type': 'Place',
          name: locationName,
          address: {
            '@type': 'PostalAddress',
            streetAddress: locationAddress || locationName,
            addressLocality: 'Tønsberg',
            addressCountry: 'NO',
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: 59.2675,
            longitude: 10.4076,
          },
        },
        organizer: {
          '@type': 'Organization',
          name: 'Tønsberglivet AS',
          url: 'https://tonsberglivet.no',
        },
        offers: {
          '@type': 'Offer',
          price: price,
          priceCurrency: 'NOK',
          availability: 'https://schema.org/InStock',
          url: url,
        },
        url: url,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Hjem',
            item: 'https://tonsberglivet.no',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Arrangementer',
            item: 'https://tonsberglivet.no/eventer',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: title,
            item: url,
          },
        ],
      },
    ],
  };

  return (
    <Script
      id={`jsonld-event-${encodeURIComponent(title)}`}
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ArticleJsonLd({
  title,
  description,
  url,
  datePublished,
  authorName = 'Tønsberglivet Redaksjon',
  category = 'Bylivet',
  imageUrl,
}: {
  title: string;
  description: string;
  url: string;
  datePublished?: string;
  authorName?: string;
  category?: string;
  imageUrl?: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: title,
        description: description,
        url: url,
        mainEntityOfPage: url,
        datePublished: datePublished || new Date().toISOString(),
        dateModified: new Date().toISOString(),
        image: imageUrl || 'https://tonsberglivet.no/images/hero.jpg',
        author: {
          '@type': 'Person',
          name: authorName,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Tønsberglivet AS',
          url: 'https://tonsberglivet.no',
          logo: {
            '@type': 'ImageObject',
            url: 'https://tonsberglivet.no/logo.png',
          },
        },
        articleSection: category,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Hjem',
            item: 'https://tonsberglivet.no',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: category,
            item: `https://tonsberglivet.no/${category.toLowerCase()}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: title,
            item: url,
          },
        ],
      },
    ],
  };

  return (
    <Script
      id={`jsonld-article-${encodeURIComponent(title)}`}
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
