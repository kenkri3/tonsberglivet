import { NextRequest, NextResponse } from 'next/server';
import { requireEditorOrAdmin } from '@/lib/auth';
import {
  getAllChatSessions,
  getOrCreateChatSession,
  addAdminReply,
  toggleSessionAi,
  markSessionAsRead,
  getUnreadChatCount,
  getGlobalAiChatbotStatus,
  setGlobalAiChatbotStatus,
  assignSession,
  unassignSession,
  findAssignableColleague,
  getAssignedToMeCount,
  toPublicSession,
} from '@/lib/live-chat';

export const dynamic = 'force-dynamic';

/**
 * GET /api/agent/live-chat
 *
 * ?sessionId=<id>  — ÅPEN. Den offentlige Tønsberg-Guiden poller sin egen samtale
 *                    for å se svar fra admin. Id-er er tilfeldige (`sess-<ts>-<rand>`).
 *                    Svaret er sanert: tildeling og interne navn følger ikke med.
 * Alt annet (innboks-listen og ulest-telleren) er adminflater og krever
 * innlogging som redaktør eller administrator.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countOnly = searchParams.get('countOnly');
    const sessionId = searchParams.get('sessionId');

    const globalAiEnabled = await getGlobalAiChatbotStatus();

    // 1. Besøkende som henter sin egen samtale — ikke adminbeskyttet.
    if (sessionId) {
      const session = await getOrCreateChatSession(sessionId);
      return NextResponse.json({
        success: true,
        session: toPublicSession(session),
        globalAiEnabled,
      });
    }

    // 2. Innboks og ulest-teller er admininformasjon (navn, e-post, meldinger).
    const auth = requireEditorOrAdmin(request);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const unreadCount = await getUnreadChatCount();
    const assignedToMeCount = await getAssignedToMeCount({
      id: auth.user?.id,
      email: auth.user?.email,
    });

    if (countOnly === 'true') {
      return NextResponse.json({
        success: true,
        unreadCount,
        assignedToMeCount,
        globalAiEnabled,
      });
    }

    const sessions = await getAllChatSessions();
    return NextResponse.json({
      success: true,
      sessions,
      unreadCount,
      assignedToMeCount,
      globalAiEnabled,
    });
  } catch (error: any) {
    console.error('[LiveChat API GET] Feil:', error);
    return NextResponse.json(
      { success: false, error: 'Kunne ikke hente chat-data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agent/live-chat — alle handlinger er administratorhandlinger
 * (svare som admin, skru AI av/på, markere lest, tildele samtaler) og krever
 * innlogging som redaktør eller administrator.
 */
export async function POST(request: NextRequest) {
  const auth = requireEditorOrAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { action } = body;

    if (action === 'admin_reply') {
      const { sessionId, text, adminName } = body;
      if (!sessionId || !text?.trim()) {
        return NextResponse.json(
          { success: false, error: 'Mangler sessionId eller tekst' },
          { status: 400 }
        );
      }
      const updated = await addAdminReply(sessionId, text.trim(), adminName || 'Cecilie (Tønsberglivet)');
      return NextResponse.json({ success: true, session: updated });
    }

    if (action === 'toggle_session_ai') {
      const { sessionId, aiEnabled } = body;
      if (!sessionId) {
        return NextResponse.json(
          { success: false, error: 'Mangler sessionId' },
          { status: 400 }
        );
      }
      const updated = await toggleSessionAi(sessionId, !!aiEnabled);
      return NextResponse.json({ success: true, session: updated });
    }

    if (action === 'toggle_global_ai') {
      const { enabled } = body;
      await setGlobalAiChatbotStatus(!!enabled);
      return NextResponse.json({ success: true, globalAiEnabled: !!enabled });
    }

    if (action === 'mark_read') {
      const { sessionId } = body;
      if (sessionId) {
        await markSessionAsRead(sessionId);
      }
      return NextResponse.json({ success: true });
    }

    // ── Tildeling ────────────────────────────────────────────────────────
    // En samtale kan tildeles en kollega, og sendes videre til en annen når
    // den første ikke kan svare. Mottakeren slås opp i databasen her, slik at
    // navn og e-post i tildelingen alltid er ekte.
    if (action === 'assign_session') {
      const { sessionId, assigneeId, note } = body;
      if (!sessionId) {
        return NextResponse.json({ success: false, error: 'Mangler sessionId' }, { status: 400 });
      }

      const target = await findAssignableColleague(String(assigneeId || ''), {
        id: auth.user?.id,
        email: auth.user?.email,
      });
      if (!target.ok) {
        return NextResponse.json({ success: false, error: target.error }, { status: 400 });
      }

      const updated = await assignSession({
        sessionId,
        assignee: target.user,
        actor: { id: auth.user?.id, name: auth.user?.name, email: auth.user!.email },
        note: typeof note === 'string' ? note : null,
      });
      return NextResponse.json({ success: true, session: updated });
    }

    if (action === 'unassign_session') {
      const { sessionId, note } = body;
      if (!sessionId) {
        return NextResponse.json({ success: false, error: 'Mangler sessionId' }, { status: 400 });
      }
      const updated = await unassignSession({
        sessionId,
        actor: { id: auth.user?.id, name: auth.user?.name, email: auth.user!.email },
        note: typeof note === 'string' ? note : null,
      });
      return NextResponse.json({ success: true, session: updated });
    }

    return NextResponse.json(
      { success: false, error: 'Ugyldig handling' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[LiveChat API POST] Feil:', error);
    return NextResponse.json(
      { success: false, error: 'Kunne ikke fullføre handlingen' },
      { status: 500 }
    );
  }
}
