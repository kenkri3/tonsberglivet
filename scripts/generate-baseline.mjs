/**
 * Gjør Prisma sin «from-empty»-SQL idempotent.
 *
 * HVORFOR: Prisma genererer `CREATE TABLE` uten IF NOT EXISTS. Kjørt mot en
 * database som allerede har noen av tabellene – slik produksjon har det – stopper
 * den på «relation already exists». Ved å gjøre hver setning tåle at objektet
 * finnes fra før, kan den samme filen kjøres mot en tom, halvferdig eller
 * komplett database, så mange ganger vi vil, uten at data røres.
 *
 * Kjøres av `npm run db:baseline`:
 *   prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script
 *     > prisma/.baseline.raw.sql
 *   node scripts/generate-baseline.mjs
 */
import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';

const RAW = 'prisma/.baseline.raw.sql';
const OUT = 'prisma/migrations/20261003120000_baseline/migration.sql';

if (!existsSync(RAW)) {
  console.error(`${RAW} finnes ikke. Kjør kommandoen over først.`);
  process.exit(1);
}

// PowerShell skriver UTF-8 med BOM og CRLF. En BOM midt i en SQL-fil er ugyldig
// for Postgres, og CRLF gjorde at \n-mønstrene under ikke traff.
let sql = readFileSync(RAW, 'utf8')
  .replace(/^\uFEFF/, '')
  .replace(/\r\n/g, '\n');

const count = { enum: 0, table: 0, index: 0, fk: 0 };

// CREATE TYPE "X" AS ENUM (...)  ->  tåler at typen finnes fra før
sql = sql.replace(/CREATE TYPE ("[^"]+") AS ENUM \(([\s\S]*?)\);/g, (_m, name, values) => {
  count.enum++;
  return (
    `DO $$ BEGIN\n` +
    `  CREATE TYPE ${name} AS ENUM (${values});\n` +
    `EXCEPTION WHEN duplicate_object THEN NULL;\n` +
    `END $$;`
  );
});

// CREATE TABLE "X" ( ... );  ->  CREATE TABLE IF NOT EXISTS
sql = sql.replace(/CREATE TABLE (?!IF NOT EXISTS)/g, () => {
  count.table++;
  return 'CREATE TABLE IF NOT EXISTS ';
});

// CREATE [UNIQUE] INDEX "X" ON ...  ->  IF NOT EXISTS
sql = sql.replace(/CREATE (UNIQUE )?INDEX (?!IF NOT EXISTS)/g, (_m, unique) => {
  count.index++;
  return `CREATE ${unique ?? ''}INDEX IF NOT EXISTS `;
});

// ALTER TABLE ... ADD CONSTRAINT ...  ->  tåler at constrainten finnes fra før
sql = sql.replace(
  /ALTER TABLE ("[^"]+") ADD CONSTRAINT ("[^"]+") ([\s\S]*?);\n/g,
  (_m, table, name, body) => {
    count.fk++;
    return (
      `DO $$ BEGIN\n` +
      `  ALTER TABLE ${table} ADD CONSTRAINT ${name} ${body};\n` +
      `EXCEPTION WHEN duplicate_object THEN NULL;\n` +
      `END $$;\n`
    );
  }
);

const header = `-- BASELINE for Tønsberglivet — GENERERT, ikke rediger for hånd.
--
-- Kilden er prisma/schema.prisma. Vil du endre noe her, endre skjemaet og kjør
-- \`npm run db:baseline\`, som genererer denne filen på nytt.
--
-- Filen er med vilje IDEMPOTENT: hver setning tåler at objektet allerede finnes.
-- Grunnen er at produksjonsdatabasen ble satt opp med \`prisma db push\` før
-- migrasjoner fantes. Den har derfor ingen _prisma_migrations, og
-- \`prisma migrate deploy\` nekter å kjøre (P3005 «database schema is not empty»).
-- I tillegg manglet den tabeller som skjemaet krevde – bl.a. "BookingRequest",
-- som gjorde at agentens verktøy feilet lenge uten at noe så det.
--
-- Med denne filen kan \`node scripts/ensure-schema.mjs\` kjøre på hver deploy og
-- bringe databasen i synk: den oppretter det som mangler og rører ingenting som
-- finnes. Data går aldri tapt.
--
-- Den ligger også i prisma/migrations/ slik at Prisma kan overta vanlig
-- migrasjonsdrift senere (se scripts/ensure-schema.mjs).

`;

writeFileSync(OUT, header + sql, 'utf8');
rmSync(RAW, { force: true });

console.log(
  `Skrev ${OUT}\n  ${count.enum} enums, ${count.table} tabeller, ` +
    `${count.index} indekser, ${count.fk} fremmednøkler gjort idempotente.`
);
