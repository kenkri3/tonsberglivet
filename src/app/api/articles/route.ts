import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sanitizeInput } from '@/lib/validations';

export const dynamic = 'force-dynamic';

const memoryArticles: Array<{
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt?: string;
  content: string;
  imageUrl?: string;
  published: boolean;
  createdAt: string;
}> = [
  {
    id: 'art-1',
    title: 'Ny kafé åpner i Nedre Langgate',
    slug: 'ny-kafe-apner-i-nedre-langgate',
    category: 'Bylivet',
    excerpt: 'En ny koselig kaffebar åpner dørene i hjertet av Tønsberg sentrum.',
    content: 'Tønsberg sentrum utvides med et fantastisk nytt tilskudd i Nedre Langgate...',
    published: true,
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: articles });
  } catch (e) {
    return NextResponse.json({ success: true, data: memoryArticles });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, excerpt, content, imageUrl, published } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'Tittel og innhold er påkrevd' }, { status: 400 });
    }

    const cleanTitle = sanitizeInput(title);
    const cleanExcerpt = excerpt ? sanitizeInput(excerpt) : undefined;
    const slug = cleanTitle
      .toLowerCase()
      .replace(/æ/g, 'ae')
      .replace(/ø/g, 'o')
      .replace(/å/g, 'a')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    try {
      const article = await prisma.article.create({
        data: {
          title: cleanTitle,
          slug: `${slug}-${Date.now().toString().slice(-4)}`,
          category: (category as any) || 'BYLIVET',
          excerpt: cleanExcerpt,
          content,
          published: published ?? true,
        },
      });
      return NextResponse.json({ success: true, data: article }, { status: 201 });
    } catch (e) {
      const newArticle = {
        id: `art-${Date.now()}`,
        title: cleanTitle,
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        category: category || 'Bylivet',
        excerpt: cleanExcerpt,
        content,
        imageUrl,
        published: published ?? true,
        createdAt: new Date().toISOString(),
      };
      memoryArticles.unshift(newArticle);
      return NextResponse.json({ success: true, data: newArticle }, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Feil ved publisering av artikkel' }, { status: 500 });
  }
}
