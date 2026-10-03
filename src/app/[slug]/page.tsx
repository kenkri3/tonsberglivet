import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Building2 } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { toParagraphs } from '@/lib/news-meta';

// Innholdet kommer fra CMS-et (Page-tabellen) og skal være ferskt ved hvert kall.
export const dynamic = 'force-dynamic';

const SITE_URL = 'https://tonsberglivet.no';
const DB_TIMEOUT_MS = 2500;

interface CmsPageRow {
  title: string;
  slug: string;
  content: string;
}

/**
 * Slår opp en publisert side i CMS-et. Databasen skal aldri velte en side:
 * svarer den ikke, behandler vi siden som ukjent (404) i stedet for å krasje.
 */
async function getPage(slug: string): Promise<CmsPageRow | null> {
  const query = prisma.page.findFirst({
    where: { slug, published: true },
    select: { title: true, slug: true, content: true },
  });
  void query.catch(() => {});

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<null>((resolve) => {
      timer = setTimeout(() => resolve(null), DB_TIMEOUT_MS);
    });
    const row = await Promise.race([query, timeout]);
    return (row as CmsPageRow | null) ?? null;
  } catch (error) {
    console.warn(`[sider] Kunne ikke hente «${slug}»:`, (error as Error).message);
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function firstParagraph(content: string): string {
  const [first] = toParagraphs(content);
  return (first ?? '').slice(0, 300);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(decodeURIComponent(slug));

  if (!page) {
    return {
      title: 'Siden finnes ikke | Tønsberglivet',
      robots: { index: false, follow: true },
    };
  }

  const description = firstParagraph(page.content).slice(0, 160);
  return {
    title: `${page.title} | Tønsberglivet`,
    description: description || undefined,
    alternates: { canonical: `${SITE_URL}/${page.slug}` },
    openGraph: {
      title: page.title,
      description: description || undefined,
      url: `${SITE_URL}/${page.slug}`,
      siteName: 'Tønsberglivet',
      locale: 'nb_NO',
      type: 'article',
    },
  };
}

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(decodeURIComponent(slug));

  if (!page) {
    notFound();
  }

  const paragraphs = toParagraphs(page.content);
  const [lead, ...body] = paragraphs;

  return (
    <main className="min-h-screen pb-20">
      <section
        className="relative overflow-hidden py-20 md:py-28"
        style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)' }}
      >
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs font-bold uppercase tracking-wider text-white/80">
            <Building2 className="w-3.5 h-3.5" /> Tønsberglivet
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {page.title}
          </h1>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-foreground-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Tilbake til forsiden
        </Link>

        <article className="bg-surface border border-border rounded-3xl p-6 sm:p-10 md:p-12 space-y-6 shadow-xs">
          {lead ? (
            <p className="text-base sm:text-lg md:text-xl font-medium text-foreground leading-relaxed">
              {lead}
            </p>
          ) : null}

          {body.length > 0 ? (
            <div className="space-y-5 text-foreground/90 text-sm sm:text-base md:text-lg leading-relaxed">
              {body.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          ) : null}
        </article>
      </div>
    </main>
  );
}
