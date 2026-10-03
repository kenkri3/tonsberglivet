'use client';

import { useEffect, useState } from 'react';

/**
 * Én kilde til sannhet for agentstatus i grensesnittet.
 *
 * Bakgrunn: to ulike visninger i adminpanelet viste tidligere hver sin «status».
 * Topplinjen viste et hardkodet grønt «Agent Studio Aktiv», mens
 * `TonsbergAgentChat` hentet ekte helse fra `/api/agent/status?deep=1`. Når
 * agenten faktisk var frakoblet, sto de to grønt og rødt samtidig – og brukeren
 * kunne ikke vite hvilken av dem som gjaldt.
 *
 * Denne kroken erstatter begge: alle flater leser samme svar og viser samme
 * etikett. Den skiller også «agenten er ikke konfigurert i dette miljøet» fra
 * «agenten er konfigurert, men svarer ikke». Det er to helt forskjellige feil
 * med hver sin fiks, og å kalle dem det samme gjorde feilsøkingen blind.
 */

export type AgentStatusState =
  /** Spørringen er i luften ennå. */
  | 'checking'
  /** Agenten svarte og fikk hentet ekte data fra Tønsberglivet. */
  | 'healthy'
  /** Agenten svarte, men verktøykallet mot backend feilet. */
  | 'degraded'
  /** Ingen transport er satt opp i miljøet (mangler AGENT_API/WEBHOOK_AGENT). */
  | 'not_configured'
  /** Konfigurert, men vi fikk ikke kontakt. */
  | 'unreachable'
  /** Sesjonen vår er utløpt eller har for lav rolle – ikke agentens feil. */
  | 'session'
  /** Vi fikk svar, men kunne ikke avgjøre tilstanden. Skal ikke gjettes på. */
  | 'unknown';

/** Én nøkkel eller integrasjon, med TRE tilstander. */
export interface AgentKeyState {
  name: string;
  /**
   * `true` = satt, `false` = beviselig ikke satt, `null` = vet ikke (nøkkelen
   * kan ligge i databasen, og databasen svarte ikke).
   *
   * `null` må overleve helt ut i grensesnittet. Gjorde vi `Boolean(null)` her,
   * ville «vet ikke» blitt til «mangler», altså nøyaktig den usanne påstanden
   * denne saken skulle fjerne – bare speilvendt.
   */
  set: boolean | null;
}

export interface AgentStatus {
  state: AgentStatusState;
  /** Teknisk årsak fra API-et, f.eks. `not_configured` eller `unreachable`. */
  reason?: string;
  /** Hvilken transport agenten faktisk svarer på, når vi vet det. */
  transport?: 'webhook' | 'mcp' | 'none';
  /** Hvilke miljøvariabler som mangler – fra API-ets `configuration.missing`. */
  missingEnv: string[];
  /** Hvilke web-intelligens-nøkler som er satt, fra API-et. */
  webIntelligence: AgentKeyState[];
  /** Status for de øvrige motorene grensesnittet viser (Gemini, 1min.AI, Ticketmaster). */
  integrations: AgentKeyState[];
  /** Er det satt opp noen transport i det hele tatt? */
  transportOk: boolean;
  /** Tidspunktet for siste sjekk, eller null hvis ingen har fullført. */
  checkedAt: string | null;
}

const INITIAL: AgentStatus = {
  state: 'checking',
  missingEnv: [],
  webIntelligence: [],
  integrations: [],
  transportOk: false,
  checkedAt: null,
};

/**
 * Hvor ofte helsen sjekkes på nytt mens fanen står åpen.
 *
 * MERK: `AGENT_ENV_VARS` ble fjernet herfra med vilje. Den listet opp hvilke
 * variabler som «må» være satt, og ble brukt til å GJETTE at begge manglet så
 * snart API-svaret ikke sa noe annet. Det viste seg å gi falske «ikke
 * konfigurert»-meldinger i miljøer som virket. Nå leser vi `configuration` fra
 * API-et i stedet – ikke en lokal antakelse.
 */
const POLL_INTERVAL_MS = 5 * 60 * 1000;

/** Deles av alle flater som viser agentstatus, så de ikke kan bli uenige. */
const listeners = new Set<(status: AgentStatus) => void>();
let current: AgentStatus = INITIAL;
let inflight: Promise<void> | null = null;

function publish(next: AgentStatus) {
  current = next;
  for (const listener of listeners) listener(next);
}

/**
 * Leser `set` fra API-et og bevarer TRE tilstander.
 *
 * Her lå en felle: `Boolean(e.set)` gjorde `null` («vet ikke», f.eks. fordi
 * databasen ikke svarte) om til `false` («mangler»). Da viste begge modalene
 * «Ikke satt opp» om nøkler de ikke visste noe om – samme klasse usann påstand
 * som resten av saken, bare speilvendt. `null` må derfor overleve hit.
 */
function readKeyState(raw: unknown): boolean | null {
  if (raw === true) return true;
  if (raw === false) return false;
  return null;
}

function readKeyList(raw: unknown): AgentKeyState[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((e: any) => typeof e?.name === 'string')
    .map((e: any) => ({ name: e.name as string, set: readKeyState(e.set) }));
}

function readEnvFlags(data: any) {
  return readKeyList(data?.configuration?.env);
}

function readWebIntelligence(data: any) {
  return readKeyList(data?.configuration?.webIntelligence);
}

function readIntegrations(data: any) {
  return readKeyList(data?.configuration?.integrations);
}

/**
 * Oversetter API-svaret til én tilstand.
 *
 * Eksportert med vilje: dette er den eneste delen av statusvisningen som kan
 * feilmerke noe, og den skal kunne testes direkte mot syntetiske svar – også de
 * formene som er vanskelige å fremkalle i et kjørende miljø (probe-feil, ikke-JSON,
 * database nede mens miljøet ellers er konfigurert).
 *
 * Her ligger den viktigste forsiktighetsregelen: vi skal ALDRI påstå «ikke
 * konfigurert» uten at svaret faktisk sier det. Et svar vi ikke forstår, eller
 * en probe som feilet, er «ukjent» – ikke «ikke satt opp». Ellers ville et
 * fullt konfigurert miljø blitt feilsøkt i helt feil ende.
 */
export function deriveStatus(res: Response, data: any): AgentStatus {
  const checkedAt: string | null = data?.health?.checkedAt || data?.timestamp || null;
  const transportOk = data?.transports?.webhook === true || data?.transports?.mcp === true;
  const missingEnv: string[] = Array.isArray(data?.configuration?.missing)
    ? data.configuration.missing.filter((m: unknown) => typeof m === 'string')
    : [];
  const webIntelligence = readWebIntelligence(data);
  const integrations = readIntegrations(data);
  const envFlags = readEnvFlags(data);
  const health = data?.health;

  const base = {
    transport: health?.transport as AgentStatus['transport'],
    missingEnv,
    webIntelligence,
    integrations,
    transportOk,
    checkedAt,
  };

  // Sesjonsproblemer er vårt problem, ikke agentens. Uten dette ville en
  // utløpt innlogging blitt presentert som «agenten er nede».
  if (res.status === 401 || res.status === 403) {
    return { ...base, state: 'session', reason: data?.error || `HTTP ${res.status}` };
  }

  if (!res.ok) {
    return { ...base, state: 'unreachable', reason: data?.error || `HTTP ${res.status}` };
  }

  if (health?.toolsWorking) return { ...base, state: 'healthy' };
  if (health?.reachable) return { ...base, state: 'degraded', reason: health.reason };

  // «Ikke konfigurert» krever POSITIVT bevis. Det er bare to ting som teller:
  //
  //   1. helsesjekken sier selv at det ikke finnes noen transport, OG alle
  //      variablene den oppgir er BEVISELIG usatt (`set === false` – ikke `null`,
  //      som betyr «vet ikke»), eller
  //   2. API-et oppgir INNENFOR `configuration` at minst én variabel beviselig
  //      mangler.
  //
  // Alt annet er «ukjent». Uten denne innstrammingen ville et fullt konfigurert
  // miljø der proben feilet blitt presentert som «ikke satt opp» – altså motsatt
  // av sannheten, og feilsøkingen starter i feil ende. `configurationPresent`
  // kreves av samme grunn: et eldre svarformat uten `configuration` må ikke
  // tolkes som «alt mangler».
  const configurationPresent = Boolean(data?.configuration);
  const configuredExplicitlyFalse =
    envFlags.length > 0 && envFlags.every((e) => e.set === false);
  const probeSaysNoTransport =
    health?.transport === 'none' &&
    health?.reachable === false &&
    health?.configured !== true &&
    configuredExplicitlyFalse;
  const apiSaysSomethingMissing =
    configurationPresent && (envFlags.some((e) => e.set === false) || missingEnv.length > 0);
  const answerUnderstood = Boolean(data?.success) && Boolean(data?.transports) && Boolean(health);

  if (health && (probeSaysNoTransport || (apiSaysSomethingMissing && !transportOk))) {
    return { ...base, state: 'not_configured', reason: health.reason || 'not_configured', transport: 'none' };
  }

  if (health?.configured === true || transportOk) {
    return { ...base, state: 'unreachable', reason: health?.reason || 'unreachable' };
  }

  // Svar vi ikke kan tolke (manglende felter, HTML-feilside med status 200, …).
  // Vi gjetter ikke – verken «Live» eller «Ikke konfigurert» ville vært ærlig.
  return {
    ...base,
    state: 'unknown',
    reason: health?.reason || (answerUnderstood ? data?.status : undefined) || 'ukjent_svar',
  };
}

export function useAgentStatus(): AgentStatus {
  const [status, setStatus] = useState<AgentStatus>(current);

  useEffect(() => {
    listeners.add(setStatus);
    // Flere flater (topplinje, chatpanel, modaler) bruker samme krok. Da skal de
    // ikke hver for seg hamre på det samme endepunktet og kunne vise ulik
    // status i vinduet mellom sine respektive svar.
    setStatus(current);

    const check = async () => {
      if (inflight) return inflight;
      inflight = (async () => {
        // Den dype sjekken er ETT kall. En kortvarig feil hos agenten ville
        // ellers gitt et falskt «Frakoblet» som står i fem minutter. Vi prøver
        // derfor én gang til – men bare når vi vet at agenten er satt opp, så
        // et ukonfigurert miljø ikke koster en ekstra runde.
        const attempt = async (): Promise<AgentStatus> => {
          const res = await fetch('/api/agent/status?deep=1', { cache: 'no-store' });
          // En feilside kan ha HTTP 200 uten å være JSON. Da er tilstanden
          // ukjent, ikke «ikke konfigurert».
          const data = await res.json().catch(() => null);
          if (data === null) {
            return {
              state: 'unknown',
              reason: 'svaret fra status-API-et var ikke JSON',
              missingEnv: [],
              webIntelligence: [],
              integrations: [],
              transportOk: false,
              checkedAt: null,
            };
          }
          return deriveStatus(res, data);
        };

        try {
          let next = await attempt();
          if (next.state === 'unreachable' && next.transportOk) {
            await new Promise((resolve) => setTimeout(resolve, 2500));
            next = await attempt();
          }
          publish(next);
        } catch {
          publish({
            state: 'unreachable',
            reason: 'nettverksfeil',
            missingEnv: [],
            webIntelligence: [],
            integrations: [],
            transportOk: false,
            checkedAt: new Date().toISOString(),
          });
        } finally {
          inflight = null;
        }
      })();
      return inflight;
    };

    void check();
    const timer = setInterval(check, POLL_INTERVAL_MS);
    return () => {
      listeners.delete(setStatus);
      clearInterval(timer);
    };
  }, []);

  return status;
}

export interface AgentBadge {
  label: string;
  /** Tailwind-klasser for merket. */
  cls: string;
  /** Tailwind-klasse for prikken. */
  dot: string;
  /** Tailwind-klasse for ren tekst i samme farge som merket. */
  text: string;
}

/**
 * Ett sted som oversetter tilstand til etikett og farge, slik at topplinjen og
 * chatpanelet alltid viser nøyaktig det samme.
 */
export const AGENT_BADGES: Record<AgentStatusState, AgentBadge> = {
  checking: {
    label: 'Sjekker…',
    cls: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20',
    dot: 'bg-slate-400',
    text: 'text-slate-600 dark:text-slate-300',
  },
  healthy: {
    label: 'Live',
    cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-500 animate-pulse',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  degraded: {
    label: 'Redusert',
    cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    dot: 'bg-amber-500 animate-pulse',
    text: 'text-amber-600 dark:text-amber-400',
  },
  not_configured: {
    label: 'Ikke konfigurert',
    cls: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20',
    dot: 'bg-slate-400',
    text: 'text-slate-600 dark:text-slate-300',
  },
  unreachable: {
    label: 'Frakoblet',
    cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    dot: 'bg-rose-500',
    text: 'text-rose-600 dark:text-rose-400',
  },
  session: {
    label: 'Sesjon utløpt',
    cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    dot: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
  },
  unknown: {
    label: 'Ukjent',
    cls: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20',
    dot: 'bg-slate-400',
    text: 'text-slate-600 dark:text-slate-300',
  },
};

/** Kort, ærlig forklaring til verktøytips og statusfelt. */
export function agentStatusDetail(status: AgentStatus): string {
  switch (status.state) {
    case 'checking':
      return 'Sjekker agenten…';
    case 'healthy':
      return 'Agenten svarer og henter ekte data fra Tønsberglivet.';
    case 'degraded':
      return `Agenten svarer, men verktøykallet mot Tønsberglivet feilet${
        status.reason ? ` (${status.reason})` : ''
      }.`;
    case 'not_configured':
      return status.missingEnv.length > 0
        ? `Agenten er ikke satt opp i dette miljøet – ${status.missingEnv.join(
            ' og '
          )} mangler. Chatten svarer derfor fra den lokale motoren.`
        : 'Agenten er ikke satt opp i dette miljøet. Chatten svarer derfor fra den lokale motoren.';
    case 'unreachable':
      // Den dype sjekken er ett enkelt kall. En kortvarig feil hos agenten kan
      // derfor gi «Frakoblet» selv om neste melding lykkes. Si det, i stedet for
      // å påstå at agenten er nede med sikkerhet.
      return `Fikk ikke kontakt med agenten${status.reason ? ` (${status.reason})` : ''}. Sjekken er ett enkelt kall – prøv en melding i chatten før du konkluderer.`;
    case 'session':
      return `Kunne ikke sjekke agenten: ${
        status.reason || 'sesjonen er ikke gyldig'
      } Logg inn på nytt. Dette sier ingenting om agenten.`;
    case 'unknown':
      return `Klarte ikke å avgjøre agentstatusen${
        status.reason ? ` (${status.reason})` : ''
      }. Verken «Live» eller «Ikke konfigurert» ville vært ærlig her.`;
  }
}
