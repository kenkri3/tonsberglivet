import { NextResponse } from 'next/server';
import { partnerAppSchema, formatZodError } from '@/lib/validations';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIdentity } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * Tar imot partnerskapshenvendelser fra /om-oss/partnere.
 *
 * Skjemaet på den siden hadde felter og en «Send partnerskapshenvendelse»-knapp,
 * men ingen state, ingen API-rute og ingen lagring – knappen gjorde ingenting.
 * `PartnerApplication`-modellen og `partnerAppSchema` fantes allerede i koden,
 * men var aldri tatt i bruk. Denne ruten kobler dem sammen.
 */
export async function POST(request: Request) {
  // Samme grense som kontaktskjemaet: 5 henvendelser per 10 minutter per klient.
  const client = getClientIdentity(request);
  const rateLimit = await checkRateLimit(`partner_app_${client.id}`, 5, 600, client.identified);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `For mange henvendelser. Vennligst vent ${rateLimit.resetSeconds} sekunder før du prøver igjen.`,
      },
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

  const validation = partnerAppSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { success: false, error: formatZodError(validation.error) },
      { status: 400 }
    );
  }

  try {
    const application = await prisma.partnerApplication.create({
      data: {
        contactName: validation.data.contactName,
        businessName: validation.data.businessName,
        email: validation.data.email,
        phone: validation.data.phone || null,
        message: validation.data.message || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Takk! Henvendelsen din er registrert. Vi tar kontakt så snart vi kan.',
        data: { id: application.id },
      },
      { status: 201 }
    );
  } catch (error) {
    // Ingen minne-fallback: en henvendelse som ikke er lagret skal aldri se ut
    // som en suksess. Brukeren får beskjed om å sende e-post i stedet.
    console.error('[PartnerApplication] Kunne ikke lagre henvendelsen:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          'Henvendelsen kunne ikke registreres på grunn av en teknisk feil. Ingenting er lagret – prøv igjen om litt, eller send e-post til hei@tonsberglivet.no.',
      },
      { status: 503 }
    );
  }
}
