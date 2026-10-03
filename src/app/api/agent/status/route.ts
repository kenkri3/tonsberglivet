import { NextRequest, NextResponse } from "next/server";
import { requireEditorOrAdmin } from "@/lib/auth";
import {
  getAgentCapabilityReport,
  probeAutonomousAgent,
  type AgentProbeResult,
} from "@/lib/agent-client";

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
  // All konfigurasjonskunnskap kommer fra én funksjon, slik at status-ruten og
  // chat-ruten ikke kan fortelle brukeren to ulike historier om samme miljø.
  const capabilities = await getAgentCapabilityReport();
  const environmentConfigured = capabilities.configured;

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
    inboundMcpRequiresKey: capabilities.inboundMcpRequiresKey,
    // Finnes en lese-only nøkkel? Uten den må agenten ha full skrivetilgang.
    inboundMcpReadOnlyKey: capabilities.inboundMcpReadOnlyKey,
    // Hvilke utgående transportveier er faktisk satt opp?
    transports: {
      webhook: capabilities.hasWebhook,
      mcp: capabilities.hasMcpKey,
    },
    // Hva grensesnittet kan vise som konkret neste steg når noe mangler.
    configuration: {
      missing: capabilities.missing,
      env: capabilities.env,
      webIntelligence: capabilities.webIntelligence,
      integrations: capabilities.integrations,
      // NB: alt over er miljøvariabler. Nøkler som ligger i databasen
      // (SystemSetting) vises ikke her – se getAgentCapabilityReport.
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

    /**
     * Oversetter et probe-resultat til `status`. Brukes av BÅDE cache-grenen og
     * den ferske grenen – sto det bare i den ene, svarte samme tilstand
     * «not_configured» ved cache-treff og «unreachable» på ferskt svar, og en
     * operatør som leste `status` fikk to ulike historier om samme miljø.
     */
    const applyStatus = (result: AgentProbeResult) => {
      body.status = result.toolsWorking ? 'healthy' : result.reachable ? 'degraded' : 'unreachable';
      // Et miljø uten konfigurasjon er ikke «frakoblet» – det er «ikke satt opp».
      if (!capabilities.configured && result.transport === 'none') {
        body.status = 'not_configured';
      }
      if (result.transport !== 'none') {
        // Den dype sjekken VET hvilken transport den faktisk brukte. La svaret
        // gjenspeile det, så grensesnittet kan skille «ikke satt opp» fra «nede».
        body.transports = {
          webhook: result.transport === 'webhook',
          mcp: result.transport === 'mcp',
        };
      }
    };

    const cached = lastProbe && Date.now() - lastProbe.at < DEEP_PROBE_TTL_MS ? lastProbe.result : null;
    if (cached) {
      body.health = { ...cached, cached: true };
      applyStatus(cached);
      return NextResponse.json(body);
    }

    try {
      const result = await probeAutonomousAgent();
      lastProbe = { at: Date.now(), result };
      body.health = { ...result, cached: false };
      applyStatus(result);
    } catch (err: unknown) {
      // Selve proben feilet. Da vet vi at noe gikk galt – men ikke at miljøet
      // mangler nøkler. Vi skiller derfor de to tilfellene i svaret:
      //   * ingenting er konfigurert  → 'not_configured'
      //   * konfigurert, probe feilet  → 'unknown'
      // Sto det 'unreachable' her, ville et fullt konfigurert miljø blitt
      // feilsøkt som om agenten var nede.
      const transport: AgentProbeResult['transport'] = capabilities.hasWebhook
        ? 'webhook'
        : capabilities.hasMcpKey
        ? 'mcp'
        : 'none';
      body.health = {
        configured: environmentConfigured,
        transport,
        reachable: false,
        toolsWorking: false,
        degraded: false,
        reason: err instanceof Error ? err.message : 'probe_failed',
        latencyMs: 0,
        checkedAt: new Date().toISOString(),
        cached: false,
      };
      body.status = environmentConfigured ? 'unknown' : 'not_configured';
    }
    if (!capabilities.configured) {
      body.status = 'not_configured';
    }
  }

  return NextResponse.json(body);
}
