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

/** Hvem en samtale er tildelt akkurat nå. */
export interface ChatAssignment {
  userId: string;
  userName: string;
  userEmail: string;
  assignedAt: string;
  /** Navnet på den som tildelte – «Cecilie sendte denne til Kenneth». */
  assignedByName?: string;
  /** Valgfri beskjed fra den som sendte samtalen videre. */
  note?: string;
}

/** Én linje i tildelingsloggen. Vises bare internt – aldri til den besøkende. */
export interface ChatAssignmentEvent {
  at: string;
  action: 'assigned' | 'reassigned' | 'released';
  fromUserName?: string | null;
  toUserName?: string | null;
  toUserId?: string | null;
  byName?: string | null;
  note?: string | null;
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
  /** Tom/udefinert = utildelt. Alle nye samtaler starter utildelt. */
  assignment?: ChatAssignment | null;
  assignmentHistory?: ChatAssignmentEvent[];
}

// In-memory cache for ultra-fast response.
//
// MERK: Ingen seedet demosamtale her. En hardkodet «Turist fra Oslo»-sesjon ble
// tidligere lagt inn, persistert til SystemSetting og aldri fjernet. Den ga
// adminpanelet en permanent falsk «1 ny henvendelse»-badge og en oppdiktet
// samtale i innboksen, selv på en helt tom database.
let inMemorySessions: Record<string, ChatSession> = {};

/** Eldre demosamtaler som skal ryddes bort hvis de allerede ligger i databasen. */
const LEGACY_DEMO_SESSION_IDS = new Set(['demo-session-1']);

let loadedFromDb = false;

async function ensureSessionsLoaded(): Promise<void> {
  if (loadedFromDb) return;
  try {
    const raw = await getSetting('live_chat_sessions_db');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        const cleaned: Record<string, ChatSession> = {};
        for (const [id, session] of Object.entries(parsed as Record<string, ChatSession>)) {
          // Fjern den gamle, hardkodede demosamtalen hvis den ligger lagret.
          if (LEGACY_DEMO_SESSION_IDS.has(id)) continue;
          cleaned[id] = session;
        }
        inMemorySessions = { ...inMemorySessions, ...cleaned };
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

// ═══════════════════════════════════════════════════════════════════════════
// TILDELING AV SAMTALER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Kollegene en samtale kan tildeles til.
 *
 * Bevisste valg:
 *  - den innloggede selv er alltid utelatt: du tildeler en samtale til noen
 *    andre, aldri til deg selv. Er du den eneste brukeren, er listen tom.
 *  - «Innsyn» (VIEWER) er utelatt: de kan ikke svare, og skal derfor ikke få
 *    samtaler tildelt.
 *  - inaktive kontoer er utelatt.
 */
export async function listAssignableColleagues(current: {
  id?: string | null;
  email?: string | null;
}): Promise<Array<{ id: string; name: string | null; email: string; role: string; title: string | null }>> {
  const currentEmail = String(current.email || '').toLowerCase();
  const users = await prisma.user.findMany({
    where: {
      active: true,
      role: { in: ['SUPERADMIN', 'ADMIN', 'EDITOR'] as any },
    },
    orderBy: [{ name: 'asc' }, { email: 'asc' }],
    select: { id: true, name: true, email: true, role: true, title: true },
  });

  return users.filter(
    (user) => user.id !== current.id && user.email.toLowerCase() !== currentEmail
  );
}

/**
 * Slår opp mottakeren av en tildeling. Reglene håndheves på serveren – ikke i
 * grensesnittet – slik at en manipulert forespørsel ikke kan tildele en samtale
 * til en inaktiv konto, til en «innsyn»-bruker eller til seg selv.
 */
export async function findAssignableColleague(
  assigneeId: string,
  current: { id?: string | null; email?: string | null }
): Promise<
  | { ok: true; user: { id: string; name: string | null; email: string; role: string; title: string | null } }
  | { ok: false; error: string }
> {
  const id = String(assigneeId || '').trim();
  if (!id) return { ok: false, error: 'Mangler hvem samtalen skal tildeles til.' };

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, title: true, active: true },
  });

  if (!user) return { ok: false, error: 'Fant ikke brukeren du prøver å tildele til.' };
  if (!user.active) return { ok: false, error: `${user.name || user.email} er deaktivert og kan ikke tildeles samtaler.` };
  if (user.role === 'VIEWER') {
    return { ok: false, error: `${user.name || user.email} har nivået «Innsyn» og kan ikke svare på samtaler.` };
  }

  const currentEmail = String(current.email || '').toLowerCase();
  if (user.id === current.id || (currentEmail !== '' && user.email.toLowerCase() === currentEmail)) {
    return { ok: false, error: 'Du kan ikke tildele en samtale til deg selv – velg en kollega.' };
  }

  const { active, ...rest } = user;
  return { ok: true, user: rest };
}

/** Antall samtaler som venter på nettopp denne brukeren. */export async function getAssignedToMeCount(current: {
  id?: string | null;
  email?: string | null;
}): Promise<number> {
  await ensureSessionsLoaded();
  const currentEmail = String(current.email || '').toLowerCase();
  return Object.values(inMemorySessions).filter((session) => {
    const assignment = session.assignment;
    if (!assignment) return false;
    return (
      (current.id && assignment.userId === current.id) ||
      (currentEmail !== '' && assignment.userEmail.toLowerCase() === currentEmail)
    );
  }).length;
}

/** Intern logg over hvem som har hatt samtalen – maks 50 linjer per samtale. */
function pushAssignmentEvent(
  session: ChatSession,
  event: ChatAssignmentEvent
): void {
  const history = [...(session.assignmentHistory || []), event];
  session.assignmentHistory = history.slice(-50);
}

/**
 * Tildeler samtalen til en kollega. Tildeles den til noen andre enn den som
 * allerede har den, logges det som «sendt videre» – det er slik Cecilie kan
 * sende en henvendelse hun ikke kan svare på til en kollega.
 */
export async function assignSession(params: {
  sessionId: string;
  assignee: { id: string; name: string | null; email: string; role?: string | null };
  actor: { id?: string | null; name?: string | null; email: string };
  note?: string | null;
}): Promise<ChatSession> {
  const session = await getOrCreateChatSession(params.sessionId);
  const previous = session.assignment || null;
  const now = new Date().toISOString();
  const note = params.note?.trim() ? params.note.trim().slice(0, 600) : undefined;
  const assigneeName = params.assignee.name || params.assignee.email;
  const actorName = params.actor.name || params.actor.email;

  session.assignment = {
    userId: params.assignee.id,
    userName: assigneeName,
    userEmail: params.assignee.email,
    assignedAt: now,
    assignedByName: actorName,
    note,
  };

  pushAssignmentEvent(session, {
    at: now,
    action: previous && previous.userId !== params.assignee.id ? 'reassigned' : 'assigned',
    fromUserName: previous?.userName || null,
    toUserName: assigneeName,
    toUserId: params.assignee.id,
    byName: actorName,
    note: note || null,
  });

  session.updatedAt = now;
  await persistSessions();
  return session;
}

/** Frigjør samtalen – den blir liggende utildelt i køen igjen. */
export async function unassignSession(params: {
  sessionId: string;
  actor: { id?: string | null; name?: string | null; email: string };
  note?: string | null;
}): Promise<ChatSession> {
  const session = await getOrCreateChatSession(params.sessionId);
  const previous = session.assignment || null;
  const now = new Date().toISOString();
  const actorName = params.actor.name || params.actor.email;
  const note = params.note?.trim() ? params.note.trim().slice(0, 600) : undefined;

  session.assignment = null;
  pushAssignmentEvent(session, {
    at: now,
    action: 'released',
    fromUserName: previous?.userName || null,
    toUserName: null,
    toUserId: null,
    byName: actorName,
    note: note || null,
  });

  session.updatedAt = now;
  await persistSessions();
  return session;
}

/**
 * Versjonen av samtalen som den besøkende kan se.
 *
 * Den offentlige chatten poller sin egen samtale. Tildeling, tildelingslogg og
 * ulest-status er interne arbeidsflater, og navnene på kollegene skal ikke
 * havne i nettleseren til en besøkende.
 */
export function toPublicSession(session: ChatSession) {
  return {
    id: session.id,
    visitorName: session.visitorName,
    aiEnabled: session.aiEnabled,
    status: session.status,
    topic: session.topic,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    messages: session.messages,
  };
}
