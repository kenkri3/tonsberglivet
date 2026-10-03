import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { prisma } from './prisma';

const SESSION_COOKIE_NAME = 'tonsberg_admin_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 dager

export interface SessionUser {
  id: string;
  name: string | null;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
}

/**
 * Hemmelighet for sesjonssignering.
 *
 * VIKTIG: Det finnes ingen hardkodet reserveverdi her. En kjent, innsjekket
 * hemmelighet gjør at hvem som helst kan signere sin egen ADMIN-cookie.
 * Er ingen hemmelighet konfigurert, genererer vi en tilfeldig en for denne
 * prosessen: sesjoner kan da ikke forfalskes, men de overlever heller ikke
 * omstart eller deles mellom flere instanser. Sett NEXTAUTH_SECRET i miljøet.
 */
let ephemeralAuthSecret: string | null = null;

function getAuthSecret(): string {
  const configured = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (configured && configured.trim() !== '') {
    return configured;
  }

  if (!ephemeralAuthSecret) {
    ephemeralAuthSecret = crypto.randomBytes(32).toString('hex');
    console.error(
      '[Auth] NEXTAUTH_SECRET/AUTH_SECRET er ikke konfigurert. ' +
        'Genererer en tilfeldig sesjonshemmelighet for denne prosessen — ' +
        'innlogginger blir ugyldige ved omstart og deles ikke mellom instanser. ' +
        'Sett NEXTAUTH_SECRET i miljøet for produksjon.',
    );
  }
  return ephemeralAuthSecret;
}

/**
 * Genererer sikker saltet passord-hash
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifiserer passord mot lagret hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, key] = storedHash.split(':');
  if (!salt || !key || !/^[0-9a-f]+$/i.test(key)) return false;

  const keyBuffer = Buffer.from(key, 'hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  // timingSafeEqual kaster RangeError ved ulik lengde — sjekk først.
  if (keyBuffer.length !== derivedKey.length) return false;
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

/**
 * Oppretter en signert sesjons-token (HMAC SHA-256)
 */
export function createSessionToken(user: SessionUser): string {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const hmac = crypto.createHmac('sha256', getAuthSecret());
  hmac.update(payloadB64);
  const signature = hmac.digest('base64url');

  return `${payloadB64}.${signature}`;
}

/**
 * Verifiserer en sesjons-token
 */
export function verifySessionToken(token: string): SessionUser | null {
  if (!token || !token.includes('.')) return null;
  const [payloadB64, signature] = token.split('.');
  if (!payloadB64 || !signature) return null;

  const hmac = crypto.createHmac('sha256', getAuthSecret());
  hmac.update(payloadB64);
  const expectedSig = hmac.digest('base64url');

  // En ugyldig/avkuttet cookie skal gi "ikke innlogget" (401), ikke en 500.
  // timingSafeEqual kaster RangeError når bufferne har ulik lengde.
  try {
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSig);
    if (sigBuffer.length !== expectedBuffer.length) return null;
    if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return null;
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }
    return {
      id: payload.sub,
      name: payload.name || null,
      email: payload.email,
      role: payload.role || 'EDITOR',
    };
  } catch {
    return null;
  }
}

/**
 * Henter og verifiserer innlogget bruker fra cookies (brukes i Server Components og API-ruter)
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Verifiserer session fra NextRequest (for middleware og API handlers)
 */
export function getSessionFromRequest(request: NextRequest | Request): SessionUser | null {
  // Sjekk cookie i headers
  let cookieHeader: string | null = null;
  if ('cookies' in request && typeof (request as any).cookies?.get === 'function') {
    const c = (request as NextRequest).cookies.get(SESSION_COOKIE_NAME);
    if (c?.value) return verifySessionToken(c.value);
  }
  
  cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) {
    // Sjekk også Authorization: Bearer <token>
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();
      return verifySessionToken(token);
    }
    return null;
  }

  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]*)`));
  if (!match) return null;
  return verifySessionToken(decodeURIComponent(match[1]));
}

/**
 * Verifiserer at forespørselen har gyldig admin-rettighet
 */
/**
 * Verifiserer at forespørselen har gyldig innlogging (ADMIN, EDITOR eller VIEWER)
 */
export function requireAuth(request: Request): { authorized: boolean; user?: SessionUser; error?: string } {
  const user = getSessionFromRequest(request);
  if (!user) {
    return { authorized: false, error: "Uautorisert: Krever innlogging." };
  }
  return { authorized: true, user };
}

export function requireAdmin(request: Request): { authorized: boolean; user?: SessionUser; error?: string } {
  const user = getSessionFromRequest(request);
  if (!user) {
    return { authorized: false, error: 'Uautorisert: Krever innlogging som administrator.' };
  }
  if (user.role !== 'ADMIN') {
    return { authorized: false, error: 'Forbudt: Handlingen krever ADMIN-rettigheter.' };
  }
  return { authorized: true, user };
}

/**
 * Verifiserer at forespørselen har gyldig redaktør- eller admin-rettighet
 */
export function requireEditorOrAdmin(request: Request): { authorized: boolean; user?: SessionUser; error?: string } {
  const user = getSessionFromRequest(request);
  if (!user) {
    return { authorized: false, error: 'Uautorisert: Krever innlogging.' };
  }
  if (user.role !== 'ADMIN' && user.role !== 'EDITOR') {
    return { authorized: false, error: 'Forbudt: Handlingen krever redaktørtilgang.' };
  }
  return { authorized: true, user };
}

export { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS };
