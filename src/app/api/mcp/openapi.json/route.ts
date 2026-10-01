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
        'Verktøy og endepunkter for autonome agenter tilknyttet Tønsberglivet: arrangementer, bedrifter, artikler, torvleie og bykontekst.',
      version: '1.0.0',
    },
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
                    startDate: { type: 'string', description: 'Startdato (YYYY-MM-DD)' },
                    location: { type: 'string', description: 'Sted' },
                    category: { type: 'string', description: 'Kategori' },
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
          },
        },
      },
      '/api/mcp': {
        post: {
          summary: 'MCP JSON-RPC 2.0 endpoint',
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
            '200': { description: 'JSON-RPC response' },
          },
        },
      },
    },
  };

  return NextResponse.json(openApiSpec, { headers: CORS_HEADERS });
}
