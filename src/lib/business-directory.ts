import { prisma } from '@/lib/prisma';
import type { BusinessCategory, EventCategory } from '@prisma/client';

/**
 * Serverhjelpere for innhold som landingssidene viser.
 *
 * Bakgrunnen: alle landingssidene hadde innholdet sitt hardkodet i JSX – lister
 * over serveringssteder, butikker og opplevelser som var skrevet for hånd og
 * aldri oppdaterte seg. Samtidig lå kundens 358 bedrifter og 1095 arrangementer
 * i databasen, usynlige for sidene.
 *
 * Disse funksjonene leser fra databasen i stedet. De feiler aldri ut mot siden:
 * er databasen nede, returnerer de tomt og siden rendrer resten som før.
 */

export interface BedriftKort {
  id: string;
  navn: string;
  slug: string;
  beskrivelse: string | null;
  adresse: string | null;
  telefon: string | null;
  epost: string | null;
  nettside: string | null;
  apningstider: string | null;
  kategori: string;
  omrade: string;
}

export interface ArrangementKort {
  id: string;
  tittel: string;
  slug: string;
  sted: string | null;
  startDato: Date;
  startTid: string | null;
  kategori: string;
  bilde: string | null;
  billettlenke: string | null;
}

const tilBedriftKort = (b: any): BedriftKort => ({
  id: b.id,
  navn: b.name,
  slug: b.slug,
  beskrivelse: b.description,
  adresse: b.address,
  telefon: b.phone,
  epost: b.email,
  nettside: b.website,
  apningstider: b.openingHours,
  kategori: b.category,
  omrade: b.area,
});

/** Bedrifter i én kategori, alfabetisk. Tom liste hvis databasen ikke svarer. */
export async function hentBedrifter(
  kategori?: BusinessCategory,
  antall = 60,
): Promise<BedriftKort[]> {
  try {
    const rader = await prisma.business.findMany({
      where: { published: true, ...(kategori ? { category: kategori } : {}) },
      orderBy: { name: 'asc' },
      take: antall,
    });
    return rader.map(tilBedriftKort);
  } catch {
    return [];
  }
}

/** Antall publiserte bedrifter per kategori – til tellere og filterbrikker. */
export async function hentBedriftstellinger(): Promise<Record<string, number>> {
  try {
    const grupper = await prisma.business.groupBy({
      by: ['category'],
      where: { published: true },
      _count: { _all: true },
    });
    return Object.fromEntries(grupper.map((g) => [g.category, g._count._all]));
  } catch {
    return {};
  }
}

/** Kommende arrangementer, nærmeste først. */
export async function hentKommendeArrangementer(
  antall = 6,
  kategori?: EventCategory,
): Promise<ArrangementKort[]> {
  try {
    const rader = await prisma.event.findMany({
      where: {
        published: true,
        startDate: { gte: new Date() },
        ...(kategori ? { category: kategori } : {}),
      },
      orderBy: { startDate: 'asc' },
      take: antall,
      include: { image: { select: { url: true } } },
    });
    return rader.map((e) => ({
      id: e.id,
      tittel: e.title,
      slug: e.slug,
      sted: e.location,
      startDato: e.startDate,
      startTid: e.startTime,
      kategori: e.category,
      bilde: e.image?.url ?? null,
      billettlenke: e.externalUrl,
    }));
  } catch {
    return [];
  }
}

/** Siste publiserte artikler. */
export async function hentSisteArtikler(antall = 4) {
  try {
    return await prisma.article.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      take: antall,
      select: { id: true, title: true, slug: true, excerpt: true, publishedAt: true },
    });
  } catch {
    return [];
  }
}

/** Formaterer en dato på norsk, kort. */
export const kortDato = (d: Date): string =>
  new Intl.DateTimeFormat('nb-NO', { day: 'numeric', month: 'short' }).format(new Date(d));
