import Script from 'next/script';

export function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
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
}: {
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  locationName: string;
  locationAddress?: string;
  url: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
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
    },
    organizer: {
      '@type': 'Organization',
      name: 'Tønsberglivet AS',
      url: 'https://tonsberglivet.no',
    },
    url: url,
  };

  return (
    <Script
      id={`jsonld-event-${title}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
