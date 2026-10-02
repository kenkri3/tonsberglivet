import { getSetting, setSetting } from './settings';

export interface VisitorInquiry {
  id: string;
  timestamp: string;
  question: string;
  topic: 'ARRANGEMENT' | 'MAT_DRIKKE' | 'TORVLEIE' | 'STRAND_SJO' | 'TRANSPORT' | 'PARKERING' | 'GENERELT';
  answered: boolean;
  leadCaptured?: boolean;
  contactEmail?: string;
  contactName?: string;
}

// Lokal minnebuffer for umiddelbar ytelse.
//
// MERK: Ingen seedede «eksempelhenvendelser» her. Fire oppdiktede spørsmål ble
// tidligere lagt inn og tellet med i «henvendelser siste døgn», slik at
// publikumspulsen viste aktivitet som aldri hadde funnet sted. Den ekte kilden
// er SystemSetting-nøkkelen `chatbot_visitor_pulse`.
let inMemoryInquiries: VisitorInquiry[] = [];

/**
 * Logg et spørsmål stilt av en innbygger eller turist i chatboten på landingssiden.
 */
export async function logVisitorQuestion(
  question: string,
  topic: VisitorInquiry['topic'] = 'GENERELT',
  answered: boolean = true,
  leadInfo?: { name?: string; email?: string }
): Promise<void> {
  const newInq: VisitorInquiry = {
    id: `inq-${Date.now()}`,
    timestamp: new Date().toISOString(),
    question,
    topic,
    answered,
    leadCaptured: !!leadInfo,
    contactName: leadInfo?.name,
    contactEmail: leadInfo?.email,
  };

  inMemoryInquiries.unshift(newInq);
  if (inMemoryInquiries.length > 50) {
    inMemoryInquiries = inMemoryInquiries.slice(0, 50);
  }

  // MERK: Vi oppretter bevisst INGEN ContactMessage her.
  // addVisitorMessage() i live-chat.ts eier den skrivingen for den samme
  // besøkende-meldingen (den kalles først i /api/agent/public-chat), og et
  // ekstra create() her ga to identiske rader i admin-innboksen og dobbel
  // ulest-teller. Loggingen begrenser seg derfor til puls-bufferen under.

  // Forsøk å synkronisere periodisk til SystemSetting
  try {
    await setSetting('chatbot_visitor_pulse', JSON.stringify(inMemoryInquiries.slice(0, 20)), 'AI');
  } catch (e) {
    // Ignorer hvis DB er midlertidig utilgjengelig
  }
}

/**
 * Henter sammendrag av publikumshenvendelser for den autonome admin-agenten.
 */
export async function getVisitorPulseSummary(): Promise<{
  totalSisteDogn: number;
  toppTemaer: Array<{ topic: string; antall: number; prosent: string }>;
  ferskeSporsmal: string[];
  anbefalteTiltak: string[];
}> {
  // Prøv å hente fra SystemSetting først
  try {
    const raw = await getSetting('chatbot_visitor_pulse');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryInquiries = parsed;
      }
    }
  } catch (e) {}

  const total = inMemoryInquiries.length;

  // «Siste døgn» = faktisk antall henvendelser med tidsstempel innenfor siste 24 timer.
  // Bufferen tar maks 50 elementer, så dens lengde er IKKE et døgnmål.
  const ettDognSiden = Date.now() - 24 * 60 * 60 * 1000;
  const totalSisteDogn = inMemoryInquiries.filter((inq) => {
    const ts = Date.parse(inq.timestamp);
    return Number.isFinite(ts) && ts >= ettDognSiden;
  }).length;

  const topicCounts: Record<string, number> = {};

  for (const inq of inMemoryInquiries) {
    topicCounts[inq.topic] = (topicCounts[inq.topic] || 0) + 1;
  }

  const sortedTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([topic, antall]) => ({
      topic,
      antall,
      prosent: `${Math.round((antall / (total || 1)) * 100)}%`,
    }));

  const ferskeSporsmal = inMemoryInquiries.slice(0, 5).map((q) => q.question);

  const anbefalteTiltak = [
    'Publiser oppdatert helgeguide for scener og servering.',
    'Oppdater åpningstider og bordbestilling for restaurantene på Brygga.',
    'Klargjør svar og vilkår for torvleiesøkere til neste ukes marked.',
  ];

  return {
    totalSisteDogn,
    toppTemaer: sortedTopics,
    ferskeSporsmal,
    anbefalteTiltak,
  };
}
