import { NextResponse } from 'next/server';
import { ProjectStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { sanitizeInput } from '@/lib/validations';
import { requireEditorOrAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function normalizeStatus(value: unknown): ProjectStatus {
  const candidate = String(value ?? '').toUpperCase();
  return (Object.values(ProjectStatus) as string[]).includes(candidate)
    ? (candidate as ProjectStatus)
    : ProjectStatus.ACTIVE;
}

export async function GET() {
  try {
    const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({
      success: true,
      source: 'DATABASE',
      data: projects,
      total: projects.length,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Kunne ikke hente prosjekter: databasen svarte ikke.' },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  const auth = requireEditorOrAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Ugyldig JSON i forespørselen' }, { status: 400 });
  }

  const { title, description, content, status, published } = body ?? {};

  if (!title || !String(title).trim()) {
    return NextResponse.json({ success: false, error: 'Tittel er påkrevd' }, { status: 400 });
  }

  try {
    const cleanTitle = sanitizeInput(String(title));
    const slug = cleanTitle
      .toLowerCase()
      .replace(/æ/g, 'ae')
      .replace(/ø/g, 'o')
      .replace(/å/g, 'a')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const project = await prisma.project.create({
      data: {
        title: cleanTitle,
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        description: description ? sanitizeInput(String(description)) : null,
        content: content ? sanitizeInput(String(content)) : null,
        status: normalizeStatus(status),
        published: published !== undefined ? Boolean(published) : true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Prosjekt «${project.title}» er opprettet!`,
        data: project,
      },
      { status: 201 },
    );
  } catch (error: any) {
    // Ingen falsk suksess: prosjektet er IKKE lagret.
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Et prosjekt med samme slug finnes allerede. Prøv igjen om noen sekunder.' },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { success: false, error: 'Kunne ikke opprette prosjektet: databasen svarte ikke. Prosjektet er ikke lagret.' },
      { status: 503 },
    );
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
    return NextResponse.json({ success: false, error: 'Mangler prosjekt-ID' }, { status: 400 });
  }

  try {
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Prosjekt slettet' });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Fant ikke prosjektet i databasen.' }, { status: 404 });
    }
    return NextResponse.json(
      { success: false, error: 'Kunne ikke slette prosjektet: databasen svarte ikke.' },
      { status: 503 },
    );
  }
}
