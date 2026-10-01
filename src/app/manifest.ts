import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tønsberglivet — Offisiell Byportal',
    short_name: 'Tønsberglivet',
    description: 'Norges eldste kystby. Opplev Bylivet, Hverdagslivet, Næringslivet, Reiselivet og Studentlivet i Tønsberg.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#16193d',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
