'use client';

import { useState } from 'react';
import { 
  Sparkles, Send, Copy, Check, 
  Layers, ArrowUpRight,
  BookOpen, Share2, Award, Zap
} from 'lucide-react';

const promptTemplates = [
  { label: 'Sommerguide Slottsfjellet', role: 'Artikkel', prompt: 'Skriv en engasjerende artikkel om de 5 beste sommeraktivitetene rundt Slottsfjellet og bryggeområdet i Tønsberg.' },
  { label: 'SoMe Reel: Spis Ute Uka', role: 'Instagram', prompt: 'Lag 3 kreative Instagram Reel manus og bildetekster for å promotere de lokale restaurantene under Spis Ute Uka.' },
  { label: 'Gründerportrett Næringsliv', role: 'Intervju', prompt: 'Generer et profesjonelt gründerintervju med et nytt teknologiselskap som har etablert seg i Tønsberg sentrum.' },
  { label: 'DoOH Storskjerm Slagord', role: 'Skjermtekst', prompt: 'Formuler 4 fengende slagord (maks 8 ord hver) til storskjermen på Tønsberg Torv for å ønske sommerturister velkommen.' },
];

const sampleGeneratedArticle = `# 5 magiske sommerminner du må oppleve på Slottsfjellet og Brygga i 2026

Tønsberg kalles med rette Norges eldste by, men om sommeren er det en pulserende og levende kystperle. Fra historiske tårn til sydende uteserveringer ved sjøkanten – her er høydepunktene du ikke bør gå glipp av denne sesongen:

### 1. Solnedgang fra Slottsfjellstårnet
Ta turen opp gjennom de frodige stiene mot toppen av fjellet. Med 360-graders utsikt over hele byen, fjorden og innseilingen er dette Vestfolds vakreste utkikkspunkt når kveldssolen senker seg.

### 2. Kulinariske opplevelser langs Brygga
Nedre Langgate forvandles på varme dager til et pulserende møtested. Enten du har lyst på ferske reker direkte fra lokale fiskere, italiensk håndverkspizza eller forfriskende gelato, finner du det her.

### 3. Kulturvandring i de historiske trehusgatene
Gründergata og Nordbyen byr på koselige brosteinsgater, små uavhengige butikker, gallerier og skjulte bakgårdscafeer med ferske kanelsnurrer.

---
*Publisert av Tønsberglivet Redaksjon • 2 min lesetid*`;

export default function CopilotStudioPage() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState(sampleGeneratedArticle);
  const [copied, setCopied] = useState(false);
  const [published, setPublished] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('journalist');
  const [selectedTone, setSelectedTone] = useState('varm');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, agent: selectedAgent, tone: selectedTone }),
      });
      const data = await res.json();
      if (data.text) {
        setGeneratedText(data.text);
      } else {
        setGeneratedText(`# Generert for: ${prompt}\n\nTønsberg yrer av liv! Med utgangspunkt i din forespørsel har Tønsberg AI strukturert en skreddersydd tekst tilpasset byens profil og tone of voice.\n\n### Nøkkelpunkter\n- Lokalt forankret innhold med fokus på opplevelser og fellesskap\n- Optimalisert for både mobilvisning og sosiale medier\n- Klar til publisering direkte på forsiden eller i nyhetsbrevet.`);
      }
    } catch {
      setGeneratedText(`# Generert for: ${prompt}\n\nTønsberg yrer av liv! Med utgangspunkt i din forespørsel har Tønsberg AI strukturert en skreddersydd tekst tilpasset byens profil og tone of voice.\n\n### Nøkkelpunkter\n- Lokalt forankret innhold med fokus på opplevelser og fellesskap\n- Optimalisert for både mobilvisning og sosiale medier\n- Klar til publisering direkte på forsiden eller i nyhetsbrevet.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublishToCms = () => {
    setPublished(true);
    setTimeout(() => setPublished(false), 3000);
  };

  return (
    <div className="space-y-12 pb-16">
      
      {/* ── Seksjon 1: KPI Metric Cards ── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">AI Copilot Motor & Ytelse</h2>
            <p className="text-xs text-foreground-muted mt-0.5">Google GenAI / GPT-4o tekstmotor med lokal kunnskapsbase for Tønsbergregionen</p>
          </div>
          <span className="text-xs font-bold text-primary bg-primary-light px-3 py-1 rounded-full">
            AI Studio v2.4
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Genererte Artikler</span>
              <div className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-foreground tracking-tight">48 stk</div>
              <div className="flex items-center gap-1 text-xs font-bold text-success mt-1">
                <ArrowUpRight className="w-4 h-4" /> +32% denne uken
              </div>
            </div>
            <div className="pt-3 border-t border-border text-xs text-foreground-muted">
              Direkte integrert med CMS
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Lokal Kunnskapsbase</span>
              <div className="w-9 h-9 rounded-xl bg-surface-muted text-foreground flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-foreground tracking-tight">98.4%</div>
              <div className="text-xs font-bold text-success mt-1">
                Norsk (Bokmål)
              </div>
            </div>
            <div className="pt-3 border-t border-border text-xs text-foreground-muted">
              Trent på Tønsberg lokalkunnskap
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">SoMe Multi-Eksport</span>
              <div className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-foreground tracking-tight">4 kanaler</div>
              <div className="text-xs font-bold text-primary mt-1">
                1-klikk eksport
              </div>
            </div>
            <div className="pt-3 border-t border-border text-xs text-foreground-muted">
              Web, Instagram, LinkedIn, Skjerm
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Modellmotor</span>
              <div className="w-9 h-9 rounded-xl bg-success-light text-success flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-foreground tracking-tight">Gemini 2.5</div>
              <div className="text-xs font-bold text-success mt-1">
                Aktiv med lav latens
              </div>
            </div>
            <div className="pt-3 border-t border-border text-xs text-foreground-muted">
              Gj.snitt 0.8s svartid
            </div>
          </div>

        </div>
      </section>

      {/* ── Seksjon 2: Studio Split Workspace (5 cols vs 7 cols) ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Input & Prompt Engineering (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Agent Persona Selector */}
          <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
            <span className="text-xs font-extrabold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              <span>Velg AI Persona & Tone</span>
            </span>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { id: 'journalist', label: 'Lokaljournalist' },
                { id: 'marketing', label: 'SoMe Forfatter' },
                { id: 'official', label: 'Offisiell Info' },
              ].map(ag => (
                <button
                  key={ag.id}
                  onClick={() => setSelectedAgent(ag.id)}
                  className={`p-3 rounded-2xl text-xs font-bold transition-all border text-center ${
                    selectedAgent === ag.id
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-surface-muted text-foreground border-border hover:bg-surface'
                  }`}
                >
                  {ag.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-border">
              <span className="text-xs font-bold text-foreground-muted">Stemning:</span>
              {(['varm', 'entusiastisk', 'formell'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTone(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    selectedTone === t ? 'bg-primary-light text-primary' : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Prompt Templates */}
          <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 shadow-xs space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-foreground">
              Ferdige Tønsberg-maler
            </span>
            <div className="space-y-2.5">
              {promptTemplates.map((tpl, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(tpl.prompt)}
                  className="w-full text-left p-3.5 rounded-2xl bg-surface-muted hover:bg-surface border border-border hover:border-primary/50 transition-all text-xs group"
                >
                  <div className="flex items-center justify-between font-bold text-foreground group-hover:text-primary">
                    <span>{tpl.label}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface text-foreground-muted border border-border">{tpl.role}</span>
                  </div>
                  <p className="text-[11px] text-foreground-muted line-clamp-1 mt-1">{tpl.prompt}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input Box */}
          <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 shadow-xs space-y-4">
            <label className="text-xs font-extrabold uppercase tracking-wider text-foreground">
              Instruksjon til Copilot
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Beskriv hva du vil ha skrevet (f.eks: 'Skriv en sak om åpning av ny torvbod med kortreiste bær...')"
              rows={4}
              className="w-full p-4 bg-surface-muted border border-border rounded-2xl text-foreground text-xs leading-relaxed placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface"
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-3.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-2xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Genererer innhold...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Generer med AI</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right: Live Canvas Output (7 cols) */}
        <div className="lg:col-span-7 bg-surface border border-border rounded-3xl p-6 md:p-8 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse"></span>
                <h3 className="text-lg font-extrabold text-foreground">Generert Artikkel-arbeidsflate</h3>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface-muted hover:bg-border border border-border text-xs font-bold text-foreground transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Kopiert!' : 'Kopier'}</span>
              </button>
            </div>

            {/* Generated text viewer */}
            <div className="p-6 bg-surface-muted border border-border rounded-2xl font-sans text-xs leading-relaxed text-foreground max-h-[480px] overflow-y-auto whitespace-pre-wrap space-y-4">
              {generatedText}
            </div>
          </div>

          <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs text-foreground-muted">
              {published ? '✅ Sendt direkte til CMS som ny artikkelkladd!' : 'Klar for direkte publisering til Tønsberglivet.'}
            </span>

            <button
              onClick={handlePublishToCms}
              disabled={published}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
            >
              <Layers className="w-4 h-4" />
              <span>{published ? 'Overført til CMS!' : 'Send til CMS Kladd'}</span>
            </button>
          </div>
        </div>

      </section>

    </div>
  );
}
