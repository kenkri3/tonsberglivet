import { NextResponse } from 'next/server';
import { PartnerLevel } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { sanitizeInput } from '@/lib/validations';
import { requireEditorOrAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function normalizeLevel(value: unknown): PartnerLevel {
  const candidate = String(value ?? '').toUpperCase();
  return (Object.values(PartnerLevel) as string[]).includes(candidate)
    ? (candidate as PartnerLevel)
    : PartnerLevel.STANDARD;
}

export async function GET() {
  try {
    const partners = await prisma.partner.findMany({ orderBy: { createdAt: 'asc' } });
    return NextResponse.json({
      success: true,
      source: 'DATABASE',
      data: partners,
      total: partners.length,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Kunne ikke hente partnere: databasen svarte ikke.' },
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

  const { name, website, description, level } = body ?? {};

  if (!name || !String(name).trim()) {
    return NextResponse.json({ success: false, error: 'Partnernavn er påkrevd' }, { status: 400 });
  }

  try {
    const cleanName = sanitizeInput(String(name));
    const slug = cleanName
      .toLowerCase()
      .replace(/æ/g, 'ae')
      .replace(/ø/g, 'o')
      .replace(/å/g, 'a')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const partner = await prisma.partner.create({
      data: {
        name: cleanName,
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        website: website ? sanitizeInput(String(website)) : null,
        description: description ? sanitizeInput(String(description)) : null,
        level: normalizeLevel(level),
        published: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Partner «${partner.name}» er opprettet!`,
        data: partner,
      },
      { status: 201 },
    );
  } catch (error: any) {
    // Ingen falsk suksess: partneren er IKKE lagret.
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'En partner med samme slug finnes allerede. Prøv igjen om noen sekunder.' },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { success: false, error: 'Kunne ikke opprette partneren: databasen svarte ikke. Partneren er ikke lagret.' },
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
    return NextResponse.json({ success: false, error: 'Mangler partner-ID' }, { status: 400 });
  }

  try {
    await prisma.partner.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Partner slettet' });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Fant ikke partneren i databasen.' }, { status: 404 });
    }
    return NextResponse.json(
      { success: false, error: 'Kunne ikke slette partneren: databasen svarte ikke.' },
      { status: 503 },
    );
  }
}
