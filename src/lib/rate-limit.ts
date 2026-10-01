/**
 * Sikker, robust in-memory rate-limiter for å forhindre misbruk, DDoS og API-kreditt-tømming
 * i henhold til The Lazy Developer Security Guide & GDPR.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

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

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

/**
 * Kontrollerer om forespørselen overskrider grensen.
 * @param identifier Unik ID for klienten (typisk IP-adresse + endepunkt)
 * @param maxRequests Maks antall forespørsler tillatt i vinduet
 * @param windowSeconds Lengden på tidsvinduet i sekunder
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowSeconds: number = 60
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetSeconds: windowSeconds,
    };
  }

  if (record.count >= maxRequests) {
    const resetSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetSeconds,
    };
  }

  record.count += 1;
  const resetSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetSeconds,
  };
}

/**
 * Henter klient-IP trygt fra request headers
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}
