import { NextResponse } from 'next/server';
import { acceptInvitation, MIN_INVITE_PASSWORD_LENGTH } from '@/lib/invitations';
import { checkRateLimit, getClientIdentity } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/invitations/accept — offentlig.
 *
 * Den inviterte setter sitt eget passord og aktiverer kontoen. Endepunktet er
 * åpent (ingen sesjon finnes ennå), men begrenset: en token på 32 tilfeldige
 * bytes kan ikke gjettes, og rate limiting hindrer at noen prøver i volum.
 */
export async function POST(request: Request) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Ugyldig JSON i forespørselen.' }, { status: 400 });
    }

    const client = getClientIdentity(request);
    const limit = await checkRateLimit(
      `invite_accept_${client.id}`,
      client.identified ? 10 : 60,
      900,
      client.identified,
    );
    if (!limit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `For mange forsøk. Prøv igjen om ${Math.ceil(limit.resetSeconds / 60)} minutt(er).`,
        },
        { status: 429, headers: { 'Retry-After': String(limit.resetSeconds) } }
      );
    }

    const result = await acceptInvitation({
      token: body?.token,
      name: body?.name,
      password: body?.password,
    });

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error || 'Kunne ikke aktivere kontoen.' },
        { status: result.status || 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: result.user,
        message: 'Kontoen er aktivert. Du kan nå logge inn med passordet du valgte.',
        minPasswordLength: MIN_INVITE_PASSWORD_LENGTH,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('[Invitation accept]:', err);
    return NextResponse.json(
      { success: false, error: 'Kunne ikke aktivere kontoen: ' + (err?.message || 'Serverfeil') },
      { status: 500 }
    );
  }
}
