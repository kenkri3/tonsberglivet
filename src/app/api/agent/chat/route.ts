import { NextRequest, NextResponse } from 'next/server';
import { getEffectiveGeminiApiKey } from '@/lib/ai-config';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import {
  toolBraveSearch,
  toolTavilySearch,
  toolApifyScrape,
  toolGetRealEvents,
  toolCreateRealArticle,
  toolGetRealBookings,
  toolApproveBooking,
  toolGetRealtimeStatus,
  toolSearchBusinesses,
  toolGetVisitorPulse,
  toolExportToDuett,
  AgentExecutionResult,
} from '@/lib/agent-tools';
import { prisma } from '@/lib/prisma';
import { requireEditorOrAdmin } from '@/lib/auth';
import { smartWebSearch } from '@/lib/web-intelligence';
import { queryAutonomousAgent } from '@/lib/agent-client';

export const dynamic = 'force-dynamic';

interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Validerer og normaliserer samtalehistorikken fra klienten.
 * Gemini krever vekslende roller som starter med brukeren, så vi slår sammen
 * påfølgende like roller, dropper tomme/ugyldige elementer og kapper lengden.
 */
function normalizeChatHistory(raw: any): ChatHistoryItem[] {
  if (!Array.isArray(raw)) return [];

  const items: ChatHistoryItem[] = [];
  for (const entry of raw.slice(-12)) {
    const role: ChatHistoryItem['role'] | null =
      entry?.role === 'assistant' ? 'assistant' : entry?.role === 'user' ? 'user' : null;
    const content = typeof entry?.content === 'string' ? entry.content.trim() : '';
    if (!role || !content) continue;

    const trimmed = content.slice(0, 2000);
    const last = items[items.length - 1];
    if (last && last.role === role) {
      last.content = `${last.content}\n${trimmed}`.slice(0, 4000);
    } else {
      items.push({ role, content: trimmed });
    }
  }

  while (items.length > 0 && items[0].role === 'assistant') {
    items.shift();
  }

  return items.slice(-6);
}

// 🛠️ Verktøydeklarasjoner for Google Gemini 2.5 Flash
const toolDeclarations: FunctionDeclaration[] = [
  {
    name: 'sok_nettet_brave',
    description: 'Søk etter sanntidsinformasjon, nyheter, åpningstider og hendelser i Tønsberg og omverdenen med Brave Search API.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'Søkefrase på norsk eller engelsk' },
      },
      required: ['query'],
    },
  },
  {
    name: 'research_tavily',
    description: 'Dyp fakta-research og kildegransking med Tavily AI Search for å finne pålitelige kilder og sammendrag.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'Forskningsspørsmål eller tema' },
      },
      required: ['query'],
    },
  },
  {
    name: 'skrap_nettside_apify',
    description: 'Skrap og les fullt innhold fra en spesifikk URL (f.eks. konsertprogram fra foynhagen.no, osebergkulturhus.no, tonsberg.kommune.no) med Apify.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        url: { type: Type.STRING, description: 'Full URL til nettsiden som skal leses' },
      },
      required: ['url'],
    },
  },
  {
    name: 'hent_live_arrangementer',
    description: 'Hent faktiske, oppdaterte arrangementer for Tønsberg fra databasen, live Ticketmaster og biblioteket.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        dagerFrem: { type: Type.NUMBER, description: 'Hvor mange dager frem i tid det skal søkes (standard 14)' },
      },
    },
  },
  {
    name: 'hent_sanntidsinformasjon',
    description: 'Hent sanntidsdata for Tønsberg: togtider (Entur), sjøtemperatur og flo/fjære (Havvarsel), luftkvalitet og veimeldinger.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'opprett_artikkel_cms',
    description: 'Opprett en ekte redaksjonell artikkel eller helgeguide i Tønsberglivets CMS database.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'Tittel på artikkelen' },
        excerpt: { type: Type.STRING, description: 'Kort ingress (1-2 setninger)' },
        content: { type: Type.STRING, description: 'Fullstendig brødtekst i markdown-format' },
        category: {
          type: Type.STRING,
          enum: ['BYLIVET', 'HVERDAGSLIVET', 'NAERINGSLIVET', 'REISELIVET', 'STUDENTLIVET'],
          description: 'Hovedkategori for saken',
        },
        published: { type: Type.BOOLEAN, description: 'True for umiddelbar publisering, false for utkast (standard false)' },
      },
      required: ['title', 'content'],
    },
  },
  {
    name: 'hent_ventende_torvleie',
    description: 'Hent faktiske ventende søknader om leie av standplass på Tønsberg Torv eller Kaldnes Brygge.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'godkjenn_torvleie_booking',
    description: 'Godkjenn en reell torvleiesøknad i databasen, send automatisk bekreftelse og rigginstruks til leietaker. Krever eksplisitt bookingId – godkjenner aldri en tilfeldig søknad.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        bookingId: { type: Type.STRING, description: 'Påkrevd booking-ID hentet fra hent_ventende_torvleie (f.eks. «cmabc123»). Kall hent_ventende_torvleie først hvis du ikke vet ID-en.' },
      },
      required: ['bookingId'],
    },
  },
  {
    name: 'sok_bedrifter_og_brreg',
    description: 'Søk i lokale bedrifter i Tønsberg samt foretaksdata i Brønnøysundregistrene (Enhetsregisteret).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'Bedriftsnavn eller bransje' },
      },
      required: ['query'],
    },
  },
  {
    name: 'analyser_publikumshenvendelser',
    description: 'Analyser hva innbyggere og turister spør om i chatboten på landingssiden (Tønsberg-Guiden) for å identifisere innholdsbehov.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'eksporter_til_duett',
    description: 'Klargjør og synkroniser fakturagrunnlag for godkjente torvleier til Duett ERP (Peppol EHF 3.0).',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
];

/**
 * Utfører et deklarert verktøykall mot det virkelige systemet
 */
async function executeAgentTool(name: string, args: any): Promise<AgentExecutionResult> {
  switch (name) {
    case 'sok_nettet_brave':
      return await toolBraveSearch(args?.query || 'Tønsberg');
    case 'research_tavily':
      return await toolTavilySearch(args?.query || 'Tønsberg');
    case 'skrap_nettside_apify':
      return await toolApifyScrape(args?.url || '', args?.instructions);
    case 'hent_live_arrangementer':
      return await toolGetRealEvents(args?.dagerFrem || 14);
    case 'hent_sanntidsinformasjon':
      return await toolGetRealtimeStatus();
    case 'opprett_artikkel_cms':
      return await toolCreateRealArticle({
        title: args.title,
        excerpt: args.excerpt,
        content: args.content,
        category: args.category || 'BYLIVET',
        published: args.published ?? false,
      });
    case 'hent_ventende_torvleie':
      return await toolGetRealBookings();
    case 'godkjenn_torvleie_booking':
      return await toolApproveBooking(args?.bookingId);
    case 'sok_bedrifter_og_brreg':
      return await toolSearchBusinesses(args?.query || 'Tønsberg');
    case 'analyser_publikumshenvendelser':
      return await toolGetVisitorPulse();
    case 'eksporter_til_duett':
      return await toolExportToDuett();
    default:
      return {
        toolName: name,
        success: false,
        message: `Ukjent verktøy: ${name}`,
        data: null,
      };
  }
}

/**
 * POST /api/agent/chat — den autonome agenten bak adminpanelets Co-Pilot
 * og Agent Hub.
 *
 * Denne ruten UTFØRER verktøy: oppretter og publiserer artikler og
 * arrangementer, oppdaterer bedrifter, godkjenner torvleie (som sender
 * bekreftelse på e-post) og synkroniserer til Duett ERP. Den MÅ derfor ikke
 * være åpen. Alle kjente konsumenter er adminflater
 * (src/app/admin/agent/page.tsx og TonsbergAgentChat i admin-layouten), så
 * kravet bryter ingen legitime kallere.
 */
export async function POST(request: NextRequest) {
  const auth = requireEditorOrAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const message = (body.message || '').trim();
    const history: ChatHistoryItem[] = normalizeChatHistory(body.history);
    const sessionId = String(body.sessionId || `session-${Date.now()}`);
    const userName = body.userName || 'Cecilie';

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Ingen melding oppgitt' },
        { status: 400 }
      );
    }

    let replyText = '';
    const quickReplies: Array<{ title: string; payload: string }> = [];
    let actionExecuted: string | null = null;
    let actionResult: any = null;

    const lower = message.toLowerCase();

    // ═══════════════════════════════════════════════════════════════
    // 🤖 0. HOVEDMOTOR: AUTONOM AGENT (MCP / WEBHOOK VIA AGENT_API)
    // ═══════════════════════════════════════════════════════════════
    const duettExportIntent =
      lower.includes('duett') &&
      (lower.includes('eksporter') ||
        lower.includes('eksport') ||
        lower.includes('overfør') ||
        lower.includes('overfor') ||
        lower.includes('klargjør') ||
        lower.includes('klargjor'));

    // «godkjenn …» med torvleie-kontekst, eller «godkjenn 123» (id-lignende tall).
    // Selve id-en må fortsatt oppgis eksplisitt med # eller «id».
    const approveIntent =
      lower.includes('godkjenn') &&
      (lower.includes('torvleie') ||
        lower.includes('booking') ||
        lower.includes('søknad') ||
        /(?:^|\s)godkjenn\s+(?:#|nr\.?\s*)?\d+/.test(lower));

    const isDirectSystemAction =
      lower.startsWith('opprett artikkel') ||
      lower.startsWith('opprett som artikkel') ||
      lower.startsWith('lagre artikkel') ||
      approveIntent ||
      duettExportIntent;

    if (!isDirectSystemAction) {
      try {
        const agentResponse = await queryAutonomousAgent({
          message,
          sessionId,
          userName,
        });

        if (agentResponse && agentResponse.success && agentResponse.reply) {
          replyText = agentResponse.reply;
          if (agentResponse.quickReplies && agentResponse.quickReplies.length > 0) {
            quickReplies.push(...agentResponse.quickReplies);
          }
        }
      } catch (agentErr: any) {
        console.warn('[Agent Chat API] Autonom agent gateway feilet:', agentErr?.message);
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // ⚡ 1. HURTIGHÅNDTERING AV EKSPLISITTE SYSTEMHANDLINGER I CMS
    // ═══════════════════════════════════════════════════════════════
    if (!replyText) {
      // A. Direkte opprettelse av artikkel i databasen
      if (
        lower.startsWith('opprett artikkel') ||
        lower.startsWith('opprett som artikkel') ||
        lower.startsWith('lagre artikkel')
      ) {
      let articleTitle = message
        .replace(/^(?:opprett\s+som\s+artikkel|opprett\s+artikkel|lagre\s+som\s+artikkel|lagre\s+artikkel)[:\s–-]*/i, '')
        .trim();
      if (!articleTitle || articleTitle.length < 3) {
        articleTitle = 'Bylivet i Tønsberg: Helgens høydepunkter, scener og byrom';
      }

      // Hent ferske arrangementer for å fylle reelt innhold
      const eventsRes = await toolGetRealEvents(7);
      const eventsList = (eventsRes.data || [])
        .map((e: any) => `- **${e.title}** (${e.location}, ${e.date} kl. ${e.time})`)
        .join('\n');

      const realContent = `## ${articleTitle}\n\nTønsberg yrer av liv med konserter, markeder og opplevelser langs Brygga og i sentrumsgatene.\n\n### Aktuelle arrangementer i kalenderen:\n${eventsList || 'Se fullstendig arrangementskalender på tonsberglivet.no.'}\n\n### Mat, drikke og byrom:\nNyt uteserveringen på Brygga, besøk de lokale galleriene og opplev Norges eldste by på sitt aller beste.\n\nVelkommen til Tønsberg!`;

      const createRes = await toolCreateRealArticle({
        title: articleTitle,
        content: realContent,
        excerpt: `Komplett oversikt over ${articleTitle}.`,
        category: 'BYLIVET',
        published: false,
      });

      if (createRes.success) {
        actionExecuted = createRes.actionExecuted || 'article_created';
        actionResult = createRes.actionResult;
        replyText = `✅ **Artikkel er opprettet og lagret i CMS-databasen!**\n\n` +
          `• **Tittel:** «${createRes.data.title}»\n` +
          `• **Status:** Utkast (Klar for redaksjonell godkjenning)\n` +
          `• **Kategori:** ${createRes.data.category}\n` +
          `• **Slug:** \`${createRes.data.slug}\`\n\n` +
          `Saken ligger nå i adminpanelet under **Artikler** og er klar til publisering.`;
        quickReplies.push({ title: '📣 Lag SoMe-pakke', payload: `Lag SoMe-poster for artikkelen «${articleTitle}»` });
        quickReplies.push({ title: '📅 Vis kalender', payload: 'Hent live arrangementer' });
      } else {
        replyText = `❌ ${createRes.message}`;
      }
    }

    // D. Direkte eksport av godkjente torvleier til Duett ERP (må ligge før
    // godkjenn-grenen: «…godkjente torvleier til Duett ERP» inneholder «torvleie»)
    else if (duettExportIntent) {
      const exportRes = await toolExportToDuett();
      if (exportRes.success) {
        actionExecuted = exportRes.actionExecuted || 'duett_synced';
        actionResult = exportRes.actionResult;
        replyText = `${exportRes.message}\n\n` +
          `• **Godkjente avtaler:** ${exportRes.data?.antallAvtaler ?? 0}\n` +
          `• **Beløp eks. mva:** kr ${Number(exportRes.data?.totalBelopEksMva || 0).toLocaleString('nb-NO')},-\n` +
          (Number(exportRes.data?.antallUtenPris || 0) > 0
            ? `• **Mangler pris:** ${exportRes.data?.antallUtenPris} avtale(r) (regnet som 0 kr)\n`
            : '') +
          `• **Klargjort:** ${exportRes.data?.klargjortTid || new Date().toISOString()}\n\n` +
          `Ingen fakturaer er sendt og ingen EHF-fil er laget ennå – selve eksporten kjøres fra Admin > Økonomi.`;
      } else {
        replyText = `ℹ️ ${exportRes.message}`;
      }
      quickReplies.push({ title: '🏛️ Vis godkjente torvleier', payload: 'Hent ventende torvleiesøknader' });
      quickReplies.push({ title: '📊 Publikumspuls', payload: 'Analyser publikumshenvendelser fra nettsiden' });
    }

    // E. Direkte godkjenning av torvleiesøknad i databasen
    else if (approveIntent) {
      // Krev en eksplisitt ID: "godkjenn booking #123" eller "godkjenn torvleie id: 123".
      // Uten ID nekter vi – å godkjenne «eldste ventende» er en irreversibel
      // statusendring som også sender bekreftelses-e-post til feil leietaker.
      const idMatch = message.match(/(?:#\s*|(?:^|[\s(])id\s*[:=]?\s*)([a-z0-9][a-z0-9_-]*)/i);
      const bookingId = idMatch ? idMatch[1] : undefined;

      if (!bookingId) {
        replyText = `⚠️ **Jeg trenger en eksplisitt booking-ID for å godkjenne.**\n\n` +
          `Jeg gjetter ikke hvilken søknad som skal godkjennes, siden godkjenning er en ` +
          `irreversibel statusendring som også sender bekreftelses-e-post til leietaker.\n\n` +
          `Skriv f.eks. «godkjenn torvleie #<id>» med ID-en fra søknadslisten.`;
        quickReplies.push({ title: '🏛️ Vis ventende søknader', payload: 'Hent ventende torvleiesøknader' });
      } else {
        const approveRes = await toolApproveBooking(bookingId);
        if (approveRes.success) {
          actionExecuted = approveRes.actionExecuted || 'booking_approved';
          actionResult = approveRes.actionResult;
          replyText = `${approveRes.message}\n\nFakturagrunnlag er klargjort for Duett ERP.`;
          quickReplies.push({ title: '💳 Send til Duett ERP', payload: 'Klargjør og overfør godkjente torvleier til Duett ERP' });
          quickReplies.push({ title: '🏛️ Vis resterende søknader', payload: 'Hent ventende torvleiesøknader' });
        } else {
          replyText = `ℹ️ ${approveRes.message}`;
        }
      }
    }

    // F. Publikumsanalyse fra landingsside-chatboten
    else if (
      lower.includes('publikum') ||
      lower.includes('trend') ||
      lower.includes('hva spør') ||
      lower.includes('hva søker') ||
      lower.includes('chatboten på nettsiden')
    ) {
      const pulseRes = await toolGetVisitorPulse();
      const p = pulseRes.data;
      if (!pulseRes.success || !p) {
        replyText = `ℹ️ Kunne ikke hente publikumspuls: ${pulseRes.message}`;
      } else {
        replyText = `📊 **Publikumspuls fra Tønsberg-Guiden (landingsside-chatboten):**\n\n` +
          `• **Registrerte henvendelser siste døgn:** ${p.totalSisteDogn}\n\n` +
          `### 🔥 Mest etterspurte temaer:\n` +
          (p.toppTemaer || []).map((t: any) => `• **${t.topic}:** ${t.antall} henvendelser (${t.prosent})`).join('\n') +
          `\n\n### 💬 Siste spørsmål fra besøkende:\n` +
          (p.ferskeSporsmal || []).map((q: string) => `• «${q}»`).join('\n') +
          `\n\n### 💡 Anbefalte redaksjonelle tiltak:\n` +
          (p.anbefalteTiltak || []).map((a: string) => `👉 ${a}`).join('\n');
      }
      quickReplies.push({ title: '✍️ Skriv helgeguide', payload: 'Generer ukens helgeguide' });
      quickReplies.push({ title: '🏛️ Sjekk torvleiesøknader', payload: 'Hent ventende torvleiesøknader' });
    }
  }

    // ═══════════════════════════════════════════════════════════════
    // 🧠 2. GOOGLE GEMINI 2.5 FLASH MED MULTI-TOOL FUNCTION CALLING
    // ═══════════════════════════════════════════════════════════════
    if (!replyText) {
      const geminiApiKey = await getEffectiveGeminiApiKey();

      if (geminiApiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey: geminiApiKey });

          // Hent sanntidsoversikt over databasen for systemprompt
          const [pendingCount, articlesCount] = await Promise.all([
            prisma.bookingRequest.count({ where: { status: { in: ['NEW', 'PROCESSING'] } } }).catch(() => 0),
            prisma.article.count().catch(() => 0),
          ]);

          const systemInstruction = `Du er den handlekraftige, helautonome AI-agenten for Tønsberglivet (Tønsberglivet OS).
Rolle og formål:
Du bistår Cecilie og ledelsen med å drifte og løfte Tønsberg: skrive artikler og helgeguider, verifisere åpningstider, søke opp omverdensdata, kvalifisere torvleie, lage SoMe-innhold og analysere publikumshenvendelser.

EKTE VERKTØY DU HAR TILGANG TIL VIA FUNKSJONSKALL:
- sok_nettet_brave (Raskt sanntidssøk via Brave Search API)
- research_tavily (Dyp AI-research og faktafangst via Tavily API)
- skrap_nettside_apify (Skrape og lese full nettside via Apify)
- hent_live_arrangementer (Faktiske eventer fra CMS, Ticketmaster og bibliotek)
- hent_sanntidsinformasjon (Entur togtider, Havvarsel badetemperatur/flo, trafikk, luftkvalitet)
- opprett_artikkel_cms (Oppretter faktisk artikkel i Postgres-databasen)
- hent_ventende_torvleie (Reelle søknader fra databasen - akkurat nå: ${pendingCount} ventende)
- godkjenn_torvleie_booking (Faktisk godkjenning i databasen og e-postutsending)
- sok_bedrifter_og_brreg (CMS bedrifter og Brønnøysundregistrene)
- analyser_publikumshenvendelser (Trender fra chatboten på nettsiden)
- eksporter_til_duett (Peppol EHF 3.0 fakturaeksport)

RETNINGSLINJER:
1. Kall alltid de relevante verktøyene når du trenger fakta, søk i nettet, sanntidsdata eller skal utføre en handling.
2. ALDRI finn på fiktive arrangementer eller falske data når du har tilgang til reelle verktøy.
3. Hvis brukeren ber om et søk, bruk enten 'sok_nettet_brave' eller 'research_tavily'.
4. Svar på profesjonelt, engasjerende norsk bokmål med formatering, overskrifter og emojier.`;

          // Tidligere samtaleturer fra klienten (TonsbergAgentChat sender history)
          const historyContents = history.map((item) => ({
            role: item.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: item.content }],
          }));
          const currentTurn = {
            role: 'user' as const,
            parts: [{ text: `${systemInstruction}\n\nBrukerens oppgave: "${message}"` }],
          };

          // Første kall til Gemini med verktøy
          let response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [...historyContents, currentTurn],
            config: {
              tools: [{ functionDeclarations: toolDeclarations }],
            },
          });

          // Håndter verktøykall hvis modellen ber om det
          const functionCalls = response.functionCalls;
          if (functionCalls && functionCalls.length > 0) {
            const toolResultsParts: any[] = [];

            for (const call of functionCalls) {
              if (!call.name) continue;
              const execResult = await executeAgentTool(call.name, call.args);
              if (execResult.actionExecuted) {
                actionExecuted = execResult.actionExecuted;
                actionResult = execResult.actionResult;
              }
              toolResultsParts.push({
                functionResponse: {
                  name: call.name,
                  response: {
                    output: execResult,
                  },
                },
              });
            }

            // Kall modellen på nytt med verktøysvarene for å generere endelig svar
            const followUp = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: [
                ...historyContents,
                currentTurn,
                {
                  role: 'model',
                  parts: functionCalls.map((fc) => ({
                    functionCall: fc,
                  })),
                },
                {
                  role: 'user',
                  parts: toolResultsParts,
                },
              ],
            });

            if (followUp && followUp.text) {
              replyText = followUp.text;
            }
          } else if (response && response.text) {
            replyText = response.text;
          }
        } catch (geminiErr: any) {
          console.warn('[Agent Chat API] Gemini verktøykall feilet:', geminiErr?.message);
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // 🚀 2.5 1MIN.AI MULTI-MODELL MOTOR (OPPKOBLING FRA RAILWAY 1_MIN_AI)
    // ═══════════════════════════════════════════════════════════════
    if (!replyText) {
      try {
        const { createOneMinChatCompletion, getEffectiveOneMinApiKey } = await import('@/lib/onemin-client');
        const oneMinKey = await getEffectiveOneMinApiKey();

        if (oneMinKey) {
          const [pendingCount, articlesCount, eventsRes] = await Promise.all([
            prisma.bookingRequest.count({ where: { status: { in: ['NEW', 'PROCESSING'] } } }).catch(() => 0),
            prisma.article.count().catch(() => 0),
            toolGetRealEvents(14).catch(() => ({ data: [] })),
          ]);

          const allEvents = eventsRes.data || [];

          const oneMinRes = await createOneMinChatCompletion(
            [
              {
                role: 'system',
                content: `Du er den handlekraftige, helautonome AI-agenten for Tønsberglivet (Tønsberglivet OS).
Driftes i samsvar med GDPR og norsk personvernlovgivning.
Du bistår Cecilie og ledelsen med å skrive artikler, helgeguider, verifisere åpningstider, håndtere torvleie og analysere bylivet.

SANNTIDSSTATUS I TØNSBERGLIVET NÅ:
- Ventende torvleiesøknader i databasen: ${pendingCount}
- Registrerte CMS-artikler: ${articlesCount}
- Aktuelle arrangementer i Tønsberg (inkl. Foynhagen, Oseberg Kulturhus, Støperiet, Papirhuset): ${JSON.stringify(allEvents)}
- Web Intelligence: Brave API, Tavily API og Apify er integrert.

INSTRUKSJONER FOR SVAR:
1. Svar alltid på levende, profesjonelt norsk bokmål med Markdown-formatering, overskrifter og emojier.
2. Når du svarer på arrangementsforespørsler eller «Event-Radar», trekk ut de spesifikke scenene (f.eks. Foynhagen og Oseberg Kulturhus), vis dato, klokkeslett, artist/tittel og oppgi direkte klikkbare lenker dersom tilgjengelig.
3. Oppgi alltid kilder for ekstern informasjon.`,
              },
              ...history.map((item) => ({
                role: item.role,
                content: item.content,
              })),
              {
                role: 'user',
                content: message,
              },
            ],
            {
              model: 'gpt-4o-mini',
              maxTokens: 1500,
            }
          );

          if (oneMinRes.success && oneMinRes.content) {
            replyText = oneMinRes.content;
            quickReplies.push({ title: '📰 Opprett som artikkel i CMS', payload: `Opprett som artikkel basert på dette` });
            quickReplies.push({ title: '📣 Lag SoMe-pakke', payload: `Lag SoMe-poster for dette` });
          }
        }
      } catch (oneMinErr: any) {
        console.warn('[Agent Chat API] 1min.AI feilet:', oneMinErr?.message);
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // 🛡️ 3. ROBUST LOKAL MOTOR (HVIS INGEN SKY-KI SVARTE)
    // ═══════════════════════════════════════════════════════════════
    if (!replyText) {
      // Hvis meldingen handler om arrangementer, helg, konserter, event-radar, Foynhagen eller Oseberg
      if (
        lower.includes('arrangement') ||
        lower.includes('helg') ||
        lower.includes('konsert') ||
        lower.includes('hva skjer') ||
        lower.includes('event') ||
        lower.includes('radar') ||
        lower.includes('foynhagen') ||
        lower.includes('oseberg') ||
        lower.includes('kulturhus')
      ) {
        const evRes = await toolGetRealEvents(14);
        const allEvents = evRes.data || [];

        let filteredEvents = allEvents;
        if (lower.includes('foynhagen') || lower.includes('oseberg')) {
          const matched = allEvents.filter((e: any) => {
            const loc = (e.location || '').toLowerCase();
            const tit = (e.title || '').toLowerCase();
            return (
              (lower.includes('foynhagen') && (loc.includes('foynhagen') || tit.includes('foynhagen'))) ||
              (lower.includes('oseberg') && (loc.includes('oseberg') || tit.includes('oseberg')))
            );
          });
          if (matched.length > 0) {
            filteredEvents = matched;
          }
        }

        const sceneLabel = lower.includes('foynhagen') && lower.includes('oseberg')
          ? 'Foynhagen & Oseberg Kulturhus'
          : lower.includes('foynhagen')
          ? 'Foynhagen'
          : lower.includes('oseberg')
          ? 'Oseberg Kulturhus'
          : 'Tønsberg';

        replyText = `📡 **Event-Radar: ${sceneLabel} for kommende uke**\n\n` +
          `Her er de bekreftede arrangementene hentet live fra Ticketmaster og Tønsberglivets arrangementskalender:\n\n` +
          (filteredEvents.length > 0
            ? filteredEvents
                .map(
                  (e: any) =>
                    `• **${e.title}**\n` +
                    `  📍 **Scene/Sted:** ${e.location}\n` +
                    `  🗓️ **Dato & Tid:** ${e.date} kl. ${e.time}\n` +
                    (e.ticketUrl ? `  🎟️ [Kjøp billetter her](${e.ticketUrl})\n` : '') +
                    `  *Kilde: ${e.source}*`
                )
                .join('\n\n')
            : `Fant ingen oppførte arrangementer for ${sceneLabel} i den umiddelbare arrangementskalenderen for denne uken. Besøk [foynhagen.no](https://foynhagen.no) og [osebergkulturhus.no](https://osebergkulturhus.no) for oppdaterte sesongprogram.`) +
          `\n\n💡 *Vil du at jeg skal opprette en helgeguide-artikkel basert på dette i CMS?*`;

        quickReplies.push({ title: '📰 Opprett som artikkel i CMS', payload: 'Opprett som artikkel: Kommende konserter i Tønsberg' });
        quickReplies.push({ title: '📣 Lag SoMe-pakke', payload: 'Lag SoMe-pakke for helgens arrangementer' });
        quickReplies.push({ title: '📅 Vis alle scener', payload: 'Hent live arrangementer' });
      }
      // Hvis meldingen handler om vær, sjø, båt eller transport
      else if (lower.includes('båt') || lower.includes('vær') || lower.includes('sjø') || lower.includes('bade') || lower.includes('tog') || lower.includes('buss')) {
        const rt = await toolGetRealtimeStatus();
        const d = rt.data;
        replyText = `⚓ **Sanntidsstatus for Tønsberg:**\n\n` +
          (d?.sjoOgVar
            ? `### 🌊 Sjø og badevann:\n• **Vanntemperatur:** ${d.sjoOgVar.sjoTemperatur}\n• **Bølgehøyde:** ${d.sjoOgVar.bolgehoyde}\n• **Vannstand:** ${d.sjoOgVar.vannstand}\n\n`
            : '') +
          (d?.togAvganger && d.togAvganger.length > 0
            ? `### 🚆 Neste togavganger fra Tønsberg Stasjon:\n` +
              d.togAvganger.map((t: any) => `• **${t.linje}** mot ${t.destinasjon}: Kl. ${t.avgangstid}`).join('\n')
            : '') +
          `\n\n• **Luftkvalitet:** ${d?.luftkvalitet || 'Ingen offisiell måling tilgjengelig'}`;
        quickReplies.push({ title: '📅 Vis arrangementer', payload: 'Hent live arrangementer' });
        quickReplies.push({ title: '🏛️ Sjekk torvleie', payload: 'Hent ventende torvleiesøknader' });
      }
      // Generelt smart svar med reell systemstatus
      else {
        const [pendingBookings, articlesCount] = await Promise.all([
          prisma.bookingRequest.count({ where: { status: { in: ['NEW', 'PROCESSING'] } } }).catch(() => 0),
          prisma.article.count().catch(() => 0),
        ]);

        replyText = `Hei ${userName}! Jeg har behandlet instruksen: **«${message}»**.\n\n` +
          `Jeg er koblet direkte til Tønsberglivets produksjonsdatabase og sanntidsverktøy:\n\n` +
          `• **Torvleie:** ${pendingBookings} ventende søknader i systemet\n` +
          `• **CMS-artikler:** ${articlesCount} registrerte artikler\n` +
          `• **Web Intelligence:** Brave Search, Tavily AI Research og Apify Scraper er klargjort\n` +
          `• **Sanntidsdata:** Entur (tog), Havvarsel (sjøtemp), Ticketmaster (live scener)\n\n` +
          `Velg en handling for å utføre oppgaven umiddelbart med ekte data:`;

        quickReplies.push({ title: '🔍 Søk i omverdenen', payload: `Gjør et nettsøk etter nyheter om ${message} via Brave eller Tavily` });
        quickReplies.push({ title: '📅 Hent ekte arrangementer', payload: 'Hent live arrangementer' });
        quickReplies.push({ title: '📊 Publikumspuls fra nettsiden', payload: 'Analyser publikumshenvendelser fra nettsiden' });
        quickReplies.push({ title: '🏛️ Sjekk torvleie', payload: 'Hent ventende torvleiesøknader' });
      }
    }

    // Sikre dynamiske hurtigvalg
    if (quickReplies.length === 0) {
      quickReplies.push({ title: '📅 Live arrangementer', payload: 'Hent live arrangementer' });
      quickReplies.push({ title: '🔍 Brave-søk', payload: 'Gjør et Brave-søk etter siste nytt i Tønsberg' });
      quickReplies.push({ title: '📊 Publikumspuls', payload: 'Analyser publikumshenvendelser fra nettsiden' });
      quickReplies.push({ title: '🏛️ Torvleiestatus', payload: 'Hent ventende torvleiesøknader' });
    }

    return NextResponse.json({
      success: true,
      reply: replyText,
      quickReplies: quickReplies.slice(0, 4),
      actionExecuted,
      actionResult,
    });
  } catch (error: any) {
    console.error('[Agent Chat API] Uventet feil:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Serverfeil' },
      { status: 500 }
    );
  }
}
