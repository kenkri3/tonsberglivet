// Statistisk sentralbyrå (SSB) OpenAPI Service for Tønsberg (Kommune 3905)
// Open statistics data from https://data.ssb.no

const SSB_TABLE_URL = 'https://data.ssb.no/api/v0/no/table';
const SSB_USER_AGENT = 'TonsberglivetPortal/1.0 (hei@tonsberglivet.no)';
const SSB_TIMEOUT_MS = 12000;
const TONSBERG_REGION = '3905';

export type SsbSource = 'LIVE' | 'PARTIAL' | 'UNAVAILABLE';

export interface SsbRegionStats {
  /** Folkemengde i Tønsberg (SSB tabell 07459). null = ikke hentet. */
  population: number | null;
  /** Sysselsatte med arbeidssted i Tønsberg (SSB tabell 07984). null = ikke hentet. */
  workplaces: number | null;
  /** Siste årstall det faktisk finnes tall for. null = ikke hentet. */
  year: number | null;
  /** Årstall for sysselsettingstallet (publiseres med ett års etterslep). */
  employmentYear: number | null;
  municipality: string;
  municipalityCode: string;
  populationTable: string;
  employmentTable: string;
  populationUpdated: string | null;
  employmentUpdated: string | null;
  source: SsbSource;
  isLive: boolean;
  note?: string;
}

// SSB krever POST mot /api/v0/no/table/{tabell} med en query per variabel.
interface SsbJsonStat {
  id: string[];
  size: number[];
  value: (number | null)[];
  updated?: string;
  dimension: Record<string, { category: { index: Record<string, number>; label: Record<string, string> } }>;
}

const SSB_NOTE_BOTH =
  'SSB (data.ssb.no) svarte ikke. Vi viser ingen statistikk i stedet for utdaterte eller oppdiktede tall.';
const SSB_NOTE_EMPLOYMENT =
  'SSB svarte ikke for sysselsettingsstatistikken (tabell 07984). Befolkningstallet er hentet live.';
const SSB_NOTE_POPULATION =
  'SSB svarte ikke for befolkningstallet (tabell 07459). Sysselsettingstallet er hentet live.';

async function fetchSsbJsonStat(table: string, body: unknown): Promise<SsbJsonStat | null> {
  try {
    const res = await fetch(`${SSB_TABLE_URL}/${table}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': SSB_USER_AGENT,
      },
      body: JSON.stringify(body),
      cache: 'force-cache',
      next: { revalidate: 86400 }, // Statistikk endres sjelden – cache 24 timer
      signal: AbortSignal.timeout(SSB_TIMEOUT_MS), // Bounded: a hung upstream must not park the handler
    });

    if (!res.ok) {
      console.warn(`[SSB ${table}] HTTP ${res.status}`);
      return null;
    }

    // En HTML-side (f.eks. API-konsollet) skal aldri tolkes som statistikk.
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('json')) {
      console.warn(`[SSB ${table}] ikke-JSON (${contentType || 'ukjent'}) – avvises.`);
      return null;
    }

    const json = await res.json();
    if (!json || !Array.isArray(json.value) || !json.dimension) {
      console.warn(`[SSB ${table}] uventet svarstruktur.`);
      return null;
    }
    return json as SsbJsonStat;
  } catch (error) {
    console.warn(`[SSB ${table}] feilet:`, error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Summerer alle celler som gjelder det siste året som faktisk finnes i svaret.
 *
 * MERK: I SSB sine json-stat2-svar varierer den SISTE variabelen i `id` raskest i `value`
 * (Tid er altså ikke nødvendigvis sist, og `size` følger ikke alltid `id`). Vi regner derfor
 * ut strides fra `id` med siste dimensjon raskest, og summerer alle celler for det siste året.
 */
function sumForLatestYear(js: SsbJsonStat): { value: number | null; year: number | null } {
  const tid = js.dimension?.Tid?.category?.index;
  if (!tid) return { value: null, year: null };

  const years = Object.keys(tid)
    .map((y) => Number(y))
    .filter((y) => Number.isFinite(y))
    .sort((a, b) => a - b);

  if (years.length === 0) return { value: null, year: null };

  const latest = years[years.length - 1];
  const tidKey = String(latest);
  const tidDimIndex = js.id.indexOf('Tid');
  if (tidDimIndex === -1 || tid[tidKey] === undefined) return { value: null, year: latest };

  // Dimensjonsstørrelser hentet fra `id`, slik at navn og rekkefølge alltid stemmer.
  const sizes = js.id.map((d) => Object.keys(js.dimension[d]?.category?.index || {}).length);
  const tidSize = sizes[tidDimIndex] || 1;

  // Siste dimensjon i `id` varierer raskest => stride = produktet av størrelsene ETTER denne.
  const stride: number[] = new Array(sizes.length);
  let acc = 1;
  for (let i = sizes.length - 1; i >= 0; i--) {
    stride[i] = acc;
    acc *= sizes[i] || 1;
  }

  const tidStride = stride[tidDimIndex];
  const tidCoordinate = tid[tidKey];

  let value: number | null = null;
  for (let i = 0; i < js.value.length; i++) {
    if (Math.floor(i / tidStride) % tidSize !== tidCoordinate) continue;
    const v = js.value[i];
    if (typeof v === 'number') value = (value ?? 0) + v;
  }

  return { value, year: latest };
}

export async function fetchSsbRegionStats(): Promise<SsbRegionStats> {
  const populationBody = {
    query: [
      { code: 'Region', selection: { filter: 'item', values: [TONSBERG_REGION] } },
      { code: 'Kjonn', selection: { filter: 'all', values: ['*'] } },
      { code: 'Alder', selection: { filter: 'all', values: ['*'] } },
      { code: 'ContentsCode', selection: { filter: 'item', values: ['Personer1'] } },
      { code: 'Tid', selection: { filter: 'all', values: ['*'] } },
    ],
    response: { format: 'json-stat2' },
  };

  const employmentBody = {
    query: [
      { code: 'Region', selection: { filter: 'item', values: [TONSBERG_REGION] } },
      // NACE2007 er en hierarkisk inndeling der «00-99» = alle næringer er totalen.
      // Vi henter bare totalen for å unngå dobbelttelling på tvers av næringskoder.
      { code: 'NACE2007', selection: { filter: 'item', values: ['00-99'] } },
      { code: 'Kjonn', selection: { filter: 'item', values: ['0'] } },
      { code: 'Alder', selection: { filter: 'item', values: ['15-74'] } },
      { code: 'ContentsCode', selection: { filter: 'item', values: ['SysselsatteArb'] } },
      { code: 'Tid', selection: { filter: 'all', values: ['*'] } },
    ],
    response: { format: 'json-stat2' },
  };

  const [populationJs, employmentJs] = await Promise.all([
    fetchSsbJsonStat('07459', populationBody),
    fetchSsbJsonStat('07984', employmentBody),
  ]);

  const population = populationJs ? sumForLatestYear(populationJs) : { value: null, year: null };
  const employment = employmentJs ? sumForLatestYear(employmentJs) : { value: null, year: null };

  const hasPopulation = typeof population.value === 'number';
  const hasEmployment = typeof employment.value === 'number';
  const isLive = hasPopulation && hasEmployment;

  let note: string | undefined;
  if (!hasPopulation && !hasEmployment) note = SSB_NOTE_BOTH;
  else if (!hasEmployment) note = SSB_NOTE_EMPLOYMENT;
  else if (!hasPopulation) note = SSB_NOTE_POPULATION;

  return {
    population: hasPopulation ? population.value : null,
    workplaces: hasEmployment ? employment.value : null,
    year: population.year,
    employmentYear: employment.year,
    municipality: 'Tønsberg',
    municipalityCode: TONSBERG_REGION,
    populationTable: 'SSB tabell 07459 (befolkning)',
    employmentTable: 'SSB tabell 07984 (sysselsatte, arbeidssted)',
    populationUpdated: populationJs?.updated || null,
    employmentUpdated: employmentJs?.updated || null,
    source: isLive ? 'LIVE' : hasPopulation || hasEmployment ? 'PARTIAL' : 'UNAVAILABLE',
    isLive,
    note,
  };
}
