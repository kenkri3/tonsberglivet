import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, hashPassword } from '@/lib/auth';
import { sanitizeInput } from '@/lib/validations';
import { logActivity } from '@/lib/activity';
import { Role } from '@prisma/client';
import { ADMIN_LEVEL_ROLES, canManageAccess, isAtLeast, roleLabel, type RoleName } from '@/lib/roles';

export const dynamic = 'force-dynamic';

/** Antall aktive brukere på administratornivå (superbruker + administrator). */
async function countActiveAdmins(): Promise<number> {
  return prisma.user.count({
    where: { active: true, role: { in: ADMIN_LEVEL_ROLES as any } },
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ success: false, error: 'Mangler bruker-ID' }, { status: 400 });
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Bruker ikke funnet' }, { status: 404 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Ugyldig JSON i forespørselen' }, { status: 400 });
    }

    const { name, role, title, phone, active, password } = body ?? {};

    // En superbruker kan bare endres av en superbruker. Uten dette kunne en
    // administrator degradert eller låst ute eiernivået.
    if (existing.role === 'SUPERADMIN' && !isAtLeast(auth.user?.role, 'SUPERADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Bare en superbruker kan endre en annen superbruker.' },
        { status: 403 }
      );
    }

    const validRoles: Role[] = [Role.SUPERADMIN, Role.ADMIN, Role.EDITOR, Role.VIEWER];
    const requestedRole: Role | null = role && validRoles.includes(role) ? role : null;

    // Ingen kan dele ut nivåer uten å være administrator selv.
    if (requestedRole && !canManageAccess(auth.user?.role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bare administratorer og superbrukere kan endre tilgangsnivåer.',
        },
        { status: 403 }
      );
    }

    // Sjekk beskyttelse mot å deaktivere eller nedgradere siste administrator
    const demotesAdmin =
      ADMIN_LEVEL_ROLES.includes(existing.role as RoleName) &&
      ((requestedRole !== null && !ADMIN_LEVEL_ROLES.includes(requestedRole as RoleName)) || active === false);
    if (demotesAdmin) {
      const adminCount = await countActiveAdmins();
      if (adminCount <= 1) {
        return NextResponse.json(
          {
            success: false,
            error: `Kan ikke nedgradere eller deaktivere den eneste aktive administratoren (${roleLabel(existing.role)}).`,
          },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name ? sanitizeInput(String(name).trim()) : null;
    if (title !== undefined) updateData.title = title ? sanitizeInput(String(title).trim()) : null;
    if (phone !== undefined) updateData.phone = phone ? sanitizeInput(String(phone).trim()) : null;
    if (typeof active === 'boolean') updateData.active = active;

    if (requestedRole) {
      updateData.role = requestedRole;
    }

    if (password && String(password).trim().length >= 6) {
      updateData.password = hashPassword(String(password).trim());
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        title: true,
        phone: true,
        active: true,
        updatedAt: true,
      },
    });

    await logActivity({
      user: auth.user,
      action: 'USER_UPDATED',
      details: `Oppdaterte bruker ${updated.name || updated.email} (Rolle: ${updated.role}, Aktiv: ${updated.active})`,
      targetType: 'User',
      targetId: updated.id,
    });

    return NextResponse.json({
      success: true,
      user: updated,
      message: 'Bruker oppdatert.',
    });
  } catch (err: any) {
    console.error('[User PATCH error]:', err);
    return NextResponse.json(
      { success: false, error: 'Kunne ikke oppdatere bruker: ' + (err?.message || 'Serverfeil') },
      { status: 500 }
    );
  }
}

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
    return NextResponse.json({ success: false, error: 'Mangler bruker-ID' }, { status: 400 });
  }

  if (auth.user?.id === id) {
    return NextResponse.json(
      { success: false, error: 'Du kan ikke slette din egen brukerkonto.' },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Bruker ikke funnet' }, { status: 404 });
    }

    if (existing.role === 'SUPERADMIN' && !isAtLeast(auth.user?.role, 'SUPERADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Bare en superbruker kan slette en annen superbruker.' },
        { status: 403 }
      );
    }

    if (ADMIN_LEVEL_ROLES.includes(existing.role as RoleName)) {
      const adminCount = await countActiveAdmins();
      if (adminCount <= 1) {
        return NextResponse.json(
          { success: false, error: 'Kan ikke slette den eneste administratoren i systemet.' },
          { status: 400 }
        );
      }
    }

    await prisma.user.delete({
      where: { id },
    });

    await logActivity({
      user: auth.user,
      action: 'USER_DELETED',
      details: `Slettet bruker ${existing.name || existing.email} (${existing.role})`,
      targetType: 'User',
      targetId: id,
    });

    return NextResponse.json({
      success: true,
      message: 'Bruker ble slettet.',
    });
  } catch (err: any) {
    console.error('[User DELETE error]:', err);
    return NextResponse.json(
      { success: false, error: 'Kunne ikke slette bruker: ' + (err?.message || 'Serverfeil') },
      { status: 500 }
    );
  }
}
