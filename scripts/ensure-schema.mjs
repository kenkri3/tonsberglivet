/**
 * Sikrer at databasen inneholder alt prisma/schema.prisma krever – uten å røre data.
 *
 * KJØRES SOM PRE-DEPLOY-STEG PÅ RAILWAY, før den nye versjonen får trafikk.
 * Feiler den, går ikke deployen live – den forrige versjonen fortsetter å kjøre.
 *
 * HVORFOR DENNE FINNES
 * Produksjonsdatabasen ble satt opp med `prisma db push` før migrasjoner fantes.
 * Den har derfor ingen `_prisma_migrations`, og `prisma migrate deploy` nekter å
 * kjøre med P3005 («database schema is not empty»). Samtidig manglet den tabeller
 * som skjemaet krevde – bl.a. "BookingRequest". Det gjorde at agentens verktøy
 * feilet med en Prisma-feil som ingen så, helt til feilmeldingen ble løftet fram.
 *
 * Hva skriptet gjør:
 *   1. Leser den idempotente baseline-SQL-en (generert fra skjemaet).
 *   2. Kjører den i én transaksjon. Hver setning tåler at objektet finnes fra før,
 *      så bare det som mangler blir opprettet.
 *   3. Logger hva som faktisk ble opprettet, så det synes i Railway-loggen.
 *   4. Sørger for at Prisma får riktig migrasjonshistorikk (best effort), slik at
 *      `prisma migrate deploy` kan brukes til vanlig migrasjonsdrift senere.
 *
 * Bruker bare `pg`, som er en produksjonsavhengighet – ingen Prisma-CLI i runtime.
 */
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import pg from 'pg';
import dotenv from 'dotenv';

const BASELINE_NAME = '20261003120000_baseline';
const BASELINE_SQL = `prisma/migrations/${BASELINE_NAME}/migration.sql`;

// Les .env når den finnes. På Railway injiseres variablene av plattformen, men
// lokalt og ved selvhosting ligger DATABASE_URL i .env. Uten dette feilet
// skjema-steget lokalt med «DATABASE_URL mangler» mens innholdssteget like
// etterpå importerte 124 artikler – fordi seed-legacy-content.mjs lastet .env
// og dette skriptet ikke gjorde det.
dotenv.config({ quiet: true });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('[ensure-schema] DATABASE_URL mangler – kan ikke sikre skjemaet.');
  process.exit(1);
}

if (!existsSync(BASELINE_SQL)) {
  console.error(`[ensure-schema] Finner ikke ${BASELINE_SQL}. Kjør \`npm run db:baseline\`.`);
  process.exit(1);
}

const sql = readFileSync(BASELINE_SQL, 'utf8');

const client = new pg.Client({ connectionString: url });
let lukket = false;

const snapshot = async () => {
  const { rows: t } = await client.query(
    `SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`
  );
  const { rows: e } = await client.query(
    `SELECT t.typname FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
     WHERE t.typtype='e' AND n.nspname='public' ORDER BY t.typname`
  );
  return { tabeller: t.map((r) => r.tablename), enums: e.map((r) => r.typname) };
};

try {
  await client.connect();

  const før = await snapshot();
  console.log(
    `[ensure-schema] Før: ${før.tabeller.length} tabeller, ${før.enums.length} enum-typer.`
  );

  // Ett transaksjonssteg: enten går hele baseline-en gjennom, eller ingenting.
  await client.query('BEGIN');
  try {
    await client.query(sql);

    // Sikre kolonner på eksisterende tabeller (f.eks. utvidede User-felter)
    const ensureColumns = [
      'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "title" TEXT;',
      'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;',
      'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true;',
      'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastActiveAt" TIMESTAMP(3);',
    ];
    for (const q of ensureColumns) {
      await client.query(q);
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }

  const etter = await snapshot();
  const nyeTabeller = etter.tabeller.filter((t) => !før.tabeller.includes(t));
  const nyeEnums = etter.enums.filter((e) => !før.enums.includes(e));

  if (nyeTabeller.length === 0 && nyeEnums.length === 0) {
    console.log('[ensure-schema] Skjemaet var allerede i synk. Ingenting endret.');
  } else {
    console.log(`[ensure-schema] OPPRETTET ${nyeTabeller.length} tabell(er): ${nyeTabeller.join(', ') || '-'}`);
    console.log(`[ensure-schema] OPPRETTET ${nyeEnums.length} enum-type(r): ${nyeEnums.join(', ') || '-'}`);
  }

  // ── Migrasjonshistorikk (best effort) ─────────────────────────────────────
  // Uten denne vil `prisma migrate deploy` fortsette å nekte med P3005. Vi lar
  // Prisma selv skrive historikken, så vi ikke risikerer å gjette feil format.
  let harHistorikk = false;
  try {
    const { rows } = await client.query(
      `SELECT 1 FROM "_prisma_migrations" WHERE migration_name = $1 AND finished_at IS NOT NULL`,
      [BASELINE_NAME]
    );
    harHistorikk = rows.length > 0;
  } catch {
    harHistorikk = false; // tabellen finnes ikke ennå
  }

  if (harHistorikk) {
    console.log('[ensure-schema] Prisma-migrasjonshistorikk er allerede på plass.');
  }

  // Lukk vår egen tilkobling FØR Prisma får åpne sine. På trange Postgres-
  // instanser (og PGlite) avvises Prismas tilkoblinger ellers med P1001.
  await client.end();
  lukket = true;

  if (!harHistorikk) {
    // Vi kaller Prisma-CLI-ens inngangsfil direkte i stedet for `npx`: npx er en
    // skriptfil (.cmd på Windows) og feiler stille fra spawnSync uten shell.
    const prismaCli = 'node_modules/prisma/build/index.js';
    const res = existsSync(prismaCli)
      ? spawnSync(process.execPath, [prismaCli, 'migrate', 'resolve', '--applied', BASELINE_NAME], {
          stdio: 'inherit',
        })
      : { status: 1 };

    if (res.status === 0) {
      console.log('[ensure-schema] Baseline registrert i Prisma-historikken.');
    } else {
      console.warn(
        '[ensure-schema] Klarte ikke å registrere baseline i Prisma-historikken. ' +
          'Skjemaet er likevel oppdatert – `prisma migrate deploy` må baselines manuelt senere.'
      );
    }
  }

  console.log('[ensure-schema] Ferdig. Skjemaet er i synk med prisma/schema.prisma.');
  process.exit(0);
} catch (err) {
  console.error('[ensure-schema] FEILET:', err.message);
  if (!lukket) {
    try {
      await client.end();
    } catch {}
  }
  // Pre-deploy feiler, men den kjørende versjonen består.
  process.exit(1);
}
