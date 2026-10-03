import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  const openApiSpec = {
    openapi: '3.0.3',
    info: {
      title: 'Tønsberglivet Agent Integration API',
      description:
        'Verktøy og endepunkter for autonome agenter tilknyttet Tønsberglivet: arrangementer, bedrifter, artikler, torvleie og bykontekst.\n\n' +
        'AUTENTISERING: Begge endepunktene krever legitimasjon — de kan endre CMS-innhold, ' +
        'bedriftsregisteret og torvleievedtak. Bruk enten «Authorization: Bearer <AGENT_WEBHOOK_SECRET / MCP_API_KEY>» ' +
        'eller en innlogget administratorøkt. Slack kan i stedet signere med SLACK_SIGNING_SECRET.',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          description:
            'Delt hemmelighet. AGENT_WEBHOOK_SECRET for /api/agent/webhook. ' +
            'For /api/mcp: MCP_API_KEY gir skrivetilgang til alle verktøy, ' +
            'MCP_READONLY_API_KEY gir bare leseverktøyene.',
        },
        adminSession: {
          type: 'apiKey',
          in: 'cookie',
          name: 'tonsberg_admin_session',
          description: 'Innlogget administrator i adminpanelet.',
        },
      },
    },
    security: [{ bearerAuth: [] }, { adminSession: [] }],
    servers: [
      {
        url: 'https://tonsberglivet-production.up.railway.app',
        description: 'Tønsberglivet Railway Produksjon',
      },
    ],
    paths: {
      '/api/agent/webhook': {
        post: {
          summary: 'Kjør en handling eller oppdatering i Tønsberglivet backend',
          description:
            'Krever Bearer-token (AGENT_WEBHOOK_SECRET), gyldig Slack-signatur (SLACK_SIGNING_SECRET) ' +
            'eller innlogget administrator. Uautorisert kall gir 401.',
          operationId: 'agent_webhook_action',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['action'],
                  properties: {
                    action: {
                      type: 'string',
                      enum: ['upsert_event', 'update_business', 'create_article', 'approve', 'get_context'],
                      description: 'Handling som skal utføres',
                    },
                    title: { type: 'string', description: 'Tittel på arrangement eller artikkel' },
                    startDate: { type: 'string', description: 'Startdato (YYYY-MM-DD eller ISO)' },
                    location: { type: 'string', description: 'Sted' },
                    category: { type: 'string', description: 'Kategori (normaliseres til gyldig enum)' },
                    name: { type: 'string', description: 'Bedriftsnavn' },
                    openingHours: { type: 'string', description: 'Åpningstider' },
                    bookingId: { type: 'string', description: 'ID for torvleie som skal godkjennes' },
                    content: { type: 'string', description: 'Artikkelinnhold i markdown' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Handling utført' },
            '400': { description: 'Ugyldig eller tom forespørsel' },
            '401': { description: 'Manglende eller ugyldig autentisering' },
          },
        },
      },
      '/api/mcp': {
        post: {
          summary: 'MCP JSON-RPC 2.0 endpoint',
          description:
            'initialize og tools/list er åpne for oppdagelse. tools/call krever Bearer-token ' +
            'og svarer ellers med JSON-RPC-feil -32001.\n\n' +
            'TO NØKLER: MCP_API_KEY gir alle 8 verktøy (inkl. publisering, bedriftsendring og ' +
            'godkjenning av torvleie). MCP_READONLY_API_KEY gir bare de fire leseverktøyene ' +
            '(hent_tonsberg_kontekst, hent_ventende_torvleier, sok_steder_og_restauranter, ' +
            'sok_bedrifter_brreg); skrivende kall avvises med -32003 og tools/list viser da ' +
            'bare leseverktøyene. Er MCP_READONLY_API_KEY ikke satt, finnes ingen lesenøkkel.\n\n' +
            'Bruk hent_ventende_torvleier til å finne booking-ID før godkjenn_torvleie – ' +
            'ID-er skal aldri gjettes.',
          operationId: 'mcp_json_rpc',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    jsonrpc: { type: 'string', example: '2.0' },
                    method: { type: 'string', example: 'tools/call' },
                    params: { type: 'object' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'JSON-RPC response (også ved JSON-RPC-feil)' },
          },
        },
      },
    },
  };

  return NextResponse.json(openApiSpec, { headers: CORS_HEADERS });
}
