// Miljødirektoratet – Luftkvalitet i Norge (offisielt, nøkkelfritt API) for Tønsberglivet
// Åpne måledata: https://api-luftmalinger.miljodirektoratet.no/public/aq/utd
//
// MERK: API-et sender ingen CORS-header og må derfor kalles server-side.
// Det gjøres i dag fra src/app/api/airquality/route.ts.
//
// Erstatter NILUs API (api.nilu.no), som nå krever Basic auth vi ikke har tilgang til.

const AQ_URL = 'https://api-luftmalinger.miljodirektoratet.no/public/aq/utd';
const AQ_AREA = 'Tønsberg';
// Semikolon skiller komponentene i «components»-parameteren (verifisert URL, ikke prosentkodes).
const AQ_COMPONENTS = 'NO2;PM10;PM2.5';

const MILJODIREKTORATET_NOTE =
  'Miljødirektoratets åpne luftmåle-API (api-luftmalinger.miljodirektoratet.no) svarte ikke med en brukbar ' +
  'Tønsberg-måling. Vi viser derfor ingen luftkvalitetstall i stedet for å gjette. Se luftkvalitet.miljodirektoratet.no.';

export type AirQualitySource = 'LIVE' | 'UNAVAILABLE';

export interface AirQualityData {
  station: string;
  index: 'LITE' | 'MODERAT' | 'HØY' | 'SVÆRT HØY';
  label: string;
  colorHex: string;
  /** null = komponenten er ikke målt i denne rapporten – aldri en oppdiktet 0. */
  pm10: number | null; // µg/m³
  pm25: number | null; // µg/m³
  no2: number | null;  // µg/m³
  healthAdvice: string;
  updatedAt: string;
}

export interface AirQualityProvenance {
  source: AirQualitySource;
  isLive: boolean;
  note?: string;
}

export interface AirQualityResult {
  /** null når ingen offisiell måling er tilgjengelig – aldri oppdiktede verdier. */
  data: AirQualityData | null;
  provenance: AirQualityProvenance;
}

// Miljødirektoratet regner selv ut «index» (1–4) per komponent. Vi gjenbruker deres
// offisielle nivåer i stedet for egne konsentrasjonsgrenser.
type AqiLevel = 1 | 2 | 3 | 4;

const AQI_LEVELS: Record<AqiLevel, { index: AirQualityData['index']; label: string; colorHex: string; healthAdvice: string }> = {
  1: {
    index: 'LITE',
    label: 'Lite',
    colorHex: '#6ee86e',
    healthAdvice: 'Luftkvaliteten er god. Ingen helserisiko for folk flest.',
  },
  2: {
    index: 'MODERAT',
    label: 'Moderat',
    colorHex: '#ff9900',
    healthAdvice: 'Luftkvaliteten er moderat. Astmatikere og andre med luftveissykdom kan merke litt ubehag.',
  },
  3: {
    index: 'HØY',
    label: 'Høy',
    colorHex: '#ff0000',
    healthAdvice: 'Luftkvaliteten er dårlig. Personer med luftveissykdom bør redusere fysisk aktivitet utendørs.',
  },
  4: {
    index: 'SVÆRT HØY',
    label: 'Svært høy',
    colorHex: '#990099',
    healthAdvice: 'Luftkvaliteten er svært dårlig. Unngå fysisk aktivitet utendørs, særlig barn, eldre og personer med luftveissykdom.',
  },
};

/** API-et svarer med ett flatt array og én rad per komponent. */
interface MiljoRow {
  station?: string;
  component?: string;
  value?: number;
  index?: number;
  color?: string;
  toTime?: string;
}

interface UsableRow extends MiljoRow {
  component: string;
  value: number;
  index: AqiLevel;
}

function isUsableRow(row: MiljoRow): row is UsableRow {
  return (
    typeof row?.component === 'string' &&
    typeof row?.value === 'number' &&
    Number.isFinite(row.value) &&
    typeof row?.index === 'number' &&
    Number.isInteger(row.index) &&
    row.index >= 1 &&
    row.index <= 4
  );
}

/** API-et oppgir farger uten «#» (f.eks. «6ee86e»). */
function withHash(color: string | undefined, fallback: string): string {
  const trimmed = typeof color === 'string' ? color.trim() : '';
  if (!trimmed) return fallback;
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
}

/**
 * Henter siste timeverdier for Tønsberg-området fra Miljødirektoratet.
 * Returnerer `data: null` med en ærlig forklaring dersom kilden ikke er tilgjengelig.
 */
export async function fetchLiveAirQuality(): Promise<AirQualityResult> {
  const unavailable: AirQualityResult = {
    data: null,
    provenance: { source: 'UNAVAILABLE', isLive: false, note: MILJODIREKTORATET_NOTE },
  };

  try {
    const url = `${AQ_URL}?areas=${encodeURIComponent(AQ_AREA)}&components=${AQ_COMPONENTS}`;
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'TonsberglivetPortal/1.0 (hei@tonsberglivet.no)' },
      cache: 'force-cache',
      next: { revalidate: 60 }, // API-et annonserer Cache-Control: max-age=30
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.warn(`Miljødirektoratet Luftkvalitet svarte HTTP ${res.status} – ingen luftkvalitetsdata tilgjengelig.`);
      return unavailable;
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('json')) {
      console.warn(`Miljødirektoratet Luftkvalitet svarte med ikke-JSON (${contentType || 'ukjent'}) – avvises.`);
      return unavailable;
    }

    const json = await res.json();
    if (!Array.isArray(json) || json.length === 0) {
      console.warn('Miljødirektoratet Luftkvalitet returnerte ingen målinger for Tønsberg.');
      return unavailable;
    }

    // Vi krever komponent, tallverdi og en indeks i 1–4. Rader uten dette er ikke
    // brukbare som offisiell måling, og hoppes over i stedet for å gjettes på.
    const rows = (json as MiljoRow[]).filter(isUsableRow);
    if (rows.length === 0) {
      console.warn('Miljødirektoratet Luftkvalitet manglet brukbare måleverdier for PM10/PM2.5/NO2.');
      return unavailable;
    }

    const pick = (component: string) => rows.find((row) => row.component.toUpperCase() === component);

    const pm10Row = pick('PM10');
    const pm25Row = pick('PM2.5');
    const no2Row = pick('NO2');

    // Verste komponent styrer nivået – den høyeste indeksen blant komponentene vinner.
    const governing = rows.reduce((worst, row) => (row.index > worst.index ? row : worst));
    const level = AQI_LEVELS[governing.index];

    // Nyeste rad bestemmer tidsstempelet («toTime» er slutten av måleperioden).
    const newestToTime = rows
      .map((row) => row.toTime)
      .filter((toTime): toTime is string => typeof toTime === 'string' && !Number.isNaN(Date.parse(toTime)))
      .sort((a, b) => Date.parse(b) - Date.parse(a))[0];

    // Manglende komponent gir null – ikke 0 µg/m³, som ville sett ut som en måling.
    const toWhole = (row: UsableRow | undefined) => (row ? Math.round(row.value) : null);

    return {
      data: {
        station: governing.station && governing.station.trim() ? governing.station : AQ_AREA,
        index: level.index,
        label: level.label,
        colorHex: withHash(governing.color, level.colorHex),
        pm10: toWhole(pm10Row),
        pm25: toWhole(pm25Row),
        no2: toWhole(no2Row),
        healthAdvice: level.healthAdvice,
        updatedAt: newestToTime
          ? new Date(newestToTime).toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })
          : '',
      },
      provenance: { source: 'LIVE', isLive: true },
    };
  } catch (err) {
    console.warn('Miljødirektoratet Luftkvalitet API feilet – ingen luftkvalitetsdata tilgjengelig:', err);
    return unavailable;
  }
}
