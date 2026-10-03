import crypto from 'crypto';

/**
 * Passord-hashing med scrypt.
 *
 * Ligger i egen fil (uten import av `next/headers`) slik at biblioteker som
 * oppretter brukere – invitasjoner, brukeradministrasjon – kan brukes og testes
 * utenfor en HTTP-forespørsel. `@/lib/auth` re-eksporterer funksjonene, så
 * eksisterende kallsteder er uendret.
 */

/** Genererer sikker saltet passord-hash */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/** Verifiserer passord mot lagret hash */
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
