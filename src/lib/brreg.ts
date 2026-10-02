// Brønnøysundregistrene (Enhetsregisteret OpenAPI) Service for Tønsberglivet
// Official open data from https://data.brreg.no

const BRREG_ENHETER_URL = 'https://data.brreg.no/enhetsregisteret/api/enheter';
const BRREG_UNDERENHETER_URL = 'https://data.brreg.no/enhetsregisteret/api/underenheter';
const BRREG_USER_AGENT = 'TonsberglivetPortal/1.0 (hei@tonsberglivet.no)';
const BRREG_TIMEOUT_MS = 10000;

export type BrregSource = 'LIVE' | 'UNAVAILABLE';

/**
 * MERK: Den tidligere FALLBACK_TONSBERG_COMPANIES-listen er fjernet med vilje.
 * Alle de seks oppdiktede organisasjonsnumrene returnerte 404 i Enhetsregisteret,
 * men ble vist som «Org.nr» med lenke til det offisielle registeret – og ble kopiert
 * inn i reelle leieavtaler via Torvleie-skjemaet. Vi viser heller ingen treff.
 */
export const BRREG_UNAVAILABLE_NOTE =
  'Brønnøysundregistrene (data.brreg.no) svarte ikke. Vi viser ingen bedrifter i stedet for oppdiktede organisasjonsnumre.';

export interface Company {
  orgNr: string;
  name: string;
  orgForm: string;
  orgFormDesc: string;
  address: string;
  street: string;
  postalCode: string;
  city: string;
  municipality: string;
  municipalityCode?: string;
  isRegistered: boolean;
  isUnderenhet: boolean;
  parentOrgNr?: string | null;
  industry: string;
  industryCode: string;
  website?: string;
  registrationDate?: string;
}

export interface CompanySearchResult {
  companies: Company[];
  source: BrregSource;
  isLive: boolean;
  note?: string;
}

function formatCompany(item: any): Company | null {
  if (!item) return null;

  const addrObj = item.forretningsadresse || item.beliggenhetsadresse || item.postadresse || {};
  const street = addrObj.adresse ? (Array.isArray(addrObj.adresse) ? addrObj.adresse.join(', ') : addrObj.adresse) : '';
  const postalCode = addrObj.postnummer || '';
  const city = addrObj.poststed || '';
  const municipality = addrObj.kommune || '';
  const municipalityCode = addrObj.kommunenummer || '';

  const fullAddress = [street, `${postalCode} ${city}`.trim()].filter(Boolean).join(', ');

  return {
    orgNr: item.organisasjonsnummer,
    name: item.navn,
    orgForm: item.organisasjonsform?.kode || item.organisasjonsform?.beskrivelse || 'Aksjeselskap',
    orgFormDesc: item.organisasjonsform?.beskrivelse || 'Aksjeselskap',
    address: fullAddress,
    street,
    postalCode,
    city,
    municipality,
    municipalityCode,
    isRegistered: !item.slettedato && !item.konkurs,
    isUnderenhet: Boolean(item.overordnetEnhet),
    parentOrgNr: item.overordnetEnhet || null,
    industry: item.naeringskode1?.beskrivelse || 'Tjenesteyting',
    industryCode: item.naeringskode1?.kode || '',
    registrationDate: item.registreringsdatoEnhetsregisteret || item.stiftelsesdato || undefined
  };
}

type BrregFetch =
  | { ok: true; json: any }
  | { ok: false; status: number; reason: 'http' | 'non-json' | 'network' };

/**
 * Henter JSON fra Brreg med tidsbegrensning og content-type-sjekk.
 * En HTML-feilside skal aldri tolkes som registerdata.
 */
async function brregFetchJson(url: string, revalidate: number): Promise<BrregFetch> {
  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': BRREG_USER_AGENT },
      cache: 'force-cache',
      next: { revalidate },
      signal: AbortSignal.timeout(BRREG_TIMEOUT_MS)
    });

    if (!res.ok) {
      return { ok: false, status: res.status, reason: 'http' };
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('json')) {
      return { ok: false, status: res.status, reason: 'non-json' };
    }

    return { ok: true, json: await res.json() };
  } catch (err) {
    console.warn(`[Brreg] Nettverksfeil mot ${url}:`, err);
    return { ok: false, status: 0, reason: 'network' };
  }
}

/**
 * Search companies in Brønnøysundregistrene with priority for Tønsberg (3905) and Færder (3911).
 * Returnerer tom liste når registeret ikke kan nås – aldri oppdiktede selskaper.
 */
export async function searchCompaniesResult(
  query?: string,
  categoryCode?: string,
  limit = 15
): Promise<CompanySearchResult> {
  const clean = (query || '').trim().replace(/\s+/g, ' ');
  const digitsOnly = clean.replace(/\D/g, '');
  // Clamp: negative eller enorme limit-verdier skal ikke gi slice(0, -1) eller enorme svar.
  const safeLimit = Math.min(Math.max(Math.trunc(limit) || 15, 1), 100);

  const unavailable = (note = BRREG_UNAVAILABLE_NOTE): CompanySearchResult => ({
    companies: [],
    source: 'UNAVAILABLE',
    isLive: false,
    note
  });

  // 1. Direct 9-digit Organisasjonsnummer lookup
  if (digitsOnly.length === 9) {
    const [enhetRes, underRes] = await Promise.all([
      brregFetchJson(`${BRREG_ENHETER_URL}/${digitsOnly}`, 3600),
      brregFetchJson(`${BRREG_UNDERENHETER_URL}/${digitsOnly}`, 3600)
    ]);

    const enhetFormatted = enhetRes.ok ? formatCompany(enhetRes.json) : null;
    if (enhetFormatted) {
      return { companies: [enhetFormatted], source: 'LIVE', isLive: true };
    }

    const underFormatted = underRes.ok ? formatCompany(underRes.json) : null;
    if (underFormatted) {
      return { companies: [underFormatted], source: 'LIVE', isLive: true };
    }

    // Et 404 er et gyldig, ærlig svar: nummeret finnes ikke i registeret.
    const enhetNotFound = !enhetRes.ok && enhetRes.reason === 'http' && enhetRes.status === 404;
    const underNotFound = !underRes.ok && underRes.reason === 'http' && underRes.status === 404;
    if (enhetNotFound || underNotFound) {
      return {
        companies: [],
        source: 'LIVE',
        isLive: true,
        note: `Ingen enhet med organisasjonsnummer ${digitsOnly} finnes i Enhetsregisteret.`
      };
    }

    // Ingen 404: registeret svarte ikke brukbart, så vi kan ikke påstå at nummeret er ukjent.
    return unavailable();
  }

  // 2. Query search by name or general search in Tønsberg region
  const params = new URLSearchParams();
  const isGenericBusinessSearch =
    !clean ||
    /\b(smb|bedrift|bedrifter|selskap|selskaper|virksomhet|virksomheter|firma|firmaer)\b/i.test(clean);

  if (clean && !isGenericBusinessSearch) {
    params.set('navn', clean);
  } else {
    params.set('organisasjonsform', 'AS');
  }
  params.set('kommunenummer', '3905,3911'); // Tønsberg & Færder
  if (categoryCode) params.set('naeringskode', categoryCode);
  params.set('size', String(safeLimit));

  const res = await brregFetchJson(`${BRREG_ENHETER_URL}?${params.toString()}`, 1800);
  if (!res.ok) {
    return unavailable();
  }

  const list = Array.isArray(res.json?._embedded?.enheter) ? res.json._embedded.enheter : [];
  const companies = list.map(formatCompany).filter(Boolean) as Company[];

  // Reelt tomt søkeresultat er «live» – bare uten treff.
  return {
    companies,
    source: 'LIVE',
    isLive: true
  };
}

/**
 * Bakoverkompatibel innpakning: returnerer kun selskapslisten.
 * Returnerer tom liste i stedet for oppdiktede selskaper når registeret ikke svarer.
 */
export async function searchCompanies(query?: string, categoryCode?: string, limit = 15): Promise<Company[]> {
  const result = await searchCompaniesResult(query, categoryCode, limit);
  return result.companies;
}

export interface TonsbergCompanyTotal {
  total: number | null;
  source: BrregSource;
  isLive: boolean;
  note?: string;
}

/**
 * Henter det FAKTISKE antallet registrerte enheter i Tønsberg (3905) og Færder (3911)
 * fra Enhetsregisteret. Dashboardet viste tidligere et hardkodet tall (13169) presentert
 * som et offisielt totaltall. Vi henter det heller fra registeret, og sier ærlig fra
 * dersom registeret ikke svarer i stedet for å vise et tall vi ikke kan belegge.
 */
export async function fetchTonsbergCompanyTotal(): Promise<TonsbergCompanyTotal> {
  const params = new URLSearchParams();
  params.set('kommunenummer', '3905,3911');
  params.set('size', '1');

  const res = await brregFetchJson(`${BRREG_ENHETER_URL}?${params.toString()}`, 86400);
  if (!res.ok) {
    return { total: null, source: 'UNAVAILABLE', isLive: false, note: BRREG_UNAVAILABLE_NOTE };
  }

  const total = res.json?.page?.totalElements;
  if (typeof total !== 'number' || !Number.isFinite(total)) {
    return {
      total: null,
      source: 'UNAVAILABLE',
      isLive: false,
      note: 'Enhetsregisteret svarte uten et totalantall.'
    };
  }

  return { total, source: 'LIVE', isLive: true };
}

export interface NewRegisteredCompany {
  orgNr: string;
  name: string;
  orgForm: string;
  orgFormDesc: string;
  registrationDate: string; // YYYY-MM-DD
  industry: string;
  industryCode: string;
  address: string;
  street: string;
  postalCode: string;
  city: string;
  municipality: string;
  municipalityCode: string;
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  activity?: string;
  purpose?: string;
  brregUrl: string;
  proffUrl: string;
}

export interface NewCompaniesResult {
  companies: NewRegisteredCompany[];
  total: number;
  source: BrregSource;
  isLive: boolean;
  note?: string;
}

/**
 * Henter nystartede / nyregistrerte bedrifter i Tønsberg (3905) og eventuelt Færder (3911)
 * fra Brønnøysundregistrene Enhetsregisteret OpenAPI.
 * Returnerer tom liste med ærlig forklaring dersom registeret ikke svarer.
 */
export async function fetchNewlyRegisteredCompanies(options?: {
  daysBack?: number;
  limit?: number;
  municipalityCode?: string; // Standard '3905' (Tønsberg)
}): Promise<NewCompaniesResult> {
  const daysBack = options?.daysBack || 30;
  const limit = Math.min(Math.max(Math.trunc(options?.limit || 50) || 50, 1), 100);
  const munCode = options?.municipalityCode || '3905'; // 3905 = Tønsberg

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - daysBack);
  const fromDateStr = pastDate.toISOString().split('T')[0];

  const params = new URLSearchParams();
  params.set('kommunenummer', munCode);
  params.set('fraRegistreringsdatoEnhetsregisteret', fromDateStr);
  params.set('sort', 'registreringsdatoEnhetsregisteret,desc');
  params.set('size', String(limit));

  const res = await brregFetchJson(`${BRREG_ENHETER_URL}?${params.toString()}`, 900);

  if (!res.ok) {
    console.warn('[Brreg OpenAPI] Kunne ikke hente nystartede bedrifter – returnerer tom liste.');
    return {
      companies: [],
      total: 0,
      source: 'UNAVAILABLE',
      isLive: false,
      note: BRREG_UNAVAILABLE_NOTE
    };
  }

  const list = Array.isArray(res.json?._embedded?.enheter) ? res.json._embedded.enheter : [];
  const total = res.json?.page?.totalElements ?? list.length;

  const formatted: NewRegisteredCompany[] = list.map((item: any) => {
    const addrObj = item.forretningsadresse || item.beliggenhetsadresse || item.postadresse || {};
    const street = addrObj.adresse ? (Array.isArray(addrObj.adresse) ? addrObj.adresse.join(', ') : addrObj.adresse) : '';
    const postalCode = addrObj.postnummer || '';
    const city = addrObj.poststed || '';
    const municipality = addrObj.kommune || 'TØNSBERG';
    const municipalityCode = addrObj.kommunenummer || '3905';

    const fullAddress = [street, `${postalCode} ${city}`.trim()].filter(Boolean).join(', ');

    const activity = Array.isArray(item.aktivitet) ? item.aktivitet.join(' ') : (item.aktivitet || '');
    const purpose = Array.isArray(item.vedtektsfestetFormaal) ? item.vedtektsfestetFormaal.join(' ') : (item.vedtektsfestetFormaal || '');

    return {
      orgNr: item.organisasjonsnummer,
      name: item.navn,
      orgForm: item.organisasjonsform?.kode || 'AS',
      orgFormDesc: item.organisasjonsform?.beskrivelse || 'Aksjeselskap',
      registrationDate: item.registreringsdatoEnhetsregisteret || item.stiftelsesdato || fromDateStr,
      industry: item.naeringskode1?.beskrivelse || 'Generell næringsvirksomhet',
      industryCode: item.naeringskode1?.kode || '',
      address: fullAddress || 'Tønsberg',
      street,
      postalCode,
      city,
      municipality,
      municipalityCode,
      email: item.epostadresse || undefined,
      phone: item.telefon || undefined,
      mobile: item.mobil || undefined,
      website: item.hjemmeside || undefined,
      activity,
      purpose,
      brregUrl: `https://virksomhet.brreg.no/nb/oppslag/enheter/${item.organisasjonsnummer}`,
      proffUrl: `https://proff.no/bransjesøk?q=${item.organisasjonsnummer}`,
    };
  });

  return { companies: formatted, total, source: 'LIVE', isLive: true };
}

/**
 * Henter fullstendige detaljer om en bedrift fra Enhetsregisteret (inkludert formål og vedtekter)
 */
export async function fetchCompanyDetails(orgNr: string): Promise<any | null> {
  const clean = orgNr.replace(/\D/g, '');
  if (clean.length !== 9) return null;

  const res = await brregFetchJson(`${BRREG_ENHETER_URL}/${clean}`, 3600);
  return res.ok ? res.json : null;
}
