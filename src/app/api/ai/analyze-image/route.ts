import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getEffectiveGeminiApiKey } from '@/lib/ai-config';
import { requireEditorOrAdmin } from '@/lib/auth';

/** Godtar rå base64 eller data-URL («data:image/png;base64,....»). */
function extractImageBase64(value: unknown): { data: string; mimeType: string } | null {
  if (typeof value !== 'string' || value.trim().length === 0) return null;

  const raw = value.trim();
  const dataUrlMatch = raw.match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i);
  if (dataUrlMatch) {
    return { mimeType: dataUrlMatch[1], data: dataUrlMatch[2] };
  }

  const cleaned = raw.replace(/\s+/g, '');
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(cleaned)) return null;
  return { mimeType: 'image/jpeg', data: cleaned };
}

/** Er dette en IPv4-adresse i et internt/reservert område? */
function isPrivateIpv4(host: string): boolean {
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  if ([a, b, Number(m[3]), Number(m[4])].some((o) => o > 255)) return true;

  return (
    a === 0 || // 0.0.0.0/8
    a === 10 || // 10.0.0.0/8
    a === 127 || // loopback
    a === 169 && b === 254 || // lenke-lokal (inkl. 169.254.169.254 metadata)
    a === 172 && b >= 16 && b <= 31 || // 172.16.0.0/12
    a === 192 && b === 168 || // 192.168.0.0/16
    a === 100 && b >= 64 && b <= 127 || // CGNAT 100.64.0.0/10
    a >= 224 // multicast og reservert
  );
}

/**
 * Er vertsnavnet trygt å hente fra serversiden?
 *
 * Appen kjører nå med databasen på Railways private nettverk, så en henting
 * fra serversiden mot et internt navn er ikke lenger teoretisk: det ville
 * kunne nå `postgres.railway.internal`. Vi avviser derfor private og
 * reserverte adresser, samt skylagringens metadata-endepunkter.
 */
function isSafeImageHost(hostname: string): boolean {
  const host = hostname.trim().toLowerCase().replace(/^\[|\]$/g, '');
  if (!host) return false;

  if (host === 'localhost' || host.endsWith('.localhost')) return false;
  if (host.endsWith('.internal') || host.endsWith('.local')) return false;
  if (host.endsWith('.railway.internal')) return false;
  if (host === 'metadata.google.internal') return false;

  if (isPrivateIpv4(host)) return false;

  // IPv6: loopback, lenke-lokal og unik-lokal
  if (host.includes(':')) {
    if (host === '::1' || host === '::') return false;
    if (/^f[cd][0-9a-f]{2}:/.test(host)) return false; // fc00::/7
    if (/^fe[89ab][0-9a-f]:/.test(host)) return false; // fe80::/10
    return false;
  }

  // Krever minst ett punktum, ellers er det et internt kortnavn.
  return host.includes('.');
}

/**
 * Henter bildebytes fra en URL på serversiden.
 * Adminpanelet kjenner bare bilde-URL-en; å hente den her unngår
 * CORS-problemer i nettleseren og holder API-nøkkelen på serveren.
 */
async function fetchImageFromUrl(url: unknown): Promise<{ data: string; mimeType: string } | null> {
  if (typeof url !== 'string' || url.trim().length === 0) return null;

  const clean = url.trim();

  // Data-URL: pakk ut direkte.
  const fromDataUrl = extractImageBase64(clean);
  if (fromDataUrl) return fromDataUrl;

  // Relative stier (f.eks. /images/hero.jpg) må gjøres absolutte.
  let target = clean;
  let isRelative = false;
  if (target.startsWith('/')) {
    const base = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    target = new URL(target, base).toString();
    isRelative = true;
  }

  if (!/^https?:\/\//i.test(target)) return null;

  // Egne, relative stier er trygge – de peker på vårt eget bildebibliotek.
  // Alt annet må passere vertssperren under.
  if (!isRelative) {
    let parsed: URL;
    try {
      parsed = new URL(target);
    } catch {
      return null;
    }
    if (!isSafeImageHost(parsed.hostname)) {
      console.warn(`[analyze-image] Avviste utrygt vertsnavn: ${parsed.hostname}`);
      return null;
    }
  }

  try {
    const res = await fetch(target, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;

    // Følg omdirigeringer, men valider SLUTTADRESSEN. Mange CDN-er
    // omdirigerer til en annen vert, så vi kan ikke blokkere omdirigeringer –
    // men en omdirigering til et internt mål skal fortsatt avvises.
    if (res.url) {
      try {
        const finalUrl = new URL(res.url);
        if (!isSafeImageHost(finalUrl.hostname)) {
          console.warn(`[analyze-image] Avviste omdirigering til utrygt vertsnavn: ${finalUrl.hostname}`);
          return null;
        }
      } catch {
        return null;
      }
    }

    const contentType = (res.headers.get('content-type') || '').split(';')[0].trim();
    if (!contentType.startsWith('image/')) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length === 0 || buffer.length > 8 * 1024 * 1024) return null;

    return { mimeType: contentType, data: buffer.toString('base64') };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const auth = requireEditorOrAdmin(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Uautorisert' },
        { status: auth.user ? 403 : 401 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Ugyldig JSON i forespørselen' },
        { status: 400 }
      );
    }

    const { imageName, folder, imageBase64, imageMimeType, imageUrl } = body as {
      imageName?: string;
      folder?: string;
      imageBase64?: string;
      imageMimeType?: string;
      imageUrl?: string;
    };

    // Bilder kan komme som rå base64/data-URL, eller som en URL vi henter her.
    const image = extractImageBase64(imageBase64) ?? (await fetchImageFromUrl(imageUrl));
    if (!image) {
      // Uten bildebytes finnes det ingen analyse – vi dikter aldri opp tagger
      // eller GDPR-status ut fra et filnavn.
      return NextResponse.json(
        {
          success: false,
          error:
            'Kan ikke analysere bildet uten bildefil. Send selve bildet som «imageBase64» (base64 eller data-URL), ' +
            'eller oppgi en «imageUrl» som peker direkte på en bildefil. ' +
            'Ingen tagger eller GDPR-status er generert.',
        },
        { status: 400 }
      );
    }

    const apiKey = await getEffectiveGeminiApiKey();
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            'AI-bildetjenesten er ikke konfigurert på serveren: Ingen aktiv Gemini API-nøkkel funnet. ' +
            'Sett GEMINI_API_KEY som miljøvariabel i Railway. Bildet er ikke analysert.',
        },
        { status: 503 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Analyser dette bildet for en byutviklingsportal i Tønsberg, Norge.
Returner KUN et JSON-objekt (ingen markdown) med:
- aiTags: array med 4-6 relevante norske tagger (f.eks. "Torvet", "Brygga", "Sommer", "Konsert")
- suggestedGdpr: enten "APPROVED" (hvis ingen gjenkjennelige ansikter uten samtykke) eller "PENDING"
- aiSummary: en kort norsk setning som beskriver motivet.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: imageMimeType || image.mimeType,
                data: image.data,
              },
            },
          ],
        },
      ],
    });

    const text = response.text || '';
    let parsedResult: any;
    try {
      parsedResult = JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch (e) {
      return NextResponse.json(
        {
          success: false,
          error:
            `Kunne ikke tolke AI-svaret som JSON for «${imageName || 'bildet'}» i mappen «${folder || 'ukjent'}». ` +
            'Ingen tagger er lagret – prøv igjen.',
        },
        { status: 502 }
      );
    }

    const aiTags = Array.isArray(parsedResult?.aiTags)
      ? parsedResult.aiTags.filter((t: any) => typeof t === 'string' && t.trim().length > 0).slice(0, 8)
      : [];

    if (aiTags.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI-analysen returnerte ingen gyldige tagger. Ingenting er lagret – prøv igjen med et tydeligere bilde.',
        },
        { status: 502 }
      );
    }

    const suggestedGdpr =
      parsedResult?.suggestedGdpr === 'APPROVED' || parsedResult?.suggestedGdpr === 'PENDING'
        ? parsedResult.suggestedGdpr
        : null;

    return NextResponse.json({
      success: true,
      aiTags,
      suggestedGdpr,
      aiSummary: typeof parsedResult?.aiSummary === 'string' ? parsedResult.aiSummary : '',
    });
  } catch (error: any) {
    console.error('AI Image Analysis error:', error);
    return NextResponse.json(
      { success: false, error: 'Kunne ikke analysere bildet med Google AI Studio' },
      { status: 500 }
    );
  }
}
