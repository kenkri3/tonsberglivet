import { NextResponse } from 'next/server';
import { GdprStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { sanitizeInput } from '@/lib/validations';
import { requireEditorOrAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** Normalisert bilde-DTO — samme form uansett hvilke kolonner DB-raden har. */
interface ImageDto {
  id: string;
  title: string;
  alt: string;
  url: string;
  folder: string;
  photographer: string;
  gdprStatus: GdprStatus;
  tags: string[];
  aiTags: string[];
  uploadedAt: string;
}

type ImageRow = {
  id: string;
  url: string;
  filename: string | null;
  alt: string | null;
  photographer: string | null;
  gdprStatus: GdprStatus;
  tags: string[];
  aiTags: string[];
  createdAt: Date;
  folder?: { name: string } | null;
};

/**
 * DB-raden har filename/alt/folder-relasjon, ikke title/folder-streng.
 * Normaliser her slik at UI-et aldri kan dereferencere undefined.
 */
function toImageDto(img: ImageRow): ImageDto {
  const filename = typeof img.filename === 'string' ? img.filename.trim() : '';
  const alt = typeof img.alt === 'string' ? img.alt.trim() : '';
  return {
    id: img.id,
    title: filename || alt || 'Uten tittel',
    alt,
    url: img.url,
    folder: img.folder?.name || 'Ukategorisert',
    photographer: img.photographer?.trim() || 'Ukreditert',
    gdprStatus: img.gdprStatus,
    tags: Array.isArray(img.tags) ? img.tags : [],
    aiTags: Array.isArray(img.aiTags) ? img.aiTags : [],
    uploadedAt: img.createdAt instanceof Date ? img.createdAt.toISOString() : String(img.createdAt),
  };
}

function normalizeGdprStatus(value: unknown): GdprStatus {
  const candidate = String(value ?? '').toUpperCase();
  return (Object.values(GdprStatus) as string[]).includes(candidate)
    ? (candidate as GdprStatus)
    : GdprStatus.PENDING;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((v) => String(v)).filter((v) => v.trim() !== '') : [];
}

/**
 * GET /api/images — bildebanken.
 * Krever redaktør/administrator: listen inneholder ikke-publiserte og
 * GDPR-flaggede (PENDING/REJECTED) assets samt mappestruktur, og skal derfor
 * ikke være åpen for anonyme. Alle kjente konsumenter er adminflater.
 */
export async function GET(request: Request) {
  const auth = requireEditorOrAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const images = await prisma.image.findMany({
      orderBy: { createdAt: 'desc' },
      include: { folder: { select: { name: true } } },
    });
    return NextResponse.json({
      success: true,
      source: 'DATABASE',
      data: images.map(toImageDto),
      total: images.length,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Kunne ikke hente bilder: databasen svarte ikke.' },
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

  const { title, url, folder, photographer, aiTags, gdprStatus, tags } = body ?? {};

  if (!title || !url) {
    return NextResponse.json({ success: false, error: 'Tittel og URL er påkrevd' }, { status: 400 });
  }

  const cleanTitle = sanitizeInput(String(title));
  const cleanUrl = String(url).trim();
  const folderName = typeof folder === 'string' && folder.trim() ? folder.trim() : null;

  try {
    let folderId: string | null = null;
    if (folderName) {
      const existing = await prisma.imageFolder.findFirst({ where: { name: folderName, parentId: null } });
      folderId = existing?.id ?? (await prisma.imageFolder.create({ data: { name: folderName } })).id;
    }

    const img = await prisma.image.create({
      data: {
        filename: cleanTitle,
        url: cleanUrl,
        photographer: typeof photographer === 'string' && photographer.trim() ? photographer.trim() : null,
        gdprStatus: normalizeGdprStatus(gdprStatus),
        // tags og aiTags er NOT NULL String[] uten default — de MÅ settes.
        tags: toStringArray(tags),
        aiTags: toStringArray(aiTags),
        folderId,
      },
      include: { folder: { select: { name: true } } },
    });
    return NextResponse.json({ success: true, data: toImageDto(img) }, { status: 201 });
  } catch {
    // Ingen falsk suksess: bildet er IKKE lagret.
    return NextResponse.json(
      { success: false, error: 'Kunne ikke lagre bildet: databasen svarte ikke. Bildet er ikke lagret.' },
      { status: 503 },
    );
  }
}
