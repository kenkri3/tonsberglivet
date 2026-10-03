import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, requireAuth, hashPassword } from '@/lib/auth';
import { sanitizeInput } from '@/lib/validations';
import { logActivity } from '@/lib/activity';
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = requireAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        title: true,
        phone: true,
        active: true,
        image: true,
        lastActiveAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            articles: true,
            assignedTasks: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      users,
      total: users.length,
    });
  } catch (err: any) {
    console.error('[Users GET error]:', err);
    return NextResponse.json(
      { success: false, error: 'Kunne ikke hente brukere fra databasen: ' + (err?.message || 'Serverfeil') },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
  }

  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Ugyldig JSON i forespørselen' }, { status: 400 });
    }

    const { name, email, password, role, title, phone } = body ?? {};

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'E-postadresse og passord er påkrevd.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return NextResponse.json(
        { success: false, error: 'Ugyldig e-postadresse.' },
        { status: 400 }
      );
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        { success: false, error: 'Passordet må ha minst 6 tegn.' },
        { status: 400 }
      );
    }

    const validRoles: Role[] = [Role.ADMIN, Role.EDITOR, Role.VIEWER];
    const userRole: Role = validRoles.includes(role) ? role : Role.EDITOR;

    // Sjekk om bruker allerede finnes
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'En bruker med denne e-postadressen er allerede registrert.' },
        { status: 409 }
      );
    }

    const cleanName = name ? sanitizeInput(String(name).trim()) : null;
    const cleanTitle = title ? sanitizeInput(String(title).trim()) : null;
    const cleanPhone = phone ? sanitizeInput(String(phone).trim()) : null;

    const newUser = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        password: hashPassword(String(password)),
        role: userRole,
        title: cleanTitle,
        phone: cleanPhone,
        active: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        title: true,
        phone: true,
        active: true,
        createdAt: true,
      },
    });

    await logActivity({
      user: auth.user,
      action: 'USER_CREATED',
      details: `Opprettet bruker ${newUser.name || newUser.email} med rolle ${newUser.role}`,
      targetType: 'User',
      targetId: newUser.id,
    });

    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'Bruker ble opprettet.',
    }, { status: 201 });
  } catch (err: any) {
    console.error('[Users POST error]:', err);
    return NextResponse.json(
      { success: false, error: 'Kunne ikke opprette bruker: ' + (err?.message || 'Serverfeil') },
      { status: 500 }
    );
  }
}
