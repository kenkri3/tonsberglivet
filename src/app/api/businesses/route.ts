import { NextResponse } from 'next/server';
import { BusinessCategory, BusinessArea } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { sanitizeInput } from '@/lib/validations';
import { requireEditorOrAdmin, getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Bedriftsregisteret.
 *
 * `Business`-tabellen hadde ingen API-rute. Den kunne bare skrives av agenten,
 * så en ansatt kunne ikke rette en åpningstid eller et telefonnummer. Etter
 * migreringen ligger kundens 358 bedrifter her.
 *
 * Kategoriene kommer fra kildesiden som norske etiketter («Mat & drikke»), så
 * vi normaliserer både enum-verdier og etiketter til riktig enum.
 */

const KATEGORIER = Object.values(BusinessCategory);
const OMRADER = Object.values(BusinessArea);

const ETIKETT_TIL_KATEGORI: Record<string, BusinessCategory> = {
  shopping: BusinessCategory.SHOPPING,
  matdrikke: BusinessCategory.MAT_DRIKKE,
  matogdrikke: BusinessCategory.MAT_DRIKKE,
  aktivitet: BusinessCategory.AKTIVITET,
  opplevelse: BusinessCategory.AKTIVITET,
  overnatting: BusinessCategory.OVERNATTING,
  frisorvelvare: BusinessCategory.FRISOR_VELVERE,
  kultur: BusinessCategory.KULTUR,
  barn: BusinessCategory.BARN,
  annet: BusinessCategory.ANNET,
};

const ETIKETT_TIL_OMRADE: Record<string, BusinessArea> = {
  'tonsbergsentrum': BusinessArea.TONSBERG_SENTRUM,
  tonsberg: BusinessArea.TONSBERG_SENTRUM,
  'tonsbergkommune': BusinessArea.TONSBERG_KOMMUNE,
  'faerderkommune': BusinessArea.FAERDER_KOMMUNE,
  faerder: BusinessArea.FAERDER_KOMMUNE,
};

const nokkel = (verdi: unknown) =>
  String(verdi ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a');

/**
 * Nøkkel for etikettoppslag: fjerner også mellomrom og tegnsetting, slik at
 * «Mat & drikke», «mat-og-drikke» og «Mat og drikke» blir samme nøkkel.
 * `nokkel()` beholder skilletegnene fordi `lagSlug()` trenger dem.
 */
const etikettNokkel = (verdi: unknown) => nokkel(verdi).replace(/[^a-z0-9]/g, '');

function normaliserKategori(verdi: unknown): BusinessCategory | null {
  if (verdi === undefined || verdi === null || String(verdi).trim() === '') return null;
  const direkte = String(verdi).trim().toUpperCase();
  if ((KATEGORIER as string[]).includes(direkte)) return direkte as BusinessCategory;
  return ETIKETT_TIL_KATEGORI[etikettNokkel(verdi)] ?? null;
}

function normaliserOmrade(verdi: unknown): BusinessArea | null {
  if (verdi === undefined || verdi === null || String(verdi).trim() === '') return null;
  const direkte = String(verdi).trim().toUpperCase();
  if ((OMRADER as string[]).includes(direkte)) return direkte as BusinessArea;
  return ETIKETT_TIL_OMRADE[etikettNokkel(verdi)] ?? null;
}

function lagSlug(verdi: string): string {
  return nokkel(verdi)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  const kanSeUtkast = session?.role === 'ADMIN' || session?.role === 'EDITOR';

  const url = new URL(request.url);
  const q = (url.searchParams.get('q') ?? '').trim();
  const kategori = normaliserKategori(url.searchParams.get('category'));
  const omrade = normaliserOmrade(url.searchParams.get('area'));
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 100, 1), 500);
  const offset = Math.max(Number(url.searchParams.get('offset')) || 0, 0);

  const where: Record<string, unknown> = {};
  if (!kanSeUtkast) where.published = true;
  if (kategori) where.category = kategori;
  if (omrade) where.area = omrade;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { address: { contains: q, mode: 'insensitive' } },
      { slug: { contains: q, mode: 'insensitive' } },
    ];
  }

  try {
    const [bedrifter, total] = await Promise.all([
      prisma.business.findMany({ where, orderBy: { name: 'asc' }, take: limit, skip: offset }),
      prisma.business.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      source: 'DATABASE',
      canSeeDrafts: kanSeUtkast,
      data: bedrifter,
      total,
      limit,
      offset,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Kunne ikke hente bedrifter: databasen svarte ikke.' },
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

  const navn = String(body?.name ?? '').trim();
  if (!navn) {
    return NextResponse.json({ success: false, error: 'Navn er påkrevd' }, { status: 400 });
  }

  const kategori = normaliserKategori(body?.category) ?? BusinessCategory.ANNET;
  const omrade = normaliserOmrade(body?.area) ?? BusinessArea.TONSBERG_SENTRUM;

  // En oppgitt verdi som ikke lar seg oversette skal gi en ærlig feil, ikke
  // stille falle tilbake på standardverdien – da ville en skrivefeil i
  // kategorien endt opp som «Annet» uten at noen fikk vite det.
  if (body?.category && !normaliserKategori(body.category)) {
    return NextResponse.json(
      { success: false, error: `Ugyldig kategori «${String(body.category)}». Gyldige: ${KATEGORIER.join(', ')}.` },
      { status: 400 },
    );
  }
  if (body?.area && !normaliserOmrade(body.area)) {
    return NextResponse.json(
      { success: false, error: `Ugyldig område «${String(body.area)}». Gyldige: ${OMRADER.join(', ')}.` },
      { status: 400 },
    );
  }

  const slug = lagSlug(String(body?.slug ?? '') || navn);
  if (!slug) {
    return NextResponse.json({ success: false, error: 'Kunne ikke lage en gyldig URL fra navnet.' }, { status: 400 });
  }

  try {
    const bedrift = await prisma.business.create({
      data: {
        name: sanitizeInput(navn),
        slug,
        description: body?.description ? sanitizeInput(String(body.description)) : null,
        address: body?.address ? sanitizeInput(String(body.address)) : null,
        phone: body?.phone ? sanitizeInput(String(body.phone)) : null,
        email: body?.email ? sanitizeInput(String(body.email)) : null,
        website: body?.website ? sanitizeInput(String(body.website)) : null,
        openingHours: body?.openingHours ? sanitizeInput(String(body.openingHours)) : null,
        category: kategori,
        area: omrade,
        published: body?.published === true,
        featured: body?.featured === true,
      },
    });

    return NextResponse.json(
      { success: true, message: `Bedriften «${bedrift.name}» er opprettet.`, data: bedrift },
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
      { success: false, error: 'Kunne ikke opprette bedriften: databasen svarte ikke. Ingenting er lagret.' },
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
    return NextResponse.json({ success: false, error: 'Mangler bedrift-ID' }, { status: 400 });
  }

  const data: Record<string, unknown> = {};

  if (body?.name !== undefined) {
    const n = String(body.name).trim();
    if (!n) return NextResponse.json({ success: false, error: 'Navn kan ikke være tomt' }, { status: 400 });
    data.name = sanitizeInput(n);
  }
  if (body?.slug !== undefined) {
    const s = lagSlug(String(body.slug));
    if (!s) return NextResponse.json({ success: false, error: 'Ugyldig slug' }, { status: 400 });
    data.slug = s;
  }

  // Tekstfeltene settes til null når de tømmes, i stedet for å lagre tom streng.
  for (const felt of ['description', 'address', 'phone', 'email', 'website', 'openingHours'] as const) {
    if (body?.[felt] !== undefined) {
      const v = String(body[felt]).trim();
      data[felt] = v ? sanitizeInput(v) : null;
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
  if (body?.area !== undefined) {
    const o = normaliserOmrade(body.area);
    if (!o) {
      return NextResponse.json(
        { success: false, error: `Ugyldig område. Gyldige: ${OMRADER.join(', ')}.` },
        { status: 400 },
      );
    }
    data.area = o;
  }
  if (body?.published !== undefined) data.published = body.published === true;
  if (body?.featured !== undefined) data.featured = body.featured === true;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ success: false, error: 'Ingen felt å oppdatere' }, { status: 400 });
  }

  try {
    const bedrift = await prisma.business.update({ where: { id }, data });
    return NextResponse.json({
      success: true,
      message: `Bedriften «${bedrift.name}» er oppdatert.`,
      data: bedrift,
    });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Fant ikke bedriften i databasen.' }, { status: 404 });
    }
    if (error?.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'En annen bedrift bruker allerede den slug-en.' }, { status: 409 });
    }
    return NextResponse.json(
      { success: false, error: 'Kunne ikke oppdatere bedriften: databasen svarte ikke. Ingen endring er gjort.' },
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
    return NextResponse.json({ success: false, error: 'Mangler bedrift-ID' }, { status: 400 });
  }

  try {
    const bedrift = await prisma.business.delete({ where: { id } });
    return NextResponse.json({ success: true, message: `Bedriften «${bedrift.name}» er slettet.` });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Fant ikke bedriften i databasen.' }, { status: 404 });
    }
    return NextResponse.json(
      { success: false, error: 'Kunne ikke slette bedriften: databasen svarte ikke.' },
      { status: 503 },
    );
  }
}
