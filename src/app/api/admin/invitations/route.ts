import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { INVITATION_TTL_DAYS, createInvitation, listInvitations } from '@/lib/invitations';
import { sendInvitationEmail } from '@/lib/email';
import { roleLabel } from '@/lib/roles';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/invitations — invitasjoner med status (venter, godtatt,
 * trukket tilbake, utløpt). Krever administratornivå.
 */
export async function GET(request: Request) {
  const auth = requireAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }

  try {
    const invitations = await listInvitations();
    return NextResponse.json({
      success: true,
      invitations,
      counts: {
        pending: invitations.filter((i) => i.status === 'PENDING').length,
        accepted: invitations.filter((i) => i.status === 'ACCEPTED').length,
        total: invitations.length,
      },
    });
  } catch (err: any) {
    console.error('[Invitations GET]:', err);
    return NextResponse.json(
      { success: false, error: 'Kunne ikke hente invitasjoner: ' + (err?.message || 'Serverfeil') },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/invitations — oppretter en invitasjon og forsøker å sende
 * e-post. Er ingen e-posttjeneste konfigurert, returneres lenken slik at den
 * som inviterer kan dele den selv. Vi later aldri som om e-posten er sendt.
 */
export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Ugyldig JSON i forespørselen' }, { status: 400 });
  }

  try {
    const result = await createInvitation({
      email: body?.email,
      name: body?.name,
      title: body?.title,
      role: body?.role,
      note: body?.note,
      actor: auth.user!,
    });

    if (!result.ok || !result.invitation || !result.token) {
      return NextResponse.json(
        { success: false, error: result.error || 'Kunne ikke opprette invitasjonen.' },
        { status: result.status || 400 }
      );
    }

    // Lenken bygges fra forespørselens opphav, slik at den virker både lokalt
    // og i produksjon uten egen konfigurasjon.
    const origin = new URL(request.url).origin;
    const inviteUrl = `${origin}/invitasjon/${result.token}`;

    const emailResult = await sendInvitationEmail({
      email: result.invitation.email,
      name: result.invitation.name,
      roleLabel: roleLabel(result.invitation.role),
      invitedByName: result.invitation.invitedByName || 'Tønsberglivet',
      inviteUrl,
      note: result.invitation.note,
      expiresAt: result.invitation.expiresAt,
    });

    return NextResponse.json(
      {
        success: true,
        invitation: result.invitation,
        inviteUrl,
        expiresInDays: INVITATION_TTL_DAYS,
        email: emailResult,
        message: emailResult.delivered
          ? `Invitasjonen er sendt til ${result.invitation.email}.`
          : `Invitasjonen er opprettet. ${emailResult.message}`,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('[Invitations POST]:', err);
    return NextResponse.json(
      { success: false, error: 'Kunne ikke opprette invitasjon: ' + (err?.message || 'Serverfeil') },
      { status: 500 }
    );
  }
}
