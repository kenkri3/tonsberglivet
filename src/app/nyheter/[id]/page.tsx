import { Metadata } from 'next';
import Image from 'next/image';
import { HeroSection } from '@/components/ui/HeroSection';
import { Calendar, User, ArrowLeft, Compass, Ticket, BookOpen, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleJsonLd } from '@/components/seo/JsonLd';
import { ShareButton } from '@/components/ui/ShareButton';
import { findNewsArticle } from '@/lib/news-server';
import type { NewsBlock } from '@/lib/news';

const SITE_URL = 'https://tonsberglivet.no';
// Filen heter -fo.jpg, ikke -ga.jpg. Feilstavingen gjorde at reservebildet for
// deling på sosiale medier pekte på en fil som ikke finnes, så en sak uten eget
// bilde delte seg uten forhåndsvisning.
const FALLBACK_OG_IMAGE = '/images/tonsberg/nyheter-siste-nytt-fra-tonsberg-fo.jpg';

// Saken hentes fra databasen (CMS) eller det redaksjonelle arkivet ved hvert
// kall, slik at en nypublisert sak er tilgjengelig med én gang.
export const dynamic = 'force-dynamic';

function articleUrl(slug: string): string {
  return `${SITE_URL}/nyheter/${slug}`;
}

function absoluteImageUrl(imageUrl: string | undefined): string {
  const path = imageUrl || FALLBACK_OG_IMAGE;
  return path.startsWith('http') ? path : `${SITE_URL}${path}`;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const article = await findNewsArticle(id);

  if (!article) {
    // Siden svarer 404 selv om metadata må returneres – lån aldri en annen sak sin tittel.
    return {
      title: 'Saken finnes ikke | Tønsberglivet',
      description: 'Denne nyhetssaken finnes ikke. Se alle siste nyheter fra Tønsberg på Tønsberglivet.',
      robots: { index: false, follow: true },
    };
  }

  const url = articleUrl(article.slug);
  const image = absoluteImageUrl(article.imageUrl);

  return {
    title: `${article.title} | Tønsberglivet`,
    description: article.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url,
      siteName: 'Tønsberglivet',
      locale: 'nb_NO',
      type: 'article',
      publishedTime: article.publishedAt,
      images: [{ url: image, alt: article.imageAlt || article.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [image],
    },
  };
}

/**
 * Rendrer sakens innhold slik det står i kilden: mellomtitler, avsnitt, sitater,
 * punktlister, bilder og CTA-lenker.
 */
function ArticleBody({ blocks, excerpt }: { blocks: NewsBlock[]; excerpt: string }) {
  const lead = excerpt.trim();
  let skippedDuplicateLead = false;

  return (
    <div className="space-y-6 text-foreground/90 text-sm sm:text-base md:text-lg leading-relaxed">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading':
            return (
              <h2
                key={index}
                className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight pt-3"
              >
                {block.text}
              </h2>
            );

          case 'quote':
            return (
              <blockquote
                key={index}
                className="border-l-4 border-primary/40 pl-4 sm:pl-6 italic text-foreground/85"
              >
                {block.text}
              </blockquote>
            );

          case 'list':
            return (
              <ul key={index} className="list-disc pl-5 sm:pl-6 space-y-2">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            );

          case 'image':
            if (!block.width || !block.height) return null;
            return (
              <figure key={index} className="space-y-2 py-2">
                <Image
                  src={block.src}
                  alt={block.alt || ''}
                  width={block.width}
                  height={block.height}
                  sizes="(max-width: 1024px) 100vw, 768px"
                  className="w-full h-auto rounded-2xl border border-border"
                />
                {block.alt ? (
                  <figcaption className="text-xs text-foreground-muted">{block.alt}</figcaption>
                ) : null}
              </figure>
            );

          case 'link':
            return (
              <p key={index} className="pt-1">
                <a
                  href={block.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl transition-colors"
                >
                  {block.text}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </p>
            );

          default: {
            // Ingressen vises rett over brødteksten. Noen saker har samme tekst i
            // ingress og første avsnitt – da viser vi den bare én gang.
            if (!skippedDuplicateLead && block.text.trim() === lead) {
              skippedDuplicateLead = true;
              return null;
            }
            return (
              <p key={index} className="leading-relaxed">
                {block.text}
              </p>
            );
          }
        }
      })}
    </div>
  );
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await findNewsArticle(id);

  // Ukjent sak skal gi 404. Tidligere falt denne siden tilbake til sak «1»,
  // og da endte alle ukjente lenker på samme kafésak.
  if (!article) {
    notFound();
  }

  const url = articleUrl(article.slug);

  return (
    <main className="min-h-screen pb-20">
      {/* Schema.org @graph JSON-LD */}
      <ArticleJsonLd
        title={article.title}
        description={article.excerpt}
        url={url}
        datePublished={article.publishedAt}
        authorName={article.author}
        category={article.categoryLabel}
        imageUrl={absoluteImageUrl(article.imageUrl)}
      />

      <HeroSection
        compact={true}
        title={article.title}
        subtitle={`${article.categoryLabel} • ${article.date}`}
        description={article.excerpt}
        backgroundGradient="linear-gradient(135deg, #1E293B 0%, #0F172A 100%)"
        backgroundImage={article.imageUrl}
        imageAlt={article.imageAlt || article.title}
        priority
      />

      {/* Responsiv container tilpasset Mobil, Pad, PC og TV */}
      <div className="max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Link
          href="/nyheter"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-foreground-muted hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Tilbake til alle artikler
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Hovedartikkel (8 kolonner på PC/TV) */}
          <article className="lg:col-span-8 bg-surface border border-border p-6 sm:p-10 md:p-12 rounded-3xl space-y-8 shadow-xs">
            
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6 text-xs sm:text-sm">
              <div className="flex flex-wrap items-center gap-4 text-foreground-muted">
                <span className="flex items-center gap-1.5 font-bold text-foreground">
                  <User className="w-4 h-4 text-primary" /> {article.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" /> {article.date}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-muted text-foreground-muted text-xs font-mono">
                  {article.readTime}
                </span>
              </div>
              <span className="px-3 py-1 text-xs font-extrabold bg-primary/10 text-primary border border-primary/20 rounded-full">
                {article.categoryLabel}
              </span>
            </div>

            {/* Ingress (GEO fact summary) */}
            <p className="text-base sm:text-lg md:text-xl font-medium text-foreground leading-relaxed">
              {article.excerpt}
            </p>

            {/* Brødtekst */}
            <ArticleBody blocks={article.blocks} excerpt={article.excerpt} />

            {/* Tagger */}
            {article.tags.length > 0 && (
              <div className="pt-6 border-t border-border flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Tagger:</span>
                {article.tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-lg bg-surface-muted border border-border text-xs font-medium text-foreground">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Deling & toveis internlenker */}
            <div className="pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-foreground-muted font-medium">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>Publisert av Tønsberglivet forvaltning</span>
              </div>
              <ShareButton
                title={article.title}
                text={article.excerpt ?? undefined}
                className="inline-flex items-center gap-2 px-4 py-2 bg-surface-muted hover:bg-border text-foreground font-bold rounded-xl text-xs transition-colors border border-border"
              />
            </div>
          </article>

          {/* Høyre sidebar: toveis internlenker & CTA (4 kolonner på PC/TV) */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* CTA 1: Utforsk Tønsberglivet */}
            <div className="bg-surface border border-border rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 font-black text-foreground text-sm">
                <Compass className="w-4 h-4 text-primary" />
                <span>Utforsk Byrommene</span>
              </div>
              <p className="text-xs text-foreground-muted">
                Oppdag mer av det pulserende bylivet, skjærgården i Færder og etableringsmuligheter for næringslivet.
              </p>
              <div className="space-y-2">
                <Link
                  href="/bylivet"
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-muted hover:bg-primary/10 hover:text-primary transition-all text-xs font-bold text-foreground border border-border"
                >
                  <span>Bylivet & Handel</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/reiselivet"
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-muted hover:bg-primary/10 hover:text-primary transition-all text-xs font-bold text-foreground border border-border"
                >
                  <span>Reiselivet & Skjærgården</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/naeringslivet"
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-muted hover:bg-primary/10 hover:text-primary transition-all text-xs font-bold text-foreground border border-border"
                >
                  <span>Næringslivet & Hi5</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* CTA 2: Arrangementer & Torvleie */}
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-3xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 font-black text-foreground text-sm">
                <Ticket className="w-4 h-4 text-primary" />
                <span>Hva skjer i Tønsberg?</span>
              </div>
              <p className="text-xs text-foreground-muted">
                Hold deg oppdatert på konserter i Foynhagen, festivaler på Slottsfjellet og markeder på Torvet.
              </p>
              <Link
                href="/eventer"
                className="inline-flex items-center justify-center w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                Se arrangementskalender
              </Link>
            </div>

          </aside>

        </div>
      </div>
    </main>
  );
}
