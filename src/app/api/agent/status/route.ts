import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Status for agent-integrasjonen.
 *
 * MERK: Denne ruten svarte tidligere alltid `status:"active"` og hardkodet
 * `features.*: true` for fire egenskaper ingenting verifiserte, samtidig som
 * den avslørte de første/siste fire tegnene av en innsjekket reserve-nøkkel.
 * Nå utledes både status og egenskapene fra hva som faktisk er konfigurert,
 * og bot-ID-en maskeres bare når den finnes.
 */
export async function GET() {
  const agentApi = process.env.AGENT_API || process.env.NEXT_PUBLIC_AGENT_API || null;
  const environmentConfigured = Boolean(agentApi);

  const notificationWebhook =
    process.env.SLACK_WEBHOOK_URL ||
    process.env.AGENT_WEBHOOK_URL ||
    process.env.TEAMS_WEBHOOK_URL ||
    process.env.DISCORD_WEBHOOK_URL ||
    null;

  return NextResponse.json({
    success: true,
    status: environmentConfigured ? 'active' : 'not_configured',
    environmentConfigured,
    // Vi røper ikke en nøkkel som ikke er satt.
    maskedBotId: agentApi ? `${agentApi.slice(0, 4)}...${agentApi.slice(-4)}` : null,
    features: {
      // /api/bot-frame og den innebygde chatten finnes uavhengig av nøkkel.
      iframeEmbedding: true,
      webWidget: true,
      // Krever en konfigurert agent-gateway.
      autonomousDispatch: environmentConfigured,
      // Krever en varslingskanal (Slack/Teams/Discord/webhook).
      multiChannelReady: Boolean(notificationWebhook),
    },
    timestamp: new Date().toISOString(),
  });
}
