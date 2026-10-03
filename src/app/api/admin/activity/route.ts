import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireEditorOrAdmin, requireAuth } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = requireAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 100);
  const targetType = url.searchParams.get('targetType');

  try {
    const where: any = {};
    if (targetType) where.targetType = targetType;

    const activities = await prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      activities,
      total: activities.length,
    });
  } catch (err: any) {
    console.error('[Activity GET error]:', err);
    return NextResponse.json(
      { success: false, error: 'Kunne ikke hente aktivitetslogg: ' + (err?.message || 'Serverfeil') },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = requireEditorOrAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, details, targetType, targetId } = body ?? {};

    if (!action || !details) {
      return NextResponse.json({ success: false, error: 'Mangler action eller details' }, { status: 400 });
    }

    const created = await logActivity({
      user: auth.user,
      action: String(action),
      details: String(details),
      targetType: targetType || null,
      targetId: targetId || null,
    });

    return NextResponse.json({ success: true, activity: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Serverfeil' }, { status: 500 });
  }
}
