'use client';

import { useState } from 'react';
import { Building2, Plus, Search, MapPin, Eye, Pencil, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

const demoBedrifter = [
  { id: '1', name: 'Kafe Nansen', category: 'Mat & drikke', area: 'Tønsberg sentrum', address: 'Nedre Langgate 26', status: true, orgNr: '928 411 029' },
  { id: '2', name: 'Farmannstredet', category: 'Shopping', area: 'Tønsberg sentrum', address: 'Jernbanegaten 1', status: true, orgNr: '974 550 120' },
  { id: '3', name: 'Hotel Klubben', category: 'Overnatting', area: 'Tønsberg sentrum', address: 'Nedre Langgate 49', status: true, orgNr: '914 832 990' },
  { id: '4', name: 'Haugar Kunstmuseum', category: 'Kultur', area: 'Tønsberg sentrum', address: 'Gråbrødregaten 17', status: true, orgNr: '988 201 449' },
  { id: '5', name: 'Engø Gård', category: 'Overnatting', area: 'Færder kommune', address: 'Gamle Engøvei 25', status: true, orgNr: '984 219 400' },
  { id: '6', name: 'Slottsfjellsmuseet', category: 'Kultur', area: 'Tønsberg sentrum', address: 'Farmannsveien 30', status: false, orgNr: '810 933 112' },
];

export default function BedrifterPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Alle');

  const categories = ['Alle', 'Mat & drikke', 'Shopping', 'Overnatting', 'Kultur'];

  const filtered = demoBedrifter.filter((b) => {
    const matchesCategory = selectedCategory === 'Alle' || b.category === selectedCategory;
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
                          b.area.toLowerCase().includes(search.toLowerCase()) ||
                          b.address.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Bedrifter & Næring</h2>
          <p className="text-foreground-muted text-sm mt-1">{demoBedrifter.length} bedrifter i utvalg • 312 totalt i registeret</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground
                           rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Ny bedrift
        </button>
      </div>

      {/* Søk og filtre */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
          <input
            type="search"
            placeholder="Søk på bedriftsnavn, gateadresse eller område..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm
                       text-foreground placeholder:text-foreground-subtle
                       focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>

        {/* Kategori-piller */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-surface border border-border text-foreground-muted hover:text-foreground hover:bg-surface-muted'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Mobil Visning (Native Cards) */}
      <div className="sm:hidden space-y-3">
        {filtered.map((b) => (
          <div
            key={b.id}
            className="bg-surface rounded-2xl border border-border p-4 space-y-3 shadow-xs"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm leading-snug">{b.name}</h3>
                  <p className="text-xs text-foreground-muted flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-foreground-subtle" />
                    {b.address}
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded-full shrink-0 ${
                  b.status
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-surface-muted text-foreground-muted'
                }`}
              >
                {b.status ? 'Synlig' : 'Skjult'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-border">
              <span className="px-2.5 py-0.5 rounded-md bg-surface-muted text-foreground-muted font-medium">
                {b.category}
              </span>
              <span className="text-[11px] text-foreground-subtle">
                Org: {b.orgNr}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Tabell */}
      <div className="hidden sm:block bg-surface rounded-2xl border border-border overflow-hidden shadow-xs">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted/60">
              <th className="text-left px-6 py-3 font-semibold text-foreground-muted text-xs uppercase tracking-wider">Bedrift</th>
              <th className="text-left px-6 py-3 font-semibold text-foreground-muted text-xs uppercase tracking-wider">Kategori</th>
              <th className="text-left px-6 py-3 font-semibold text-foreground-muted text-xs uppercase tracking-wider">Område & Adresse</th>
              <th className="text-left px-6 py-3 font-semibold text-foreground-muted text-xs uppercase tracking-wider">Org.nr</th>
              <th className="text-right px-6 py-3 font-semibold text-foreground-muted text-xs uppercase tracking-wider">Synlig i portal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-surface-muted/40 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-semibold">{b.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 text-xs font-semibold bg-accent/10 text-accent rounded-full">
                    {b.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-foreground-muted text-xs">
                  <p className="font-medium text-foreground">{b.area}</p>
                  <p className="text-foreground-subtle text-[11px]">{b.address}</p>
                </td>
                <td className="px-6 py-4 text-foreground-subtle text-xs font-mono">{b.orgNr}</td>
                <td className="px-6 py-4 text-right">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full ${
                      b.status
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-surface-muted text-foreground-muted'
                    }`}
                  >
                    {b.status ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Synlig
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" /> Skjult
                      </>
                    )}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
