import { NextResponse } from 'next/server';
import { EventCategory } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { sanitizeInput } from '@/lib/validations';
import { requireEditorOrAdmin, getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Arrangementer i kalenderen.
 *
 * `Event`-tabellen hadde ingen API-rute i det hele tatt. Den kunne bare skrives
 * av agenten (gjennom /api/mcp og /api/agent/webhook) – en ansatt i panelet
 * kunne ikke rette en skrivefeil i et arrangement. Etter migreringen av kundens
 * eksisterende nettsted ligger det over tusen arrangementer her, så dette er
 * den største flaten uten redigeringstilgang.
 *
 * Synlighet følger artiklene: alle kan lese PUBLISERTE arrangementer, mens
 * upubliserte bare er synlige for redaktør/admin.
 */

const KATEGORIER = Object.values(EventCategory);

/** «Konsert», «KONSERT», «konsert» → enum-verdi. Ukjent gir null. */
function normaliserKategori(verdi: unknown): EventCategory | null {
  if (verdi === undefined || verdi === null || String(verdi).trim() === '') return null;
  const key = String(verdi).trim().toUpperCase();
  return (KATEGORIER as string[]).includes(key) ? (key as EventCategory) : null;
}

function lagSlug(verdi: string): string {
  return verdi
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Tolker en dato fra klienten. Returnerer null for søppel i stedet for Invalid Date. */
function tilDato(verdi: unknown): Date | null {
  if (verdi === undefined || verdi === null || String(verdi).trim() === '') return null;
  const d = new Date(String(verdi));
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  const kanSeUtkast = session?.role === 'ADMIN' || session?.role === 'EDITOR';

  const url = new URL(request.url);
  const q = (url.searchParams.get('q') ?? '').trim();
  const kategori = normaliserKategori(url.searchParams.get('category'));
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 100, 1), 500);
  const offset = Math.max(Number(url.searchParams.get('offset')) || 0, 0);

  const where: Record<string, unknown> = {};
  if (!kanSeUtkast) where.published = true;
  if (kategori) where.category = kategori;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { location: { contains: q, mode: 'insensitive' } },
      { slug: { contains: q, mode: 'insensitive' } },
    ];
  }

  try {
    const [arrangementer, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { startDate: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.event.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      source: 'DATABASE',
      canSeeDrafts: kanSeUtkast,
      data: arrangementer,
      total,
      limit,
      offset,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Kunne ikke hente arrangementer: databasen svarte ikke.' },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  const auth = requireEditorOrAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Ugyldig JSON i forespørselen' }, { status: 400 });
  }

  const tittel = String(body?.title ?? '').trim();
  if (!tittel) {
    return NextResponse.json({ success: false, error: 'Tittel er påkrevd' }, { status: 400 });
  }

  const start = tilDato(body?.startDate);
  if (!start) {
    return NextResponse.json(
      { success: false, error: 'Startdato er påkrevd og må være en gyldig dato.' },
      { status: 400 },
    );
  }

  // En oppgitt kategori som ikke lar seg oversette skal gi en ærlig feil, ikke
  // stille bli «ARRANGEMENT» – da ville en skrivefeil endt opp som feil
  // kategori uten at noen fikk vite det.
  if (body?.category && !normaliserKategori(body.category)) {
    return NextResponse.json(
      { success: false, error: `Ugyldig kategori «${String(body.category)}». Gyldige: ${KATEGORIER.join(', ')}.` },
      { status: 400 },
    );
  }
  const kategori = normaliserKategori(body?.category) ?? EventCategory.ARRANGEMENT;
  const slutt = tilDato(body?.endDate);
  if (body?.endDate && !slutt) {
    return NextResponse.json({ success: false, error: 'Sluttdato er ikke en gyldig dato.' }, { status: 400 });
  }
  if (slutt && slutt < start) {
    return NextResponse.json({ success: false, error: 'Sluttdato kan ikke være før startdato.' }, { status: 400 });
  }

  const slug = lagSlug(String(body?.slug ?? '') || tittel);
  if (!slug) {
    return NextResponse.json(
      { success: false, error: 'Kunne ikke lage en gyldig URL fra tittelen. Oppgi en egen slug.' },
      { status: 400 },
    );
  }

  try {
    const arrangement = await prisma.event.create({
      data: {
        title: sanitizeInput(tittel),
        slug,
        description: body?.description ? sanitizeInput(String(body.description)) : null,
        location: body?.location ? sanitizeInput(String(body.location)) : null,
        address: body?.address ? sanitizeInput(String(body.address)) : null,
        startDate: start,
        endDate: slutt,
        startTime: body?.startTime ? String(body.startTime).trim() : null,
        endTime: body?.endTime ? String(body.endTime).trim() : null,
        externalUrl: body?.externalUrl ? sanitizeInput(String(body.externalUrl)) : null,
        category: kategori,
        published: body?.published === true,
        featured: body?.featured === true,
      },
    });

    return NextResponse.json(
      { success: true, message: `Arrangementet «${arrangement.title}» er opprettet.`, data: arrangement },
      { status: 201 },
    );
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: `Slug-en «${slug}» er allerede i bruk. Velg en annen.` },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { success: false, error: 'Kunne ikke opprette arrangementet: databasen svarte ikke. Ingenting er lagret.' },
      { status: 503 },
    );
  }
}

export async function PATCH(request: Request) {
  const auth = requireEditorOrAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Ugyldig JSON i forespørselen' }, { status: 400 });
  }

  const id = String(body?.id ?? '').trim();
  if (!id) {
    return NextResponse.json({ success: false, error: 'Mangler arrangement-ID' }, { status: 400 });
  }

  // Bygg bare opp feltene som er sendt inn, så en delvis oppdatering
  // (f.eks. bare «avpubliser») ikke nullstiller resten.
  const data: Record<string, unknown> = {};

  if (body?.title !== undefined) {
    const t = String(body.title).trim();
    if (!t) return NextResponse.json({ success: false, error: 'Tittel kan ikke være tom' }, { status: 400 });
    data.title = sanitizeInput(t);
  }
  if (body?.slug !== undefined) {
    const s = lagSlug(String(body.slug));
    if (!s) return NextResponse.json({ success: false, error: 'Ugyldig slug' }, { status: 400 });
    data.slug = s;
  }
  for (const [felt, kolonne] of [
    ['description', 'description'],
    ['location', 'location'],
    ['address', 'address'],
    ['externalUrl', 'externalUrl'],
  ] as const) {
    if (body?.[felt] !== undefined) {
      const v = String(body[felt]).trim();
      data[kolonne] = v ? sanitizeInput(v) : null;
    }
  }
  for (const felt of ['startTime', 'endTime'] as const) {
    if (body?.[felt] !== undefined) {
      const v = String(body[felt]).trim();
      data[felt] = v || null;
    }
  }
  if (body?.startDate !== undefined) {
    const d = tilDato(body.startDate);
    if (!d) return NextResponse.json({ success: false, error: 'Startdato er ikke en gyldig dato.' }, { status: 400 });
    data.startDate = d;
  }
  if (body?.endDate !== undefined) {
    if (body.endDate === null || String(body.endDate).trim() === '') {
      data.endDate = null;
    } else {
      const d = tilDato(body.endDate);
      if (!d) return NextResponse.json({ success: false, error: 'Sluttdato er ikke en gyldig dato.' }, { status: 400 });
      data.endDate = d;
    }
  }
  if (body?.category !== undefined) {
    const k = normaliserKategori(body.category);
    if (!k) {
      return NextResponse.json(
        { success: false, error: `Ugyldig kategori. Gyldige: ${KATEGORIER.join(', ')}.` },
        { status: 400 },
      );
    }
    data.category = k;
  }
  if (body?.published !== undefined) data.published = body.published === true;
  if (body?.featured !== undefined) data.featured = body.featured === true;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ success: false, error: 'Ingen felt å oppdatere' }, { status: 400 });
  }

  try {
    const arrangement = await prisma.event.update({ where: { id }, data });
    return NextResponse.json({
      success: true,
      message: `Arrangementet «${arrangement.title}» er oppdatert.`,
      data: arrangement,
    });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Fant ikke arrangementet i databasen.' }, { status: 404 });
    }
    if (error?.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Et annet arrangement bruker allerede den slug-en.' }, { status: 409 });
    }
    return NextResponse.json(
      { success: false, error: 'Kunne ikke oppdatere arrangementet: databasen svarte ikke. Ingen endring er gjort.' },
      { status: 503 },
    );
  }
}

export async function DELETE(request: Request) {
  const auth = requireEditorOrAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, error: 'Mangler arrangement-ID' }, { status: 400 });
  }

  try {
    const arrangement = await prisma.event.delete({ where: { id } });
    return NextResponse.json({ success: true, message: `Arrangementet «${arrangement.title}» er slettet.` });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Fant ikke arrangementet i databasen.' }, { status: 404 });
    }
    return NextResponse.json(
      { success: false, error: 'Kunne ikke slette arrangementet: databasen svarte ikke.' },
      { status: 503 },
    );
  }
}
