import { NextResponse } from 'next/server';
import { contactSchema, formatZodError } from '@/lib/validations';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIdentity } from '@/lib/rate-limit';
import { requireEditorOrAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Rate-limiting: maks 5 henvendelser per 10 minutter per klient
  const client = getClientIdentity(request);
  const rateLimit = await checkRateLimit(`contact_${client.id}`, 5, 600, client.identified);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: `For mange henvendelser. Vennligst vent ${rateLimit.resetSeconds} sekunder før du prøver igjen.` },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Ugyldig JSON i forespørselen.' },
      { status: 400 }
    );
  }

  const validation = contactSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { success: false, error: formatZodError(validation.error) },
      { status: 400 }
    );
  }

  try {
    const msg = await prisma.contactMessage.create({
      data: {
        name: validation.data.name,
        email: validation.data.email,
        subject: validation.data.subject,
        message: validation.data.message,
      },
    });
    return NextResponse.json({ success: true, message: 'Meldingen din er sendt! Vi svarer så fort som mulig.', data: msg }, { status: 201 });
  } catch (e) {
    // Ingen minne-fallback: en melding som ikke er lagret skal aldri se ut som en suksess.
    console.error('[Contact] Kunne ikke lagre meldingen i databasen:', e);
    return NextResponse.json(
      {
        success: false,
        error:
          'Meldingen kunne ikke sendes på grunn av en teknisk feil. Ingenting er registrert – prøv igjen om litt, eller send e-post til post@tonsberglivet.no.',
      },
      { status: 503 }
    );
  }
}

export async function GET(request: Request) {
  const auth = requireEditorOrAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const msgs = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: msgs });
  } catch (e) {
    console.error('[Contact] Kunne ikke hente meldinger fra databasen:', e);
    return NextResponse.json(
      { success: false, error: 'Kunne ikke hente meldinger fra databasen akkurat nå.', data: [] },
      { status: 503 }
    );
  }
}

/**
 * Marker kontaktskjemameldinger som lest.
 * Body-varianter:
 *   { id: "<id>" }                       -> én melding
 *   { ids: ["<id>", ...] }               -> flere meldinger
 *   { all: true } (eller action:'mark_all_read') -> alle uleste
 * `read: false` kan sendes for å angre (markere som ulest).
 */
export async function PATCH(request: Request) {
  const auth = requireEditorOrAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Ugyldig JSON i forespørselen.' }, { status: 400 });
  }

  const read = body?.read === undefined ? true : Boolean(body.read);
  const markAll = body?.all === true || body?.action === 'mark_all_read';
  const ids: string[] = Array.isArray(body?.ids)
    ? body.ids.filter((value: unknown): value is string => typeof value === 'string' && value.length > 0)
    : [];
  const singleId: string | null = typeof body?.id === 'string' && body.id.length > 0 ? body.id : null;

  if (!markAll && !singleId && ids.length === 0) {
    return NextResponse.json(
      { success: false, error: 'Mangler meldings-id (eller { all: true } for å markere alle som lest).' },
      { status: 400 }
    );
  }

  try {
    if (markAll) {
      const result = await prisma.contactMessage.updateMany({
        where: { read: !read },
        data: { read },
      });
      return NextResponse.json({ success: true, data: { updated: result.count, read } });
    }

    if (singleId) {
      const updated = await prisma.contactMessage.update({
        where: { id: singleId },
        data: { read },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    const result = await prisma.contactMessage.updateMany({
      where: { id: { in: ids } },
      data: { read },
    });
    return NextResponse.json({ success: true, data: { updated: result.count, read } });
  } catch (e: any) {
    // P2025 = «Record to update not found»
    if (e?.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Fant ingen melding med denne ID-en.' }, { status: 404 });
    }
    console.error('[Contact] Kunne ikke oppdatere lest-status:', e);
    return NextResponse.json(
      { success: false, error: 'Kunne ikke oppdatere meldingen på grunn av en teknisk feil. Ingenting er endret.' },
      { status: 503 }
    );
  }
}
