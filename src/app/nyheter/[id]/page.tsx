import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { Calendar, User, ArrowLeft, Tag, Share2 } from 'lucide-react';
import Link from 'next/link';

const demoNewsMap: Record<string, {
  title: string;
  category: string;
  date: string;
  author: string;
  excerpt: string;
  content: string[];
}> = {
  '1': {
    title: 'Ny kafé åpner i Nedre Langgate med fokus på lokale råvarer',
    category: 'Bylivet',
    date: '12. august 2026',
    author: 'Redaksjonen',
    excerpt: 'Tønsberg sentrum utvides med et nytt spennende serveringssted. Eierne lover hjemmebakt brød, fersk kaffe og koselig bakgård.',
    content: [
      'Gledelige nyheter for alle kaffe- og matelskere i Tønsberg! Nå åpner dørene til en splitter ny kafé i historiske lokaler i Nedre Langgate.',
      'Bak konseptet står to lokale gründere som brenner for å skape nye møteplasser i bykjernen. Menyen vil variere etter sesongene, med spesiell vekt på kortreiste råvarer fra bønder i Vestfold og Færder.',
      '– Vi ønsker at dette skal være en uformell oase der folk kan senke skuldrene, enten de trenger en god lunsj eller vil ta med seg nybakt surdeigsbrød hjem, forteller gründerne.',
      'Åpningstidene blir fra 08:00 til 18:00 alle hverdager, og 09:00 til 17:00 i helgene. Velkommen innom!'
    ],
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
  },
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const news = demoNewsMap[id] || demoNewsMap['1'];
  return {
    title: `${news.title} | Tønsberglivet`,
    description: news.excerpt,
  };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const news = demoNewsMap[id] || demoNewsMap['1'];

  return (
    <main className="min-h-screen pb-20">
      <HeroSection
        compact={true}
        title={news.title}
        subtitle={`${news.category} • ${news.date}`}
        description={news.excerpt}
        backgroundGradient="linear-gradient(135deg, #1E293B 0%, #0F172A 100%)"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/nyheter"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Tilbake til nyhetsarkiv
        </Link>

        <article className="bg-surface border border-border p-8 md:p-12 rounded-3xl space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
            <div className="flex items-center gap-4 text-sm text-foreground-muted">
              <span className="flex items-center gap-1.5 font-medium">
                <User className="w-4 h-4 text-primary" /> {news.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" /> {news.date}
              </span>
            </div>
            <span className="px-3 py-1 text-xs font-semibold bg-primary-light text-primary rounded-full">
              {news.category}
            </span>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            {news.content.map((paragraph, index) => (
              <p key={index} className="text-foreground text-lg leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="pt-8 border-t border-border flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Del denne saken</span>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-surface-muted text-foreground font-medium rounded-xl text-sm hover:bg-border transition-colors">
              <Share2 className="w-4 h-4" /> Del artikkel
            </button>
          </div>
        </article>
      </div>
    </main>
  );
}
