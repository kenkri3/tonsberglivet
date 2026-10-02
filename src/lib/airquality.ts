// NILU & Miljødirektoratet Luftkvalitet i Norge Service for Tønsberglivet
// Open sensor data from https://api.nilu.no

const NILU_AQ_URL = 'https://api.nilu.no/aq/utd';
const NILU_NOTE =
  'NILUs åpne API (api.nilu.no) krever nå API-nøkkel og svarte ikke på nøkkelfri forespørsel. ' +
  'Vi viser derfor ingen luftkvalitetstall i stedet for å gjette. Se luftkvalitet.miljodirektoratet.no.';

export type AirQualitySource = 'LIVE' | 'UNAVAILABLE';

export interface AirQualityData {
  station: string;
  index: 'LAV' | 'MODERAT' | 'HØY' | 'SVÆRT HØY';
  label: string;
  colorHex: string;
  pm10: number; // µg/m³
  pm25: number; // µg/m³
  no2: number;  // µg/m³
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

/**
 * Henter siste timeverdier for Tønsberg-målestasjonen fra NILU.
 * Returnerer `data: null` med en ærlig forklaring dersom kilden ikke er tilgjengelig.
 */
export async function fetchLiveAirQuality(): Promise<AirQualityResult> {
  const unavailable: AirQualityResult = {
    data: null,
    provenance: { source: 'UNAVAILABLE', isLive: false, note: NILU_NOTE },
  };

  try {
    const url = `${NILU_AQ_URL}?stations=${encodeURIComponent('Tønsberg')}`;
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'TonsberglivetPortal/1.0 (hei@tonsberglivet.no)' },
      cache: 'force-cache',
      next: { revalidate: 3600 }, // Cache 1 time
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.warn(`NILU Luftkvalitet svarte HTTP ${res.status} – ingen luftkvalitetsdata tilgjengelig.`);
      return unavailable;
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('json')) {
      console.warn(`NILU Luftkvalitet svarte med ikke-JSON (${contentType || 'ukjent'}) – avvises.`);
      return unavailable;
    }

    const json = await res.json();
    if (!Array.isArray(json) || json.length === 0) {
      console.warn('NILU Luftkvalitet returnerte ingen målinger for Tønsberg.');
      return unavailable;
    }

    // NILU svarer med én rad per komponent. Bruk kun målestasjonen i Tønsberg,
    // og foretrekk PM10 (ikke «første rad i arrayet», som kan være en annen by).
    interface NiluRow {
      station: string;
      component?: string;
      value?: number;
      date?: string;
    }
    const rows = (json as NiluRow[]).filter(
      (row) => typeof row?.station === 'string' && row.station.toLowerCase().includes('tønsberg')
    );
    const source = rows.length > 0 ? rows : [];
    if (source.length === 0) {
      console.warn('NILU Luftkvalitet returnerte ingen stasjon som matcher Tønsberg.');
      return unavailable;
    }

    const pick = (component: string) => {
      const row = source.find(
        (r) => String(r?.component || '').toLowerCase() === component && typeof r?.value === 'number'
      );
      return typeof row?.value === 'number' ? row.value : undefined;
    };

    const pm10Value = pick('pm10');
    const pm25Value = pick('pm25');
    const no2Value = pick('no2');

    if (pm10Value === undefined && pm25Value === undefined && no2Value === undefined) {
      console.warn('NILU Luftkvalitet manglet måleverdier for PM10/PM2.5/NO2.');
      return unavailable;
    }

    const reference = pm10Value ?? pm25Value ?? no2Value ?? 0;
    let index: AirQualityData['index'] = 'LAV';
    let label = 'Liten luftforurensning (God luft)';
    let colorHex = '#10b981'; // emerald-500

    if (reference > 50) {
      index = 'MODERAT';
      label = 'Moderat forurensning';
      colorHex = '#f59e0b'; // amber-500
    }
    if (reference > 100) {
      index = 'HØY';
      label = 'Høy forurensning';
      colorHex = '#ef4444'; // red-500
    }

    const stationRow = source[0];

    return {
      data: {
        station: stationRow.station,
        index,
        label,
        colorHex,
        pm10: pm10Value !== undefined ? Math.round(pm10Value) : 0,
        pm25: pm25Value !== undefined ? Math.round(pm25Value) : 0,
        no2: no2Value !== undefined ? Math.round(no2Value) : 0,
        healthAdvice: label,
        updatedAt: stationRow.date
          ? new Date(stationRow.date).toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })
          : new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' }),
      },
      provenance: { source: 'LIVE', isLive: true },
    };
  } catch (err) {
    console.warn('NILU Luftkvalitet API feilet – ingen luftkvalitetsdata tilgjengelig:', err);
    return unavailable;
  }
}
