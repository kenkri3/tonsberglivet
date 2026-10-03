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
  if (target.startsWith('/')) {
    const base = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    target = new URL(target, base).toString();
  }

  if (!/^https?:\/\//i.test(target)) return null;

  try {
    const res = await fetch(target, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;

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
