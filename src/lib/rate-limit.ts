/**
 * Rate-limiter som beskytter de offentlige skjemaene (torvleie/booking og kontakt)
 * mot misbruk, DDoS og API-kreditt-tømming, i henhold til The Lazy Developer
 * Security Guide & GDPR.
 *
 * Designvalg (funn C14):
 *
 * 1) Klientidentitet — `x-forwarded-for` kan settes av klienten selv. Next.js
 *    fyller bare ut headeren dersom klienten IKKE sendte den
 *    (`req.headers['x-forwarded-for'] ??= socket.remoteAddress`), så i et direkte
 *    (proxy-løst) oppsett kan vi ikke skille «ekte» fra «oppdiktet» verdi.
 *    Vi stoler derfor kun på headeren når vi eksplisitt er satt bak en betrodd
 *    proxy (RATE_LIMIT_TRUST_PROXY=true, eller kjent plattform som Vercel/
 *    Railway/Fly/Render/Cloud Run), og bruker da SISTE hopp i kjeden — det er
 *    hoppet den betrodde proxyen selv la til. Uten betrodd proxy deler alle
 *    klienter én bøtte, slik at en klient ikke kan velge sin egen identitet og
 *    dermed omgå grensen (jf. «5 per 600 sekunder»).
 *
 * 2) Deling på tvers av instanser — tellerverket ligger i prosessminnet og
 *    nullstilles når modulen lastes på nytt (f.eks. ved filendring i dev). Er
 *    UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN satt, telles det i en
 *    delt Redis i stedet, slik at grensen også håndheves på tvers av flere
 *    applikasjonsinstanser. Resultatet rapporterer hvilket lager som ble brukt.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
  /** Hvilket lager tellingen kommer fra. */
  store: 'memory' | 'shared';
  /** true når klienten kunne identifiseres sikkert (betrodd proxy). */
  identified: boolean;
}

const UNIDENTIFIED_CLIENT = 'ukjent-klient';

/**
 * Prosess-lokalt tellerverk. Nullstilles når modulen lastes på nytt (f.eks. ved
 * filendring i dev). Trenger du håndhevelse på tvers av flere instanser, sett
 * UPSTASH_REDIS_REST_URL/TOKEN – da telles det i delt Redis i stedet.
 */
const rateLimitStore = new Map<string, RateLimitRecord>();

// Rydd automatisk utgåtte oppføringer hvert 5. minutt for å unngå minnelekkasjer
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000).unref?.();

/**
 * Er applikasjonen satt bak en proxy vi kan stole på (dvs. en proxy som selv
 * overskriver/legger til x-forwarded-for)?
 */
function isBehindTrustedProxy(): boolean {
  const explicit = process.env.RATE_LIMIT_TRUST_PROXY;
  if (explicit === 'true') return true;
  if (explicit === 'false') return false;

  // Railway setter flere av disse. Sjekker vi bare RAILWAY_ENVIRONMENT, risikerer
  // vi å tro at vi står uten proxy – og da deler alle klienter én bøtte, slik at
  // én persons forsøk låser ute alle andre.
  return Boolean(
    process.env.VERCEL ||
      process.env.RAILWAY_ENVIRONMENT ||
      process.env.RAILWAY_ENVIRONMENT_ID ||
      process.env.RAILWAY_ENVIRONMENT_NAME ||
      process.env.RAILWAY_PROJECT_ID ||
      process.env.RAILWAY_SERVICE_ID ||
      process.env.FLY_APP_NAME ||
      process.env.RENDER ||
      process.env.K_SERVICE
  );
}

const IPV4_PATTERN = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const IPV6_PATTERN = /^[0-9a-f:]+$/i;

/** Validerer og normaliserer en IP-adresse. Returnerer null for søppel/oppdiktede verdier. */
function normalizeIp(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const value = raw.trim().replace(/^\[|\]$/g, '');
  if (!value || value.length > 45) return null;

  const v4 = value.match(IPV4_PATTERN);
  if (v4) {
    const octets = v4.slice(1).map((o) => Number(o));
    if (octets.some((o) => o > 255)) return null;
    return octets.join('.');
  }

  if (value.includes(':') && IPV6_PATTERN.test(value)) {
    const lower = value.toLowerCase();
    // IPv4-mappet IPv6 (::ffff:127.0.0.1) behandles som IPv4 for stabil nøkkel
    const mapped = lower.match(/^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
    if (mapped) return normalizeIp(mapped[1]);
    return lower;
  }

  return null;
}

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const sharedStoreConfigured = Boolean(upstashUrl && upstashToken);

/** Teller i delt Redis (Upstash REST) når det er konfigurert. null = ikke tilgjengelig. */
async function checkSharedStore(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ count: number; resetSeconds: number } | null> {
  if (!sharedStoreConfigured) return null;

  try {
    const key = `ratelimit:${identifier}`;
    const res = await fetch(`${upstashUrl}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${upstashToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', key],
        ['TTL', key],
      ]),
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const payload = (await res.json()) as Array<{ result?: unknown; error?: string }>;
    const count = Number(payload?.[0]?.result);
    let ttl = Number(payload?.[1]?.result);
    if (!Number.isFinite(count) || count <= 0) return null;

    if (!Number.isFinite(ttl) || ttl < 0) {
      ttl = windowSeconds;
      await fetch(`${upstashUrl}/expire/${encodeURIComponent(key)}/${windowSeconds}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${upstashToken}` },
        cache: 'no-store',
      }).catch(() => undefined);
    }

    return { count, resetSeconds: Math.max(1, ttl) };
  } catch {
    // Delt lager utilgjengelig -> fall tilbake til prosess-lokalt tellerverk
    return null;
  }
}

function checkMemoryStore(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): { count: number; resetSeconds: number } {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return { count: 1, resetSeconds: windowSeconds };
  }

  record.count += 1;
  return {
    count: record.count,
    resetSeconds: Math.max(1, Math.ceil((record.resetTime - now) / 1000)),
  };
}

/**
 * Kontrollerer om forespørselen overskrider grensen.
 * @param identifier Unik ID for klienten (typisk IP-adresse + endepunkt)
 * @param maxRequests Maks antall forespørsler tillatt i vinduet
 * @param windowSeconds Lengden på tidsvinduet i sekunder
 * @param identified false når klienten ikke kunne identifiseres sikkert
 */
export async function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowSeconds: number = 60,
  identified: boolean = true
): Promise<RateLimitResult> {
  const shared = await checkSharedStore(identifier, maxRequests, windowSeconds);
  const { count, resetSeconds } = shared ?? checkMemoryStore(identifier, maxRequests, windowSeconds);

  return {
    allowed: count <= maxRequests,
    remaining: Math.max(0, maxRequests - count),
    resetSeconds,
    store: shared ? 'shared' : 'memory',
    identified,
  };
}

/**
 * Henter klientidentitet (IP når den er til å stole på) for rate-limiting.
 */
export function getClientIdentity(request: Request): { id: string; identified: boolean } {
  const ip = getClientIp(request);
  return { id: ip, identified: ip !== UNIDENTIFIED_CLIENT };
}

/**
 * Henter klient-IP på en måte som ikke kan styres av klienten selv.
 *
 * Bak en betrodd proxy brukes siste hopp i x-forwarded-for (lagt til av proxyen).
 * Uten betrodd proxy kan headeren være oppdiktet, og vi faller tilbake til en
 * delt identitet slik at grensen fortsatt håndheves (ingen omgåelse ved å bytte
 * header), samtidig som vanlige brukere slipper gjennom.
 */
export function getClientIp(request: Request): string {
  if (!isBehindTrustedProxy()) {
    return UNIDENTIFIED_CLIENT;
  }

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const chain = forwardedFor.split(',').map((part) => part.trim()).filter(Boolean);
    for (let i = chain.length - 1; i >= 0; i -= 1) {
      const ip = normalizeIp(chain[i]);
      if (ip) return ip;
    }
  }

  const realIp = normalizeIp(request.headers.get('x-real-ip'));
  if (realIp) return realIp;

  return UNIDENTIFIED_CLIENT;
}
