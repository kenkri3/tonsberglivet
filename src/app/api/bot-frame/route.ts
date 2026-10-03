import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * `?bot_api=` gjorde tidligere denne ruten til en ÅPEN PROXY: hvem som helst
 * kunne be tonsberglivet.no hente hvilken som helst annen bot fra leverandøren
 * og presentere den under vårt domene. Vi godtar derfor bare den konfigurerte
 * nøkkelen.
 *
 * Nøkkelen lå tidligere hardkodet her som en standardverdi. Den gjorde dermed
 * repoet til kilden for en gyldig nøkkel, og repoet er offentlig. Nå kommer den
 * bare fra miljøet, og mangler den, sier vi fra i stedet for å falle tilbake på
 * en kjent verdi.
 */
function resolveBotKey(requested: string | null): { key: string } | { error: string } {
  const configured = process.env.AGENT_API || process.env.NEXT_PUBLIC_AGENT_API;

  if (!configured) {
    return {
      error: 'Bot er ikke konfigurert på serveren. Sett AGENT_API i miljøet.',
    };
  }

  if (!requested) return { key: configured };
  if (requested === configured) return { key: requested };

  return {
    error:
      'Ukjent bot_api. Denne ruten proxier bare Tønsberglivets egen bot. ' +
      'Sett AGENT_API i miljøet for å bytte bot.',
  };
}

export async function GET(req: NextRequest) {
  const resolved = resolveBotKey(req.nextUrl.searchParams.get("bot_api"));
  if ("error" in resolved) {
    return NextResponse.json({ success: false, error: resolved.error }, { status: 400 });
  }
  const botKey = resolved.key;

  const agentHost = process.env.AGENTIC_HOST || ['agentic.', 'bot', 'sify.', 'com'].join('');
  const upstreamUrl = `https://${agentHost}/web-bot/landing/${encodeURIComponent(botKey)}`;

  try {
    const res = await fetch(upstreamUrl, {
      headers: {
        "User-Agent":
          req.headers.get("user-agent") ||
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 TonsberglivetOS/1.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return new NextResponse(`Kunne ikke laste agent-grensesnitt: ${res.statusText}`, {
        status: res.status,
      });
    }

    let html = await res.text();

    // 1. Fjern Cloudflare Rocket Loader tags og normaliser type-attributter
    html = html.replace(/<script[^>]*rocket-loader[^>]*><\/script>/gi, "");
    html = html.replace(/type="[a-f0-9]+-text\/javascript"/gi, 'type="text/javascript"');
    html = html.replace(/type="[a-f0-9]+-module"/gi, 'type="module"');
    html = html.replace(/data-cf-settings="[^"]*"/gi, "");

    // 2. Skjul Google Translate elementet
    html = html.replace(/<div id="google_translate_element"[^>]*><\/div>/gi, "");
    html = html.replace(/<script[^>]*translate\.google\.com[^>]*><\/script>/gi, "");

    // 3. Omdiriger /assets/ til vår egen proxy-rute /api/bot-frame/assets/
    html = html.replace(/src="\/assets\//gi, 'src="/api/bot-frame/assets/');
    html = html.replace(/href="\/assets\//gi, 'href="/api/bot-frame/assets/');

    // 4. Sett virtuell URL til /web-bot/landing/${botKey} slik at Vue router matcher ruten direkte
    const routePatch = `
      <script>
        try {
          if (window.location.pathname !== '/web-bot/landing/${botKey}') {
            window.history.replaceState({}, '', '/web-bot/landing/${botKey}');
          }
        } catch(e) {}
      </script>
      <style>
        body, html { margin: 0; padding: 0; height: 100%; width: 100%; overflow: auto; background: transparent; }
        .goog-te-banner-frame, #goog-gt-tt, .goog-tooltip { display: none !important; }
        body { top: 0 !important; }
      </style>
    `;

    if (html.includes("<head>")) {
      html = html.replace("<head>", `<head>${routePatch}`);
    } else {
      html = routePatch + html;
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Frame-Options": "SAMEORIGIN",
      },
    });
  } catch (error: any) {
    console.error("Feil ved lasting av agent-frame:", error);
    return new NextResponse(`Feil ved kontakt med AI-agenten: ${error.message}`, {
      status: 502,
    });
  }
}
