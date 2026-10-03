import { NextRequest, NextResponse } from "next/server";
import { requireEditorOrAdmin } from "@/lib/auth";
import { probeAutonomousAgent, type AgentProbeResult } from "@/lib/agent-client";

export const dynamic = "force-dynamic";

/**
 * Status for agent-integrasjonen.
 *
 * MERK: Denne ruten svarte tidligere alltid `status:"active"` og hardkodet
 * `features.*: true` for fire egenskaper ingenting verifiserte, samtidig som
 * den avslørte de første/siste fire tegnene av en reserve-nøkkel. Masken er nå
 * fjernet helt, og nøkkelen selv er ute av repoet og rotert – se
 * `src/app/api/bot-frame/route.ts` for hvorfor den ikke skal tilbake.
 *
 * `status` sier fortsatt bare om noe er KONFIGURERT. For å vite om agenten
 * faktisk får hentet data, bruk `?deep=1` (krever admin) – den kjører et ekte
 * verktøykall hele veien gjennom agenten og tilbake til vårt eget MCP-endepunkt.
 */

/** Standardnøkkelen lå tidligere her. Den er fjernet fra repoet og rotert. */

const DEEP_PROBE_TTL_MS = 5 * 60 * 1000;
let lastProbe: { at: number; result: AgentProbeResult } | null = null;

export async function GET(request: NextRequest) {
  const agentApi = process.env.AGENT_API || process.env.NEXT_PUBLIC_AGENT_API || null;
  const environmentConfigured = Boolean(agentApi);

  const notificationWebhook =
    process.env.SLACK_WEBHOOK_URL ||
    process.env.AGENT_WEBHOOK_URL ||
    process.env.TEAMS_WEBHOOK_URL ||
    process.env.DISCORD_WEBHOOK_URL ||
    null;

  const body: Record<string, unknown> = {
    success: true,
    status: environmentConfigured ? 'active' : 'not_configured',
    environmentConfigured,
    // Aldri nøkkelbiter her – ruten er åpen for alle. Vi oppgir heller ikke
    // lenger om nøkkelen er «den kjente», for det finnes ikke noen kjent
    // standardnøkkel i repoet etter at den ble fjernet og rotert.
    mcpEndpointConfigured: Boolean(
      process.env.AGENT_MCP_ENDPOINT || process.env.AGENT_MCP_URL
    ),
    // Er vår egen MCP-server lukket for verktøykall uten token?
    // Er denne false, får agenten -32001 på HVERT verktøykall mot oss.
    inboundMcpRequiresKey: Boolean(process.env.MCP_API_KEY),
    // Finnes en lese-only nøkkel? Uten den må agenten ha full skrivetilgang.
    inboundMcpReadOnlyKey: Boolean(process.env.MCP_READONLY_API_KEY),
    // Hvilke utgående transportveier er faktisk satt opp?
    transports: {
      webhook: Boolean(process.env.WEBHOOK_AGENT?.trim().startsWith('http')),
      mcp: Boolean(agentApi),
    },
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
  };

  // Dyp helsesjekk er opt-in: den koster et ekte agent-kall og tar 5–40 sekunder.
  // Editor eller admin – redaktører bruker agenten daglig og skal se ærlig status.
  if (request.nextUrl.searchParams.get('deep') === '1') {
    const auth = requireEditorOrAdmin(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    const cached = lastProbe && Date.now() - lastProbe.at < DEEP_PROBE_TTL_MS ? lastProbe.result : null;
    if (cached) {
      body.health = { ...cached, cached: true };
      return NextResponse.json(body);
    }

    try {
      const result = await probeAutonomousAgent();
      lastProbe = { at: Date.now(), result };
      body.health = { ...result, cached: false };
      body.status = result.toolsWorking ? 'healthy' : result.reachable ? 'degraded' : 'unreachable';
    } catch (err: unknown) {
      body.health = {
        configured: environmentConfigured,
        transport: 'none',
        reachable: false,
        toolsWorking: false,
        degraded: false,
        reason: err instanceof Error ? err.message : 'probe_failed',
        latencyMs: 0,
        checkedAt: new Date().toISOString(),
        cached: false,
      };
      body.status = 'unreachable';
    }
  }

  return NextResponse.json(body);
}
