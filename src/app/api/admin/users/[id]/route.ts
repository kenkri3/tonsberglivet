import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, hashPassword } from '@/lib/auth';
import { sanitizeInput } from '@/lib/validations';
import { logActivity } from '@/lib/activity';
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

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

    // Sjekk beskyttelse mot å deaktivere eller nedgradere siste administrator
    if (existing.role === 'ADMIN' && (role && role !== 'ADMIN' || active === false)) {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN', active: true },
      });
      if (adminCount <= 1) {
        return NextResponse.json(
          { success: false, error: 'Kan ikke nedgradere eller deaktivere den eneste aktive administratoren.' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name ? sanitizeInput(String(name).trim()) : null;
    if (title !== undefined) updateData.title = title ? sanitizeInput(String(title).trim()) : null;
    if (phone !== undefined) updateData.phone = phone ? sanitizeInput(String(phone).trim()) : null;
    if (typeof active === 'boolean') updateData.active = active;

    const validRoles: Role[] = [Role.ADMIN, Role.EDITOR, Role.VIEWER];
    if (role && validRoles.includes(role)) {
      updateData.role = role;
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

    if (existing.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN', active: true },
      });
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
