import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireEditorOrAdmin } from '@/lib/auth';
import { sanitizeInput } from '@/lib/validations';
import { logActivity } from '@/lib/activity';
import { TaskStatus, TaskPriority } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = requireEditorOrAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  const url = new URL(request.url);
  const statusParam = url.searchParams.get('status');

  try {
    const where: any = {};
    if (statusParam && Object.values(TaskStatus).includes(statusParam as TaskStatus)) {
      where.status = statusParam;
    }

    const tasks = await prisma.teamTask.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, role: true, title: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ success: true, tasks, total: tasks.length });
  } catch (err: any) {
    console.error('[Tasks GET error]:', err);
    return NextResponse.json({ success: false, error: 'Kunne ikke hente oppgaver' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = requireEditorOrAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, priority, dueDate, assignedToId } = body ?? {};

    if (!title || String(title).trim() === '') {
      return NextResponse.json({ success: false, error: 'Oppgavetittel er påkrevd' }, { status: 400 });
    }

    const cleanTitle = sanitizeInput(String(title).trim());
    const cleanDesc = description ? sanitizeInput(String(description).trim()) : null;

    const validPriorities: TaskPriority[] = [TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH];
    const taskPriority = validPriorities.includes(priority) ? priority : TaskPriority.MEDIUM;

    let parsedDueDate: Date | null = null;
    if (dueDate) {
      const d = new Date(dueDate);
      if (!isNaN(d.getTime())) parsedDueDate = d;
    }

    const task = await prisma.teamTask.create({
      data: {
        title: cleanTitle,
        description: cleanDesc,
        priority: taskPriority,
        dueDate: parsedDueDate,
        assignedToId: assignedToId || null,
        createdById: auth.user?.id || null,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    await logActivity({
      user: auth.user,
      action: 'TASK_CREATED',
      details: `Opprettet oppgave: "${task.title}"${task.assignedTo ? ` (tildelt ${task.assignedTo.name || task.assignedTo.email})` : ''}`,
      targetType: 'Task',
      targetId: task.id,
    });

    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (err: any) {
    console.error('[Tasks POST error]:', err);
    return NextResponse.json({ success: false, error: 'Kunne ikke opprette oppgave' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = requireEditorOrAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, title, description, status, priority, dueDate, assignedToId } = body ?? {};

    if (!id) {
      return NextResponse.json({ success: false, error: 'Mangler oppgave-ID' }, { status: 400 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = sanitizeInput(String(title).trim());
    if (description !== undefined) updateData.description = description ? sanitizeInput(String(description).trim()) : null;

    if (status && Object.values(TaskStatus).includes(status)) {
      updateData.status = status;
    }
    if (priority && Object.values(TaskPriority).includes(priority)) {
      updateData.priority = priority;
    }
    if (dueDate !== undefined) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    }
    if (assignedToId !== undefined) {
      updateData.assignedToId = assignedToId || null;
    }

    const updated = await prisma.teamTask.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    await logActivity({
      user: auth.user,
      action: 'TASK_UPDATED',
      details: `Oppdaterte oppgave: "${updated.title}" (Status: ${updated.status})`,
      targetType: 'Task',
      targetId: updated.id,
    });

    return NextResponse.json({ success: true, task: updated });
  } catch (err: any) {
    console.error('[Tasks PATCH error]:', err);
    return NextResponse.json({ success: false, error: 'Kunne ikke oppdatere oppgave' }, { status: 500 });
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
    return NextResponse.json({ success: false, error: 'Mangler oppgave-ID' }, { status: 400 });
  }

  try {
    const task = await prisma.teamTask.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json({ success: false, error: 'Oppgave ikke funnet' }, { status: 404 });
    }

    await prisma.teamTask.delete({ where: { id } });

    await logActivity({
      user: auth.user,
      action: 'TASK_DELETED',
      details: `Slettet oppgave: "${task.title}"`,
      targetType: 'Task',
      targetId: id,
    });

    return NextResponse.json({ success: true, message: 'Oppgave slettet' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Kunne ikke slette oppgave' }, { status: 500 });
  }
}
