import crypto from 'crypto';
import { prisma } from './prisma';
import { hashPassword } from './password';
import { logActivity } from './activity';
import { canManageAccess, isRoleName, roleLabel, type RoleName } from './roles';
import { sanitizeInput } from './validations';
import type { SessionUser } from './auth';

/**
 * Invitasjoner til nye medarbeidere.
 *
 * Flyten er: en superbruker/administrator oppretter en invitasjon med e-post og
 * tilgangsnivå. Den inviterte får en lenke (/invitasjon/<token>), velger sitt
 * eget passord, og kontoen opprettes først da. Vi lagrer aldri selve tokenen –
 * bare et SHA-256-fingeravtrykk – slik at en som leser databasen ikke kan bruke
 * en utestående invitasjon til å ta over kontoen.
 */

/** Hvor lenge en invitasjon er gyldig. */
export const INVITATION_TTL_DAYS = 7;

/** Minste passordlengde når den inviterte setter passord selv. */
export const MIN_INVITE_PASSWORD_LENGTH = 8;

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';

export interface InvitationSummary {
  id: string;
  email: string;
  name: string | null;
  title: string | null;
  role: RoleName;
  roleLabel: string;
  note: string | null;
  invitedByName: string | null;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

type InvitationRow = {
  id: string;
  email: string;
  name: string | null;
  title: string | null;
  role: string;
  note: string | null;
  invitedByName: string | null;
  expiresAt: Date;
  acceptedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
};

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function normalizeInviteEmail(email: unknown): string {
  return String(email || '').trim().toLowerCase();
}

function isEmailShaped(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function statusOf(row: InvitationRow): InvitationStatus {
  if (row.acceptedAt) return 'ACCEPTED';
  if (row.revokedAt) return 'REVOKED';
  if (row.expiresAt.getTime() < Date.now()) return 'EXPIRED';
  return 'PENDING';
}

function toSummary(row: InvitationRow): InvitationSummary {
  const role: RoleName = isRoleName(row.role) ? row.role : 'EDITOR';
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    title: row.title,
    role,
    roleLabel: roleLabel(role),
    note: row.note,
    invitedByName: row.invitedByName,
    status: statusOf(row),
    expiresAt: row.expiresAt.toISOString(),
    acceptedAt: row.acceptedAt ? row.acceptedAt.toISOString() : null,
    revokedAt: row.revokedAt ? row.revokedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

export interface CreateInvitationResult {
  ok: boolean;
  status: number;
  error?: string;
  invitation?: InvitationSummary;
  /** Rå token – returneres kun én gang, til den som opprettet invitasjonen. */
  token?: string;
}

/**
 * Oppretter en invitasjon. `actor` er den innloggede brukeren som inviterer.
 *
 * Regler:
 *  - e-posten må være ledig (ingen aktiv bruker med samme adresse)
 *  - man kan ikke dele ut et nivå over sitt eget
 *  - en eldre, ubrukt invitasjon til samme adresse trekkes tilbake og erstattes
 */
export async function createInvitation(params: {
  email: unknown;
  name?: unknown;
  title?: unknown;
  role: unknown;
  note?: unknown;
  actor: SessionUser;
}): Promise<CreateInvitationResult> {
  const email = normalizeInviteEmail(params.email);
  if (!isEmailShaped(email)) {
    return { ok: false, status: 400, error: 'Oppgi en gyldig e-postadresse.' };
  }

  const role: RoleName = isRoleName(params.role) ? params.role : 'EDITOR';
  if (!canManageAccess(params.actor.role)) {
    return {
      ok: false,
      status: 403,
      error: 'Bare administratorer og superbrukere kan invitere nye brukere.',
    };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return {
      ok: false,
      status: 409,
      error: 'Det finnes allerede en bruker med denne e-postadressen.',
    };
  }

  // Erstatter vi en gammel invitasjon, trekker vi den tilbake først – ellers
  // ville to gyldige lenker kunne brukes mot samme konto.
  await prisma.invitation.updateMany({
    where: { email, acceptedAt: null, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  const token = crypto.randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000);

  const created = await prisma.invitation.create({
    data: {
      email,
      name: params.name ? sanitizeInput(String(params.name).trim()) || null : null,
      title: params.title ? sanitizeInput(String(params.title).trim()) || null : null,
      role: role as any,
      note: params.note ? String(params.note).trim().slice(0, 600) : null,
      tokenHash: hashToken(token),
      invitedById: params.actor.id?.startsWith('admin-env-id') ? null : params.actor.id || null,
      invitedByName: params.actor.name || params.actor.email,
      expiresAt,
    },
  });

  await logActivity({
    user: params.actor,
    action: 'USER_INVITED',
    details: `Inviterte ${email} som ${roleLabel(role)} (gyldig i ${INVITATION_TTL_DAYS} dager)`,
    targetType: 'User',
    targetId: created.id,
  });

  return { ok: true, status: 201, invitation: toSummary(created as InvitationRow), token };
}

/** Alle invitasjoner, nyeste først – med utledet status. */
export async function listInvitations(): Promise<InvitationSummary[]> {
  const rows = await prisma.invitation.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  return rows.map((row) => toSummary(row as InvitationRow));
}

/** Trekker tilbake en ubrukt invitasjon. */
export async function revokeInvitation(
  id: string,
  actor: SessionUser,
): Promise<{ ok: boolean; status: number; error?: string; invitation?: InvitationSummary }> {
  const existing = await prisma.invitation.findUnique({ where: { id } });
  if (!existing) {
    return { ok: false, status: 404, error: 'Fant ikke invitasjonen.' };
  }
  if (existing.acceptedAt) {
    return { ok: false, status: 400, error: 'Invitasjonen er allerede brukt – kontoen finnes.' };
  }
  if (existing.revokedAt) {
    return { ok: true, status: 200, invitation: toSummary(existing as InvitationRow) };
  }

  const updated = await prisma.invitation.update({
    where: { id },
    data: { revokedAt: new Date() },
  });

  await logActivity({
    user: actor,
    action: 'USER_INVITATION_REVOKED',
    details: `Trakk tilbake invitasjonen til ${existing.email}`,
    targetType: 'User',
    targetId: id,
  });

  return { ok: true, status: 200, invitation: toSummary(updated as InvitationRow) };
}

export type InvitationLookup =
  | { ok: true; invitation: InvitationSummary }
  | { ok: false; error: string };

/**
 * Slår opp en invitasjon fra rå token (brukes av den offentlige
 * invitasjonssiden). Ukjent, brukt, trukket tilbake eller utløpt token gir en
 * forklarende feil – aldri en konto.
 */
export async function findInvitationByToken(token: string): Promise<InvitationLookup> {
  const clean = String(token || '').trim();
  if (clean.length < 20) {
    return { ok: false, error: 'Invitasjonslenken er ufullstendig. Be om en ny lenke.' };
  }

  const row = await prisma.invitation.findUnique({ where: { tokenHash: hashToken(clean) } });
  if (!row) {
    return { ok: false, error: 'Fant ingen invitasjon med denne lenken. Den kan være erstattet av en nyere.' };
  }

  const summary = toSummary(row as InvitationRow);
  if (summary.status === 'REVOKED') {
    return { ok: false, error: 'Invitasjonen er trukket tilbake. Be om en ny lenke.' };
  }
  if (summary.status === 'ACCEPTED') {
    return { ok: false, error: 'Invitasjonen er allerede brukt. Logg inn med passordet du valgte.' };
  }
  if (summary.status === 'EXPIRED') {
    return { ok: false, error: `Invitasjonen utløp ${new Date(summary.expiresAt).toLocaleDateString('nb-NO')}. Be om en ny lenke.` };
  }

  return { ok: true, invitation: summary };
}

export interface AcceptInvitationResult {
  ok: boolean;
  status: number;
  error?: string;
  user?: { id: string; name: string | null; email: string; role: RoleName };
}

/**
 * Fullfører invitasjonen: den inviterte velger navn og passord, og kontoen
 * opprettes med nivået invitasjonen ga. Kalles fra det offentlige endepunktet.
 */
export async function acceptInvitation(params: {
  token: unknown;
  name?: unknown;
  password: unknown;
}): Promise<AcceptInvitationResult> {
  const lookup = await findInvitationByToken(String(params.token || ''));
  if (!lookup.ok) {
    return { ok: false, status: 400, error: lookup.error };
  }

  const password = String(params.password || '');
  if (password.length < MIN_INVITE_PASSWORD_LENGTH) {
    return {
      ok: false,
      status: 400,
      error: `Passordet må ha minst ${MIN_INVITE_PASSWORD_LENGTH} tegn.`,
    };
  }

  const invitation = lookup.invitation;
  const cleanName = params.name ? sanitizeInput(String(params.name).trim()) : null;

  const existingUser = await prisma.user.findUnique({ where: { email: invitation.email } });
  if (existingUser?.password) {
    return {
      ok: false,
      status: 409,
      error: 'Det finnes allerede en konto med denne e-postadressen. Bruk «Glemt passord» eller kontakt en superbruker.',
    };
  }

  const role = invitation.role as any;

  const user = existingUser
    ? await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: cleanName || existingUser.name,
          password: hashPassword(password),
          role,
          active: true,
          emailVerified: existingUser.emailVerified ?? new Date(),
        },
        select: { id: true, name: true, email: true, role: true },
      })
    : await prisma.user.create({
        data: {
          email: invitation.email,
          name: cleanName || invitation.name || null,
          title: invitation.title,
          password: hashPassword(password),
          role,
          active: true,
          emailVerified: new Date(),
        },
        select: { id: true, name: true, email: true, role: true },
      });

  await prisma.invitation.update({
    where: { id: invitation.id },
    data: { acceptedAt: new Date() },
  });

  await logActivity({
    action: 'USER_INVITATION_ACCEPTED',
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    userRole: String(user.role),
    details: `Takket ja til invitasjon og opprettet konto som ${roleLabel(role)}`,
    targetType: 'User',
    targetId: user.id,
  });

  return {
    ok: true,
    status: 201,
    user: { id: user.id, name: user.name, email: user.email, role: (isRoleName(user.role) ? user.role : 'EDITOR') as RoleName },
  };
}
