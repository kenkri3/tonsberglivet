import { getSetting } from './settings';

export interface WebSearchResultItem {
  title: string;
  url: string;
  snippet: string;
  extraSnippets?: string[];
  source?: string;
  score?: number;
}

export interface WebSearchResponse {
  success: boolean;
  engine: 'brave' | 'tavily' | 'direct' | 'none';
  query: string;
  answer?: string;
  results: WebSearchResultItem[];
  error?: string;
}

export interface WebScrapeResponse {
  success: boolean;
  url: string;
  title: string;
  content: string;
  source: 'apify' | 'direct_fetch';
  markdown?: string;
  error?: string;
}

/**
 * Henter Brave API-nøkkel fra databasen (SystemSetting) eller miljøvariabler.
 */
export async function getBraveApiKey(): Promise<string | null> {
  const key = await getSetting('brave_api_key');
  if (key && key.trim()) return key.trim();
  if (process.env.BRAVE_API_KEY && process.env.BRAVE_API_KEY.trim()) {
    return process.env.BRAVE_API_KEY.trim();
  }
  return null;
}

/**
 * Henter Tavily API-nøkkel fra databasen (SystemSetting) eller miljøvariabler.
 */
export async function getTavilyApiKey(): Promise<string | null> {
  const key = await getSetting('tavily_api_key');
  if (key && key.trim()) return key.trim();
  if (process.env.TAVILY_API_KEY && process.env.TAVILY_API_KEY.trim()) {
    return process.env.TAVILY_API_KEY.trim();
  }
  return null;
}

/**
 * Henter Apify API-nøkkel fra databasen (SystemSetting) eller miljøvariabler.
 */
export async function getApifyApiKey(): Promise<string | null> {
  const key = await getSetting('apify_api_key');
  if (key && key.trim()) return key.trim();
  if (process.env.APIFY_API_KEY && process.env.APIFY_API_KEY.trim()) {
    return process.env.APIFY_API_KEY.trim();
  }
  return null;
}

/**
 * Utfører et direktesøk via Brave Search API
 */
export async function searchBrave(query: string, count: number = 6): Promise<WebSearchResponse> {
  const apiKey = await getBraveApiKey();
  if (!apiKey) {
    return {
      success: false,
      engine: 'brave',
      query,
      results: [],
      error: 'Brave API-nøkkel er ikke konfigurert. Legg den inn i /admin/innstillinger (BYOK).',
    };
  }

  try {
    const url = new URL('https://api.search.brave.com/res/v1/web/search');
    url.searchParams.set('q', query);
    url.searchParams.set('count', Math.min(count, 10).toString());
    url.searchParams.set('search_lang', 'no');
    url.searchParams.set('country', 'no');

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': apiKey,
      },
      signal: AbortSignal.timeout(9000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return {
        success: false,
        engine: 'brave',
        query,
        results: [],
        error: `Brave Search returnerte status ${res.status}: ${errText.slice(0, 150)}`,
      };
    }

    const data = await res.json();
    const rawResults = data?.web?.results || [];

    const results: WebSearchResultItem[] = rawResults.map((item: any) => ({
      title: item.title || '',
      url: item.url || '',
      snippet: item.description || '',
      extraSnippets: Array.isArray(item.extra_snippets) ? item.extra_snippets : [],
      source: 'Brave Search',
    }));

    return {
      success: true,
      engine: 'brave',
      query,
      results,
    };
  } catch (err: any) {
    return {
      success: false,
      engine: 'brave',
      query,
      results: [],
      error: `Feil ved Brave-søk: ${err?.message || 'Nettverksfeil'}`,
    };
  }
}

/**
 * Utfører et dypere research-søk via Tavily Search API
 */
export async function searchTavily(
  query: string,
  options?: { searchDepth?: 'basic' | 'advanced'; maxResults?: number }
): Promise<WebSearchResponse> {
  const apiKey = await getTavilyApiKey();
  if (!apiKey) {
    return {
      success: false,
      engine: 'tavily',
      query,
      results: [],
      error: 'Tavily API-nøkkel er ikke konfigurert. Legg den inn i /admin/innstillinger (BYOK).',
    };
  }

  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: options?.searchDepth || 'basic',
        include_answer: true,
        max_results: options?.maxResults || 5,
      }),
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return {
        success: false,
        engine: 'tavily',
        query,
        results: [],
        error: `Tavily API returnerte status ${res.status}: ${errText.slice(0, 150)}`,
      };
    }

    const data = await res.json();
    const results: WebSearchResultItem[] = (data?.results || []).map((item: any) => ({
      title: item.title || '',
      url: item.url || '',
      snippet: item.content || '',
      score: item.score,
      source: 'Tavily AI Search',
    }));

    return {
      success: true,
      engine: 'tavily',
      query,
      answer: data?.answer || undefined,
      results,
    };
  } catch (err: any) {
    return {
      success: false,
      engine: 'tavily',
      query,
      results: [],
      error: `Feil ved Tavily-søk: ${err?.message || 'Nettverksfeil'}`,
    };
  }
}

/**
 * Skraper eller leser innhold fra en spesifikk URL via Apify eller innebygd direkteleser.
 */
export async function scrapeUrl(url: string, instructions?: string): Promise<WebScrapeResponse> {
  const apifyKey = await getApifyApiKey();

  // 1. Forsøk Apify dersom nøkkel er tilgjengelig
  if (apifyKey) {
    try {
      // Bruk Apify RAG Web Browser actor som er optimalisert for LLM
      const apifyUrl = `https://api.apify.com/v2/acts/apify~rag-web-browser/run-sync-get-dataset-items?token=${apifyKey}`;
      const apifyRes = await fetch(apifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: url,
          maxResults: 1,
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (apifyRes.ok) {
        const dataset = await apifyRes.json();
        if (Array.isArray(dataset) && dataset.length > 0) {
          const first = dataset[0];
          return {
            success: true,
            url,
            title: first.metadata?.title || first.title || url,
            content: first.text || first.markdown || first.description || '',
            markdown: first.markdown || undefined,
            source: 'apify',
          };
        }
      }
    } catch (apifyErr) {
      console.warn('[Apify Scrape] Apify-kall feilet, faller tilbake til direkte web-leser:', apifyErr);
    }
  }

  // 2. Robust direkte web-leser (fungerer alltid uten nøkkel!)
  try {
    const directRes = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 TønsberglivetBot/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'nb-NO,nb;q=0.9,no;q=0.8,nn;q=0.7,en;q=0.6',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!directRes.ok) {
      return {
        success: false,
        url,
        title: '',
        content: '',
        source: 'direct_fetch',
        error: `Kunne ikke hente nettside (status ${directRes.status})`,
      };
    }

    const html = await directRes.text();
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : url;

    // Fjern unødvendige tags som script, style, svg, osv.
    let cleaned = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/\s{2,}/g, ' ')
      .trim();

    // Begrens lengde til maks 8000 tegn for responsen
    if (cleaned.length > 8000) {
      cleaned = cleaned.slice(0, 8000) + '... [Teksten ble kuttet for optimal lesbarhet]';
    }

    return {
      success: true,
      url,
      title,
      content: cleaned,
      source: 'direct_fetch',
    };
  } catch (err: any) {
    return {
      success: false,
      url,
      title: '',
      content: '',
      source: 'direct_fetch',
      error: `Feil ved lesing av nettsiden ${url}: ${err?.message || 'Ukjent feil'}`,
    };
  }
}

/**
 * Intelligent hybrid-søk:
 * Prøver Tavily (best for AI-svar) -> Brave (best for oppdaterte lenker) -> Informerer om manglende nøkler
 */
export async function smartWebSearch(
  query: string,
  preferredEngine: 'auto' | 'brave' | 'tavily' = 'auto'
): Promise<WebSearchResponse> {
  const [hasBrave, hasTavily] = await Promise.all([getBraveApiKey(), getTavilyApiKey()]);

  // 1. Hvis bruker spesifikt ber om Brave
  if (preferredEngine === 'brave' || (hasBrave && !hasTavily)) {
    const res = await searchBrave(query);
    if (res.success || !hasTavily) return res;
  }

  // 2. Hvis bruker spesifikt ber om Tavily, eller vi er i auto-modus og Tavily er tilgjengelig
  if (hasTavily) {
    const res = await searchTavily(query);
    if (res.success || !hasBrave) return res;
  }

  // 3. Fallback til Brave hvis Tavily feilet
  if (hasBrave) {
    return await searchBrave(query);
  }

  return {
    success: false,
    engine: 'none',
    query,
    results: [],
    error: 'Verken Brave API eller Tavily API-nøkkel er konfigurert. Konfigurer minst én i /admin/innstillinger under BYOK.',
  };
}
