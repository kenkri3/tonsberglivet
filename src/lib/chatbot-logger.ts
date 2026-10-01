import { prisma } from './prisma';
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

// Lokal minnebuffer for umiddelbar ytelse
let inMemoryInquiries: VisitorInquiry[] = [
  {
    id: 'inq-1',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    question: 'Hva skjer på Foynhagen denne helgen?',
    topic: 'ARRANGEMENT',
    answered: true,
  },
  {
    id: 'inq-2',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    question: 'Hvor kan man parkere nær Brygga med elbil?',
    topic: 'PARKERING',
    answered: true,
  },
  {
    id: 'inq-3',
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    question: 'Hvordan leier man standplass på Torvet for å selge håndverk?',
    topic: 'TORVLEIE',
    answered: true,
    leadCaptured: true,
  },
  {
    id: 'inq-4',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    question: 'Hva er badevannstemperaturen på Ringshaugstranda i dag?',
    topic: 'STRAND_SJO',
    answered: true,
  },
];

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

  // Hvis leadInfo er oppgitt, lagre automatisk som ContactMessage i databasen
  if (leadInfo && (leadInfo.email || leadInfo.name)) {
    try {
      await prisma.contactMessage.create({
        data: {
          name: leadInfo.name || 'Besøkende fra Tønsberg-Guiden',
          email: leadInfo.email || 'ubesvart@tonsberglivet.no',
          subject: `Chatbot-henvendelse [${topic}]`,
          message: question,
        },
      });
    } catch (e) {
      console.warn('[ChatbotLogger] Kunne ikke lagre ContactMessage i DB:', e);
    }
  }

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
    totalSisteDogn: total,
    toppTemaer: sortedTopics,
    ferskeSporsmal,
    anbefalteTiltak,
  };
}
