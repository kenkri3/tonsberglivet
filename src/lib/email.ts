import { getSetting } from './settings';
import { prisma } from './prisma';

export interface BookingConfirmationData {
  id: string;
  name: string;
  email: string;
  orgNr?: string;
  zone: string;
  dates: string;
  powerNeeded: boolean;
  waterNeeded?: boolean;
  totalPrice: number;
  confirmedAt?: Date;
}

/**
 * Genererer en stilig, responsiv HTML-epost for leiebekreftelse.
 */
export function generateBookingEmailHtml(booking: BookingConfirmationData): string {
  const formattedPrice = booking.totalPrice.toLocaleString('nb-NO');
  const orderRef = `TBG-${booking.id.padStart(5, '0')}`;
  const confirmationDate = (booking.confirmedAt || new Date()).toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="nb">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bekreftelse på Torvleie i Tønsberg</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #0f172a; padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 8px 0 0; font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
    .badge { display: inline-block; background: #22c55e; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; margin-top: 12px; }
    .content { padding: 32px 24px; }
    .intro { font-size: 16px; line-height: 1.6; color: #334155; margin-bottom: 24px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .card-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-top: 0; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
    .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
    .row:last-child { margin-bottom: 0; }
    .label { color: #64748b; }
    .value { font-weight: 600; color: #0f172a; text-align: right; }
    .rules-list { margin: 0; padding-left: 20px; color: #475569; font-size: 13px; line-height: 1.6; }
    .rules-list li { margin-bottom: 8px; }
    .contact-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin-top: 24px; font-size: 13px; color: #1e40af; }
    .footer { background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>tønsberglivet</h1>
      <p>Byrom & Torvleie Forvaltning</p>
      <div class="badge">Søknad Godkjent</div>
    </div>
    <div class="content">
      <p class="intro">Hei <strong>${booking.name}</strong>,</p>
      <p class="intro">Vi har gleden av å bekrefte din leie av byrom og standplass i Tønsberg. Alt er nå registrert og godkjent i vårt byromssystem.</p>

      <div class="card">
        <div class="card-title">Ordredetaljer (Ref: ${orderRef})</div>
        <div class="row">
          <span class="label">Leietaker:</span>
          <span class="value">${booking.name} ${booking.orgNr ? `(Org: ${booking.orgNr})` : ''}</span>
        </div>
        <div class="row">
          <span class="label">Areal / Sone:</span>
          <span class="value">${booking.zone}</span>
        </div>
        <div class="row">
          <span class="label">Leieperiode:</span>
          <span class="value">${booking.dates}</span>
        </div>
        <div class="row">
          <span class="label">Strømbehov (400V/32A):</span>
          <span class="value">${booking.powerNeeded ? 'Ja, tilkobling inkludert' : 'Nei'}</span>
        </div>
        ${booking.waterNeeded !== undefined ? `
        <div class="row">
          <span class="label">Vann & Avløp:</span>
          <span class="value">${booking.waterNeeded ? 'Ja, godkjent for næringsmidler' : 'Nei'}</span>
        </div>` : ''}
        <div class="row" style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #cbd5e1;">
          <span class="label" style="font-size: 15px; font-weight: 700; color: #0f172a;">Totalpris eks. MVA:</span>
          <span class="value" style="font-size: 16px; font-weight: 800; color: #0f172a;">${formattedPrice} kr</span>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Viktige riggeregler & praktisk info</div>
        <ul class="rules-list">
          <li><strong>Rigg & Varemottak:</strong> Kjøring inn på torvområdet er kun tillatt for av-/pålessing mellom kl. 06:00–09:30 og etter kl. 18:00. Kjøretøy må parkeres på offentlig parkering utenfor torvet.</li>
          <li><strong>Strømtilkobling:</strong> Nøkkel til strømskap kvitteres ut ved henvendelse til Tønsberglivet. Skap må alltid holdes låst.</li>
          <li><strong>Avfall & Renhold:</strong> Standplassen skal ryddes, feies og forlates i ren stand daglig. Alt avfall må kildesorteres og borttransporteres for egen regning.</li>
          <li><strong>Ro & Orden:</strong> Bruk av lydanlegg må forhåndsgodkjennes og følge Tønsberg kommunes politivedtekter.</li>
        </ul>
      </div>

      <div class="contact-box">
        <strong>Har du spørsmål før opprigg?</strong><br>
        Kontakt byromskoordinator Cecilie B. på e-post <a href="mailto:post@tonsberglivet.no" style="color: #1d4ed8; text-decoration: underline;">post@tonsberglivet.no</a> eller tlf. <strong>33 30 00 00</strong>.
      </div>
    </div>

    <div class="footer">
      Bekreftelse utstedt ${confirmationDate} • Tønsberglivet AS • Norges eldste kystby<br>
      Faktura oversendes via Duett ERP / Peppol EHF 3.0 med 14 dagers forfall.
    </div>
  </div>
</body>
</html>`;
}

export interface BookingEmailSendResult {
  /** true kun når e-posten faktisk er levert til en e-posttransport. */
  success: boolean;
  /** true kun når meldingen har forlatt serveren (Resend). */
  delivered: boolean;
  /** 'resend' = ekte utsending, 'smtp'/'mock_logged' = simulert/logget, 'failed' = forsøkt og feilet. */
  mode: 'resend' | 'smtp' | 'mock_logged' | 'failed';
  messageId?: string;
  message: string;
}

/**
 * Sender bekreftelses-epost via Resend API eller logger dersom ingen nøkkel er satt opp.
 * Rapporterer alltid den faktiske leveringsstatusen – «success» er aldri true
 * når e-posten bare er logget lokalt.
 */
export async function sendBookingConfirmationEmail(
  booking: BookingConfirmationData
): Promise<BookingEmailSendResult> {
  const resendApiKey = (await getSetting('resend_api_key')) || process.env.RESEND_API_KEY;
  const smtpUrl = (await getSetting('smtp_url')) || process.env.SMTP_URL;

  const subject = `Bekreftelse på Torvleie i Tønsberg – ${booking.zone} (${booking.dates})`;
  const html = generateBookingEmailHtml(booking);

  let resendFailure: string | null = null;

  // 1. Send via Resend dersom nøkkel er tilgjengelig
  if (resendApiKey && resendApiKey.trim() !== '') {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'Tønsberglivet Byrom <post@tonsberglivet.no>',
          to: [booking.email],
          subject,
          html,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`[Email] Bekreftelse sendt via Resend til ${booking.email} (ID: ${data.id})`);
        return {
          success: true,
          delivered: true,
          mode: 'resend',
          messageId: data.id,
          message: `Bekreftelsen er sendt til ${booking.email} via Resend.`,
        };
      } else {
        const errText = await res.text();
        resendFailure = `Resend API svarte med status ${res.status}`;
        console.warn(`[Email] Resend API svarte med feil (${res.status}): ${errText}`);
      }
    } catch (error: any) {
      resendFailure = `Nettverksfeil mot Resend: ${error?.message || 'ukjent feil'}`;
      console.error('[Email] Feil ved utsending via Resend:', error);
    }
  }

  // 2. SMTP er konfigurert, men utsending er ikke implementert -> simulert
  if (smtpUrl && smtpUrl.trim() !== '') {
    console.log(`[Email] SMTP konfigurert (${smtpUrl}). Utsending er ikke implementert – logger i stedet for ${booking.email}`);
    return {
      success: false,
      delivered: false,
      mode: 'smtp',
      message: `SMTP-utsending er ikke implementert. E-posten til ${booking.email} er kun logget på serveren.`,
    };
  }

  // 3. Fallback: Logging til konsoll (utviklingsmodus / manglende nøkler)
  console.log(`\n📧 [E-POST UTSENDING] (BYOK fallback logger)`);
  console.log(`Til: ${booking.email}`);
  console.log(`Emne: ${subject}`);
  console.log(`Leietaker: ${booking.name} (Org: ${booking.orgNr || 'N/A'})`);
  console.log(`Sone: ${booking.zone}`);
  console.log(`Totalpris: ${booking.totalPrice} kr`);
  console.log(`Status: E-post generert og klar for produksjon.\n`);

  return {
    success: false,
    delivered: false,
    mode: resendFailure ? 'failed' : 'mock_logged',
    message: resendFailure
      ? `${resendFailure}. Ingen e-posttjeneste er konfigurert – meldingen er kun logget på serveren.`
      : 'Ingen e-posttjeneste er konfigurert. Meldingen er kun logget på serveren (simulert utsending).',
  };
}

/**
 * Henter en booking fra databasen, godkjenner den og sender e-postbekreftelse.
 * Kaster feil dersom bookingen ikke finnes eller ikke kan oppdateres – vi
 * oppretter aldri en oppdiktet booking.
 */
export async function approveAndConfirmBooking(bookingId: string): Promise<{
  success: boolean;
  booking: BookingConfirmationData;
  emailSent: boolean;
  emailMode: 'resend' | 'smtp' | 'mock_logged' | 'failed' | 'not_attempted';
  message: string;
}> {
  // 1. Oppslag i Prisma (eneste kilde til bookinger)
  let dbBooking: any;
  try {
    dbBooking = await prisma.bookingRequest.findUnique({
      where: { id: bookingId },
    });
  } catch (dbError: any) {
    console.error(`[Booking Approval] Kunne ikke lese booking ${bookingId} fra databasen:`, dbError);
    throw new Error(
      `Kunne ikke lese torvleiesøknad «${bookingId}» fra databasen. Ingen endring er gjort og ingen e-post er sendt.`
    );
  }

  if (!dbBooking) {
    throw new Error(`Fant ingen torvleiesøknad med ID «${bookingId}». Ingen e-post er sendt.`);
  }

  const datesFormatted = dbBooking.startDate && dbBooking.endDate
    ? `${dbBooking.startDate.toLocaleDateString('nb-NO')} - ${dbBooking.endDate.toLocaleDateString('nb-NO')}`
    : 'Etter avtale';

  const bookingData: BookingConfirmationData = {
    id: dbBooking.id,
    name: dbBooking.name,
    email: dbBooking.email,
    orgNr: dbBooking.orgNr || undefined,
    zone: dbBooking.zone || 'Ikke spesifisert',
    dates: datesFormatted,
    powerNeeded: dbBooking.powerNeeded,
    waterNeeded: dbBooking.waterNeeded,
    // Kun lagret beløp. Mangler prisen, viser vi 0 – vi finner ikke på et beløp.
    totalPrice: typeof dbBooking.totalPrice === 'number' && Number.isFinite(dbBooking.totalPrice) ? dbBooking.totalPrice : 0,
    confirmedAt: new Date(),
  };

  // 2. Oppdater status og confirmedAt i databasen før e-post går ut
  try {
    await prisma.bookingRequest.update({
      where: { id: bookingId },
      data: {
        status: 'APPROVED',
        confirmedAt: new Date(),
      },
    });
  } catch (dbError: any) {
    console.error(`[Booking Approval] Kunne ikke oppdatere booking ${bookingId}:`, dbError);
    throw new Error(
      `Kunne ikke godkjenne torvleiesøknad «${bookingId}» i databasen. Status er uendret og ingen e-post er sendt.`
    );
  }

  // 3. Send e-postbekreftelse (defensiv try/catch – godkjenningen er allerede lagret)
  let emailSent = false;
  let emailMode: 'resend' | 'smtp' | 'mock_logged' | 'failed' | 'not_attempted' = 'not_attempted';
  let emailMessage = 'E-postbekreftelse ble ikke forsøkt sendt.';
  try {
    const emailResult = await sendBookingConfirmationEmail(bookingData);
    emailSent = emailResult.delivered;
    emailMode = emailResult.mode;
    emailMessage = emailResult.message;
  } catch (emailErr: any) {
    emailMode = 'failed';
    emailMessage = `E-postutsending feilet: ${emailErr?.message || 'ukjent feil'}`;
    console.error(`[Booking Approval] Feil under e-postsending for booking ${bookingId}:`, emailErr);
  }

  return {
    success: true,
    booking: bookingData,
    emailSent,
    emailMode,
    message: `Booking #${bookingId} (${bookingData.name}) er godkjent. ${emailMessage}`,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// INVITASJON TIL NY MEDARBEIDER
// ═══════════════════════════════════════════════════════════════════════════

export interface InvitationEmailData {
  email: string;
  name?: string | null;
  roleLabel: string;
  invitedByName: string;
  inviteUrl: string;
  note?: string | null;
  expiresAt: string;
}

export function generateInvitationEmailHtml(data: InvitationEmailData): string {
  const greeting = data.name ? `Hei ${data.name}!` : 'Hei!';
  const expires = new Date(data.expiresAt).toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="nb">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitasjon til Tønsberglivet OS</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:24px auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
    <div style="background:#0f172a;padding:28px 24px;text-align:center;color:#ffffff;">
      <h1 style="margin:0;font-size:22px;font-weight:800;letter-spacing:-0.4px;">tønsberglivet</h1>
      <p style="margin:8px 0 0;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Administrasjonspanel</p>
    </div>
    <div style="padding:28px 24px;">
      <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 16px;">${greeting}</p>
      <p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 20px;">
        ${data.invitedByName} har invitert deg til Tønsberglivet OS med tilgangsnivået
        <strong>${data.roleLabel}</strong>.
      </p>
      ${data.note ? `<div style="background:#f1f5f9;border-left:3px solid #1d4ed8;border-radius:8px;padding:14px 16px;margin:0 0 20px;font-size:14px;line-height:1.6;color:#334155;white-space:pre-line;">${data.note.replace(/</g, '&lt;')}</div>` : ''}
      <p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 24px;">
        Klikk på knappen for å velge ditt eget passord. Lenken er personlig og gyldig til <strong>${expires}</strong>.
      </p>
      <div style="text-align:center;margin:0 0 24px;">
        <a href="${data.inviteUrl}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:9999px;">Velg passord og aktiver kontoen</a>
      </div>
      <p style="font-size:12px;line-height:1.6;color:#64748b;margin:0;">
        Virker ikke knappen? Kopier denne adressen inn i nettleseren:<br>
        <span style="word-break:break-all;color:#1d4ed8;">${data.inviteUrl}</span>
      </p>
    </div>
    <div style="background:#f1f5f9;padding:18px 24px;text-align:center;font-size:12px;color:#64748b;border-top:1px solid #e2e8f0;">
      Denne invitasjonen er sendt til ${data.email}. Har du ikke bedt om den, kan du se bort fra e-posten.
    </div>
  </div>
</body>
</html>`;
}

export interface InvitationEmailResult {
  /** true kun når e-posten faktisk er levert til en e-posttransport. */
  delivered: boolean;
  mode: 'resend' | 'smtp' | 'mock_logged' | 'failed';
  message: string;
}

/**
 * Sender invitasjons-e-post. Uten konfigurert e-posttjeneste logges innholdet på
 * serveren, og API-et returnerer lenken slik at den kan deles manuelt. Vi later
 * aldri som om e-posten er sendt.
 */
export async function sendInvitationEmail(data: InvitationEmailData): Promise<InvitationEmailResult> {
  const resendApiKey = (await getSetting('resend_api_key')) || process.env.RESEND_API_KEY;
  const smtpUrl = (await getSetting('smtp_url')) || process.env.SMTP_URL;
  const subject = `Invitasjon til Tønsberglivet OS (${data.roleLabel})`;
  const html = generateInvitationEmailHtml(data);

  let resendFailure: string | null = null;

  if (resendApiKey && resendApiKey.trim() !== '') {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'Tønsberglivet <post@tonsberglivet.no>',
          to: [data.email],
          subject,
          html,
        }),
      });

      if (res.ok) {
        return {
          delivered: true,
          mode: 'resend',
          message: `Invitasjonen er sendt til ${data.email}.`,
        };
      }
      resendFailure = `Resend API svarte med status ${res.status}`;
      console.warn(`[Email] Resend avviste invitasjonen til ${data.email} (${res.status}).`);
    } catch (error: any) {
      resendFailure = `Nettverksfeil mot Resend: ${error?.message || 'ukjent feil'}`;
      console.error('[Email] Feil ved utsending av invitasjon:', error);
    }
  }

  if (smtpUrl && smtpUrl.trim() !== '') {
    console.log(`[Email] SMTP er konfigurert, men utsending er ikke implementert. Invitasjonslenke til ${data.email}: ${data.inviteUrl}`);
    return {
      delivered: false,
      mode: 'smtp',
      message: `SMTP-utsending er ikke implementert. Kopier invitasjonslenken og send den til ${data.email} selv.`,
    };
  }

  console.log(`\n📧 [INVITASJON] Ingen e-posttjeneste er konfigurert – lenken logges her:`);
  console.log(`Til: ${data.email} (${data.roleLabel})`);
  console.log(`Lenke: ${data.inviteUrl}\n`);

  return {
    delivered: false,
    mode: resendFailure ? 'failed' : 'mock_logged',
    message: resendFailure
      ? `${resendFailure}. Kopier invitasjonslenken og send den til ${data.email} selv.`
      : `Ingen e-posttjeneste er konfigurert. Kopier invitasjonslenken og send den til ${data.email} selv.`,
  };
}
