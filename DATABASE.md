# Database og skjema

## Kort versjon

Skjemaet holdes i synk av **`npm run db:ensure`**, som kjører automatisk som
pre-deploy-steg på Railway (se `railway.json`). Den oppretter det som mangler i
databasen og rører ingenting som finnes. Du trenger ikke gjøre noe manuelt.

| Kommando | Gjør |
|---|---|
| `npm run db:ensure` | Bringer databasen i synk med `prisma/schema.prisma`. Trygg å kjøre når som helst, også mot produksjon. |
| `npm run db:baseline` | Genererer `prisma/migrations/20261003120000_baseline/migration.sql` på nytt fra skjemaet. |
| `npm run db:migrate` | `prisma migrate deploy` – for vanlig migrasjonsdrift senere. |

## Hvorfor det ser sånn ut

Produksjonsdatabasen ble satt opp med `prisma db push` **før** migrasjoner fantes.
Den har derfor ingen `_prisma_migrations`-tabell, og Prisma nekter å kjøre
migrasjoner mot den:

```
Error: P3005
The database schema is not empty.
```

Samtidig hadde skjemaet fått modeller som aldri nådde produksjon. `BookingRequest`
var én av dem. Konsekvensen var at agentens verktøy feilet med

```
The table `public.BookingRequest` does not exist in the current database.
```

…uten at noe så det: feilen lå inne i et verktøysvar, og panelet viste grønt lys.

## Hvordan det løses

`prisma/migrations/20261003120000_baseline/migration.sql` er en **idempotent**
utgave av hele skjemaet: hver setning tåler at objektet allerede finnes
(`CREATE TABLE IF NOT EXISTS`, `CREATE TYPE` pakket i `DO`-blokker som svelger
`duplicate_object`, og tilsvarende for indekser og fremmednøkler).

Det gjør at den samme filen kan kjøres mot en database som er tom, halvferdig
eller komplett – den oppretter kun det som mangler. Data går aldri tapt.

`scripts/ensure-schema.mjs` kjører denne filen i én transaksjon, logger hva som
ble opprettet, og registrerer baseline i Prismas historikk slik at
`prisma migrate deploy` kan tas i bruk senere.

Feiler pre-deploy-steget, går ikke den nye versjonen live – den forrige fortsetter
å kjøre. Skjemaet kan altså ikke bli halvveis oppdatert av en feilet deploy.

## Når du endrer skjemaet

1. Endre `prisma/schema.prisma`.
2. Kjør `npm run db:baseline` – den genererer baseline på nytt fra skjemaet.
3. Commit både skjemaet og `prisma/migrations/…/migration.sql`.
4. Deploy. Pre-deploy-steget oppretter de nye tabellene.

Dette dekker **additive** endringer (nye tabeller, kolonner, indekser, enums).
Skal du fjerne eller endre noe som finnes, må det gjøres som en egen, gjennomtenkt
operasjon – den idempotente filen rører aldri eksisterende objekter.

## Verifisert

Baseline-en er testet mot ekte PostgreSQL (PGlite 18/17) i tre scenarioer:
tom database, kjørt to ganger på rad, og en database der `BookingRequest` er
droppet mens andre tabeller har data. Alle 12 sjekker passer, inkludert at
eksisterende rader og unike indekser overlever.

Testskriptet ligger i `scratch/pglite-verify/` (scratch er ikke i git).
