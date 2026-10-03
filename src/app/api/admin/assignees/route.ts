import { NextResponse } from 'next/server';
import { requireEditorOrAdmin } from '@/lib/auth';
import { listAssignableColleagues } from '@/lib/live-chat';
import { isRoleName, roleLabel } from '@/lib/roles';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/assignees
 *
 * Kollegene en samtale kan tildeles til: aktive brukere med svarrett
 * (superbruker, administrator, redaktør), uten den innloggede selv. Er du den
 * eneste brukeren i systemet, er listen tom – da må du invitere en kollega
 * først.
 */
export async function GET(request: Request) {
  const auth = requireEditorOrAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const colleagues = await listAssignableColleagues({
      id: auth.user?.id,
      email: auth.user?.email,
    });

    return NextResponse.json({
      success: true,
      assignees: colleagues.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleLabel: isRoleName(user.role) ? roleLabel(user.role) : 'Bruker',
        title: user.title,
      })),
      total: colleagues.length,
      // Tom liste er et gyldig svar – det betyr «ingen andre å tildele til ennå».
      hint:
        colleagues.length === 0
          ? 'Ingen andre brukere å tildele til ennå. Inviter en kollega under Team & Samhandling.'
          : null,
    });
  } catch (err: any) {
    console.error('[Assignees GET]:', err);
    return NextResponse.json(
      { success: false, error: 'Kunne ikke hente kollegaer: ' + (err?.message || 'Serverfeil') },
      { status: 500 }
    );
  }
}
