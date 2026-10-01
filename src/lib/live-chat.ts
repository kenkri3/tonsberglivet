import { getSetting, setSetting } from './settings';
import { prisma } from './prisma';

export interface ChatMessageItem {
  id: string;
  sender: 'visitor' | 'assistant' | 'admin';
  senderName?: string;
  content: string;
  timestamp: string;
  quickReplies?: Array<{ title: string; payload: string }>;
}

export interface ChatSession {
  id: string;
  visitorName?: string;
  visitorEmail?: string;
  aiEnabled: boolean;
  status: 'active' | 'waiting_admin' | 'answered_by_admin' | 'closed';
  topic: string;
  createdAt: string;
  updatedAt: string;
  unreadByAdmin: boolean;
  messages: ChatMessageItem[];
}

// In-memory cache for ultra-fast response
let inMemorySessions: Record<string, ChatSession> = {
  'demo-session-1': {
    id: 'demo-session-1',
    visitorName: 'Turist fra Oslo',
    visitorEmail: 'turist@example.com',
    aiEnabled: true,
    status: 'waiting_admin',
    topic: 'TORVLEIE',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    unreadByAdmin: true,
    messages: [
      {
        id: 'm1',
        sender: 'visitor',
        content: 'Hei! Vi ønsker å leie standplass på Torvet for å selge keramikk under Tønsbergdagene. Hvordan går vi frem?',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' }),
      },
      {
        id: 'm2',
        sender: 'assistant',
        senderName: 'Tønsberg-Guiden AI',
        content: 'Hei! Så spennende med håndverk og keramikk på Torvet! Standleie koster kr 350,- per dag for 3x3 meter. Du kan søke direkte her eller legge igjen kontaktinfo.',
        timestamp: new Date(Date.now() - 1000 * 60 * 14).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' }),
      },
      {
        id: 'm3',
        sender: 'visitor',
        content: 'Kan vi få en hjørneplass mot Brygga? Kontakt meg gjerne på turist@example.com.',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' }),
      },
    ],
  },
};

let loadedFromDb = false;

async function ensureSessionsLoaded(): Promise<void> {
  if (loadedFromDb) return;
  try {
    const raw = await getSetting('live_chat_sessions_db');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        inMemorySessions = { ...inMemorySessions, ...parsed };
      }
    }
  } catch (e) {
    console.warn('[LiveChat] Kunne ikke laste lagrede sesjoner fra DB:', e);
  } finally {
    loadedFromDb = true;
  }
}

async function persistSessions(): Promise<void> {
  try {
    // Behold de nyeste 50 sesjonene for å unngå overskridelse
    const entries = Object.entries(inMemorySessions)
      .sort((a, b) => new Date(b[1].updatedAt).getTime() - new Date(a[1].updatedAt).getTime())
      .slice(0, 50);

    const pruned: Record<string, ChatSession> = Object.fromEntries(entries);
    await setSetting('live_chat_sessions_db', JSON.stringify(pruned), 'AI');
  } catch (e) {
    console.warn('[LiveChat] Kunne ikke lagre sesjoner til DB:', e);
  }
}

/**
 * Henter global status for om AI i chatboten er slått på eller av.
 */
export async function getGlobalAiChatbotStatus(): Promise<boolean> {
  const val = await getSetting('public_chatbot_ai_enabled', 'true');
  return val !== 'false';
}

/**
 * Slår AI i chatboten globalt av eller på.
 */
export async function setGlobalAiChatbotStatus(enabled: boolean): Promise<void> {
  await setSetting('public_chatbot_ai_enabled', enabled ? 'true' : 'false', 'AI');
}

/**
 * Henter alle chatsesjoner for admin.
 */
export async function getAllChatSessions(): Promise<ChatSession[]> {
  await ensureSessionsLoaded();
  return Object.values(inMemorySessions).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

/**
 * Henter eller oppretter en chat-sesjon.
 */
export async function getOrCreateChatSession(sessionId: string): Promise<ChatSession> {
  await ensureSessionsLoaded();
  if (inMemorySessions[sessionId]) {
    return inMemorySessions[sessionId];
  }

  const globalAi = await getGlobalAiChatbotStatus();
  const newSession: ChatSession = {
    id: sessionId,
    aiEnabled: globalAi,
    status: 'active',
    topic: 'GENERELT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    unreadByAdmin: false,
    messages: [],
  };

  inMemorySessions[sessionId] = newSession;
  await persistSessions();
  return newSession;
}

/**
 * Legger til en melding fra en besøkende i sesjonen.
 */
export async function addVisitorMessage(
  sessionId: string,
  content: string,
  topic: string = 'GENERELT',
  contactInfo?: { name?: string; email?: string }
): Promise<ChatSession> {
  const session = await getOrCreateChatSession(sessionId);

  const msgId = `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newMsg: ChatMessageItem = {
    id: msgId,
    sender: 'visitor',
    content,
    timestamp: new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' }),
  };

  session.messages.push(newMsg);
  session.updatedAt = new Date().toISOString();
  session.unreadByAdmin = true;
  if (topic && topic !== 'GENERELT') {
    session.topic = topic;
  }

  if (contactInfo?.name) session.visitorName = contactInfo.name;
  if (contactInfo?.email) session.visitorEmail = contactInfo.email;

  if (!session.aiEnabled) {
    session.status = 'waiting_admin';
  }

  // Hvis brukeren har lagt igjen kontaktinfo, opprett også automatisk en ContactMessage for admin
  if (contactInfo?.email || contactInfo?.name) {
    try {
      await prisma.contactMessage.create({
        data: {
          name: contactInfo.name || 'Besøkende på Tønsberg-Guiden',
          email: contactInfo.email || 'chat@tonsberglivet.no',
          subject: `Live Chat: ${topic} [${session.id}]`,
          message: content,
        },
      });
    } catch {
      // Ignorer hvis database ikke er tilgjengelig
    }
  }

  await persistSessions();
  return session;
}

/**
 * Legger til et svar fra assistenten (AI) i sesjonen.
 */
export async function addAssistantMessage(
  sessionId: string,
  content: string,
  quickReplies?: Array<{ title: string; payload: string }>
): Promise<ChatSession> {
  const session = await getOrCreateChatSession(sessionId);

  const msgId = `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newMsg: ChatMessageItem = {
    id: msgId,
    sender: 'assistant',
    senderName: 'Tønsberg-Guiden AI',
    content,
    quickReplies,
    timestamp: new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' }),
  };

  session.messages.push(newMsg);
  session.updatedAt = new Date().toISOString();

  await persistSessions();
  return session;
}

/**
 * Legger til et manuelt svar fra admin i sesjonen.
 */
export async function addAdminReply(
  sessionId: string,
  content: string,
  adminName: string = 'Cecilie (Tønsberglivet)'
): Promise<ChatSession> {
  const session = await getOrCreateChatSession(sessionId);

  const msgId = `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newMsg: ChatMessageItem = {
    id: msgId,
    sender: 'admin',
    senderName: adminName,
    content,
    timestamp: new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' }),
  };

  session.messages.push(newMsg);
  session.updatedAt = new Date().toISOString();
  session.unreadByAdmin = false;
  session.status = 'answered_by_admin';

  await persistSessions();
  return session;
}

/**
 * Veksler AI av eller på for en bestemt sesjon.
 */
export async function toggleSessionAi(
  sessionId: string,
  aiEnabled: boolean
): Promise<ChatSession> {
  const session = await getOrCreateChatSession(sessionId);
  session.aiEnabled = aiEnabled;
  session.updatedAt = new Date().toISOString();
  if (!aiEnabled) {
    session.status = 'waiting_admin';
  }
  await persistSessions();
  return session;
}

/**
 * Markerer en sesjon som lest av admin.
 */
export async function markSessionAsRead(sessionId: string): Promise<void> {
  const session = await getOrCreateChatSession(sessionId);
  session.unreadByAdmin = false;
  await persistSessions();
}

/**
 * Henter antall uleste samtaler for admin.
 */
export async function getUnreadChatCount(): Promise<number> {
  await ensureSessionsLoaded();
  return Object.values(inMemorySessions).filter((s) => s.unreadByAdmin).length;
}
