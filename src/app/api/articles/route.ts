import { NextResponse } from 'next/server';
import { ArticleCategory } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { sanitizeInput } from '@/lib/validations';
import { requireEditorOrAdmin, getSessionFromRequest } from '@/lib/auth';
import { logActivity } from '@/lib/activity';
import { getSetting } from '@/lib/settings';

export const dynamic = 'force-dynamic';

/**
 * Enkelt kilde til sannhet for artiklenes kategorier er Prisma-enumet
 * ArticleCategory. Alle etiketter UI-et kan sende inn normaliseres hit.
 */
const CATEGORY_LABELS: Record<ArticleCategory, string> = {
  [ArticleCategory.BYLIVET]: 'Bylivet',
  [ArticleCategory.HVERDAGSLIVET]: 'Hverdagslivet',
  [ArticleCategory.NAERINGSLIVET]: 'Næringslivet',
  [ArticleCategory.REISELIVET]: 'Reiselivet',
  [ArticleCategory.STUDENTLIVET]: 'Studentlivet',
};

/** «Næringslivet», «naeringslivet», «NAERINGSLIVET» osv. → enum-verdi. */
const CATEGORY_ALIASES: Record<string, ArticleCategory> = {
  bylivet: ArticleCategory.BYLIVET,
  hverdagslivet: ArticleCategory.HVERDAGSLIVET,
  naeringslivet: ArticleCategory.NAERINGSLIVET,
  reiselivet: ArticleCategory.REISELIVET,
  studentlivet: ArticleCategory.STUDENTLIVET,
};

/** Normaliserer en kategorietikett til enum-verdien. Ukjent verdi gir null. */
function normalizeCategory(value: unknown): ArticleCategory | null {
  if (value === undefined || value === null || String(value).trim() === '') {
    return ArticleCategory.BYLIVET;
  }
  const key = String(value)
    .trim()
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[^a-z0-9]/g, '');
  return CATEGORY_ALIASES[key] ?? null;
}

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  const canSeeDrafts = session?.role === 'ADMIN' || session?.role === 'EDITOR';

  try {
    const articles = await prisma.article.findMany({
      where: canSeeDrafts ? undefined : { published: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, source: 'DATABASE', data: articles, total: articles.length });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Kunne ikke hente artikler: databasen svarte ikke.' },
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

  const { title, category, excerpt, content, imageId, published } = body ?? {};

  if (!title || !content) {
    return NextResponse.json({ success: false, error: 'Tittel og innhold er påkrevd' }, { status: 400 });
  }

  // Kategorien må mappes til enum-verdien FØR innsetting, ellers kaster Prisma.
  const normalizedCategory = normalizeCategory(category);
  if (!normalizedCategory) {
    return NextResponse.json(
      {
        success: false,
        error: `Ugyldig kategori «${String(category)}». Gyldige kategorier: ${Object.values(CATEGORY_LABELS).join(', ')}.`,
      },
      { status: 400 },
    );
  }

  try {
    const cleanTitle = sanitizeInput(String(title));
    const cleanExcerpt = excerpt ? sanitizeInput(String(excerpt)) : undefined;
    const slug = cleanTitle
      .toLowerCase()
      .replace(/æ/g, 'ae')
      .replace(/ø/g, 'o')
      .replace(/å/g, 'a')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const autoPublishSetting = await getSetting('auto_publish_articles', 'false');
    const autonomyMode = await getSetting('autonomy_mode', 'manual');
    const isAuto = autoPublishSetting === 'true' || autonomyMode === 'auto';
    const shouldPublish = published !== undefined ? Boolean(published) : isAuto;

    // imageId er en ekte relasjon til bildebanken (Article.imageId → Image.id).
    let resolvedImageId: string | null = null;
    if (imageId !== undefined && imageId !== null && String(imageId).trim() !== '') {
      const image = await prisma.image.findUnique({ where: { id: String(imageId) } });
      if (!image) {
        return NextResponse.json(
          { success: false, error: 'Bildet finnes ikke i bildebanken. Velg et bilde på nytt.' },
          { status: 400 },
        );
      }
      resolvedImageId = image.id;
    }

    const article = await prisma.article.create({
      data: {
        title: cleanTitle,
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        category: normalizedCategory,
        excerpt: cleanExcerpt,
        content: String(content),
        imageId: resolvedImageId,
        published: shouldPublish,
        authorId: auth.user?.id || null,
      },
    });
    await logActivity({
      user: auth.user,
      action: shouldPublish ? 'ARTICLE_PUBLISHED' : 'ARTICLE_CREATED',
      details: `${shouldPublish ? 'Publiserte' : 'Opprettet utkast for'} artikkelen: "${article.title}" (${article.category})`,
      targetType: 'Article',
      targetId: article.id,
    });
    return NextResponse.json({ success: true, data: article }, { status: 201 });
  } catch (error: any) {
    // Ingen falsk suksess: artikkelen er IKKE lagret.
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'En artikkel med samme slug finnes allerede. Prøv igjen om noen sekunder.' },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { success: false, error: 'Kunne ikke lagre artikkelen: databasen svarte ikke. Artikkelen er ikke lagret.' },
      { status: 503 },
    );
  }
}
