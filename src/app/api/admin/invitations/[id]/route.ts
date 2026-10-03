import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { revokeInvitation } from '@/lib/invitations';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/admin/invitations/[id] — trekker tilbake en ubrukt invitasjon.
 * En invitasjon som allerede er godtatt kan ikke trekkes tilbake; da finnes
 * kontoen, og den skal fjernes eller deaktiveres i brukeradministrasjonen.
 */
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ success: false, error: 'Mangler invitasjons-ID' }, { status: 400 });
  }

  try {
    const result = await revokeInvitation(id, auth.user!);
    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error || 'Kunne ikke trekke tilbake invitasjonen.' },
        { status: result.status || 400 }
      );
    }

    return NextResponse.json({
      success: true,
      invitation: result.invitation,
      message: 'Invitasjonen er trukket tilbake. Lenken slutter å virke umiddelbart.',
    });
  } catch (err: any) {
    console.error('[Invitation DELETE]:', err);
    return NextResponse.json(
      { success: false, error: 'Kunne ikke trekke tilbake invitasjonen: ' + (err?.message || 'Serverfeil') },
      { status: 500 }
    );
  }
}
