'use client';

import { useState, useEffect } from 'react';
import { Search, Building2, MapPin, CheckCircle, ExternalLink, Filter, Loader2 } from 'lucide-react';
import type { Company } from '@/lib/brreg';

const CATEGORIES = [
  { label: 'Alle bedrifter', code: '' },
  { label: 'Mat & Servering', code: '56' },
  { label: 'Handel & Shopping', code: '47' },
  { label: 'Overnatting & Reiseliv', code: '55' },
  { label: 'Kultur & Underholdning', code: '90' },
  { label: 'Eiendom & Bygg', code: '68' },
];

export function BrregSearchWidget() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCompanies();
    }, 300);
    return () => clearTimeout(timer);
  }, [query, category]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (category) params.set('category', category);
      params.set('limit', '12');

      const res = await fetch(`/api/brreg?${params.toString()}`);
      const json = await res.json();
      // `success` betyr nå «Enhetsregisteret svarte», ikke «kallet gjennomførtes».
      // `data` er befolket også når kilden ikke er live, så vi må ikke filtrere på success.
      if (Array.isArray(json.data)) {
        setCompanies(json.data);
      }
    } catch (e) {
      console.error('Feil ved henting av bedrifter:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface rounded-3xl border border-border p-6 md:p-8 space-y-6 shadow-sm">
      {/* Topp og tittel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Brønnøysundregistrene Live API</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-foreground">
            Søk i Tønsbergregionens Bedriftsregister
          </h3>
          <p className="text-foreground-muted text-sm mt-1">
            Offisielle data fra Enhetsregisteret for over 7 500 bedrifter i Tønsberg og Færder.
          </p>
        </div>
      </div>

      {/* Søkefelt og filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
          <input
            type="text"
            placeholder="Søk på bedriftsnavn, bransje eller 9-sifret organisasjonsnummer..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs"
          />
          {loading && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-spin" />
          )}
        </div>

        {/* Kategori-piller */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-4 h-4 text-foreground-muted shrink-0 mr-1 hidden sm:block" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat.code}
              onClick={() => setCategory(cat.code)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                category === cat.code
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-muted text-foreground hover:bg-surface-muted/80 border border-border'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resultat-rutenett */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {companies.map((c) => (
          <div
            key={c.orgNr}
            className="p-5 rounded-2xl bg-surface-muted/60 border border-border hover:border-primary/50 transition-all space-y-3 flex flex-col justify-between group hover:shadow-md"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-mono font-bold text-foreground-muted bg-surface px-2 py-0.5 rounded border border-border">
                  Org.nr: {c.orgNr}
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {c.orgForm}
                </span>
              </div>

              {/* To linjer på mobil – firmanavn er hovedinformasjonen og bør
                  ikke klippes til én linje («1-2-TRE ELEMENTPRODUKSJON AS»). */}
              <h4 className="font-bold text-foreground group-hover:text-primary transition-colors text-base line-clamp-2 leading-snug">
                {c.name}
              </h4>

              <p className="text-xs text-foreground-muted line-clamp-2">
                {c.industry}
              </p>
            </div>

            <div className="pt-3 border-t border-border flex items-start justify-between gap-2 text-xs text-foreground-subtle">
              {/* Adressen får bryte over inntil to linjer i stedet for å bli
                  kuttet («Båtsmannsveien 49B, 3150 TOLVS…»). */}
              <span className="flex items-start gap-1 min-w-0">
                <MapPin className="w-3 h-3 shrink-0 text-primary mt-0.5" />
                <span className="min-w-0 line-clamp-2 leading-snug break-words">
                  {c.address || `${c.city || 'Tønsberg'}`}
                </span>
              </span>
              <a
                href={`https://virksomhet.brreg.no/nb/oppslag/enheter/${c.orgNr}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-semibold flex items-center gap-1 shrink-0"
                title="Se i Brønnøysundregistrene"
              >
                <span>Brreg</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}

        {companies.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-foreground-muted">
            Ingen bedrifter funnet for søket &quot;{query}&quot;. Prøv et annet søkeord.
          </div>
        )}
      </div>
    </div>
  );
}
