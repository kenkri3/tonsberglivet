import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { Calendar, User, ArrowLeft, Share2, Compass, Ticket, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { ArticleJsonLd } from '@/components/seo/JsonLd';

const demoNewsMap: Record<string, {
  title: string;
  category: string;
  date: string;
  author: string;
  excerpt: string;
  content: string[];
  tags: string[];
  readTime: string;
}> = {
  '1': {
    title: 'Ny kafé åpner i Nedre Langgate med fokus på lokale råvarer',
    category: 'Bylivet',
    date: '12. august 2026',
    author: 'Tønsberglivet Redaksjon',
    excerpt: 'Tønsberg sentrum utvides med et nytt spennende serveringssted. Eierne lover hjemmebakt brød, fersk kaffe og koselig bakgård.',
    content: [
      'Gledelige nyheter for alle kaffe- og matelskere i Tønsberg! Nå åpner dørene til en splitter ny kafé i historiske lokaler i Nedre Langgate.',
      'Bak konseptet står to lokale gründere som brenner for å skape nye møteplasser i bykjernen. Menyen vil variere etter sesongene, med spesiell vekt på kortreiste råvarer fra bønder i Vestfold og Færder.',
      '– Vi ønsker at dette skal være en uformell oase der folk kan senke skuldrene, enten de trenger en god lunsj eller vil ta med seg nybakt surdeigsbrød hjem, forteller gründerne.',
      'Åpningstidene blir fra 08:00 til 18:00 alle hverdager, og 09:00 til 17:00 i helgene. Velkommen innom!'
    ],
    tags: ['Kafé', 'Nedre Langgate', 'Bylivet', 'Lokalmat'],
    readTime: '3 min lesetid',
  },
  '2': {
    title: 'Gründerhuset Hi5 feirer 5 år med rekordmange oppstartsbedrifter',
    category: 'Næringslivet',
    date: '10. august 2026',
    author: 'Tønsberglivet Næring',
    excerpt: 'Over 50 bedrifter har fått starthjelp gjennom miljøet på Hi5 siden oppstarten. Nå feires jubileet med åpen dag.',
    content: [
      'Gründerhuset Hi5 har etablert seg som en sentral drivkraft for nyskaping og næringsutvikling i Tønsbergregionen.',
      'Siden starten for fem år siden har klyngefellesskapet hjulpet frem alt fra teknologiselskaper til bærekraftige tjenesteleverandører.',
      '– Nøkkelen til suksessen er delingskulturen. Når gründere sitter sammen og utveksler erfaringer, akselererer veksten betydelig, sier daglig leder.',
      'I forbindelse med jubileet inviteres hele næringslivet og interesserte innbyggere til åpen dag med foredrag og nettverksbygging.'
    ],
    tags: ['Hi5', 'Næringsliv', 'Gründere', 'Innovasjon'],
    readTime: '4 min lesetid',
  },
  '3': {
    title: '10 fantastiske opplevelser i Færder i sommer',
    category: 'Reiselivet',
    date: '8. august 2026',
    author: 'Visit Tønsberg & Færder',
    excerpt: 'Fra Verdens Ende til skjulte perler i skjærgården. Her er guiden til de mest magiske sommeropplevelsene.',
    content: [
      'Færder nasjonalpark og kyststiene i Tønsbergregionen byr på noen av Norges vakreste natur- og sommeropplevelser.',
      'Her kan du kombinere svaberg og skjærgårdsliv med rike kulturminner, historiske Slottsfjellet og ylende bryggeliv.',
      'Enten du ønsker ro og kajakkpadling eller livlige konsertkvelder i Foynhagen, har Tønsberg alt du ser etter.',
      'Se hele listen over anbefalte turer og aktiviteter i vår reiselivsportal!'
    ],
    tags: ['Færder', 'Sommer', 'Skjærgård', 'Verdens Ende'],
    readTime: '5 min lesetid',
  },
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const news = demoNewsMap[id] || demoNewsMap['1'];
  return {
    title: `${news.title} | Tønsberglivet`,
    description: news.excerpt,
    openGraph: {
      title: news.title,
      description: news.excerpt,
      url: `https://tonsberglivet.no/nyheter/${id}`,
      siteName: 'Tønsberglivet',
      locale: 'nb_NO',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: news.title,
      description: news.excerpt,
    },
  };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const news = demoNewsMap[id] || demoNewsMap['1'];
  const articleUrl = `https://tonsberglivet.no/nyheter/${id}`;

  return (
    <main className="min-h-screen pb-20">
      {/* Schema.org @graph JSON-LD */}
      <ArticleJsonLd
        title={news.title}
        description={news.excerpt}
        url={articleUrl}
        datePublished="2026-08-12T08:00:00Z"
        authorName={news.author}
        category={news.category}
        imageUrl="https://tonsberglivet.no/images/hero.jpg"
      />

      <HeroSection
        compact={true}
        title={news.title}
        subtitle={`${news.category} • ${news.date}`}
        description={news.excerpt}
        backgroundGradient="linear-gradient(135deg, #1E293B 0%, #0F172A 100%)"
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
                  <User className="w-4 h-4 text-primary" /> {news.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" /> {news.date}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-muted text-foreground-muted text-xs font-mono">
                  {news.readTime}
                </span>
              </div>
              <span className="px-3 py-1 text-xs font-extrabold bg-primary/10 text-primary border border-primary/20 rounded-full">
                {news.category}
              </span>
            </div>

            {/* Ingress (GEO fact summary) */}
            <p className="text-base sm:text-lg md:text-xl font-medium text-foreground leading-relaxed">
              {news.excerpt}
            </p>

            {/* Brødtekst */}
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-foreground/90 text-sm sm:text-base md:text-lg leading-relaxed">
              {news.content.map((paragraph, index) => (
                <p key={index} className="leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Tagger */}
            <div className="pt-6 border-t border-border flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Tagger:</span>
              {news.tags.map((tag, idx) => (
                <span key={idx} className="px-3 py-1 rounded-lg bg-surface-muted border border-border text-xs font-medium text-foreground">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Deling & Toveis internlenker */}
            <div className="pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-foreground-muted font-medium">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>Publisert av Tønsberglivet forvaltning</span>
              </div>
              <button 
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 bg-surface-muted hover:bg-border text-foreground font-bold rounded-xl text-xs transition-colors border border-border"
              >
                <Share2 className="w-4 h-4" /> Del denne saken
              </button>
            </div>
          </article>

          {/* Høyre sidebar: Toveis internlenker & CTA (4 kolonner på PC/TV) */}
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
