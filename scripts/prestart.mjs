/**
 * Kjøres før `next start`, i app-containeren.
 *
 * HVORFOR IKKE PRE-DEPLOY: Railway kjører pre-deploy i en kontekst der den
 * private databasen (postgres.railway.internal) ikke alltid er nåbar – bygget
 * feiler med P1001 når det prøver. App-containeren derimot snakker med
 * databasen hele tiden, så det er den trygge plassen å gjøre dette.
 *
 * Skriptet gjør to ting:
 *   1. Sikrer at databasen har alle tabellene skjemaet krever (ensure-schema).
 *   2. Skriver innholdet fra kundens gamle nettsted hvis det ikke alt ligger der.
 *
 * Det feiler ALDRI ut mot appen: en feil her skal ikke hindre at nettstedet
 * starter. Alt logges, og begge stegene hopper raskt over når de er gjort.
 */

import { spawnSync } from 'node:child_process';

const STEG = [
  ['skjema', 'scripts/ensure-schema.mjs'],
  ['innhold', 'scripts/seed-legacy-content.mjs'],
];

console.log('[prestart] Starter forberedelser.');

for (const [navn, skript] of STEG) {
  const start = Date.now();
  const res = spawnSync(process.execPath, [skript], { stdio: 'inherit' });
  const tid = ((Date.now() - start) / 1000).toFixed(1);
  if (res.status === 0) {
    console.log(`[prestart] ${navn}: OK (${tid}s)`);
  } else {
    console.error(`[prestart] ${navn}: FEILET med kode ${res.status} (${tid}s) – appen starter likevel.`);
  }
}

console.log('[prestart] Ferdig. Starter appen.');
process.exit(0);
