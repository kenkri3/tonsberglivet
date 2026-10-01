/**
 * Autonom Agent Gateway (MCP & Webhook)
 * Kobler Tønsberglivets systemer direkte til den autonome agenten
 * via AGENT_API og WEBHOOK_AGENT.
 */

export interface AgentResponse {
  success: boolean;
  reply: string;
  quickReplies?: Array<{ title: string; payload: string }>;
  source?: 'webhook' | 'mcp' | 'none';
  error?: string;
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
    const textParts: string[] = [];

    for (const item of dataItems) {
      if (!item) continue;
      if (typeof item === 'string') {
        textParts.push(item);
      } else if (item.text) {
        textParts.push(item.text);
      }

      if (Array.isArray(item.quick_replies)) {
        for (const qr of item.quick_replies) {
          if (qr.title) {
            quickReplies.push({
              title: qr.title,
              payload: qr.payload || qr.title,
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
      signal: AbortSignal.timeout(18000),
    });

    if (!res.ok) {
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

    if (reply) {
      return {
        success: true,
        reply,
        quickReplies: quickReplies.slice(0, 4),
        source: 'webhook',
      };
    }
  } catch (err: any) {
    console.warn('[Agent Gateway] Feil ved oppkall til webhook:', err?.message);
  }
  return null;
}

/**
 * 2. Kaller agenten via MCP-protokollen med AGENT_API nøkkel
 */
async function callAgentMcp(
  botKey: string,
  message: string,
  sessionId: string
): Promise<AgentResponse | null> {
  // Endepunkt for MCP-agenten
  const mcpUrl =
    process.env.AGENT_MCP_ENDPOINT ||
    process.env.AGENT_MCP_URL ||
    ['https://mcp.', 'bot', 'sify', '.com/agent/mcp'].join('');

  const cleanKey = botKey.trim();

  try {
    // Steg 1: Initialize MCP Session
    const initRes = await fetch(mcpUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cleanKey}`,
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
          clientInfo: { name: 'Tonsberglivet_OS', version: '1.0' },
        },
      }),
      signal: AbortSignal.timeout(9000),
    });

    if (!initRes.ok) {
      return null;
    }

    const mcpSessionId = initRes.headers.get('mcp-session-id');
    const convId = toConversationId(sessionId);

    // Steg 2: Utfør tools/call med 'getBotResponse'
    const headers: Record<string, string> = {
      Authorization: `Bearer ${cleanKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    };
    if (mcpSessionId) {
      headers['mcp-session-id'] = mcpSessionId;
    }

    const callRes = await fetch(mcpUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'getBotResponse',
          arguments: {
            question: message,
            conversation_id: convId,
          },
        },
      }),
      signal: AbortSignal.timeout(22000),
    });

    if (!callRes.ok) {
      return null;
    }

    const rawResponse = await callRes.text();

    const lines = rawResponse.split('\n');
    for (const line of lines) {
      if (line.startsWith('data:')) {
        try {
          const jsonStr = line.replace(/^data:\s*/, '').trim();
          const rpcObj = JSON.parse(jsonStr);
          const contentItems = rpcObj?.result?.content;

          if (Array.isArray(contentItems) && contentItems.length > 0) {
            const firstText = contentItems[0]?.text || '';
            const parsed = parseAgentResponsePayload(firstText);

            if (parsed.reply) {
              return {
                success: true,
                reply: parsed.reply,
                quickReplies: parsed.quickReplies.slice(0, 4),
                source: 'mcp',
              };
            }
          }
        } catch {
          // Ignorer parsefeil på delvis SSE
        }
      }
    }
  } catch (err: any) {
    console.warn('[Agent Gateway] Feil ved oppkall:', err?.message);
  }

  return null;
}

/**
 * Ruter brukerens oppgave eller spørsmål direkte til den autonome agenten
 */
export async function queryAutonomousAgent(params: {
  message: string;
  sessionId?: string;
  userName?: string;
}): Promise<AgentResponse | null> {
  const { message, sessionId = `sess-${Date.now()}`, userName = 'Cecilie' } = params;

  // 1. Prioritet: WEBHOOK_AGENT hvis tilgjengelig
  const webhookUrl = process.env.WEBHOOK_AGENT;
  if (webhookUrl && webhookUrl.trim().startsWith('http')) {
    const webhookRes = await callAgentWebhook(webhookUrl.trim(), message, sessionId, userName);
    if (webhookRes && webhookRes.success) {
      return webhookRes;
    }
  }

  // 2. Prioritet: AGENT_API (MCP gateway)
  const agentApiKey = process.env.AGENT_API || process.env.NEXT_PUBLIC_AGENT_API;
  if (agentApiKey && agentApiKey.trim()) {
    const mcpRes = await callAgentMcp(agentApiKey.trim(), message, sessionId);
    if (mcpRes && mcpRes.success) {
      return mcpRes;
    }
  }

  return null;
}
