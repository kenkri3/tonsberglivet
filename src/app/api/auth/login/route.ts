import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSessionToken, verifyPassword, hashPassword, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS, SessionUser } from '@/lib/auth';
import { logActivity } from '@/lib/activity';
import { checkRateLimit, getClientIdentity } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Ugyldig JSON i forespørselen.' },
        { status: 400 }
      );
    }
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'E-postadresse og passord er påkrevd.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // ── Rate limiting ──────────────────────────────────────────────────────
    // Innlogging var tidligere det eneste endepunktet uten grense. Uten dette
    // var scrypt-kostnaden eneste motstand mot en brute force mot admin-passordet.
    //
    // Tre lag, fordi et angrep kan se ulikt ut:
    //   1) per klient  – stopper én IP som gjetter mange passord
    //   2) per e-post  – stopper fordelt gjetting mot én konto fra mange IP-er
    //   3) globalt     – stopper fordelt gjetting mot mange kontoer
    //
    // Grensene er romslige nok for en som taster feil noen ganger, og stramme
    // nok til at gjetting blir upraktisk. Vinduet er 15 minutter.
    //
    // To feller er rettet her, begge oppdaget ved at en ekte bruker ble låst ute
    // på FØRSTE forsøk:
    //
    // 1. Klarer vi ikke å identifisere klienten sikkert, deler alle samme bøtte.
    //    Med grense 10 ville ti tilfeldige forespørsler fra hvem som helst låse
    //    ute hele redaksjonen. Delt bøtte krever derfor en romslig grense.
    //
    // 2. Den globale grensen på 60 gjaldt HELE nettstedet. Automatiske skannere
    //    treffer /api/auth/login kontinuerlig, så den ble fylt av andre enn den
    //    som faktisk prøvde å logge inn – og da hjelper det ikke at man selv
    //    taster riktig. Den er hevet kraftig; det er per-e-post som er det
    //    reelle vernet mot brute force mot én konto.
    const client = getClientIdentity(request);
    const perClientGrense = client.identified ? 10 : 200;
    const [perClient, perEmail, global] = await Promise.all([
      checkRateLimit(`login_client_${client.id}`, perClientGrense, 900, client.identified),
      checkRateLimit(`login_email_${cleanEmail}`, 20, 900, true),
      checkRateLimit('login_global', 600, 900, true),
    ]);

    if (!perClient.allowed || !perEmail.allowed || !global.allowed) {
      const retryAfter = Math.max(perClient.resetSeconds, perEmail.resetSeconds, global.resetSeconds);
      // Si hvilken grense som slo inn. Uten det er meldingen umulig å handle på:
      // en låst ute vet ikke om det gjelder deres egne forsøk eller andres.
      const hvilken = !perEmail.allowed
        ? 'for mange forsøk på denne e-postadressen'
        : !perClient.allowed
          ? 'for mange forsøk fra denne tilkoblingen'
          : 'for mange forsøk på nettstedet samlet';
      return NextResponse.json(
        {
          success: false,
          error: `For mange innloggingsforsøk (${hvilken}). Prøv igjen om ${Math.ceil(retryAfter / 60)} minutt(er).`,
          reason: !perEmail.allowed ? 'email' : !perClient.allowed ? 'client' : 'global',
          retryAfterSeconds: retryAfter,
        },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    const envAdminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim().toLowerCase() : null;
    const envAdminPassword = process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD.trim() : null;

    let user: SessionUser | null = null;

    // 1. Sjekk primært mot miljøvariabler fra Railway (ADMIN_EMAIL og ADMIN_PASSWORD)
    if (envAdminEmail && envAdminPassword && cleanEmail === envAdminEmail) {
      if (password !== envAdminPassword) {
        return NextResponse.json(
          { success: false, error: 'Feil e-postadresse eller passord.' },
          { status: 401 }
        );
      }

      // Kontoen som er konfigurert i miljøet (ADMIN_EMAIL) er eieren av
      // systemet og får derfor superbruker-nivået: bare superbrukere kan
      // invitere nye brukere og dele ut tilgangsnivåer.
      user = {
        id: 'admin-env-id',
        name: cleanEmail === 'cecilie@tonsberglivet.no' ? 'Cecilie Bækken Dahl' : 'Tønsberglivet Admin',
        email: cleanEmail,
        role: 'SUPERADMIN',
      };

      // Synkroniser/oppdater i databasen hvis tilgjengelig
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });

        if (!dbUser) {
          const created = await prisma.user.create({
            data: {
              email: cleanEmail,
              name: user.name,
              role: 'SUPERADMIN',
              password: hashPassword(password),
            },
          });
          user.id = created.id;
        } else {
          user.id = dbUser.id;
          if (dbUser.name) user.name = dbUser.name;
          // Passordet holdes i synk med miljøvariabelen. Kontoen er eieren av
          // systemet og settes derfor til superbruker.
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { password: hashPassword(password), role: 'SUPERADMIN' },
          });
        }
      } catch (syncErr) {
        console.warn('[Auth]: Kunne ikke synkronisere admin-passord til DB, men godkjenner via miljøvariabel:', syncErr);
      }
    } else {
      // 2. Standard database-autentisering.
      //
      // SIKKERHET: Vi oppretter eller endrer ikke kontoer her med mindre databasen
      // er helt tom (førstegangsoppsett). Tidligere kunne hvem som helst logge inn
      // som cecilie@/admin@ med et valgfritt passord, og dermed både opprette en
      // ADMIN-konto og overta en eksisterende ADMIN-konto som manglet passord.
      const BOOTSTRAP_EMAILS = ['cecilie@tonsberglivet.no', 'admin@tonsberglivet.no'];

      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });

        if (dbUser && dbUser.password) {
          if (dbUser.active === false) {
            return NextResponse.json(
              { success: false, error: "Denne brukerkontoen er deaktivert. Kontakt administrator." },
              { status: 403 }
            );
          }
          const isValid = verifyPassword(password, dbUser.password);
          if (!isValid) {
            return NextResponse.json(
              { success: false, error: 'Feil e-postadresse eller passord.' },
              { status: 401 }
            );
          }
          user = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role as any,
          };
        } else {
          const isFirstRun = (await prisma.user.count()) === 0;

          if (isFirstRun && !dbUser && BOOTSTRAP_EMAILS.includes(cleanEmail)) {
            // Tom database: opprett den første administratoren. Den første
            // kontoen i et tomt system er eieren og får superbruker-nivå.
            const newAdmin = await prisma.user.create({
              data: {
                email: cleanEmail,
                name: cleanEmail === 'cecilie@tonsberglivet.no' ? 'Cecilie Bækken Dahl' : 'Tønsberglivet Admin',
                role: 'SUPERADMIN',
                password: hashPassword(password),
              },
            });
            user = {
              id: newAdmin.id,
              name: newAdmin.name,
              email: newAdmin.email,
              role: 'SUPERADMIN',
            };
          } else if (isFirstRun && dbUser && !dbUser.password) {
            // Tom database og kontoen finnes uten passord: sett passordet nå.
            const updated = await prisma.user.update({
              where: { id: dbUser.id },
              data: { password: hashPassword(password) },
            });
            user = {
              id: updated.id,
              name: updated.name,
              email: updated.email,
              role: updated.role as any,
            };
          } else {
            // Systemet er i drift: ingen selvregistrering, ingen passordtilskrivning.
            return NextResponse.json(
              { success: false, error: 'Feil e-postadresse eller passord.' },
              { status: 401 }
            );
          }
        }
      } catch (dbError: any) {
        // Databasen er utilgjengelig — da kan vi ikke verifisere noe passord og
        // gir derfor ingen sesjon. (Tidligere ga dette en gyldig ADMIN-sesjon til
        // cecilie@/admin@ med et vilkårlig passord.)
        console.error('[Auth] Databasefeil under innlogging — avviser forespørselen:', dbError);
        return NextResponse.json(
          {
            success: false,
            error: 'Innlogging er midlertidig utilgjengelig fordi databasen ikke svarer. Prøv igjen om litt.',
          },
          { status: 503 }
        );
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Ugyldig brukernavn eller passord.' },
        { status: 401 }
      );
    }

    const token = createSessionToken(user);

    // Oppdater lastActiveAt og logg innlogging
    try {
      if (user.id && user.id !== 'admin-env-id') {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastActiveAt: new Date() },
        });
      }
      await logActivity({
        user,
        action: 'USER_LOGIN',
        details: 'Logget inn i administrasjonspanelet',
        targetType: 'User',
        targetId: user.id !== 'admin-env-id' ? user.id : null,
      });
    } catch (e) {
      // Ignorerer feil i aktivitetslogg
    }

    const response = NextResponse.json({
      success: true,
      user,
      message: 'Innlogging vellykket.',
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Feil ved innlogging: ' + (err?.message || 'Serverfeil') },
      { status: 500 }
    );
  }
}
