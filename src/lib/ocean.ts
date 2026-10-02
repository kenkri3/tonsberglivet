// MET Norway & Yr Ocean Forecast & Tide Service for Tønsberglivet
// Open oceanographic & marine meteorological data from https://api.met.no

const MET_OCEAN_URL = 'https://api.met.no/weatherapi/oceanforecast/2.0/complete';

export type OceanSource = 'LIVE' | 'PARTIAL' | 'UNAVAILABLE';

export interface OceanConditions {
  station: string;
  /** null = MET svarte ikke; ingen oppdiktet vanntemperatur vises. */
  seaTemperature: number | null; // Celsius
  /** null = MET svarte ikke. */
  waveHeight: number | null; // meters
  /** null = MET svarte ikke. */
  currentSpeedKnots: number | null;
  tideState: 'Flo (Høyvann)' | 'Fjære (Lavvann)' | 'Floende (Vannet stiger)' | 'Fjærende (Vannet synker)';
  isRising: boolean;
  nextHighTide: {
    time: string;
    height: string;
  };
  nextLowTide: {
    time: string;
    height: string;
  };
  beaches: {
    name: string;
    waterTemp: number;
    suitability: 'Utmerket' | 'God' | 'Frisk';
  }[];
  updatedAt: string;
  /** 'LIVE' = MET-havvarsel hentet, 'PARTIAL' = kun lokalt beregnet tidevann, 'UNAVAILABLE' = ingenting. */
  source: OceanSource;
  isLive: boolean;
  /** 'ESTIMATE' = tidevannet er lokal aritmetikk, ikke en offisiell prognose. */
  tideSource: 'ESTIMATE';
  /** Menneskelesbar forklaring på hva som faktisk er målt og hva som er beregnet. */
  note: string;
  tideNote: string;
}

export async function fetchLiveOceanConditions(): Promise<OceanConditions> {
  const now = new Date();

  // Tidevannet er en lokal harmonisk tilnærming, ikke en offisiell måling/prognose.
  const TIDE_NOTE =
    'Flo og fjære er beregnet lokalt fra en harmonisk tilnærming (12 t 25 min syklus), ikke hentet fra en offisiell tidevannskilde.';

  let seaTemp: number | null = null;
  let waveHeight: number | null = null;
  let currentSpeed: number | null = null;
  let metAvailable = false;

  try {
    const res = await fetch(
      `${MET_OCEAN_URL}?lat=59.2675&lon=10.4076`,
      {
        headers: { 'User-Agent': 'TonsberglivetPortal/1.0 (hei@tonsberglivet.no)', 'Accept': 'application/json' },
        cache: 'force-cache',
        next: { revalidate: 1800 }, // Cache 30 minutes
        signal: AbortSignal.timeout(8000), // Bounded: a hung upstream must not park the handler
      }
    );

    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('json')) {
        throw new Error(`MET oceanforecast svarte med ikke-JSON (${contentType || 'ukjent'})`);
      }

      const json = await res.json();
      const instant = json?.properties?.timeseries?.[0]?.data?.instant?.details;
      if (instant) {
        if (typeof instant.sea_water_temperature === 'number') {
          seaTemp = instant.sea_water_temperature;
          metAvailable = true;
        }
        if (typeof instant.sea_surface_wave_height === 'number') {
          waveHeight = instant.sea_surface_wave_height;
          metAvailable = true;
        }
        if (typeof instant.sea_water_speed === 'number') {
          currentSpeed = Number((instant.sea_water_speed * 1.94384).toFixed(1));
          metAvailable = true;
        }
      }
    } else {
      console.warn(`MET oceanforecast svarte HTTP ${res.status}.`);
    }
  } catch (err) {
    console.warn('Kunne ikke hente sjødata fra MET:', err);
  }

  const available = typeof seaTemp === 'number';
  const wave = waveHeight as number | null;
  const knots = currentSpeed as number | null;
  const hasTemperature = typeof seaTemp === 'number';
  const note = available
    ? 'Sjøtemperatur, bølgehøyde og strøm er hentet fra MET Norway (oceanforecast 2.0). Tidevannet er beregnet lokalt.'
    : 'MET Norway (oceanforecast 2.0) svarte ikke. Sjøtemperatur, bølgehøyde og strøm vises ikke – kun lokalt beregnet tidevann.';

  // Calculate dynamic semidiurnal tide cycle for Tønsbergfjorden / Oslofjorden (~12h 25m)
  const epochMinutes = Math.floor(now.getTime() / (1000 * 60));
  const tideCycleMinutes = 745;
  const phase = (epochMinutes % tideCycleMinutes) / tideCycleMinutes;

  const isRising = phase < 0.25 || phase > 0.75;
  const isHigh = phase >= 0.15 && phase <= 0.35;
  const isLow = phase >= 0.65 && phase <= 0.85;

  let tideState: OceanConditions['tideState'] = 'Floende (Vannet stiger)';
  if (isHigh) tideState = 'Flo (Høyvann)';
  else if (isLow) tideState = 'Fjære (Lavvann)';
  else if (isRising) tideState = 'Floende (Vannet stiger)';
  else tideState = 'Fjærende (Vannet synker)';

  const minutesToHigh = Math.round(((0.25 - phase + 1) % 1) * tideCycleMinutes);
  const minutesToLow = Math.round(((0.75 - phase + 1) % 1) * tideCycleMinutes);

  const nextHighDate = new Date(now.getTime() + minutesToHigh * 60000);
  const nextLowDate = new Date(now.getTime() + minutesToLow * 60000);

  const formatTime = (d: Date) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

  return {
    station: 'Tønsberg Havn & Ytre Oslofjord',
    seaTemperature: hasTemperature ? Math.round((seaTemp as number) * 10) / 10 : null,
    waveHeight: typeof wave === 'number' ? Math.round(wave * 10) / 10 : null,
    currentSpeedKnots: knots,
    tideState,
    isRising,
    tideSource: 'ESTIMATE',
    note,
    tideNote: TIDE_NOTE,
    nextHighTide: {
      time: formatTime(nextHighDate),
      height: '+22 cm (beregnet)'
    },
    nextLowTide: {
      time: formatTime(nextLowDate),
      height: '-18 cm (beregnet)'
    },
    // Badevanntemperaturene er METs målte sjøtemperatur med et lite lokalavvik per strand.
    // De er ikke egne målinger og merkes derfor som anslag i UI.
    beaches: hasTemperature
      ? [
          { name: 'Ringshaugstranda', waterTemp: Math.round(((seaTemp as number) + 0.5) * 10) / 10, suitability: 'Utmerket' },
          { name: 'Skallevoldstranda', waterTemp: Math.round((seaTemp as number) * 10) / 10, suitability: 'Utmerket' },
          { name: 'Fjærholmen (Nøtterøy)', waterTemp: Math.round(((seaTemp as number) - 0.2) * 10) / 10, suitability: 'God' },
          { name: 'Verdens Ende (Tjøme)', waterTemp: Math.round(((seaTemp as number) - 0.8) * 10) / 10, suitability: 'Frisk' }
        ]
      : [],
    source: metAvailable ? 'LIVE' : 'PARTIAL',
    isLive: metAvailable,
    updatedAt: now.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })
  };
}

