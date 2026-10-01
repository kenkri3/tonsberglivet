import { NextRequest, NextResponse } from 'next/server';
import {
  getAllChatSessions,
  getOrCreateChatSession,
  addAdminReply,
  toggleSessionAi,
  markSessionAsRead,
  getUnreadChatCount,
  getGlobalAiChatbotStatus,
  setGlobalAiChatbotStatus,
} from '@/lib/live-chat';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countOnly = searchParams.get('countOnly');
    const sessionId = searchParams.get('sessionId');

    const globalAiEnabled = await getGlobalAiChatbotStatus();
    const unreadCount = await getUnreadChatCount();

    if (countOnly === 'true') {
      return NextResponse.json({
        success: true,
        unreadCount,
        globalAiEnabled,
      });
    }

    if (sessionId) {
      const session = await getOrCreateChatSession(sessionId);
      return NextResponse.json({
        success: true,
        session,
        globalAiEnabled,
      });
    }

    const sessions = await getAllChatSessions();
    return NextResponse.json({
      success: true,
      sessions,
      unreadCount,
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

export async function POST(request: NextRequest) {
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
