import { NewRegisteredCompany, fetchNewlyRegisteredCompanies } from './brreg';
import { generateUnifiedAiResponse } from './ai-config';
import { getSetting, setSetting } from './settings';

export interface WelcomeEmailData {
  subject: string;
  salutation: string;
  bodyText: string;
  bodyHtml: string;
  highlights: string[];
  recipientEmail: string;
  mailtoUrl: string;
  generatedAt: string;
  modelUsed: string;
}

export type CompanyWelcomeStatus = 'PENDING' | 'DRAFT' | 'APPROVED' | 'SENT' | 'SKIPPED';

export interface CompanyWelcomeRecord extends NewRegisteredCompany {
  status: CompanyWelcomeStatus;
  emailDraft?: WelcomeEmailData;
  sentAt?: string;
  notes?: string;
}

// Lokal minne-cache for lynrask respons
let inMemoryCompanyStore: Record<string, CompanyWelcomeRecord> = {};
let isStoreLoaded = false;

async function loadStore(): Promise<void> {
  if (isStoreLoaded) return;
  try {
    const raw = await getSetting('tonsberg_new_companies_store');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        inMemoryCompanyStore = parsed;
      }
    }
  } catch (err) {
    console.warn('[CompanyStore] Feil ved lasting fra system settings:', err);
  }
  isStoreLoaded = true;
}

async function persistStore(): Promise<void> {
  try {
    await setSetting('tonsberg_new_companies_store', JSON.stringify(inMemoryCompanyStore), 'INTEGRATIONS');
  } catch (err) {
    console.warn('[CompanyStore] Feil ved lagring:', err);
  }
}

/**
 * Bransjespesifikk skreddersøm for næringskoder
 */
function getSectorHighlights(industry: string, industryCode: string): { sectorName: string; perks: string[] } {
  const indLower = industry.toLowerCase();

  if (indLower.includes('restaurant') || indLower.includes('kafe') || indLower.includes('servering') || indLower.includes('mat')) {
    return {
      sectorName: 'Mat, Drikke & Uteliv',
      perks: [
        'Profilering på Brygga og i Tønsberglivets populære Spiseguide',
        'Mulighet for uteservering og deltakelse på Tønsberg Matfestival og Sommerbyen',
        'Markedsføring mot 33 000+ matglade følgere på Instagram og Facebook'
      ]
    };
  }

  if (indLower.includes('butikk') || indLower.includes('handel') || indLower.includes('detaljhandel') || indLower.includes('klær')) {
    return {
      sectorName: 'Handel & Shopping',
      perks: [
        'Synlighet i sentrumsguiden og felles kampanjer (Tønsbergdagene, Kveldsåpent, Black Week)',
        'Mulighet for popup-bod eller stand på Tønsberg Torv i helgene',
        'Knyttet opp mot Tønsberg Sentrumsgavekort som brukes i over 150 lokale butikker'
      ]
    };
  }

  if (indLower.includes('bygg') || indLower.includes('tømrer') || indLower.includes('entreprenør') || indLower.includes('håndverk') || indLower.includes('maler')) {
    return {
      sectorName: 'Håndverk & Bygg',
      perks: [
        'Oppføring i den lokale håndverker- og tjenestekatalogen for huseiere i Tønsberg & Færder',
        'Invitasjon til kommunale næringstreff og B2B-nettverket i Tønsberg Næringsforening',
        'Synlighet overfor næringsdrivende og eiendomsutviklere i regionen'
      ]
    };
  }

  if (indLower.includes('data') || indLower.includes('konsulent') || indLower.includes('it') || indLower.includes('programvare') || indLower.includes('rådgivning')) {
    return {
      sectorName: 'Teknologi & Rådgivning',
      perks: [
        'Tilknytning til gründer- og innovasjonsmiljøet ved Hi5 i Tønsberg',
        'Arenaer for kunnskapsdeling og tech-frokoster i Vestfold',
        'Nettverksbygging med over 300 etablerte lokale bedrifter'
      ]
    };
  }

  if (indLower.includes('helse') || indLower.includes('frisør') || indLower.includes('velvære') || indLower.includes('trening') || indLower.includes('terapi')) {
    return {
      sectorName: 'Helse & Velvære',
      perks: [
        'Profilering i byens velvære- og behandleroversikt',
        'Synlighet mot lokale innbyggere og ansatte i nærliggende bedrifter',
        'Deltakelse i sesongkampanjer for velvære og aktiv livsstil'
      ]
    };
  }

  return {
    sectorName: 'Næringsvirksomhet',
    perks: [
      'Gratis grunnoppføring i Tønsberglivets digitale bedriftsregister (tonsberglivet.no)',
      'Tilgang til næringsfrokoster, seminarer og Tønsberg Næringsforenings møteplasser',
      'Synlighetsmuligheter på byens digitale informasjonsskjermer og sosiale kanaler'
    ]
  };
}

/**
 * Genererer en høykvalitets velkomstmail med AI (1min.AI / Gemini) eller robust norsk fallback.
 */
export async function generateWelcomeEmailDraft(company: NewRegisteredCompany): Promise<WelcomeEmailData> {
  const recipient = company.email || `post@${company.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.no`;
  const sectorInfo = getSectorHighlights(company.industry, company.industryCode);

  const systemInstruction = `Du er en engasjert, profesjonell og varm næringsrådgiver hos Tønsberglivet (Nærings- og byutvikling i Norges eldste by, Tønsberg).
Oppgaven din er å skrive en personlig velkomst-e-post til en nyetablert bedrift i Tønsberg kommune.
Tone: Varm, støttende, profesjonell, stolt av Tønsberg, tydelig verdi, null overselging.
Avsender: Cecilie Sørumshaugen & Teamet i Tønsberglivet.
Nettside: www.tonsberglivet.no.
E-post: post@tonsberglivet.no.

Innholdet må inkludere:
1. Varm gratulasjon med nyetableringen og at de har valgt Tønsberg som base.
2. Tilbud om gratis oppføring i Tønsberglivets offisielle by- og bedriftsportal for synlighet mot 33 000+ følgere og tusenvis av ukentlige besøkende.
3. Bransjespesifikke råd eller muligheter for deres fagfelt: ${sectorInfo.sectorName}.
4. Invitasjon til en uforpliktende kaffekopp på kontoret i sentrum for å høre mer om planene deres.
5. GDPR / Reservasjonsnotis i bunn: "Denne henvendelsen sendes som næringsrettet velkomstinformasjon til nyregistrerte enheter i Tønsberg. Svar gjerne hvis dere ønsker å reservere dere mot fremtidige oppdateringer."

Svar som ren norsk tekst med god formattering og avsnitt.`;

  const prompt = `Skriv velkomstmail til:
Bedrift: ${company.name} (${company.orgFormDesc})
Org.nr: ${company.orgNr}
Registrert dato: ${company.registrationDate}
Bransje: ${company.industry} (kode: ${company.industryCode})
Adresse: ${company.address}
${company.purpose ? `Formål/aktivitet: ${company.purpose}` : ''}
${company.activity ? `Aktivitet: ${company.activity}` : ''}

Lag et fengende emnefelt (Subject) på første linje startende med "EMNE: ", og deretter selve e-postteksten.`;

  let aiGeneratedText = '';
  let modelUsed = 'Lokal Tønsberg Mal (Fallback)';

  try {
    const response = await generateUnifiedAiResponse({
      prompt,
      systemInstruction,
      preferEu: true, // For GDPR-overholdelse
      temperature: 0.65,
    });

    if (response && response.length > 50) {
      aiGeneratedText = response;
      modelUsed = '1min.AI (Mistral/OpenAI EU) / Gemini';
    }
  } catch (err) {
    console.warn('[WelcomeEmail AI Warning] Bruker fallback-mal:', err);
  }

  let subject = `Velkommen som nyetablert i Tønsberg! Hilsen Tønsberglivet`;
  let bodyContent = '';

  if (aiGeneratedText) {
    const lines = aiGeneratedText.split('\n');
    const emneLine = lines.find(l => l.toUpperCase().startsWith('EMNE:') || l.toUpperCase().startsWith('SUBJECT:'));
    if (emneLine) {
      subject = emneLine.replace(/^(EMNE|SUBJECT):\s*/i, '').trim();
      bodyContent = lines.filter(l => l !== emneLine).join('\n').trim();
    } else {
      subject = `Gratulerer med ${company.name} – Velkommen til næringslivet i Tønsberg!`;
      bodyContent = aiGeneratedText.trim();
    }
  } else {
    // Elegant, velskrevet forhåndsdefinert norsk velkomstbrev
    subject = `Gratulerer med ${company.name} – Velkommen til Tønsberg!`;
    bodyContent = `Hei teamet i ${company.name},

Gratulerer så mye med registreringen av ${company.name} i Brønnøysundregistrene!

Vi i Tønsberglivet heier på alle gründere og etablerere som satser i regionen vår. Enten dere holder til i sentrum, på Sem, Tolvsrød eller Vear, bidrar dere til et mer levende og mangfoldig lokalsamfunn.

Som nyetablert bedrift innen ${company.industry.toLowerCase()} ønsker vi å ønske dere hjertelig velkommen og gi dere en god start:

1. Gratis oppføring i Tønsberglivet-portalen:
Vi sørger for at dere blir synlige for over 33 000 følgere og tusenvis av innbyggere og tilreisende som ukentlig bruker tonsberglivet.no for å finne lokale tjenester og handel.

2. Næringsnettverk & Frokostmøter:
Gjennom Tønsberg Næringsforening og gründerhuben Hi5 inviterer vi jevnlig til uformelle samlinger og faglige påfyll der dere kan knytte kontakter med etablerte lokale aktører.

3. Byrom & Synlighet:
Har dere planer om lanseringsevent, stand på Tønsberg Torv eller markedsføring mot byen? Vi hjelper dere gjerne med råd om søknader, byrom og synlighet på byens digitale informasjonskanaler.

Har dere lyst på en uforpliktende kaffekopp på kontoret vårt i sentrum, eller bare en rask prat om hva vi kan bistå med? Svar direkte på denne e-posten, så avtaler vi et tidspunkt som passer dere.

Vi ønsker dere masse lykke til med satsingen!

Vennlig hilsen,
Cecilie Sørumshaugen & Teamet i Tønsberglivet
Tønsberglivet AS / Foreningen Tønsberglivet
E-post: post@tonsberglivet.no | www.tonsberglivet.no
Telefon: 33 30 00 00

---
Personvern & Reservasjon: Denne henvendelsen sendes som offisiell velkomstinformasjon til nyregistrerte virksomheter i Tønsberg kommune iht. markedsføringsloven § 15 (virksomhetskontakt). Svar med "Stopp" dersom dere ikke ønsker videre informasjon om næringsaktiviteter.`;
  }

  // Generer tiltalende HTML-versjon
  const bodyHtml = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #1e293b; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
  <div style="background: linear-gradient(135deg, #1e3a8a, #2563eb); padding: 32px 28px; text-align: center; color: #ffffff;">
    <h1 style="margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">Tønsberglivet</h1>
    <p style="margin: 6px 0 0; font-size: 15px; opacity: 0.9;">Velkommen til Norges eldste og mest levende by</p>
  </div>
  
  <div style="padding: 28px 24px;">
    <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
      <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #2563eb; letter-spacing: 0.5px;">Nyetablert i Tønsberg</span>
      <h2 style="margin: 4px 0 0; font-size: 18px; color: #0f172a;">${company.name}</h2>
      <p style="margin: 2px 0 0; font-size: 13px; color: #64748b;">Org.nr: ${company.orgNr} • ${company.industry}</p>
    </div>

    <div style="font-size: 15px; color: #334155; white-space: pre-line; line-height: 1.7;">
      ${bodyContent}
    </div>

    <div style="margin-top: 32px; padding: 20px; background-color: #eff6ff; border-radius: 12px; border: 1px solid #bfdbfe; text-align: center;">
      <h3 style="margin: 0 0 8px; font-size: 16px; color: #1e40af;">Ønsker dere en gratis velkomstkaffe?</h3>
      <p style="margin: 0 0 16px; font-size: 13px; color: #3b82f6;">Ta turen innom kontoret vårt i Tønsberg sentrum for en uforpliktende prat om synlighet og nettverk.</p>
      <a href="mailto:post@tonsberglivet.no?subject=Kaffeprat%20med%20Tønsberglivet%20-%20${encodeURIComponent(company.name)}" 
         style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px;">
        Svar på henvendelsen
      </a>
    </div>
  </div>

  <div style="padding: 20px 24px; background-color: #f1f5f9; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center;">
    <p style="margin: 0 0 4px;"><strong>Tønsberglivet AS</strong> • Nedre Langgate, 3126 Tønsberg • post@tonsberglivet.no</p>
    <p style="margin: 0;">Denne e-posten sendes som offisiell gründervelkomst i samarbeid med offentlige registre (Brønnøysundregistrene). Svar "Stopp" for å avmelde.</p>
  </div>
</div>
`;

  // Bygg full mailto-lenke for 1-klikks sending fra Outlook / Apple Mail / Webmail
  const mailtoUrl = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyContent)}`;

  return {
    subject,
    salutation: `Hei teamet i ${company.name},`,
    bodyText: bodyContent,
    bodyHtml,
    highlights: sectorInfo.perks,
    recipientEmail: recipient,
    mailtoUrl,
    generatedAt: new Date().toISOString(),
    modelUsed,
  };
}

/**
 * Henter og oppdaterer listen over nyetablerte bedrifter og deres e-postkladd.
 */
export async function syncAndGetNewCompanies(options?: {
  daysBack?: number;
  limit?: number;
  autoDraft?: boolean;
}): Promise<{
  companies: CompanyWelcomeRecord[];
  stats: {
    total: number;
    withEmail: number;
    draftsReady: number;
    approved: number;
    sent: number;
  };
}> {
  await loadStore();

  const daysBack = options?.daysBack || 30;
  const limit = options?.limit || 50;
  const autoDraft = options?.autoDraft !== undefined ? options.autoDraft : true;

  // Hent ferske data fra Brreg OpenAPI
  const brregResult = await fetchNewlyRegisteredCompanies({ daysBack, limit });

  // Flett med eksisterende poster
  for (const comp of brregResult.companies) {
    if (!inMemoryCompanyStore[comp.orgNr]) {
      inMemoryCompanyStore[comp.orgNr] = {
        ...comp,
        status: 'PENDING',
      };
    } else {
      // Oppdater eventuelle nye felter (f.eks. e-post eller nettside hvis registrert senere)
      if (comp.email && !inMemoryCompanyStore[comp.orgNr].email) {
        inMemoryCompanyStore[comp.orgNr].email = comp.email;
      }
      if (comp.phone && !inMemoryCompanyStore[comp.orgNr].phone) {
        inMemoryCompanyStore[comp.orgNr].phone = comp.phone;
      }
      if (comp.website && !inMemoryCompanyStore[comp.orgNr].website) {
        inMemoryCompanyStore[comp.orgNr].website = comp.website;
      }
    }
  }

  // Generer automatiske kladder for inntil de 10 nyeste som ennå er PENDING hvis autoDraft er på
  if (autoDraft) {
    const pendingList = Object.values(inMemoryCompanyStore)
      .filter(c => c.status === 'PENDING' && !c.emailDraft)
      .slice(0, 10);

    for (const pending of pendingList) {
      try {
        const draft = await generateWelcomeEmailDraft(pending);
        inMemoryCompanyStore[pending.orgNr].emailDraft = draft;
        inMemoryCompanyStore[pending.orgNr].status = 'DRAFT';
      } catch (err) {
        console.warn(`[Draft Error for ${pending.orgNr}]:`, err);
      }
    }
  }

  await persistStore();

  const allRecords = Object.values(inMemoryCompanyStore).sort((a, b) => {
    return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
  });

  const stats = {
    total: allRecords.length,
    withEmail: allRecords.filter(c => Boolean(c.email)).length,
    draftsReady: allRecords.filter(c => c.status === 'DRAFT').length,
    approved: allRecords.filter(c => c.status === 'APPROVED').length,
    sent: allRecords.filter(c => c.status === 'SENT').length,
  };

  return { companies: allRecords, stats };
}

/**
 * Oppdaterer status for en bedrifts velkomstmail (godkjenn, merk som sendt, etc.)
 */
export async function updateCompanyWelcomeStatus(
  orgNr: string,
  status: CompanyWelcomeStatus,
  customDraft?: Partial<WelcomeEmailData>
): Promise<CompanyWelcomeRecord | null> {
  await loadStore();

  const record = inMemoryCompanyStore[orgNr];
  if (!record) return null;

  record.status = status;
  if (status === 'SENT') {
    record.sentAt = new Date().toISOString();
  }

  if (customDraft && record.emailDraft) {
    record.emailDraft = {
      ...record.emailDraft,
      ...customDraft,
      mailtoUrl: `mailto:${encodeURIComponent(customDraft.recipientEmail || record.emailDraft.recipientEmail)}?subject=${encodeURIComponent(customDraft.subject || record.emailDraft.subject)}&body=${encodeURIComponent(customDraft.bodyText || record.emailDraft.bodyText)}`
    };
  }

  await persistStore();
  return record;
}

/**
 * Regenererer velkomstmail for en spesifikk bedrift
 */
export async function regenerateEmailForCompany(orgNr: string): Promise<CompanyWelcomeRecord | null> {
  await loadStore();
  const record = inMemoryCompanyStore[orgNr];
  if (!record) return null;

  const draft = await generateWelcomeEmailDraft(record);
  record.emailDraft = draft;
  record.status = 'DRAFT';

  await persistStore();
  return record;
}
