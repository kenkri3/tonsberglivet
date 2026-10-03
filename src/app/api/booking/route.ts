import { NextResponse } from 'next/server';
import { bookingSchema, formatZodError } from '@/lib/validations';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIdentity } from '@/lib/rate-limit';
import { requireEditorOrAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Rate limiting for booking-forespørsler
  const client = getClientIdentity(request);
  const rateLimit = await checkRateLimit(`booking_${client.id}`, 5, 600, client.identified);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: `For mange bookingforespørsler. Vennligst vent ${rateLimit.resetSeconds} sekunder.` },
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

  const validation = bookingSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { success: false, error: formatZodError(validation.error) },
      { status: 400 }
    );
  }
  const parsed = validation.data;

  try {
    const booking = await prisma.bookingRequest.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone,
        type: parsed.type,
        startDate: parsed.startDate ? new Date(parsed.startDate) : null,
        endDate: parsed.endDate ? new Date(parsed.endDate) : null,
        message: parsed.message,
        status: 'NEW',
      },
    });
    return NextResponse.json({ success: true, data: booking }, { status: 201 });
  } catch (dbError) {
    // Ingen minne-fallback: en søknad som ikke er lagret skal aldri se ut som en suksess.
    console.error('[Booking] Kunne ikke lagre søknaden i databasen:', dbError);
    return NextResponse.json(
      {
        success: false,
        error:
          'Søknaden kunne ikke lagres på grunn av en teknisk feil. Ingen søknad er registrert – prøv igjen om litt, eller send e-post til post@tonsberglivet.no.',
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
    const bookings = await prisma.bookingRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: bookings });
  } catch (e) {
    console.error('[Booking] Kunne ikke hente søknader fra databasen:', e);
    return NextResponse.json(
      { success: false, error: 'Kunne ikke hente søknader fra databasen akkurat nå.', data: [] },
      { status: 503 }
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
    return NextResponse.json({ success: false, error: 'Ugyldig JSON i forespørselen.' }, { status: 400 });
  }

  const { id, status } = body || {};
  if (!id || !['APPROVED', 'REJECTED', 'PROCESSING'].includes(status)) {
    return NextResponse.json({ success: false, error: 'Ugyldig status' }, { status: 400 });
  }

  try {
    const updated = await prisma.bookingRequest.update({
      where: { id },
      data: { status },
    });
    await logActivity({
      user: auth.user,
      action: status === 'APPROVED' ? 'BOOKING_APPROVED' : (status === 'REJECTED' ? 'BOOKING_REJECTED' : 'BOOKING_UPDATED'),
      details: `${status === 'APPROVED' ? 'Godkjente' : (status === 'REJECTED' ? 'Avslo' : 'Oppdaterte')} torvleiesøknad for ${updated.name || updated.email} (${updated.type})`,
      targetType: 'BookingRequest',
      targetId: updated.id,
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (e: any) {
    // P2025 = «Record to update not found» -> søknaden finnes ikke
    if (e?.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Fant ingen søknad med denne ID-en.' },
        { status: 404 }
      );
    }
    console.error(`[Booking] Kunne ikke oppdatere status for søknad ${id}:`, e);
    return NextResponse.json(
      { success: false, error: 'Kunne ikke oppdatere søknaden på grunn av en teknisk feil. Status er ikke endret.' },
      { status: 503 }
    );
  }
}
