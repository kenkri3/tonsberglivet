import type { Metadata } from 'next';
import Link from 'next/link';
import { findInvitationByToken } from '@/lib/invitations';
import { InvitationForm } from './InvitationForm';

/** Invitasjonssider skal aldri indekseres – de inneholder en personlig nøkkel. */
export const metadata: Metadata = {
  title: 'Invitasjon — Tønsberglivet OS',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const lookup = await findInvitationByToken(decodeURIComponent(token || ''));

  if (!lookup.ok) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background px-4 py-16">
        <div className="w-full max-w-md bg-surface border border-border rounded-3xl p-8 shadow-xl space-y-4 text-center">
          <h1 className="text-xl font-bold text-foreground">Invitasjonen kan ikke brukes</h1>
          <p className="text-sm text-foreground-muted leading-relaxed">{lookup.error}</p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary-hover transition-colors"
            >
              Gå til innlogging
            </Link>
            <Link href="/" className="text-xs font-semibold text-foreground-muted hover:text-foreground">
              Tilbake til nettsiden
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { invitation } = lookup;

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-lg bg-surface border border-border rounded-3xl p-8 shadow-xl space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Tønsberglivet OS</span>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            {invitation.name ? `Velkommen, ${invitation.name}` : 'Du er invitert inn'}
          </h1>
          <p className="text-sm text-foreground-muted leading-relaxed">
            {invitation.invitedByName || 'En kollega'} har invitert deg med tilgangsnivået{' '}
            <strong className="text-foreground">{invitation.roleLabel}</strong>. Velg et passord for å aktivere
            kontoen.
          </p>
        </div>

        {invitation.note && (
          <div className="p-4 rounded-2xl bg-surface-muted border border-border text-sm text-foreground leading-relaxed whitespace-pre-line">
            {invitation.note}
          </div>
        )}

        <InvitationForm
          token={token}
          email={invitation.email}
          suggestedName={invitation.name || ''}
          expiresAt={invitation.expiresAt}
        />
      </div>
    </main>
  );
}
