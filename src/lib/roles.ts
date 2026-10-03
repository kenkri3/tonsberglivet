/**
 * Rollestige for Tønsberglivet OS.
 *
 * Nivåene er en rangstige, ikke bare etiketter: høyere rang arver alt lavere
 * nivåer kan. «Superbruker» er eiernivået – det kan invitere nye brukere, dele
 * ut tilgangsnivåer og endre andre superbrukere. «Innsyn» kan se, ikke endre.
 *
 * Filen er bevisst uten avhengigheter (ingen @prisma/client-import), slik at
 * både serverkode og klientkomponenter kan bruke de samme etikettene. Det
 * holder UI og API fra å beskrive samme rolle ulikt.
 */

export type RoleName = 'SUPERADMIN' | 'ADMIN' | 'EDITOR' | 'VIEWER';

/** Rangeringen bestemmer hvem som kan dele ut hvilke nivåer. */
export const ROLE_RANK: Record<RoleName, number> = {
  SUPERADMIN: 40,
  ADMIN: 30,
  EDITOR: 20,
  VIEWER: 10,
};

/** Høyeste nivå først – rekkefølgen brukes i velgere og lister. */
export const ROLE_ORDER: RoleName[] = ['SUPERADMIN', 'ADMIN', 'EDITOR', 'VIEWER'];

export const ROLE_LABELS: Record<RoleName, string> = {
  SUPERADMIN: 'Superbruker',
  ADMIN: 'Administrator',
  EDITOR: 'Redaktør',
  VIEWER: 'Innsyn',
};

/** Kort forklaring til invitasjonsskjemaet – hva nivået faktisk gir. */
export const ROLE_DESCRIPTIONS: Record<RoleName, string> = {
  SUPERADMIN: 'Eiernivå. Kan invitere nye brukere, dele ut alle tilgangsnivåer og endre andre superbrukere.',
  ADMIN: 'Full tilgang til drift, innhold og meldinger. Kan invitere administratorer, redaktører og innsyn.',
  EDITOR: 'Kan svare på henvendelser, tildele samtaler og jobbe med innhold. Kan ikke endre brukere.',
  VIEWER: 'Kan se innhold og statistikk, men ikke svare, tildele eller endre noe.',
};

export function isRoleName(value: unknown): value is RoleName {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(ROLE_RANK, value);
}

export function roleRank(role: unknown): number {
  return isRoleName(role) ? ROLE_RANK[role] : 0;
}

export function roleLabel(role: unknown): string {
  return isRoleName(role) ? ROLE_LABELS[role] : 'Ukjent nivå';
}

/** Er `role` på samme nivå som eller høyere enn `minimum`? */
export function isAtLeast(role: unknown, minimum: RoleName): boolean {
  return roleRank(role) >= ROLE_RANK[minimum];
}

/**
 * Kan rollen dele ut tilgangsnivåer i det hele tatt?
 *
 * Administratornivå (administrator og superbruker) kan opprette og invitere
 * brukere på alle nivåer – også superbruker. Det er samme tillit som fra før:
 * en administrator kunne allerede opprette administratorer direkte. Redaktør og
 * innsyn kan ikke endre brukere i det hele tatt.
 *
 * Superbruker er fortsatt et eget vern: bare en superbruker kan endre eller
 * slette en annen superbruker.
 */
export function canManageAccess(role: unknown): boolean {
  return isAtLeast(role, 'ADMIN');
}

/** Roller som teller som «administrator» når vi verner om siste eier. */
export const ADMIN_LEVEL_ROLES: RoleName[] = ['SUPERADMIN', 'ADMIN'];
