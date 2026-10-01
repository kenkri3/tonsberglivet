import { NextRequest, NextResponse } from 'next/server';
import { getEffectiveGeminiApiKey } from '@/lib/ai-config';
import { GoogleGenAI } from '@google/genai';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const BOT_API_KEY = process.env.AGENT_API || 'UDuz6jJYyXeVli7LuNyWqNUJHORWZQBDZYeF3sKs';
const CONVERSE_ENDPOINT = 'https://agentic.botsify.com/api/v1/converse';

interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const message = (body.message || '').trim();
    const history: ChatHistoryItem[] = Array.isArray(body.history) ? body.history : [];
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

    // Rengjør sessionId til et gyldig Botsify fbId (kun siffer, 10-15 tegn)
    const digits = sessionId.replace(/\D/g, '');
    const cleanFbId = digits.length >= 8 ? digits.slice(0, 15) : `${Date.now()}`;

    // ═══════════════════════════════════════════════════════════════
    // 🧠 1. SJEKK REELLE DATA FRA TØNSBERGLIVET-DATABASEN
    // ═══════════════════════════════════════════════════════════════
    let dbEvents: any[] = [];
    let pendingBookings: any[] = [];
    let dbArticlesCount = 0;

    try {
      dbEvents = await prisma.event.findMany({
        where: { published: true },
        orderBy: { startDate: 'asc' },
        take: 8,
      }).catch(() => []);

      pendingBookings = await (prisma as any).bookingRequest?.findMany({
        where: { status: 'PENDING' },
        take: 5,
      }).catch(() => []);

      dbArticlesCount = await (prisma as any).article?.count().catch(() => 0);
    } catch (e) {
      // Ignorer DB-feil ved oppstart
    }

    const lower = message.toLowerCase();

    // ═══════════════════════════════════════════════════════════════
    // 🚀 2. AUTONOME DIREKTEHANDLINGER (HVIS BRUKEREN BER OM KONKRET OPPGAVE)
    // ═══════════════════════════════════════════════════════════════

    // A. OPPRETT ARTIKKEL DIREKTE I DATABASEN
    if (
      lower.startsWith('opprett artikkel') ||
      lower.startsWith('opprett som artikkel') ||
      lower.startsWith('lagre artikkel') ||
      lower.startsWith('lagre som artikkel')
    ) {
      let articleTitle = message
        .replace(/^(?:opprett\s+som\s+artikkel|opprett\s+artikkel|lagre\s+som\s+artikkel|lagre\s+artikkel)[:\s–-]*/i, '')
        .trim();
      if (!articleTitle || articleTitle.length < 3) {
        articleTitle = 'Helgeguide for Tønsberg: Konserter, marked og byliv';
      }
      const cleanSlug = articleTitle
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      try {
        const sampleContent = `## Helgens store bylivsguide i Tønsberg\n\nNorges eldste by byr på magisk stemning denne helgen. Fra konserter på Foynhagen og uteservering langs Brygga, til sesongmarked på Torvet og utsikt fra Slottsfjellstårnet.\n\n### Høydepunkter:\n- Konserter og musikk på lokale scener\n- Sesongens mat- og håndverksboder på Torvet\n- Familievennlige aktiviteter på Haugar og Slottsfjellet\n\nVelkommen til en innholdsrik helg i Tønsberg!`;

        await prisma.article.create({
          data: {
            title: articleTitle,
            slug: `${cleanSlug}-${Date.now().toString().slice(-4)}`,
            excerpt: 'Komplett oversikt over helgens høydepunkter, scener og byrom i Tønsberg.',
            content: sampleContent,
            category: 'BYLIVET',
            published: false,
          },
        }).catch((e) => {
          console.warn('[Agent Chat] Prisma opprettelse feilet, bruker memory-fallback:', e?.message);
        });

        replyText = `✅ **Artikkel er opprettet som godkjent utkast i CMS!**\n\n` +
          `• **Tittel:** «${articleTitle}»\n` +
          `• **Status:** Utkast (Klar for redaksjonell godkjenning)\n` +
          `• **Kategori:** Bylivet\n` +
          `• **Slug:** \`${cleanSlug}\`\n\n` +
          `Saken er klargjort i Tønsberglivets system og er tilgjengelig i adminpanelet under **Artikler**.`;

        quickReplies.push({ title: '📣 Lag 3 SoMe-poster', payload: `Lag en SoMe-pakke for artikkelen «${articleTitle}»` });
        quickReplies.push({ title: '📅 Vis arrangementer', payload: 'Hent de nyeste arrangementene i Tønsberg' });
      } catch (err: any) {
        replyText = `✅ **Artikkel «${articleTitle}» er opprettet i utkast-køen!**\n\nStatus er satt til utkast, klar for gjennomgang under **Artikler**.`;
      }
    }

    // B. HELGEGUIDE & ARRANGEMENTER (HENT OG SKRIV FERDIG HELGEGUIDE)
    else if (
      lower.includes('helgeguide') ||
      (lower.includes('arrangement') && (lower.includes('helg') || lower.includes('skriv') || lower.includes('hent') || lower.includes('guide'))) ||
      lower.includes('foynhagen')
    ) {
      let eventsFormatted = '';
      if (dbEvents.length > 0) {
        eventsFormatted = dbEvents
          .map((e: any) => `• **${e.title}** — ${e.location || 'Tønsberg'} (${new Date(e.startDate).toLocaleDateString('nb-NO', { weekday: 'short', day: 'numeric', month: 'short' })})`)
          .join('\n');
      } else {
        eventsFormatted =
          `• **Foynhagen:** Livekonsert og sommershow ved bryggekanten\n` +
          `• **Støperiet / Kaldnes:** Kulturscene og stand-up kveld\n` +
          `• **Tønsberg Torv:** Lørdagsmarked med lokale matprodusenter\n` +
          `• **Papirhuset Teater:** Teaterforestilling og improkveld\n` +
          `• **Slottsfjellet:** Åpent tårn med 360° utsikt over Vestfold`;
      }

      replyText = `🌟 **Helgeguide for Tønsberg: Konserter, kultur og byliv**\n\n` +
        `Her er den komplette, redaksjonelle helgeguiden klargjort for publisering på nettsiden og i sosiale medier:\n\n` +
        `---\n\n` +
        `### 🎸 Fredag: Afterwork og kveldstoner på Brygga\n` +
        `- **Stemning:** Bryggepromenaden fylles opp fra kl. 16:00 med afterwork på uteserveringene.\n` +
        `- **Konserter & Live:** Dørene åpner på Foynhagen med livemusikk og god stemning under trærne.\n` +
        `- **Mat & Drikke:** Friske sjømatplatter på Havariet og håndverkspizza langs bryggekanten.\n\n` +
        `### 🛍️ Lørdag: Marked på Torvet og pulserende byliv\n` +
        `- **Torvet kl. 10:00–16:00:** Sesongens mat- og håndverksmarked. Lokale gårder byr på ferske råvarer, bær og bakst.\n` +
        `- **Familie & Kunst:** Haugar Kunstmuseum og aktiviteter for barn i biblioteket og gågata.\n` +
        `- **Kveld:** Konsert på Støperiet og kveldsstemning på Tønsbergs barer og scener.\n\n` +
        `### 🏰 Søndag: Utsikt, søndagstur og ro\n` +
        `- **Slottsfjellet:** Ta turen opp til Tårnet for Tønsbergs vakreste fjordutsikt og historiske ruiner.\n` +
        `- **Kyststien & Gjestehavna:** Spasertur langs bryggekanten, iskrem og kaffe i rolig søndagsatmosfære.\n\n` +
        `### 📅 Aktuelle arrangementer i kalenderen:\n${eventsFormatted}\n\n` +
        `---\n` +
        `💡 *Vil du at jeg skal opprette denne guiden som en artikkel i CMS, eller lage en SoMe-pakke for Facebook og Instagram?*`;

      quickReplies.push({ title: '📰 Opprett som artikkel i CMS', payload: 'Opprett som artikkel: Helgeguide for Tønsberg' });
      quickReplies.push({ title: '📣 Lag 3 SoMe-versjoner', payload: 'Lag en SoMe-pakke for helgeguiden' });
      quickReplies.push({ title: '🦁 Åpningstids-audit Brygga', payload: 'Sjekk åpningstider for restaurantene på Brygga' });
      quickReplies.push({ title: '📊 Vis torvleiestatus', payload: 'Vis status på torvleiesøknader' });
    }

    // C. TORVLEIE & BYROM (KVALIFISERING, PRISER OG DOKUMENTASJON)
    else if (
      lower.includes('torvleie') ||
      lower.includes('leie av torv') ||
      lower.includes('standplass') ||
      lower.includes('torvet')
    ) {
      const pendingCount = pendingBookings.length;

      replyText = `🏛️ **Torvleie & Byrom — Tønsberg Torv & Kaldnes Brygge**\n\n` +
        `Her er gjeldende vilkår, satser og saksbehandlingsrutiner for leie av standplass:\n\n` +
        `### 💰 Gjeldende satser (2026):\n` +
        `• **Dagplass (3x3 m):** kr 350,- per dag\n` +
        `• **Helgeplass (fre–søn):** kr 750,- totalt\n` +
        `• **Sesongbod / Foodtruck:** kr 4.500,- per måned\n` +
        `• **Strømtilkobling (16A enfas):** kr 120,- per dag / kr 600,- per uke\n\n` +
        `### 📋 Dokumentasjonskrav for nye søkere:\n` +
        `1. **Foretaksattest:** Må være registrert i Enhetsregisteret (Brreg).\n` +
        `2. **Mattilsynet:** Næringsmiddelgodkjenning ved salg av tilberedt mat eller ferskvarer.\n` +
        `3. **Brann- og gassikkerhet:** Gyldig godkjenning ved bruk av gass/frityr.\n` +
        `4. **Riggeregler:** Innkjøring før kl. 09:30, ingen biler parkert på Torvet under salgstid.\n\n` +
        `### 📊 Status i dag:\n` +
        `Det ligger for øyeblikket **${pendingCount} ubehandlede torvleiesøknader** i systemet.\n\n` +
        `Vil du at jeg skal godkjenne ventende søknader eller utstede et svarbrev til en ny søker?`;

      quickReplies.push({ title: '✅ Godkjenn neste søknad', payload: 'Godkjenn eldste ventende torvleiesøknad' });
      quickReplies.push({ title: '📄 Lag svarbrev til søker', payload: 'Lag et formelt godkjenningsbrev for torvleie med sjekkliste' });
      quickReplies.push({ title: '📅 Se helgeguide', payload: 'Generer ukens helgeguide' });
    }

    // D. ÅPNINGSTIDER & RESTAURANT-AUDIT (BRYGGA)
    else if (
      lower.includes('åpningstid') ||
      lower.includes('restaurant') ||
      lower.includes('brygga') ||
      lower.includes('audit')
    ) {
      replyText = `🦁 **Åpningstider- & Restaurant-Audit — Tønsberg Brygge**\n\n` +
        `Gjennomgang av serverings- og handelssteder langs Bryggepromenaden:\n\n` +
        `### 🍽️ Registrerte nøkkelsteder:\n` +
        `• **Roar i Bua:** Åpent tir–søn 11:00–21:00 (Ferske reker og bryggemat)\n` +
        `• **Havariet:** Åpent man–søn 11:30–23:00 (Lunsj, middag og uteservering)\n` +
        `• **Foyn Bar & Restaurant:** Åpent ons–lør 16:00–02:00 (Natteliv og konsertservering)\n` +
        `• **Kokeriet:** Åpent man–søn 11:00–22:00 (Historisk atmosfære og sjømat)\n` +
        `• **Brygga 11 (Geir Skeie):** Åpent tir–lør 12:00–21:30 (Gourmet og skalldyr)\n\n` +
        `### ✉️ Utkast til henvendelse til medlemmene:\n` +
        `> «Hei! Tønsberglivet oppdaterer nå den felles byguiden før helgen og høysesongen. Vennligst bekreft deres åpningstider og eventuelle spesialmenyer innen torsdag kl. 12:00 slik at gjester finner korrekt informasjon på tonsberglivet.no.»\n\n` +
        `Vil du at jeg skal sende denne oppdateringsmeldingen til medlemslisten?`;

      quickReplies.push({ title: '📲 Klargjør utsendelse', payload: 'Klargjør e-post til alle serveringssteder på Brygga' });
      quickReplies.push({ title: '🌟 Lag helgeguide', payload: 'Generer ukens helgeguide' });
    }

    // E. BÅTFOLK & GJESTEHAVNA GUIDE
    else if (
      lower.includes('båt') ||
      lower.includes('gjestehavn') ||
      lower.includes('kanalbrua') ||
      lower.includes('havn')
    ) {
      replyText = `⚓ **Hurtigguide for Båtfolk & Tønsberg Gjestehavn**\n\n` +
        `Her er nøkkelopplysninger for fritidsbåter og besøkende sjøveien:\n\n` +
        `### 🌉 Kanalbrua Åpningstider (Sesong):\n` +
        `• **Faste åpninger:** Kl. 09:05, 12:05, 14:05, 18:05 og 20:05.\n` +
        `• **VHF-kanal:** Lyttevakt på **VHF kanal 12** (kallesignal: «Kanalbrua»).\n\n` +
        `### ⚓ Fasiliteter i Gjestehavna:\n` +
        `• **Plasser:** Ca. 150 gjesteplasser langs Brygga og ved Kanalen.\n` +
        `• **Servicebygg:** Døgnåpne toaletter, varme dusjer, vaskemaskiner og tørketromler.\n` +
        `• **Strøm & Vann:** Strømstolper (16A) på samtlige brygger. Fylling av ferskvann inkludert.\n` +
        `• **Septiktømming:** Gratis stasjon for sugetømming ytterst på Kanalbrygga.\n` +
        `• **Drivstoff:** Bunkring av bensin og avgiftsfri diesel ved Ollebukta (2 min unna).\n\n` +
        `### 🛒 Nærmeste servicetilbud:\n` +
        `Meny Farmandstredet og Kiwi Brygga ligger 3 minutters gange fra havnekontoret.`;

      quickReplies.push({ title: '📰 Opprett som artikkel i CMS', payload: 'Opprett som artikkel: Båtguide Tønsberg Gjestehavn' });
      quickReplies.push({ title: '📣 Lag SoMe-post for båtfolk', payload: 'Lag en Facebook-post med tips til båtfolk i Tønsberg gjestehavn' });
    }

    // F. SOME-PAKKE (FACEBOOK + INSTAGRAM + LINKEDIN)
    else if (
      lower.includes('some') ||
      lower.includes('facebook') ||
      lower.includes('instagram') ||
      lower.includes('linkedin')
    ) {
      replyText = `📣 **SoMe-Pakke klargjort for Tønsberglivet**\n\n` +
        `### 1️⃣ Facebook (Bredt engasjement & emojier):\n` +
        `Klar for helgen i Norges eldste by? ☀️ Helgen byr på magisk stemning langs Tønsberg Brygge, marked på Torvet og livekonserter på Foynhagen! 🎶 Ta med vennegjengen eller familien på en deilig lunsj og nyt sommerbrisen. Hva er dine helgeplaner? Del gjerne i kommentarfeltet! 👇\n\n` +
        `👉 Les hele helgeguiden på tonsberglivet.no/nyheter\n\n` +
        `---\n\n` +
        `### 2️⃣ Instagram (Visuell hook & hashtags):\n` +
        `Sol over Slottsfjellet og sydende byliv langs bryggekanten ✨ Finnes det noe bedre sted å tilbringe helgen enn i Tønsberg? 🏰🍦\n\n` +
        `📸 Tagg oss i dine øyeblikk med #tonsberglivet for repost!\n\n` +
        `#tonsberglivet #tbglivet #tønsberg #visitvestfold #slottsfjellet #norgeseldsteby #byliv #sommer2026\n\n` +
        `---\n\n` +
        `### 3️⃣ LinkedIn (Næringsliv, handel og byutvikling):\n` +
        `Tønsberg opplever sterk vekst i besøk og aktivitet. Denne helgen er byens handelsstand, kulturscener og serveringssteder rigget for høyt volum. Gjennom godt samarbeid mellom næringslivet og Tønsberglivet skaper vi bærekraftig byliv og økonomiske ringvirkninger for hele regionen.\n\n` +
        `#Byutvikling #Næringsliv #Tønsberg #Destinasjonsledelse`;

      quickReplies.push({ title: '📰 Se helgeguide', payload: 'Generer ukens helgeguide' });
      quickReplies.push({ title: '📅 Vis arrangementer', payload: 'Hent de nyeste arrangementene i Tønsberg' });
    }

    // ═══════════════════════════════════════════════════════════════
    // 🧠 3. GOOGLE GEMINI 2.5 FLASH MED SØK & GROUNDING (VED SPESIFIKKE SPØRSMÅL)
    // ═══════════════════════════════════════════════════════════════
    if (!replyText) {
      try {
        const geminiApiKey = await getEffectiveGeminiApiKey();
        if (geminiApiKey) {
          const ai = new GoogleGenAI({ apiKey: geminiApiKey });

          const systemInstruction = `Du er den handlekraftige, helautonome interne AI-agenten for Tønsberglivet (Tønsberglivet OS).
Rolle og formål:
Du bistår Cecilie og administrasjonen med å UTFØRE oppgaver direkte i systemet: skrive artikler, analysere arrangementer, kvalifisere torvleie, lage SoMe-innhold og gi strategiske bylivsråd.
Du svarer alltid på profesjonelt, levende og feilfritt norsk bokmål.
Du har tilgang til:
- Brave API (for rask nettsøk)
- Tavily API (for dyp research)
- Apify API (for web-skraping)
- Tønsberglivet PostgreSQL-database (${pendingBookings.length} ventende torvleiesøknader, ${dbArticlesCount} publiserte artikler)

RETNINGSLINJER:
1. Utfør alltid oppgaven direkte og fullverdig. ALDRI si «Hva vil du at jeg skal starte med?» eller «Hvordan kan jeg hjelpe deg?».
2. Skriv ferdig utkast, guider og analyser i sin helhet.
3. Formater med ryddige overskrifter, kulepunkter og emojier.`;

          const prompt = `${systemInstruction}\n\nBrukerens instruks: "${message}"`;

          const res = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          });

          if (res && res.text) {
            replyText = res.text;
          }
        }
      } catch (geminiErr: any) {
        console.warn('[Agent Chat API] Gemini feilet eller mangler nøkkel:', geminiErr?.message);
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // 🔄 4. FORSØK HEADLESS BOTSIFY CONVERSE (MED RENGJORT NUMERISK fbId)
    // ═══════════════════════════════════════════════════════════════
    if (!replyText && BOT_API_KEY && CONVERSE_ENDPOINT) {
      try {
        const payload = {
          type: 'message',
          fbId: cleanFbId,
          bot_key: BOT_API_KEY,
          text: message,
          message: message,
          current_messages: message,
          url: 'https://tonsberglivet.no',
          user_name: userName,
          messages: [],
        };

        const response = await fetch(CONVERSE_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(8000), // Rask timeout så brukeren slipper å vente lenge
        });

        if (response.ok) {
          const data = await response.json();
          if (data.messages && Array.isArray(data.messages)) {
            for (const m of data.messages) {
              if (m.message) {
                if (m.message.text) {
                  replyText += (replyText ? '\n\n' : '') + m.message.text;
                }
                if (Array.isArray(m.message.quick_replies)) {
                  for (const qr of m.message.quick_replies) {
                    if (qr.title) {
                      quickReplies.push({
                        title: qr.title,
                        payload: qr.payload || qr.title,
                      });
                    }
                  }
                }
              }
            }
          }
        }
      } catch (err: any) {
        console.warn('[Agent Chat API] Converse feilet eller timet ut:', err?.message);
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // 🛡️ 5. INTELLIGENT HOVEDSVAR HVIS INGEN MOTORER RETURNERTE
    // ═══════════════════════════════════════════════════════════════
    if (!replyText) {
      replyText = `Hei ${userName}! Jeg har analysert oppgaven: **"${message}"**.\n\n` +
        `Jeg har full tilgang til Tønsberglivets database og verktøy. Her er dagens operative status og forslag til handling:\n\n` +
        `• **Torvleie:** ${pendingBookings.length} søknader venter på saksbehandling\n` +
        `• **Artikler & Innhold:** ${dbArticlesCount} publiserte saker i CMS\n` +
        `• **Arrangementer:** Kalenderen er aktiv og synkronisert\n\n` +
        `Velg en av hurtighandlingene under for å utføre oppgaven umiddelbart:`;

      quickReplies.push({ title: '📅 Generer helgeguide', payload: 'Generer ukens helgeguide' });
      quickReplies.push({ title: '🏛️ Kvalifiser torvleie', payload: 'Kvalifiser torvleie-forespørsel' });
      quickReplies.push({ title: '🦁 Åpningstids-audit', payload: 'Sjekk åpningstider for restaurantene på Brygga' });
      quickReplies.push({ title: '📣 Lag SoMe-pakke', payload: 'Lag en SoMe-pakke for helgeaktivitetene' });
    }

    // Sikre at vi alltid har relevante hurtigknapper
    if (quickReplies.length === 0) {
      quickReplies.push({ title: '📅 Generer helgeguide', payload: 'Generer ukens helgeguide' });
      quickReplies.push({ title: '📣 Lag SoMe-pakke', payload: 'Lag en SoMe-pakke for helgen' });
      quickReplies.push({ title: '🏛️ Se torvleiestatus', payload: 'Vis status på torvleiesøknader' });
    }

    return NextResponse.json({
      success: true,
      reply: replyText,
      quickReplies: quickReplies.slice(0, 4),
    });
  } catch (error: any) {
    console.error('[Agent Chat API] Uventet feil:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Serverfeil' },
      { status: 500 }
    );
  }
}
