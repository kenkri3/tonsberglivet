import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const assetPath = Array.isArray(path) ? path.join("/") : path;
  const upstreamUrl = `https://agentic.botsify.com/assets/${assetPath}`;

  try {
    const res = await fetch(upstreamUrl, {
      headers: {
        "User-Agent":
          req.headers.get("user-agent") ||
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 TonsberglivetOS/1.0",
      },
    });

    if (!res.ok) {
      return new NextResponse(`Asset not found: ${res.statusText}`, { status: res.status });
    }

    let contentType = res.headers.get("content-type") || "application/javascript";
    if (assetPath.endsWith(".js")) {
      contentType = "application/javascript; charset=utf-8";
    } else if (assetPath.endsWith(".css")) {
      contentType = "text/css; charset=utf-8";
    } else if (assetPath.endsWith(".png")) {
      contentType = "image/png";
    } else if (assetPath.endsWith(".svg")) {
      contentType = "image/svg+xml";
    } else if (assetPath.endsWith(".woff2")) {
      contentType = "font/woff2";
    }

    // For JS-filer omskrives eventuelle interne referanser til assets/ slik at underskripts rutes samme vei
    if (contentType.includes("javascript")) {
      let code = await res.text();
      code = code.replace(/"assets\//g, '"/api/bot-frame/assets/');
      code = code.replace(/\/assets\//g, '/api/bot-frame/assets/');
      return new NextResponse(code, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=86400, immutable",
        },
      });
    }

    if (contentType.includes("text/css")) {
      let css = await res.text();
      css = css.replace(/\/assets\//g, '/api/bot-frame/assets/');
      return new NextResponse(css, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=86400, immutable",
        },
      });
    }

    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (error: any) {
    return new NextResponse(`Feil ved proxying av asset: ${error.message}`, { status: 502 });
  }
}
