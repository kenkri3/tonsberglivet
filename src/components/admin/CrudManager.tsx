'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { Plus, Search, Trash2, Pencil, X, Eye, EyeOff, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * Gjenbrukbar CRUD-flate for innholdstyper i admin-panelet.
 *
 * Bakgrunnen er at ingen innholdstype hadde full CRUD: `Event` og `Business`
 * hadde i det hele tatt ingen redigering i panelet – bare agenten kunne skrive
 * til dem. Etter migreringen av kundens nettsted ligger det over tusen rader i
 * disse tabellene, så behovet for å kunne rette og slette er stort.
 *
 * Komponenten tar feltdefinisjoner og et endepunkt, og håndterer list, søk,
 * filter, opprett, rediger og slett mot API-et.
 */

export interface CrudFelt {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'date' | 'time' | 'select' | 'checkbox';
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  placeholder?: string;
  /** Vis feltet i listelinjen også, ikke bare i skjemaet. */
  visILinje?: boolean;
  /** Feltet skal fylle hele bredden i skjemaet. */
  bred?: boolean;
}

export interface CrudManagerProps {
  tittel: string;
  beskrivelse?: string;
  ikon: ReactNode;
  endepunkt: string;
  felt: CrudFelt[];
  /** Nøkkelen som brukes til overskriften i hver rad. */
  tittelFelt: string;
  /** Et valgfritt felt å filtrere på, typisk kategori. */
  filterFelt?: { key: string; label: string; options: Array<{ value: string; label: string }> };
  sokPlaceholder?: string;
  nyKnappTekst?: string;
}

type Rad = Record<string, any>;

const TOM = (felt: CrudFelt[]): Rad =>
  Object.fromEntries(
    felt.map((f) => [f.key, f.type === 'checkbox' ? false : f.type === 'select' ? (f.options?.[0]?.value ?? '') : '']),
  );

/** Gjør en ISO-dato om til verdien et <input type="date"> forventer. */
const tilDatoInput = (verdi: unknown) => {
  if (!verdi) return '';
  const d = new Date(String(verdi));
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
};

export function CrudManager({
  tittel,
  beskrivelse,
  ikon,
  endepunkt,
  felt,
  tittelFelt,
  filterFelt,
  sokPlaceholder = 'Søk…',
  nyKnappTekst = 'Ny',
}: CrudManagerProps) {
  const [rader, setRader] = useState<Rad[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Rad>(() => TOM(felt));
  const [redigererId, setRedigererId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formFeil, setFormFeil] = useState<string | null>(null);
  const [varsel, setVarsel] = useState<{ tekst: string; feil: boolean } | null>(null);

  const hent = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '200' });
      if (search.trim()) params.set('q', search.trim());
      if (filter && filterFelt) params.set(filterFelt.key, filter);

      const res = await fetch(`${endepunkt}?${params}`, { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setRader(json.data);
        setTotal(json.total ?? json.data.length);
      } else {
        setVarsel({ tekst: json.error ?? 'Kunne ikke hente data.', feil: true });
      }
    } catch {
      setVarsel({ tekst: 'Kunne ikke kontakte serveren.', feil: true });
    } finally {
      setLoading(false);
    }
  }, [endepunkt, search, filter, filterFelt]);

  useEffect(() => {
    hent();
  }, [hent]);

  useEffect(() => {
    if (!varsel) return;
    const t = setTimeout(() => setVarsel(null), 6000);
    return () => clearTimeout(t);
  }, [varsel]);

  const apneNy = () => {
    setForm(TOM(felt));
    setRedigererId(null);
    setFormFeil(null);
    setModalOpen(true);
  };

  const apneRedigering = (rad: Rad) => {
    const nytt: Rad = {};
    for (const f of felt) {
      const v = rad[f.key];
      if (f.type === 'date') nytt[f.key] = tilDatoInput(v);
      else if (f.type === 'checkbox') nytt[f.key] = Boolean(v);
      else nytt[f.key] = v ?? '';
    }
    setForm(nytt);
    setRedigererId(rad.id);
    setFormFeil(null);
    setModalOpen(true);
  };

  const lagre = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeil(null);

    for (const f of felt) {
      if (f.required && !String(form[f.key] ?? '').trim()) {
        setFormFeil(`«${f.label}» er påkrevd.`);
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch(endepunkt, {
        method: redigererId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(redigererId ? { id: redigererId, ...form } : form),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setFormFeil(json.error ?? `Lagring feilet (HTTP ${res.status}).`);
        return;
      }
      setModalOpen(false);
      setVarsel({ tekst: json.message ?? 'Lagret.', feil: false });
      await hent();
    } catch {
      setFormFeil('Kunne ikke kontakte serveren. Ingenting er lagret.');
    } finally {
      setSaving(false);
    }
  };

  const slett = async (rad: Rad) => {
    const navn = String(rad[tittelFelt] ?? 'elementet');
    if (!confirm(`Slette «${navn}»? Dette kan ikke angres.`)) return;
    try {
      const res = await fetch(`${endepunkt}?id=${encodeURIComponent(rad.id)}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setVarsel({ tekst: json.error ?? 'Sletting feilet.', feil: true });
        return;
      }
      setVarsel({ tekst: json.message ?? 'Slettet.', feil: false });
      await hent();
    } catch {
      setVarsel({ tekst: 'Kunne ikke kontakte serveren.', feil: true });
    }
  };

  const byttPublisert = async (rad: Rad) => {
    try {
      const res = await fetch(endepunkt, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rad.id, published: !rad.published }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setVarsel({ tekst: json.error ?? 'Kunne ikke endre status.', feil: true });
        return;
      }
      setRader((prev) => prev.map((r) => (r.id === rad.id ? { ...r, published: !rad.published } : r)));
    } catch {
      setVarsel({ tekst: 'Kunne ikke kontakte serveren.', feil: true });
    }
  };

  const linjefelt = felt.filter((f) => f.visILinje);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            {ikon}
            {tittel}
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            {beskrivelse ?? `${total} elementer i databasen`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={hent}
            className="p-2 rounded-xl border border-border text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors"
            title="Oppdater"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={apneNy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            {nyKnappTekst}
          </button>
        </div>
      </div>

      {varsel && (
        <div
          className={`flex items-start gap-2 p-3 rounded-xl border text-sm ${
            varsel.feil
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {varsel.feil ? (
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          )}
          <span>{varsel.tekst}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={sokPlaceholder}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface border border-border text-sm text-foreground placeholder:text-foreground-muted/60 focus:outline-none focus:border-primary/50"
          />
        </div>
        {filterFelt && (
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface border border-border text-sm text-foreground focus:outline-none focus:border-primary/50"
          >
            <option value="">{filterFelt.label}: alle</option>
            {filterFelt.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-foreground-muted">Laster…</p>
      ) : rader.length === 0 ? (
        <div className="p-8 rounded-2xl border border-dashed border-border text-center">
          <p className="text-sm text-foreground-muted">
            {search || filter ? 'Ingen treff på søket.' : 'Ingen elementer ennå.'}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {rader.map((rad) => (
            <li
              key={rad.id}
              className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-surface border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex-1 min-w-[220px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground">{String(rad[tittelFelt] ?? '')}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      rad.published
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    }`}
                  >
                    {rad.published ? 'Publisert' : 'Utkast'}
                  </span>
                </div>
                <p className="text-xs text-foreground-muted mt-0.5">
                  {linjefelt
                    .map((f) => {
                      const v = rad[f.key];
                      if (v === null || v === undefined || v === '') return null;
                      if (f.type === 'date') return tilDatoInput(v);
                      return String(v);
                    })
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => byttPublisert(rad)}
                  className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors"
                  title={rad.published ? 'Avpubliser' : 'Publiser'}
                >
                  {rad.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => apneRedigering(rad)}
                  className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors"
                  title="Rediger"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => slett(rad)}
                  className="p-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Slett"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {rader.length > 0 && total > rader.length && (
        <p className="text-xs text-foreground-muted">
          Viser {rader.length} av {total}. Bruk søket for å finne flere.
        </p>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={lagre}
            className="bg-surface border border-border rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-foreground">
                {redigererId ? `Rediger ${tittel.toLowerCase()}` : nyKnappTekst}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-foreground-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formFeil && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{formFeil}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {felt.map((f) => (
                <label key={f.key} className={`block ${f.bred || f.type === 'textarea' ? 'sm:col-span-2' : ''}`}>
                  <span className="text-xs font-semibold text-foreground-muted">
                    {f.label}
                    {f.required && <span className="text-rose-500"> *</span>}
                  </span>

                  {f.type === 'textarea' ? (
                    <textarea
                      value={String(form[f.key] ?? '')}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      rows={6}
                      placeholder={f.placeholder}
                      className="mt-1 w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary/50 resize-y"
                    />
                  ) : f.type === 'select' ? (
                    <select
                      value={String(form[f.key] ?? '')}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      className="mt-1 w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary/50"
                    >
                      {f.options?.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : f.type === 'checkbox' ? (
                    <span className="mt-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={Boolean(form[f.key])}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })}
                        className="w-4 h-4 rounded border-border"
                      />
                      <span className="text-sm text-foreground">{f.placeholder ?? f.label}</span>
                    </span>
                  ) : (
                    <input
                      type={f.type === 'date' ? 'date' : f.type === 'time' ? 'time' : 'text'}
                      value={String(form[f.key] ?? '')}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      className="mt-1 w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary/50"
                    />
                  )}
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-border text-sm font-semibold text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors"
              >
                Avbryt
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                {saving ? 'Lagrer…' : redigererId ? 'Lagre endringer' : 'Opprett'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
