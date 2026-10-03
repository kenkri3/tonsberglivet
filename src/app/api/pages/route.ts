import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sanitizeInput } from '@/lib/validations';
import { requireEditorOrAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Sider i CMS-et.
 *
 * `Page`-modellen har ligget i skjemaet hele tiden, men har aldri hatt verken
 * API eller admin-side – så innhold som ble migrert inn kunne ikke redigeres.
 * Denne ruten gir full CRUD.
 *
 * Synlighet følger samme mønster som artiklene: hvem som helst kan lese
 * PUBLISERTE sider, mens utkast bare er synlige for redaktør/admin. Det er
 * viktig her fordi sidenes innhold kan inneholde ting som ikke skal ut ennå.
 */

/** Gjør en tittel om til en stabil slug. */
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

export async function GET(request: Request) {
  const auth = requireEditorOrAdmin(request);
  const kanSeUtkast = auth.authorized;

  try {
    const pages = await prisma.page.findMany({
      where: kanSeUtkast ? {} : { published: true },
      orderBy: [{ published: 'desc' }, { title: 'asc' }],
    });

    return NextResponse.json({
      success: true,
      source: 'DATABASE',
      canSeeDrafts: kanSeUtkast,
      data: pages,
      total: pages.length,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Kunne ikke hente sider: databasen svarte ikke.' },
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
  const innhold = String(body?.content ?? '').trim();
  const slugInn = String(body?.slug ?? '').trim();

  if (!tittel) {
    return NextResponse.json({ success: false, error: 'Tittel er påkrevd' }, { status: 400 });
  }
  if (!innhold) {
    return NextResponse.json({ success: false, error: 'Innhold er påkrevd' }, { status: 400 });
  }

  try {
    const renTittel = sanitizeInput(tittel);
    const slug = lagSlug(slugInn || renTittel);

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Kunne ikke lage en gyldig URL fra tittelen. Oppgi en egen slug.' },
        { status: 400 },
      );
    }

    const side = await prisma.page.create({
      data: {
        title: renTittel,
        slug,
        content: sanitizeInput(innhold),
        published: body?.published === true,
      },
    });

    return NextResponse.json(
      { success: true, message: `Siden «${side.title}» er opprettet.`, data: side },
      { status: 201 },
    );
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: `Slug-en «${lagSlug(slugInn || tittel)}» er allerede i bruk. Velg en annen.` },
        { status: 409 },
      );
    }
    // Ingen falsk suksess: siden er IKKE lagret.
    return NextResponse.json(
      { success: false, error: 'Kunne ikke opprette siden: databasen svarte ikke. Siden er ikke lagret.' },
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
    return NextResponse.json({ success: false, error: 'Mangler side-ID' }, { status: 400 });
  }

  // Bygg bare opp de feltene som faktisk er sendt inn, så en delvis oppdatering
  // ikke nullstiller resten.
  const data: Record<string, unknown> = {};
  if (body?.title !== undefined) {
    const t = String(body.title).trim();
    if (!t) return NextResponse.json({ success: false, error: 'Tittel kan ikke være tom' }, { status: 400 });
    data.title = sanitizeInput(t);
  }
  if (body?.content !== undefined) {
    const c = String(body.content).trim();
    if (!c) return NextResponse.json({ success: false, error: 'Innhold kan ikke være tomt' }, { status: 400 });
    data.content = sanitizeInput(c);
  }
  if (body?.slug !== undefined) {
    const s = lagSlug(String(body.slug));
    if (!s) return NextResponse.json({ success: false, error: 'Ugyldig slug' }, { status: 400 });
    data.slug = s;
  }
  if (body?.published !== undefined) {
    data.published = body.published === true;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ success: false, error: 'Ingen felt å oppdatere' }, { status: 400 });
  }

  try {
    const side = await prisma.page.update({ where: { id }, data });
    return NextResponse.json({ success: true, message: `Siden «${side.title}» er oppdatert.`, data: side });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Fant ikke siden i databasen.' }, { status: 404 });
    }
    if (error?.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'En annen side bruker allerede den slug-en.' }, { status: 409 });
    }
    return NextResponse.json(
      { success: false, error: 'Kunne ikke oppdatere siden: databasen svarte ikke. Ingen endring er gjort.' },
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
    return NextResponse.json({ success: false, error: 'Mangler side-ID' }, { status: 400 });
  }

  try {
    const side = await prisma.page.delete({ where: { id } });
    return NextResponse.json({ success: true, message: `Siden «${side.title}» er slettet.` });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Fant ikke siden i databasen.' }, { status: 404 });
    }
    return NextResponse.json(
      { success: false, error: 'Kunne ikke slette siden: databasen svarte ikke.' },
      { status: 503 },
    );
  }
}
