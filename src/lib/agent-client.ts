/**
 * Autonom Agent Gateway (MCP & Webhook)
 * Kobler Tønsberglivets systemer direkte til den autonome agenten
 * via AGENT_API og WEBHOOK_AGENT.
 *
 * Agenten svarer alltid «success: true» selv når den ikke fikk tak i dataene
 * sine. En avvist verktøykall (f.eks. 401 fra vårt eget MCP-endepunkt) kommer
 * derfor tilbake som en høflig unnskyldning på norsk – ikke som en feil. Denne
 * filen skiller de to, slik at kalleren kan falle videre til neste motor i
 * stedet for å vise brukeren en unnskyldning som om den var et svar.
 */

export interface AgentResponse {
  success: boolean;
  reply: string;
  quickReplies?: Array<{ title: string; payload: string }>;
  source?: 'webhook' | 'mcp' | 'none';
  error?: string;
  /**
   * Agenten svarte, men svaret er dens egen feilmelding (typisk fordi et
   * verktøykall mot backend ble avvist). `reply` er da brukbar som siste
   * utvei, men bør ikke presenteres som et fullgodt svar.
   */
  degraded?: boolean;
  /** Teknisk årsak, f.eks. 'mcp_unauthorized' eller 'mcp_rpc_error'. */
  reason?: string;
}

/** Resultatet av en ekte helsesjekk mot agenten (brukt av /api/agent/status). */
export interface AgentProbeResult {
  configured: boolean;
  transport: 'webhook' | 'mcp' | 'none';
  /** Fikk vi i det hele tatt kontakt med agenten? */
  reachable: boolean;
  /** Klarte agenten å hente ekte data fra Tønsberglivet (verktøykallet gikk gjennom)? */
  toolsWorking: boolean;
  degraded: boolean;
  reason?: string;
  latencyMs: number;
  replyPreview?: string;
  checkedAt: string;
}

const DEFAULT_MCP_URL = ['https://mcp.', 'bot', 'sify', '.com/agent/mcp'].join('');

/** Tidsbudsjetter. Kan overstyres med miljøvariabler uten ny deploy. */
function readTimeout(name: string, fallback: number): number {
  const raw = Number(process.env[name]);
  if (!Number.isFinite(raw) || raw <= 0) return fallback;
  return Math.min(Math.max(Math.round(raw), 3000), 120000);
}

/**
 * Sikrer at conversation_id har et konsistent 32-tegns format
 */
function toConversationId(sessionId: string): string {
  const clean = sessionId.replace(/[^a-zA-Z0-9]/g, '');
  if (clean.length >= 32) return clean.slice(0, 32);
  return (clean + 'abcdef0123456789abcdef0123456789').slice(0, 32);
}

/**
 * Sjekker om teksten er en teknisk feilmelding fra ekstern agent/server
 * i stedet for et ekte svar til brukeren.
 */
export function isBotErrorMessage(text: string): boolean {
  if (!text || typeof text !== 'string') return true;
  const l = text.toLowerCase().trim();
  return (
    l.includes('failed to get bot response') ||
    l.includes('no response received from server') ||
    l.includes('no response received') ||
    l.includes('internal server error') ||
    l.includes('bad gateway') ||
    l.includes('service unavailable') ||
    l.includes('timed out') ||
    l.startsWith('error:') ||
    l === 'null' ||
    l === 'undefined'
  );
}

/**
 * Gjenkjenner de tilfellene der agenten SVARER, men svaret er dens egen
 * beskrivelse av at den ikke fikk tak i dataene våre. Formuleringene under er
 * Fire varianter observert i produksjon 03.10.2026 – agenten omformulerer seg
 * hver gang, så en fast fraseliste er for skjør:
 *
 *   «…tilkoblingen ble avvist (ugyldig/utløpt tilgang).»
 *   «Kallet mot backend ble avvist: uautorisert (mangler gyldig Bearer-token/MCP_API_KEY…)»
 *   «Jeg fikk dessverre ikke hentet arrangementskalenderen akkurat nå (teknisk feil mot backend).»
 *   «Tilgangen til backendsystemet ble avvist: «Uautorisert: verktøykall krever gyldig
 *    Bearer-token (MCP_API_KEY) eller innlogget administrator».»
 *
 * Det som er stabilt, er at agenten kaller verktøykallet «avvist» og enten
 * siterer VÅR egen feilmelding fra src/app/api/mcp/route.ts (uautorisert /
 * Bearer-token / MCP_API_KEY) eller beskriver en teknisk feil mot backend.
 * Vi matcher derfor på signaler i kombinasjon, ikke på hele setninger.
 */
const AUTH_FAILURE_SIGNALS: RegExp[] = [
  // Vår egen JSON-RPC-feiltekst, sitert ordrett av agenten.
  /verktøykall krever gyldig/i,
  /mcp_api_key/i,
  /bearer-token/i,
  /ugyldig\/utløpt tilgang/i,
  /tilgangen til backendsystemet/i,
  /\buautorisert\b/i,
  /\bunauthorized\b/i,
];

/**
 * Botsifys egen feilmelding når boten ikke har noen MCP-integrasjon i det hele
 * tatt. Dette er en ANNEN feil enn et ugyldig token, og krever en annen fiks:
 * integrasjonen må opprettes (Custom Integration → Server URL + Bearer Token).
 *
 *   «No MCP configuration matched tool … for bot 137265»
 */
const MCP_NOT_CONFIGURED_SIGNALS: RegExp[] = [
  /no mcp configuration matched/i,
  /ikke konfigurert/i,
  /ingen tilkoblet/i,
  /mangler (en )?mcp/i,
  /mcp[-\s]?serveren .{0,40}er ikke (aktivert|konfigurert|tilkoblet)/i,
];

/** Ord som viser at teksten handler om agentens tilgang til VÅRT system. */
const BACKEND_SCOPE_SIGNALS: RegExp[] = [
  /backend/i,
  /\bmcp\b/i,
  /verktøykall/i,
  /\btilgang/i,
  /\bbearer\b/i,
  /sanntidsstatus/i,
  /tilkobling/i,
];

/** Ord som viser at noe faktisk gikk galt – ikke bare et tomt resultat. */
const BACKEND_PROBLEM_SIGNALS: RegExp[] = [
  /avvist/,
  /teknisk feil/,
  /utilgjengelig/,
  /ikke tilgjengelig/,
  /ingen tilgang/,
  /har ikke tilgang/,
  /ikke tilkoblet/,
  /\b(er|var|ble) nede\b/,
  /mangler gyldig/,
  /feilet/,
  /mislyktes/,
  /nektet/,
  /avslått/,
  /fikk ikke (kontakt|svar)/,
];

/** «…klarte/fikk/får ikke hentet …» – agenten innrømmer manglende data. */
const FETCH_FAILURE_SIGNALS: RegExp[] = [
  /\b(fikk|får|klarte|kunne|kan)\b[^.]{0,50}\bikke\b[^.]{0,40}\b(hente|hentet|hente\s+tak|få tak i)\b/,
  /\bikke (fått|fikk) (tak i|hentet)\b/,
  /\bhar ikke tilgang\b/,
  /\bikke tilgang til\b/,
];

function matchesAny(text: string, patterns: RegExp[]): RegExp | undefined {
  return patterns.find((re) => re.test(text));
}

/** Klassifiserer et agent-svar som ekte svar eller selvrapportert feil. */
export function classifyAgentReply(text: string): { degraded: boolean; reason?: string } {
  if (!text || typeof text !== 'string') return { degraded: false };

  // 1. Agenten siterer vår egen autorisasjonsfeil → MCP-tokenet er problemet.
  if (matchesAny(text, AUTH_FAILURE_SIGNALS)) {
    return { degraded: true, reason: 'agent_tool_unauthorized' };
  }

  // 2. Agentplattformen sier at det ikke finnes noen MCP-integrasjon for boten.
  //    Da hjelper det ikke å bytte token – integrasjonen må opprettes.
  if (matchesAny(text, MCP_NOT_CONFIGURED_SIGNALS)) {
    return { degraded: true, reason: 'agent_mcp_not_configured' };
  }

  const inBackendScope = matchesAny(text, BACKEND_SCOPE_SIGNALS);

  // 3. Teksten handler om vår backend OG beskriver en feil.
  if (inBackendScope && matchesAny(text, BACKEND_PROBLEM_SIGNALS)) {
    return { degraded: true, reason: 'agent_tool_backend_error' };
  }

  // 4. Agenten sier at den ikke fikk hentet noe – men bare når teksten også
  //    peker på vårt system. «Jeg fant ingen arrangementer» skal IKKE treffe.
  if (inBackendScope && matchesAny(text, FETCH_FAILURE_SIGNALS)) {
    return { degraded: true, reason: 'agent_tool_backend_error' };
  }

  return { degraded: false };
}

/**
 * Parser responsdata og strukturerte meldinger
 */
function parseAgentResponsePayload(rawText: string): { reply: string; quickReplies: Array<{ title: string; payload: string }> } {
  let cleanText = rawText.trim();
  const quickReplies: Array<{ title: string; payload: string }> = [];

  if (cleanText.startsWith('Bot Response:')) {
    cleanText = cleanText.replace(/^Bot Response:\s*/, '').trim();
  }

  try {
    const parsed = JSON.parse(cleanText);
    const dataItems = Array.isArray(parsed.data) ? parsed.data : [parsed.data || parsed];

    // Enkelte svar har ingen `data`, men tekst rett på rotnivå.
    if (
      dataItems.length === 1 &&
      dataItems[0] === parsed &&
      typeof parsed.text === 'string' &&
      !Array.isArray(parsed.data)
    ) {
      return { reply: parsed.text, quickReplies };
    }

    const textParts: string[] = [];

    for (const item of dataItems) {
      if (!item) continue;
      if (typeof item === 'string') {
        textParts.push(item);
      } else if (typeof item.text === 'string' && item.text.trim()) {
        textParts.push(item.text);
      }

      if (Array.isArray(item.quick_replies)) {
        for (const qr of item.quick_replies) {
          if (qr?.title) {
            quickReplies.push({
              title: String(qr.title),
              payload: String(qr.payload || qr.title),
            });
          }
        }
      }
    }

    if (textParts.length > 0) {
      return {
        reply: textParts.join('\n\n'),
        quickReplies,
      };
    }
  } catch {
    // Ikke JSON, bruk ren tekst
  }

  return {
    reply: cleanText,
    quickReplies,
  };
}

/**
 * 1. Sender forespørsel via WEBHOOK_AGENT
 */
async function callAgentWebhook(
  url: string,
  message: string,
  sessionId: string,
  userName: string
): Promise<AgentResponse | null> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        message,
        question: message,
        query: message,
        session_id: sessionId,
        conversation_id: toConversationId(sessionId),
        userName,
        timestamp: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(readTimeout('AGENT_WEBHOOK_TIMEOUT_MS', 15000)),
    });

    if (!res.ok) {
      console.warn(`[Agent Gateway] Webhook svarte HTTP ${res.status}.`);
      return null;
    }

    const data = await res.json();
    let reply = '';
    const quickReplies: Array<{ title: string; payload: string }> = [];

    if (typeof data === 'string') {
      reply = data;
    } else if (data.data) {
      if (typeof data.data === 'string') {
        reply = data.data;
      } else if (data.data.text) {
        reply = data.data.text;
      } else {
        const parsed = parseAgentResponsePayload(JSON.stringify(data.data));
        reply = parsed.reply;
        quickReplies.push(...parsed.quickReplies);
      }
    } else if (data.message && data.message !== 'Webhook processed successfully') {
      reply = data.message;
    } else if (data.reply) {
      reply = data.reply;
    }

    if (reply && !isBotErrorMessage(reply)) {
      const verdict = classifyAgentReply(reply);
      if (verdict.degraded) {
        console.warn(`[Agent Gateway] Webhook: agenten rapporterte selv en feil (${verdict.reason}).`);
      }
      return {
        success: true,
        reply,
        quickReplies: quickReplies.slice(0, 4),
        source: 'webhook',
        degraded: verdict.degraded,
        reason: verdict.reason,
      };
    } else if (reply) {
      console.warn('[Agent Gateway] Webhook returnerte feilmelding:', reply);
    }
  } catch (err: any) {
    console.warn('[Agent Gateway] Feil ved oppkall til webhook:', err?.message);
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// MCP-transport
// ─────────────────────────────────────────────────────────────────────────────

interface McpSession {
  url: string;
  key: string;
  sessionId: string;
  expiresAt: number;
}

/**
 * MCP-økten gjenbrukes i prosessminnet. Tidligere kjørte vi `initialize` på
 * nytt for hver eneste melding, noe som la en ekstra rundtur til leverandøren
 * foran hvert svar – og skapte en ny økt per spørsmål.
 */
const MCP_SESSION_TTL_MS = 4 * 60 * 1000;
let mcpSession: McpSession | null = null;

function mcpUrl(): string {
  return (
    process.env.AGENT_MCP_ENDPOINT?.trim() ||
    process.env.AGENT_MCP_URL?.trim() ||
    DEFAULT_MCP_URL
  );
}

function invalidateMcpSession(): void {
  mcpSession = null;
}

/**
 * Åpner (eller gjenbruker) en MCP-økt. Returnerer null hvis `initialize`
 * feiler – da er hele transporten nede.
 */
async function openMcpSession(url: string, key: string, force = false): Promise<string | null> {
  if (!force && mcpSession && mcpSession.url === url && mcpSession.key === key && mcpSession.expiresAt > Date.now()) {
    return mcpSession.sessionId;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'Tonsberglivet_OS', version: '1.1' },
      },
    }),
    signal: AbortSignal.timeout(readTimeout('AGENT_MCP_INIT_TIMEOUT_MS', 8000)),
  });

  if (!res.ok) {
    console.warn(`[Agent Gateway] MCP initialize svarte HTTP ${res.status}.`);
    return null;
  }

  const sessionId = res.headers.get('mcp-session-id');
  if (!sessionId) {
    console.warn('[Agent Gateway] MCP-initialize ga ingen mcp-session-id – fortsetter uten økt.');
    return null;
  }

  mcpSession = { url, key, sessionId, expiresAt: Date.now() + MCP_SESSION_TTL_MS };

  // Iht. MCP-standarden skal klienten bekrefte med notifications/initialized.
  // Det er en varsling uten svar – vi venter ikke på den og feiler ikke på den.
  void fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      'mcp-session-id': sessionId,
    },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }),
    signal: AbortSignal.timeout(5000),
  }).catch(() => undefined);

  return sessionId;
}

type McpPayload =
  | { kind: 'text'; text: string }
  | { kind: 'tool_error'; text: string }
  | { kind: 'rpc_error'; code: number; message: string; sessionGone: boolean }
  | { kind: 'empty' };

/**
 * MCP svarer enten som ren JSON eller som SSE (`event: message` + `data: {...}`).
 * Vi leste tidligere bare `result.content`, og kastet dermed ALLE JSON-RPC-feil
 * (f.eks. -32001 Uautorisert) rett i søpla – uten logg og uten spor.
 */
function parseMcpResponse(raw: string): McpPayload {
  const payloads: any[] = [];
  const trimmed = raw.trim();

  const tryPush = (candidate: string) => {
    const text = candidate.trim();
    if (!text || text === '[DONE]') return;
    try {
      payloads.push(JSON.parse(text));
    } catch {
      // Delvis eller ikke-JSON linje – ignorer.
    }
  };

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    tryPush(trimmed);
  } else {
    for (const line of raw.split('\n')) {
      if (line.startsWith('data:')) tryPush(line.replace(/^data:\s*/, ''));
    }
  }

  for (const payload of payloads) {
    if (!payload || typeof payload !== 'object') continue;

    if (payload.error) {
      const code = Number(payload.error.code);
      const message = String(payload.error.message ?? '');
      const sessionGone = code === -32001 && /session/i.test(message);
      return { kind: 'rpc_error', code: Number.isFinite(code) ? code : -32603, message, sessionGone };
    }

    const content = payload?.result?.content;
    if (Array.isArray(content) && content.length > 0) {
      const text = content
        .map((item: any) => (typeof item?.text === 'string' ? item.text : ''))
        .filter(Boolean)
        .join('\n\n');
      if (text) {
        return payload.result?.isError === true
          ? { kind: 'tool_error', text }
          : { kind: 'text', text };
      }
    }

    if (payload?.result?.isError === true) {
      return { kind: 'tool_error', text: JSON.stringify(payload.result) };
    }
  }

  return { kind: 'empty' };
}

/**
 * 2. Kaller agenten via MCP-protokollen med AGENT_API nøkkel
 */
async function callAgentMcp(
  botKey: string,
  message: string,
  sessionId: string
): Promise<AgentResponse | null> {
  const url = mcpUrl();
  const key = botKey.trim();
  const convId = toConversationId(sessionId);
  const requestBody = (id: number) =>
    JSON.stringify({
      jsonrpc: '2.0',
      id,
      method: 'tools/call',
      params: {
        name: 'getBotResponse',
        arguments: {
          question: message,
          conversation_id: convId,
        },
      },
    });

  const send = async (sessionIdHeader: string | null) => {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    };
    if (sessionIdHeader) headers['mcp-session-id'] = sessionIdHeader;

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: requestBody(2),
      signal: AbortSignal.timeout(readTimeout('AGENT_MCP_TIMEOUT_MS', 35000)),
    });

    return res;
  };

  try {
    let session = await openMcpSession(url, key);
    let res = await send(session);

    // En utløpt økt gir typisk 404/410. Da åpner vi en ny og prøver én gang til.
    if (session && (res.status === 404 || res.status === 410)) {
      console.warn(`[Agent Gateway] MCP-økten er utløpt (HTTP ${res.status}) – åpner en ny.`);
      invalidateMcpSession();
      session = await openMcpSession(url, key, true);
      res = await send(session);
    }

    if (!res.ok) {
      console.warn(`[Agent Gateway] MCP tools/call svarte HTTP ${res.status}.`);
      return null;
    }

    const parsed = parseMcpResponse(await res.text());

    switch (parsed.kind) {
      case 'rpc_error': {
        console.warn(`[Agent Gateway] MCP JSON-RPC-feil ${parsed.code}: ${parsed.message}`);
        if (parsed.sessionGone) invalidateMcpSession();
        return null;
      }
      case 'tool_error': {
        const verdict = classifyAgentReply(parsed.text);
        console.warn(`[Agent Gateway] MCP-verktøyet returnerte isError: ${parsed.text.slice(0, 200)}`);
        return {
          success: true,
          reply: parsed.text,
          source: 'mcp',
          degraded: true,
          reason: verdict.reason ?? 'mcp_tool_error',
        };
      }
      case 'empty': {
        console.warn('[Agent Gateway] MCP svarte uten brukbart innhold.');
        return null;
      }
      case 'text':
        break;
    }

    const result = parseAgentResponsePayload(parsed.text);
    if (!result.reply || isBotErrorMessage(result.reply)) {
      console.warn('[Agent Gateway] MCP returnerte feilrespons fra bakenforliggende agent:', result.reply);
      return null;
    }

    const verdict = classifyAgentReply(result.reply);
    if (verdict.degraded) {
      // Agenten svarte, men innrømmer selv at verktøykallet mot oss feilet.
      // Vi logger høyt og flagger svaret, så kalleren kan falle videre.
      console.warn(
        `[Agent Gateway] Agenten fikk ikke utført verktøykall mot backend (${verdict.reason}). ` +
          `Sjekk MCP_API_KEY i Railway og tokenet i agentens MCP-connector.`
      );
    }

    return {
      success: true,
      reply: result.reply,
      quickReplies: result.quickReplies.slice(0, 4),
      source: 'mcp',
      degraded: verdict.degraded,
      reason: verdict.reason,
    };
  } catch (err: any) {
    console.warn('[Agent Gateway] Feil ved MCP-oppkall:', err?.message);
  }

  return null;
}

/**
 * Husker hvilken transport som faktisk svarte godt sist.
 *
 * Produksjon har BÅDE WEBHOOK_AGENT og AGENT_API satt. Rekkefølgen var hardkodet
 * webhook → MCP, så en webhook som henger koster hele tidsavbruddet (15 s) på
 * HVER melding før MCP i det hele tatt prøves. Nå prøver vi den Transporten som
 * virket sist først, og bytter automatisk hvis den slutter å svare.
 */
let preferredTransport: 'webhook' | 'mcp' | null = null;

/**
 * Ruter brukerens oppgave eller spørsmål direkte til den autonome agenten
 */
export async function queryAutonomousAgent(params: {
  message: string;
  sessionId?: string;
  userName?: string;
}): Promise<AgentResponse | null> {
  const { message, sessionId = `sess-${Date.now()}`, userName = 'Cecilie' } = params;

  // Be agenten om alltid å legge ved kildelenker når den finner ekstern info.
  // Instruksen legges bare på når den ikke allerede er nevnt, så den ikke
  // gjentas i agentens samtaleminne for hver melding.
  const promptMessage =
    message.includes('kilde') || message.includes('lenke') || message.includes('url')
      ? message
      : `${message}\n\n(Vennligst oppgi alltid direkte klikkbare kildelenker/URL-er til kildene når du henter informasjon fra utsiden av portalen).`;

  const webhookUrl = process.env.WEBHOOK_AGENT;
  const agentApiKey = process.env.AGENT_API || process.env.NEXT_PUBLIC_AGENT_API;

  const hasWebhook = Boolean(webhookUrl && webhookUrl.trim().startsWith('http'));
  const hasMcp = Boolean(agentApiKey && agentApiKey.trim());

  const order: Array<'webhook' | 'mcp'> =
    preferredTransport === 'mcp' ? ['mcp', 'webhook'] : ['webhook', 'mcp'];

  for (const transport of order) {
    if (transport === 'webhook' && !hasWebhook) continue;
    if (transport === 'mcp' && !hasMcp) continue;

    const res =
      transport === 'webhook'
        ? await callAgentWebhook(webhookUrl!.trim(), promptMessage, sessionId, userName)
        : await callAgentMcp(agentApiKey!.trim(), promptMessage, sessionId);

    if (res?.success && !res.degraded) {
      preferredTransport = transport;
      return res;
    }

    if (res?.degraded) {
      // WEBHOOK_AGENT og AGENT_API går til SAMME agent. Når agenten selv sier at
      // verktøykallet feilet, ligger feilen inne i agenten – ikke i transporten.
      // Å prøve den andre veien ville kjørt samme spørsmål gjennom samme agent en
      // gang til, og kostet 5–20 sekunder for nøyaktig samme svar.
      return res;
    }

    // Hard feil (nettverk/HTTP): da er det nyttig å prøve den andre transporten.
  }

  return null;
}

/**
 * Ekte helsesjekk: stiller agenten et spørsmål som tvinger et verktøykall mot
 * Tønsberglivet. Da tester vi hele kjeden – AGENT_API, MCP-transporten OG
 * agentens egen MCP-connector – i stedet for bare å se om en nøkkel er satt.
 */
export async function probeAutonomousAgent(): Promise<AgentProbeResult> {
  const startedAt = Date.now();
  const webhookUrl = process.env.WEBHOOK_AGENT;
  const agentApiKey = process.env.AGENT_API || process.env.NEXT_PUBLIC_AGENT_API;

  const hasWebhook = Boolean(webhookUrl && webhookUrl.trim().startsWith('http'));
  const hasMcp = Boolean(agentApiKey && agentApiKey.trim());
  const transport: AgentProbeResult['transport'] = hasWebhook ? 'webhook' : hasMcp ? 'mcp' : 'none';

  const base = {
    configured: transport !== 'none',
    transport,
    checkedAt: new Date().toISOString(),
  };

  if (transport === 'none') {
    return {
      ...base,
      reachable: false,
      toolsWorking: false,
      degraded: false,
      reason: 'not_configured',
      latencyMs: Date.now() - startedAt,
    };
  }

  // Spørsmålet krever et verktøykall mot vår egen database.
  const probeQuestion = 'Hvor mange ventende torvleiesøknader ligger i systemet akkurat nå?';

  // Vi gjenbruker den ekte ruteringslogikken i stedet for en egen variant, slik
  // at helsesjekken alltid måler nøyaktig den veien brukerne faktisk går.
  const res = await queryAutonomousAgent({
    message: probeQuestion,
    sessionId: 'health-probe',
    userName: 'Helsesjekk',
  });

  const latencyMs = Date.now() - startedAt;

  if (!res) {
    return {
      ...base,
      reachable: false,
      toolsWorking: false,
      degraded: false,
      reason: 'unreachable',
      latencyMs,
    };
  }

  return {
    ...base,
    reachable: true,
    toolsWorking: !res.degraded,
    degraded: Boolean(res.degraded),
    reason: res.degraded ? res.reason ?? 'agent_reported_tool_failure' : undefined,
    latencyMs,
    replyPreview: res.reply.slice(0, 240),
  };
}
