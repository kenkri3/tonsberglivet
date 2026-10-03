import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireEditorOrAdmin, requireAuth } from '@/lib/auth';
import { sanitizeInput } from '@/lib/validations';
import { logActivity } from '@/lib/activity';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = requireAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const notes = await prisma.internalNote.findMany({
      orderBy: [
        { pinned: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        author: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return NextResponse.json({ success: true, notes, total: notes.length });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Kunne ikke hente notater' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = requireAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { content, pinned } = body ?? {};

    if (!content || String(content).trim() === '') {
      return NextResponse.json({ success: false, error: 'Innhold er påkrevd' }, { status: 400 });
    }

    const cleanContent = sanitizeInput(String(content).trim());

    const note = await prisma.internalNote.create({
      data: {
        content: cleanContent,
        pinned: Boolean(pinned),
        authorId: auth.user?.id || null,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    await logActivity({
      user: auth.user,
      action: 'NOTE_CREATED',
      details: `La til redaksjonsnotat: "${cleanContent.slice(0, 50)}${cleanContent.length > 50 ? '...' : ''}"`,
      targetType: 'Note',
      targetId: note.id,
    });

    return NextResponse.json({ success: true, note }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Kunne ikke opprette notat' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = requireEditorOrAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, error: 'Mangler notat-ID' }, { status: 400 });
  }

  try {
    await prisma.internalNote.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Notat slettet' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Kunne ikke slette notat' }, { status: 500 });
  }
}
