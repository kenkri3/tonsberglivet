# Agenten viser «Frakoblet» / «Ikke konfigurert» — hvordan koble den til

Kort versjon: **agenten kjører ikke i appen.** Appen kaller en ekstern
agent-plattform, og nøkkelen som kreves for det kallet er ikke satt i miljøet.
Ingenting er galt med databasen, innloggingen eller nettverket.

---

## 1. Hva merkene betyr

Adminpanelet viser agentstatus fra `GET /api/agent/status?deep=1`. Den dype
sjekken stiller agenten et spørsmål som tvinger et verktøykall tilbake til vårt
eget `/api/mcp`, og oversetter svaret til én av disse tilstandene:

| Merke | Betyr | Hva du gjør |
|---|---|---|
| **Live** (grønn) | Agenten svarte OG hentet ekte data fra Tønsberglivet | Ingenting |
| **Redusert** (gul) | Agenten svarte, men verktøykallet mot `/api/mcp` feilet | Sjekk `MCP_API_KEY` og agentens MCP-connector |
| **Ikke konfigurert** (grå) | Ingen utgående transport er satt opp i dette miljøet | Følg steg 2 under |
| **Frakoblet** (rød) | Konfigurert, men vi fikk ikke kontakt | Sjekk agent-plattformen og tidsavbrudd |
| **Sesjon utløpt** (gul) | Vi kunne ikke sjekke fordi innloggingen din er utløpt eller har for lav rolle | Logg inn på nytt |
| **Ukjent** (grå) | Vi fikk svar, men kunne ikke avgjøre tilstanden | Se serverloggen |
| **Sjekker…** (grå) | Spørringen er i luften (dyp sjekk kan ta 5–40 s) | Vent |

**«Ikke konfigurert» og «Frakoblet» er to forskjellige feil.** Den første er en
manglende innstilling, den andre er en driftsfeil. De ble tidligere slått sammen
til «Frakoblet», noe som sendte feilsøkingen i feil retning. Panelet påstår nå
aldri «ikke konfigurert» uten at svaret faktisk sier det – et svar det ikke
forstår vises som **Ukjent**, ikke som en gjetning.

> Det grønne «Agent Studio Aktiv»-merket som tidligere sto i topplinjen var
> **hardkodet** og sa ingenting om agenten. Det er nå fjernet og erstattet av
> samme ekte status som chatpanelet viser – også prikkene i sidemenyen, i
> mobilmenyen og i integrasjonsoversikten.

**Statusen kan henge etter i opptil fem minutter.** Den dype sjekken mellomlagres
i fem minutter på serveren, og klienten spør på nytt hvert femte minutt. Har du
nettopp satt en nøkkel, restart appen og last siden på nytt for å se det med en
gang.

### De rå verdiene fra API-et

Feilsøker du fra terminal, ikke les `status` alene – les feltene under:

| Felt | Betyr |
|---|---|
| `environmentConfigured` | Er minst én utgående transport satt opp? |
| `transports.mcp` / `transports.webhook` | Hvilke veier er satt opp |
| `configuration.missing` | Miljøvariablene som mangler |
| `configuration.env` | Alle relevante variabler med `set: true/false` |
| `configuration.webIntelligence` | Brave/Tavily/Apify – sjekket BÅDE i miljøet og i databasen. `set: null` betyr «vet ikke» (databasen svarte ikke) |
| `configuration.integrations` | Gemini, 1min.AI, Ticketmaster – samme tre tilstander |
| `health.toolsWorking` | Gikk verktøykallet hele veien gjennom? Dette er «Live» |
| `health.reachable` | Fikk vi i det hele tatt kontakt? |
| `health.cached` | Er svaret fra mellomlageret (inntil 5 min gammelt)? |

`status` kan være `healthy`, `degraded`, `unreachable`, `not_configured` eller
`unknown`. `unknown` betyr «konfigurert, men proben feilet» – altså en driftsfeil,
ikke en manglende innstilling.

---

## 2. Slå agenten på

Alt gjøres i miljøet. Lokalt betyr det `.env` i prosjektroten; i produksjon betyr
det variablene i Railway.

### Steg 1 — Sett den utgående nøkkelen

```dotenv
# Nøkkelen appen kaller agenten med. Hentes fra agent-plattformen (Bot → API/MCP).
AGENT_API="<nøkkel fra agent-plattformen>"
```

Alternativt (eller i tillegg) webhook-transporten, som prøves først når den er satt:

```dotenv
WEBHOOK_AGENT="https://<agentens-webhook-url>"
```

Minst én av disse to **må** være satt. Det er dette som avgjør «Ikke
konfigurert» mot «Live».

### Steg 2 — La agenten hente data fra oss (innkommende)

Agenten trenger et token for å kalle verktøyene våre i `/api/mcp`:

```dotenv
MCP_API_KEY="<ny, tilfeldig verdi>"
# Valgfritt: lese-only-nøkkel hvis agenten ikke skal kunne endre noe.
MCP_READONLY_API_KEY="<ny, tilfeldig verdi>"
```

Uten `MCP_API_KEY` avviser `/api/mcp` alle `tools/call`. Agenten svarer da med en
høflig unnskyldning i stedet for ekte data — det er tilstanden panelet kaller
**Redusert**, ikke «Live».

I agent-plattformen: opprett/åpne MCP-integrasjonen (f.eks.
`tonsberglivet_backend`), sett **Server URL** til `https://<ditt-domene>/api/mcp`,
velg **Bearer Token** som autentisering og lim inn samme verdi som `MCP_API_KEY`.

### Steg 3 — Start på nytt og verifiser

Miljøvariabler leses ved oppstart. Start appen på nytt, og åpne deretter
adminpanelet. Merket skal gå fra «Ikke konfigurert» til «Live» innen 5–40
sekunder (dyp sjekk) — eller trykk oppdater i nettleseren.

Husk at helsesjekken mellomlagres i inntil fem minutter. Har du nettopp endret
en nøkkel, restart appen **før** du tolker merket som «fortsatt feil».

Vil du sjekke uten nettleser:

```powershell
# Krever en gyldig admin-sesjonscookie.
Invoke-RestMethod 'http://localhost:3000/api/agent/status?deep=1' -WebSession $session |
  ConvertTo-Json -Depth 6
```

Se etter `health.toolsWorking: true`. Er den `false` mens `health.reachable` er
`true`, er problemet tokenet i steg 2 — ikke nøkkelen i steg 1.

---

## 3. Hva chatten gjør uten agent

Når ingen agent svarer, faller `/api/agent/chat` tilbake på den lokale motoren.
Den kan gjøre ekte ting, men bare innenfor vår egen database:

- **Virkelig:** lese arrangementskalenderen, opprette og lagre artikkelutkast i
  CMS, godkjenne en torvleiesøknad på eksplisitt kommando, og telle artikler og
  søknader.
- **Ikke tilgjengelig:** å *liste opp* ventende torvleiesøknader, nettsøk
  (Brave/Tavily/Apify), fri tekstproduksjon og reasoning. Dette krever agenten
  (eller `GEMINI_API_KEY` / `1_MIN_AI`).

Advarselen om at agenten ikke svarte settes på de lokale svarene som bygger på
vår egen database: det generiske svaret, Event-Radar og vær/sjø. Unntaket er
publikumspuls, som bare leser statistikk vi selv eier – og rene
systemkommandoer («Opprett artikkel: …», «godkjenn #12», «eksporter til Duett»),
som kjøres lokalt med vilje. Der sier chatten hva som skjedde i stedet for å late
som agenten svarte.

Hurtigvalgene som tilbys er begrenset til handlinger som beviselig virker uten
agent. Alle «vis/sjekk torvleie»-knapper er fjernet fra de lokale grenene fordi de
ikke kunne gi listen de lovet: den lokale motoren kan godkjenne en søknad på
eksplisitt kommando, men den kan ikke liste opp søknader – det krever agenten
eller en AI-nøkkel. ID-en til godkjenning finner du i Admin → Torvleie & Byrom.

«Status på nøklene nå» i advarselen leser **både** miljøvariabler og
databasen (`SystemSetting`), fordi verktøyene selv gjør det. En nøkkel som ligger
i databasen blir derfor ikke feilaktig rapportert som manglende. Er databasen
utilgjengelig, vises `?` – ikke `✗`.

### Eksternt innhold krever egne nøkler

Selv med agenten på, er disse kildene tomme til nøkkelen finnes:

```dotenv
BRAVE_API_KEY=""
TAVILY_API_KEY=""
APIFY_API_KEY=""
TICKETMASTER_API_KEY=""
```

---

## 4. Feilsøking

| Symptom | Sannsynlig årsak |
|---|---|
| Merket står på «Ikke konfigurert» | `AGENT_API` og `WEBHOOK_AGENT` er begge tomme i dette miljøet. (`NEXT_PUBLIC_AGENT_API` teller også som `AGENT_API` – samme nøkkel, to navn) |
| Merket står på «Frakoblet» etter at nøkkelen er satt | Feil nøkkel, eller agent-plattformen svarer ikke. Se etter `[Agent Gateway]`-linjer i serverloggen |
| Merket står på «Sesjon utløpt» | Din egen innlogging, ikke agenten. Logg inn på nytt |
| Merket står på «Ukjent» | Konfigurert, men proben feilet – se serverloggen. Dette er en driftsfeil, ikke en manglende nøkkel |
| Merket står på «Redusert» | `MCP_API_KEY` mangler, eller agentens connector-token er en annen verdi |
| Chatten svarer, men uten ekte data | Agenten er nede og den lokale motoren svarte — se advarselen øverst i svaret |
| Integrasjonsoversikten sier «Ukjent» | Nøkkelen kan ligge i databasen (Innstillinger), eller databasen svarte ikke da panelet spurte. «Ukjent» betyr «vet ikke» – ikke «mangler» |
| Integrasjonsoversikten sier «Ikke satt opp» | Nøkkelen finnes verken i miljøet eller i databasen |
| `HTTP 401` fra `/api/agent/status?deep=1` | Sesjonen din er utløpt eller har for lav rolle (krever redaktør eller høyere) |
| Endringen slår ikke inn etter at du satte nøkkelen | Miljøvariabler leses ved oppstart, og helsesjekken mellomlagres i 5 minutter. Restart appen og last siden på nytt |

Serverloggen er den raskeste veien: agent-klienten logger med prefikset
`[Agent Gateway]`, blant annet `MCP initialize svarte HTTP 401` og
`Agenten fikk ikke utført verktøykall mot backend`.
