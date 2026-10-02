import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSessionToken, verifyPassword, hashPassword, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS, SessionUser } from '@/lib/auth';

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

      user = {
        id: 'admin-env-id',
        name: cleanEmail === 'cecilie@tonsberglivet.no' ? 'Cecilie Bækken Dahl' : 'Tønsberglivet Admin',
        email: cleanEmail,
        role: 'ADMIN',
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
              role: 'ADMIN',
              password: hashPassword(password),
            },
          });
          user.id = created.id;
        } else {
          user.id = dbUser.id;
          if (dbUser.name) user.name = dbUser.name;
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { password: hashPassword(password), role: 'ADMIN' },
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
            // Tom database: opprett den første administratoren.
            const newAdmin = await prisma.user.create({
              data: {
                email: cleanEmail,
                name: cleanEmail === 'cecilie@tonsberglivet.no' ? 'Cecilie Bækken Dahl' : 'Tønsberglivet Admin',
                role: 'ADMIN',
                password: hashPassword(password),
              },
            });
            user = {
              id: newAdmin.id,
              name: newAdmin.name,
              email: newAdmin.email,
              role: 'ADMIN',
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
