import { Metadata } from 'next';
import EventerClient from './EventerClient';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Hva skjer i Tønsberg - Eventer',
  description: 'Oversikt over arrangementer, konserter, markeder og kultur i Tønsberg.',
};

// Kalenderen hentes fra databasen ved hvert besøk, så nye arrangementer vises
// med en gang.
export const dynamic = 'force-dynamic';

/**
 * Henter Tønsberglivets egne kommende arrangementer.
 *
 * `/eventer` viste før bare Ticketmaster-feeden, som er ekstern og bare
 * inneholder det det selges billetter til. Kundens egne 1095 arrangementer lå
 * i databasen uten å være synlige noe sted på den nye siden.
 */
async function hentEgneArrangementer(visAlle: boolean) {
  try {
    const naa = new Date();
    const [rader, totalt] = await Promise.all([
      prisma.event.findMany({
        where: { published: true, startDate: { gte: naa } },
        orderBy: { startDate: 'asc' },
        take: visAlle ? 120 : 9,
        include: { image: { select: { url: true } } },
      }),
      prisma.event.count({ where: { published: true, startDate: { gte: naa } } }),
    ]);

    return {
      arrangementer: rader.map((e) => ({
        id: e.id,
        slug: e.slug,
        tittel: e.title,
        sted: e.location,
        startDato: e.startDate.toISOString(),
        startTid: e.startTime,
        kategori: e.category,
        bilde: e.image?.url ?? null,
        billettlenke: e.externalUrl,
      })),
      totalt,
    };
  } catch {
    return { arrangementer: [], totalt: 0 };
  }
}

export default async function EventerPage({
  searchParams,
}: {
  searchParams: Promise<{ vis?: string }>;
}) {
  const { vis } = await searchParams;
  const { arrangementer, totalt } = await hentEgneArrangementer(vis === 'alle');

  return <EventerClient egneArrangementer={arrangementer} egneTotalt={totalt} />;
}
