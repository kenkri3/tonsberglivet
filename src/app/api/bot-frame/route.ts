import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Støtt dynamisk overstyring via query parameter, miljøvariabel AGENT_API, eller standard agent-ID
  const botKey =
    req.nextUrl.searchParams.get("bot_api") ||
    process.env.AGENT_API ||
    process.env.NEXT_PUBLIC_AGENT_API ||
    "";

  const upstreamUrl = `https://agentic.botsify.com/web-bot/frame/${botKey}`;

  try {
    const res = await fetch(upstreamUrl, {
      headers: {
        "User-Agent":
          req.headers.get("user-agent") ||
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 TonsberglivetOS/1.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return new NextResponse(`Kunne ikke laste agent-frame: ${res.statusText}`, {
        status: res.status,
      });
    }

    let html = await res.text();

    // Injiser <base href> slik at relative skript, stilsett, assets og sockets lastes feilfritt
    if (html.includes("<head>")) {
      html = html.replace("<head>", `<head><base href="https://agentic.botsify.com/" />`);
    } else {
      html = `<base href="https://agentic.botsify.com/" />` + html;
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Frame-Options": "SAMEORIGIN",
      },
    });
  } catch (error: any) {
    console.error("Feil ved proxying av agent-frame:", error);
    return new NextResponse(`Feil ved kontakt med AI-agenten: ${error.message}`, {
      status: 502,
    });
  }
}
