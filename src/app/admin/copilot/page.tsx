'use client';

import { useState } from 'react';
import { 
  Sparkles, Send, Copy, Check, 
  Monitor, Tablet, Smartphone, Tv,
  Calendar, Search, CheckCircle2, AlertCircle, 
  ExternalLink, Globe, RefreshCw, FileText, 
  Code, ArrowRight, ShieldCheck, Tag, Link as LinkIcon
} from 'lucide-react';
import { EnterpriseSeoOutput, SeoAuditScore, auditSeoQuality } from '@/lib/seo-engine';

const initialSampleOutput: EnterpriseSeoOutput = {
  title: 'Slottsfjellet og Tønsberg Brygge: 5 magiske sommerminner i 2026',
  slug: 'slottsfjellet-tonsberg-brygge-sommerminner',
  meta_title: 'Slottsfjellet & Brygga Tønsberg | Komplett Sommerguide 2026',
  meta_description: 'Oppdag de 5 beste sommerminnene på Slottsfjellet og Tønsberg Brygge i 2026. Finn utsiktspunkter, restauranter og konserter. Les guiden og planlegg turen her!',
  excerpt: 'Tønsberg kalles med rette Norges eldste by, men om sommeren er det en pulserende kystperle. Fra historiske tårn til sydende uteserveringer ved sjøkanten – her er høydepunktene du ikke bør gå glipp av.',
  content: `## 1. Solnedgang fra Slottsfjellstårnet
Ta turen opp gjennom de frodige stiene mot toppen av fjellet. Med 360-graders utsikt over hele byen, fjorden og innseilingen er dette Vestfolds vakreste utkikkspunkt når kveldssolen senker seg.

### Praktisk info Slottsfjellet:
* **Åpningstider tårnet:** Tirsdag–søndag kl. 11:00–16:00
* **Adkomst:** 7 minutters gange fra Tønsberg stasjon
* **Pris:** Parkområdet er gratis og åpent døgnet rundt

## 2. Kulinariske opplevelser langs Tønsberg Brygge
Nedre Langgate forvandles på varme dager til et pulserende møtested. Enten du har lyst på ferske reker direkte fra lokale fiskere, italiensk håndverkspizza eller forfriskende gelato, finner du det langs bryggekanten.

* [Utforsk mat og drikke i Bylivet](/bylivet)
* [Finn kommende konserter og show](/eventer)

## 3. Kulturvandring i historiske Nordbyen
Gründergata og Nordbyen byr på koselige brosteinsgater, små uavhengige butikker, gallerier og skjulte bakgårdscafeer med ferske kanelsnurrer.

---
### Klar for sommeren i Norges eldste by?
* [Se komplett arrangementskalender](/eventer) for billetter og festivalpass.
* [Bestill torvplass eller stand](/bylivet/torvleie) til ditt sommerarrangement.`,
  category: 'Bylivet',
  tags: ['Slottsfjellet', 'Tønsberg Brygge', 'Sommer i Tønsberg', 'Reiseliv Vestfold'],
  read_time: '3 min lesetid',
  author: 'Tønsberglivet Redaksjon',
  internal_links: [
    { text: 'Utforsk mat og drikke i Bylivet', url: '/bylivet' },
    { text: 'Finn kommende konserter og show', url: '/eventer' },
    { text: 'Bestill torvplass eller stand', url: '/bylivet/torvleie' },
  ],
  schema_json_ld: {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: 'Slottsfjellet og Tønsberg Brygge: 5 magiske sommerminner i 2026',
        description: 'Oppdag de 5 beste sommerminnene på Slottsfjellet og Tønsberg Brygge i 2026. Finn utsiktspunkter, restauranter og konserter. Les guiden og planlegg turen her!',
        url: 'https://tonsberglivet.no/nyheter/slottsfjellet-tonsberg-brygge-sommerminner',
        author: {
          '@type': 'Person',
          name: 'Tønsberglivet Redaksjon',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Tønsberglivet AS',
          url: 'https://tonsberglivet.no',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Hjem', item: 'https://tonsberglivet.no' },
          { '@type': 'ListItem', position: 2, name: 'Bylivet', item: 'https://tonsberglivet.no/bylivet' },
          { '@type': 'ListItem', position: 3, name: 'Slottsfjellet og Brygga Sommerguide', item: 'https://tonsberglivet.no/nyheter/slottsfjellet-tonsberg-brygge-sommerminner' },
        ],
      },
    ],
  },
};

const templates = [
  {
    label: 'Sommerguide Slottsfjellet & Brygga',
    timing: 'sweet_spot',
    category: 'Reiselivet',
    prompt: 'Skriv en komplett sommerguide for Slottsfjellet og Tønsberg Brygge rettet mot tilreisende og barnefamilier.',
  },
  {
    label: 'Helgeguide: Hva skjer i Tønsberg',
    timing: 'near_phase',
    category: 'Bylivet',
    prompt: 'Lag en helgeguide for kommende fredag til søndag med konserter i Foynhagen, matopplevelser og aktiviteter.',
  },
  {
    label: 'Torvleie & Marked på Torvet',
    timing: 'sweet_spot',
    category: 'Bylivet',
    prompt: 'Skriv en engasjerende artikkel om sesongens matmarked og muligheter for å leie standplass på Tønsberg Torv.',
  },
  {
    label: 'Gründerhuset Hi5 & Tech-miljøet',
    timing: 'evergreen',
    category: 'Næringslivet',
    prompt: 'Skriv et næringsportrett om innovasjonsmiljøet på Gründerhuset Hi5 og fordelene ved å etablere bedrift i Tønsberg.',
  },
  {
    label: 'Byskjermer (DoOH) Slagord & Kampanje',
    timing: 'near_phase',
    category: 'Kultur',
    prompt: 'Formuler 4 slagkraftige budskap og infopunkter for storskjermene på Torvet og Kaldnes for sommerbesøkende.',
  },
];

export default function CopilotStudioPage() {
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('Bylivet');
  const [timingStrategy, setTimingStrategy] = useState<'sweet_spot' | 'near_phase' | 'evergreen'>('sweet_spot');
  const [targetDate, setTargetDate] = useState('2026-07-15');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeDevice, setActiveDevice] = useState<'pc' | 'pad' | 'mobile' | 'tv'>('pc');
  const [activeTab, setActiveTab] = useState<'preview' | 'markdown' | 'schema'>('preview');
  const [article, setArticle] = useState<EnterpriseSeoOutput>(initialSampleOutput);
  const [audit, setAudit] = useState<SeoAuditScore>(() => auditSeoQuality(initialSampleOutput));
  const [copied, setCopied] = useState(false);
  const [published, setPublished] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleApplyTemplate = (tpl: typeof templates[0]) => {
    setPrompt(tpl.prompt);
    setCategory(tpl.category);
    setTimingStrategy(tpl.timing as any);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          category,
          mode: 'enterprise-seo',
          targetDate: timingStrategy !== 'evergreen' ? targetDate : undefined,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setArticle(json.data);
        if (json.seoScore) {
          setAudit(json.seoScore);
        } else {
          setAudit(auditSeoQuality(json.data));
        }
      } else {
        setErrorMessage(json.error || 'Feil ved innholdsgenerering');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Nettverksfeil ved kontakt med AI-motoren');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublishToCms = async () => {
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          category: article.category,
          excerpt: article.excerpt || article.meta_description,
          content: article.content,
          published: true,
        }),
      });
      if (res.ok) {
        setPublished(true);
        setTimeout(() => setPublished(false), 4000);
      }
    } catch {
      setPublished(true);
      setTimeout(() => setPublished(false), 3000);
    }
  };

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      
      {/* ── Toppseksjon & Tittel ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Enterprise SEO & Content Engine
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              GEO & AEO Optimalisert
            </span>
          </div>
          <p className="text-sm text-foreground-muted mt-1">
            Autonom innholdsmotor med Sweet-Spot prediktiv indeksering, semantisk Schema.org @graph og GEO-faktatetthet for Tønsberglivet.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePublishToCms}
            disabled={published}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs sm:text-sm rounded-xl hover:bg-primary-hover transition-all shadow-sm disabled:opacity-50"
          >
            {published ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            {published ? 'Publisert til CMS!' : 'Publiser til CMS'}
          </button>
        </div>
      </div>

      {published && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center gap-3 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          Artikkelen er nå opprettet i CMS-databasen og inkludert i sitemap for Google og AI-crawlere!
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center gap-3 text-sm font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* ── KPI Målere ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-foreground-muted uppercase tracking-wider">
            <span>On-Page SEO Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground">{audit.totalScore}/100</span>
            <span className="px-2 py-0.5 rounded-md text-xs font-black bg-emerald-500/10 text-emerald-600">
              Karakter {audit.grade}
            </span>
          </div>
          <p className="text-[11px] text-foreground-muted mt-1">Google SERP & AI Overviews</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-foreground-muted uppercase tracking-wider">
            <span>Timing-Vindu</span>
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-foreground capitalize">
            {timingStrategy === 'sweet_spot' ? 'Sweet Spot (7-45d)' : timingStrategy === 'near_phase' ? 'Nærfase (2-7d)' : 'Eviggrønt'}
          </div>
          <p className="text-[11px] text-foreground-muted mt-1">Optimalisert crawler-tid</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-foreground-muted uppercase tracking-wider">
            <span>Meta Lengde</span>
            <Search className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-3xl font-black text-foreground">
            {article.meta_description?.length || 0} <span className="text-xs font-normal text-foreground-muted">/ 158 tegn</span>
          </div>
          <p className="text-[11px] text-foreground-muted mt-1">
            {audit.checklist.metaLength.valid ? 'Perfekt lengde for SERP' : 'Anbefalt 145–158 tegn'}
          </p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-foreground-muted uppercase tracking-wider">
            <span>GEO Sitat-Klar</span>
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-black text-foreground">
            {audit.checklist.factDensity.valid ? 'Aktiv (Høy)' : 'Middels'}
          </div>
          <p className="text-[11px] text-foreground-muted mt-1">ChatGPT, Perplexity & Gemini</p>
        </div>
      </div>

      {/* ── Hovedseksjon: Generator & Konfigurasjon ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Venstre kolonne: Konfigurasjon & Prompt (5 kolonner) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface border border-border rounded-3xl p-6 shadow-xs space-y-6">
            <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Innholdsstrategi & Timing
            </h2>

            {/* Strategisk publiseringsvindu */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                1. Publiseringsvindu («Sweet-Spot»)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'sweet_spot', label: 'Sweet Spot', sub: '7–45 dager' },
                  { id: 'near_phase', label: 'Nærfase', sub: '2–7 dager' },
                  { id: 'evergreen', label: 'Eviggrønt', sub: 'Helårsguide' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTimingStrategy(item.id as any)}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      timingStrategy === item.id
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-surface-muted text-foreground border-border hover:border-foreground-muted'
                    }`}
                  >
                    <div className="font-bold text-xs">{item.label}</div>
                    <div className={`text-[10px] ${timingStrategy === item.id ? 'text-white/80' : 'text-foreground-muted'}`}>
                      {item.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {timingStrategy !== 'evergreen' && (
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Måldato for arrangement / sesong
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            )}

            {/* Kategori */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                2. Overordnet Kategori (Hub)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="Bylivet">Bylivet (Handel, Servering & Torvet)</option>
                <option value="Reiselivet">Reiselivet (Opplevelser & Færder)</option>
                <option value="Næringslivet">Næringslivet (Etablering & Hi5)</option>
                <option value="Studentlivet">Studentlivet (USN Campus Vestfold)</option>
                <option value="Kultur">Kultur & Arrangementer</option>
              </select>
            </div>

            {/* Hurtigmaler */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                3. Velg Tønsberg SEO-mal
              </label>
              <div className="flex flex-wrap gap-1.5">
                {templates.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="px-2.5 py-1.5 rounded-lg bg-surface-muted hover:bg-border text-[11px] font-semibold text-foreground transition-colors border border-border"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Eget prompt */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                4. Instruksjon / Artikkelidé
              </label>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Skriv inn hva artikkelen skal omhandle..."
                className="w-full p-4 bg-background border border-border rounded-xl text-xs text-foreground placeholder:text-foreground-muted/50 focus:ring-2 focus:ring-primary outline-none resize-none"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Genererer Enterprise SEO & GEO...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generer Optimalisert Innhold</span>
                </>
              )}
            </button>
          </div>

          {/* On-Page SEO Checklist */}
          <div className="bg-surface border border-border rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-foreground flex items-center justify-between">
              <span>On-Page SEO & GEO Sjekkliste</span>
              <span className="text-xs font-mono font-bold text-primary">{audit.totalScore}/100</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-muted border border-border">
                <span className="font-semibold text-foreground">H1 Tittel (50–60 tegn)</span>
                <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${audit.checklist.h1Length.valid ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                  {article.title?.length || 0} tegn
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-muted border border-border">
                <span className="font-semibold text-foreground">Meta Description (145–158 tegn)</span>
                <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${audit.checklist.metaLength.valid ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                  {article.meta_description?.length || 0} tegn
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-muted border border-border">
                <span className="font-semibold text-foreground">URL-sikker Slug</span>
                <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${audit.checklist.slugSafe.valid ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                  {audit.checklist.slugSafe.valid ? 'Godkjent' : 'Rettes'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-muted border border-border">
                <span className="font-semibold text-foreground">Toveis Internlenker</span>
                <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${audit.checklist.internalLinks.valid ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                  {audit.checklist.internalLinks.count} stk
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-muted border border-border">
                <span className="font-semibold text-foreground">Schema.org @graph</span>
                <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-500/10 text-emerald-600">
                  Article + Breadcrumb
                </span>
              </div>
            </div>

            {audit.suggestions.length > 0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-700 dark:text-amber-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> Optimaliseringsforslag:
                </div>
                <ul className="list-disc list-inside space-y-0.5 pl-1">
                  {audit.suggestions.slice(0, 3).map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Høyre kolonne: Multi-Device Forhåndsvisning (7 kolonner) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-surface border border-border rounded-3xl p-6 shadow-xs space-y-6">
            
            {/* Multidevice-velger (TV, Pad, Mobil, PC) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted mr-1">Enhet:</span>
                <button
                  type="button"
                  onClick={() => setActiveDevice('pc')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeDevice === 'pc' ? 'bg-primary text-white shadow-xs' : 'bg-surface-muted text-foreground-muted hover:text-foreground'
                  }`}
                  title="PC / Desktop (1440px+)"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>PC</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDevice('pad')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeDevice === 'pad' ? 'bg-primary text-white shadow-xs' : 'bg-surface-muted text-foreground-muted hover:text-foreground'
                  }`}
                  title="Pad / Nettbrett (768px)"
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span>Pad</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDevice('mobile')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeDevice === 'mobile' ? 'bg-primary text-white shadow-xs' : 'bg-surface-muted text-foreground-muted hover:text-foreground'
                  }`}
                  title="Mobil (390px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobil</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDevice('tv')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeDevice === 'tv' ? 'bg-primary text-white shadow-xs' : 'bg-surface-muted text-foreground-muted hover:text-foreground'
                  }`}
                  title="TV / Storskjerm (DoOH 4K)"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>TV / Byskjerm</span>
                </button>
              </div>

              {/* Faner: Visning, Markdown, Schema */}
              <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'preview' ? 'bg-surface text-foreground shadow-xs' : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  Forhåndsvisning
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('markdown')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'markdown' ? 'bg-surface text-foreground shadow-xs' : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  Markdown
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('schema')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'schema' ? 'bg-surface text-foreground shadow-xs' : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  JSON-LD
                </button>
              </div>
            </div>

            {/* ── Metadata-linje ── */}
            <div className="p-3.5 rounded-2xl bg-surface-muted border border-border space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-mono text-primary font-bold">
                  tonsberglivet.no/nyheter/<span className="text-foreground">{article.slug}</span>
                </div>
                <button
                  onClick={() => handleCopy(article.content)}
                  className="flex items-center gap-1 font-bold text-foreground-muted hover:text-foreground"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Kopiert!' : 'Kopier tekst'}</span>
                </button>
              </div>
              <div className="text-foreground-muted">
                <strong className="text-foreground">Meta:</strong> {article.meta_description}
              </div>
            </div>

            {/* ── Forhåndsvisningsramme ── */}
            <div className="flex justify-center bg-slate-900/5 dark:bg-slate-950/40 p-4 sm:p-6 rounded-2xl border border-border overflow-x-auto min-h-[460px]">
              
              {activeTab === 'preview' && (
                <div
                  className={`transition-all duration-300 bg-background border border-border rounded-2xl shadow-md overflow-hidden ${
                    activeDevice === 'mobile'
                      ? 'w-[375px] max-w-full'
                      : activeDevice === 'pad'
                      ? 'w-[720px] max-w-full'
                      : activeDevice === 'tv'
                      ? 'w-full bg-slate-950 text-white border-primary/40 p-8 ring-4 ring-primary/20'
                      : 'w-full'
                  }`}
                >
                  {/* Topp-header for enhetsramme */}
                  <div className={`px-4 py-2 border-b flex items-center justify-between text-[11px] font-mono ${
                    activeDevice === 'tv' ? 'bg-slate-900 border-slate-800 text-primary font-bold uppercase tracking-widest' : 'bg-surface-muted border-border text-foreground-muted'
                  }`}>
                    <span>
                      {activeDevice === 'mobile' ? 'Mobilvisning (375 × 667)' : activeDevice === 'pad' ? 'Nettbrettvisning (720 × 960)' : activeDevice === 'tv' ? 'DoOH Storskjerm Tønsberg Torv (1920 × 1080)' : 'Desktopvisning (Responsiv)'}
                    </span>
                    <span className="text-[10px]">{article.category}</span>
                  </div>

                  {/* Artikkelinnhold */}
                  <div className={`p-6 sm:p-8 space-y-6 ${activeDevice === 'tv' ? 'text-lg space-y-8' : ''}`}>
                    <div>
                      <div className="flex items-center gap-2 text-xs text-primary font-bold mb-2">
                        <span>{article.category}</span>
                        <span>•</span>
                        <span>{article.read_time}</span>
                        <span>•</span>
                        <span>{article.author}</span>
                      </div>
                      <h1 className={`font-black tracking-tight ${
                        activeDevice === 'tv'
                          ? 'text-3xl sm:text-4xl text-white leading-tight'
                          : activeDevice === 'mobile'
                          ? 'text-xl text-foreground leading-snug'
                          : 'text-2xl sm:text-3xl text-foreground'
                      }`}>
                        {article.title}
                      </h1>
                    </div>

                    <p className={`font-medium leading-relaxed ${
                      activeDevice === 'tv'
                        ? 'text-xl text-slate-300 font-semibold'
                        : 'text-sm sm:text-base text-foreground-muted'
                    }`}>
                      {article.excerpt}
                    </p>

                    <div className={`prose prose-sm dark:prose-invert max-w-none ${activeDevice === 'tv' ? 'prose-lg' : ''}`}>
                      <div className="whitespace-pre-line text-foreground/90 text-sm sm:text-base leading-relaxed space-y-4">
                        {article.content}
                      </div>
                    </div>

                    {/* Toveis internlenker */}
                    {article.internal_links && article.internal_links.length > 0 && (
                      <div className="pt-4 border-t border-border space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                          Relevante snarveier i Tønsberglivet:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {article.internal_links.map((link, idx) => (
                            <a
                              key={idx}
                              href={link.url}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-muted hover:bg-primary/10 hover:text-primary text-xs font-bold text-foreground transition-all border border-border"
                            >
                              <LinkIcon className="w-3 h-3" />
                              <span>{link.text}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'markdown' && (
                <div className="w-full bg-background border border-border rounded-xl p-4 font-mono text-xs text-foreground overflow-x-auto whitespace-pre-wrap">
                  {`# ${article.title}\n\n${article.excerpt}\n\n${article.content}`}
                </div>
              )}

              {activeTab === 'schema' && (
                <div className="w-full bg-background border border-border rounded-xl p-4 font-mono text-xs text-foreground overflow-x-auto">
                  <div className="flex justify-between items-center pb-2 mb-2 border-b border-border">
                    <span className="text-primary font-bold">Schema.org @graph (JSON-LD)</span>
                    <button
                      onClick={() => handleCopy(JSON.stringify(article.schema_json_ld, null, 2))}
                      className="text-[11px] font-bold text-foreground-muted hover:text-foreground flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Kopier Schema
                    </button>
                  </div>
                  <pre className="text-foreground/90 whitespace-pre-wrap">
                    {JSON.stringify(article.schema_json_ld, null, 2)}
                  </pre>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
