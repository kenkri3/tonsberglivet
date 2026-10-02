// Statens vegvesen & Trafikkmeldinger Service for Tønsbergregionen
// Åpne trafikkdata fra Statens vegvesen (DATEX II / Trafikkdata).
//
// VIKTIG: Det finnes ingen nøkkelfri, maskinlesbar trafikkkilde for Kanalbrua.
// DATEX II- og Trafikkdata-endepunktene til Statens vegvesen krever autentisering
// (SVV-API-nøkkel / tilgangsavtale), og webatlas-REST-endepunktet er 404.
// Inntil en slik tilgang er konfigurert finnes det INGEN sanntids trafikkdata her:
// `isLive` er derfor false og `alerts` er tom. Tidligere inneholdt dette svaret
// oppdiktede «veimeldinger» og en påstått trafikkflyt som ble presentert som live.

export type TrafficSource = 'LIVE' | 'UNAVAILABLE';

export const TRAFFIC_UNAVAILABLE_NOTE =
  'Statens vegvesen krever API-tilgang for trafikkdata (DATEX II/Trafikkdata), og den er ikke ' +
  'konfigurert. Vi viser derfor ingen påstått sanntidsstatus for Kanalbrua eller E18. ' +
  'Se vegvesen.no/trafikk for gjeldende situasjon.';

export interface TrafficAlert {
  id: string;
  road: string;
  location: string;
  severity: 'NORMAL' | 'LOW' | 'MEDIUM' | 'HIGH';
  heading: string;
  description: string;
  validFrom?: string;
  validTo?: string;
  isBridgeStatus?: boolean;
}

export interface TbgTrafficStatus {
  kanalbrua: {
    status: 'ÅPEN FOR VEITRAFIKK' | 'BROÅPNING (BÅTTRAFIKK)' | 'VEDLIKEHOLD' | 'UKJENT';
    /** false når det ikke finnes en verifisert sanntidskilde for brua. */
    isCarPassable: boolean | null;
    nextScheduledOpening?: string;
    details: string;
  };
  alerts: TrafficAlert[];
  trafficFlowOverview: 'Flyter fint' | 'Tett trafikk' | 'Forsinkelser' | 'Ukjent (ingen sanntidskilde)';
  updatedAt: string;
  source: TrafficSource;
  isLive: boolean;
  note: string;
  /** 'ESTIMATE' = neste åpning er regnet ut lokalt, ikke meldt fra Statens vegvesen. */
  bridgeScheduleSource: 'ESTIMATE';
}

export async function fetchLiveTrafficStatus(): Promise<TbgTrafficStatus> {
  const now = new Date();
  const formatTime = (d: Date) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

  // Neste rutemessige åpning er ren lokal aritmetikk (typisk åpning xx:05), ikke en
  // melding fra Statens vegvesen. Den merkes derfor eksplisitt som anslag.
  const nextHour = new Date(now.getTime() + 60 * 60000);
  nextHour.setMinutes(5);
  const nextOpeningStr = `ca. kl. ${formatTime(nextHour)} (beregnet)`;

  return {
    kanalbrua: {
      status: 'UKJENT',
      isCarPassable: null,
      nextScheduledOpening: nextOpeningStr,
      details:
        'Ingen verifisert sanntidskilde for Kanalbrua er tilkoblet. Neste rutemessige åpning er ' +
        'beregnet lokalt og kan avvike fra faktisk tidspunkt.'
    },
    alerts: [],
    trafficFlowOverview: 'Ukjent (ingen sanntidskilde)',
    updatedAt: now.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' }),
    source: 'UNAVAILABLE',
    isLive: false,
    note: TRAFFIC_UNAVAILABLE_NOTE,
    bridgeScheduleSource: 'ESTIMATE'
  };
}
