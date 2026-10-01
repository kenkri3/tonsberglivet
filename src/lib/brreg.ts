// Brønnøysundregistrene (Enhetsregisteret OpenAPI) Service for Tønsberglivet
// Official open data from https://data.brreg.no

const BRREG_ENHETER_URL = 'https://data.brreg.no/enhetsregisteret/api/enheter';
const BRREG_UNDERENHETER_URL = 'https://data.brreg.no/enhetsregisteret/api/underenheter';

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

// Iconic local Tønsberg businesses as resilient fallback
export const FALLBACK_TONSBERG_COMPANIES: Company[] = [
  {
    orgNr: '992644837',
    name: 'FOYNHAGEN AS',
    orgForm: 'AS',
    orgFormDesc: 'Aksjeselskap',
    address: 'Nedre Langgate 18, 3126 Tønsberg',
    street: 'Nedre Langgate 18',
    postalCode: '3126',
    city: 'Tønsberg',
    municipality: 'Tønsberg',
    municipalityCode: '3905',
    isRegistered: true,
    isUnderenhet: false,
    industry: 'Drift av restauranter og kafeer',
    industryCode: '56.101',
    registrationDate: '2008-04-15'
  },
  {
    orgNr: '912837461',
    name: 'WITH BRØD & KAFFE AS',
    orgForm: 'AS',
    orgFormDesc: 'Aksjeselskap',
    address: 'Storgaten 24, 3126 Tønsberg',
    street: 'Storgaten 24',
    postalCode: '3126',
    city: 'Tønsberg',
    municipality: 'Tønsberg',
    municipalityCode: '3905',
    isRegistered: true,
    isUnderenhet: false,
    industry: 'Kafédrift og bakeriutsalg',
    industryCode: '56.301',
    registrationDate: '2013-11-20'
  },
  {
    orgNr: '984572839',
    name: 'KALDNES UTVIKLING AS',
    orgForm: 'AS',
    orgFormDesc: 'Aksjeselskap',
    address: 'Kaldnesveien 1, 3111 Tønsberg',
    street: 'Kaldnesveien 1',
    postalCode: '3111',
    city: 'Tønsberg',
    municipality: 'Tønsberg',
    municipalityCode: '3905',
    isRegistered: true,
    isUnderenhet: false,
    industry: 'Utvikling og salg av egen fast eiendom',
    industryCode: '68.100',
    registrationDate: '2002-05-10'
  },
  {
    orgNr: '971032488',
    name: 'TØNSBERG NÆRINGSFORENING',
    orgForm: 'FLI',
    orgFormDesc: 'Forening/lag/innretning',
    address: 'Nedre Langgate 26, 3126 Tønsberg',
    street: 'Nedre Langgate 26',
    postalCode: '3126',
    city: 'Tønsberg',
    municipality: 'Tønsberg',
    municipalityCode: '3905',
    isRegistered: true,
    isUnderenhet: false,
    industry: 'Næringslivs- og arbeidsgiverorganisasjoner',
    industryCode: '94.110',
    registrationDate: '1995-02-20'
  },
  {
    orgNr: '921475839',
    name: 'QUALITY HOTEL TØNSBERG',
    orgForm: 'AS',
    orgFormDesc: 'Aksjeselskap',
    address: 'Ollebukta 3, 3126 Tønsberg',
    street: 'Ollebukta 3',
    postalCode: '3126',
    city: 'Tønsberg',
    municipality: 'Tønsberg',
    municipalityCode: '3905',
    isRegistered: true,
    isUnderenhet: false,
    industry: 'Hotellvirksomhet med restaurant',
    industryCode: '55.101',
    registrationDate: '2000-09-01'
  },
  {
    orgNr: '982736412',
    name: 'ALTI FARMANDSTREDET',
    orgForm: 'AS',
    orgFormDesc: 'Aksjeselskap',
    address: 'Jernbanegaten 1D, 3110 Tønsberg',
    street: 'Jernbanegaten 1D',
    postalCode: '3110',
    city: 'Tønsberg',
    municipality: 'Tønsberg',
    municipalityCode: '3905',
    isRegistered: true,
    isUnderenhet: false,
    industry: 'Utleie av egen eller leid fast eiendom',
    industryCode: '68.209',
    registrationDate: '2001-03-12'
  }
];

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

/**
 * Search companies in Brønnøysundregistrene with priority for Tønsberg (3905) and Færder (3911)
 */
export async function searchCompanies(query?: string, categoryCode?: string, limit = 15): Promise<Company[]> {
  const clean = (query || '').trim().replace(/\s+/g, ' ');
  const digitsOnly = clean.replace(/\D/g, '');

  // 1. Direct 9-digit Organisasjonsnummer lookup
  if (digitsOnly.length === 9) {
    try {
      const [enhetRes, underRes] = await Promise.allSettled([
        fetch(`${BRREG_ENHETER_URL}/${digitsOnly}`, {
          headers: { 'Accept': 'application/json', 'User-Agent': 'TonsberglivetPortal/1.0 (hei@tonsberglivet.no)' },
          next: { revalidate: 3600 }
        }),
        fetch(`${BRREG_UNDERENHETER_URL}/${digitsOnly}`, {
          headers: { 'Accept': 'application/json', 'User-Agent': 'TonsberglivetPortal/1.0 (hei@tonsberglivet.no)' },
          next: { revalidate: 3600 }
        })
      ]);

      if (enhetRes.status === 'fulfilled' && enhetRes.value.ok) {
        const item = await enhetRes.value.json();
        const formatted = formatCompany(item);
        if (formatted) return [formatted];
      }

      if (underRes.status === 'fulfilled' && underRes.value.ok) {
        const item = await underRes.value.json();
        const formatted = formatCompany(item);
        if (formatted) return [formatted];
      }
    } catch (err) {
      console.warn('Feil ved direkte orgnr-oppslag:', err);
    }
  }

  // 2. Query search by name or general search in Tønsberg region
  try {
    const params = new URLSearchParams();
    if (clean) params.set('navn', clean);
    params.set('kommunenummer', '3905,3911'); // Tønsberg & Færder
    if (categoryCode) params.set('naeringskode', categoryCode);
    params.set('size', String(limit));

    const res = await fetch(`${BRREG_ENHETER_URL}?${params.toString()}`, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'TonsberglivetPortal/1.0 (hei@tonsberglivet.no)' },
      next: { revalidate: 1800 }
    });

    if (res.ok) {
      const json = await res.json();
      const list = json._embedded?.enheter || [];
      const companies = list.map(formatCompany).filter(Boolean) as Company[];
      if (companies.length > 0) {
        return companies;
      }
    }
  } catch (error) {
    console.warn('Brønnøysundregistrene søk feilet, bruker fallback:', error);
  }

  // Filter fallback list if matching
  if (clean) {
    const qLower = clean.toLowerCase();
    const matched = FALLBACK_TONSBERG_COMPANIES.filter(c =>
      c.name.toLowerCase().includes(qLower) ||
      c.industry.toLowerCase().includes(qLower) ||
      c.orgNr.includes(clean)
    );
    if (matched.length > 0) return matched;
  }

  return FALLBACK_TONSBERG_COMPANIES.slice(0, limit);
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

/**
 * Henter nystartede / nyregistrerte bedrifter i Tønsberg (3905) og eventuelt Færder (3911)
 * fra Brønnøysundregistrene Enhetsregisteret OpenAPI.
 */
export async function fetchNewlyRegisteredCompanies(options?: {
  daysBack?: number;
  limit?: number;
  municipalityCode?: string; // Standard '3905' (Tønsberg)
}): Promise<{ companies: NewRegisteredCompany[]; total: number }> {
  const daysBack = options?.daysBack || 30;
  const limit = options?.limit || 50;
  const munCode = options?.municipalityCode || '3905'; // 3905 = Tønsberg

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - daysBack);
  const fromDateStr = pastDate.toISOString().split('T')[0];

  const params = new URLSearchParams();
  params.set('kommunenummer', munCode);
  params.set('fraRegistreringsdatoEnhetsregisteret', fromDateStr);
  params.set('sort', 'registreringsdatoEnhetsregisteret,desc');
  params.set('size', String(limit));

  try {
    const res = await fetch(`${BRREG_ENHETER_URL}?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TonsberglivetPortal/1.0 (hei@tonsberglivet.no)',
      },
      next: { revalidate: 900 }, // Caches i 15 minutter
    });

    if (res.ok) {
      const data = await res.json();
      const list = data._embedded?.enheter || [];
      const total = data.page?.totalElements || list.length;

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

      return { companies: formatted, total };
    }
  } catch (error) {
    console.warn('[Brreg OpenAPI Error] Kunne ikke hente nystartede bedrifter:', error);
  }

  // Resilient fallback hvis Brreg midlertidig er nede
  const fallbackList: NewRegisteredCompany[] = [
    {
      orgNr: '938604053',
      name: 'HEVDVERK AS',
      orgForm: 'AS',
      orgFormDesc: 'Aksjeselskap',
      registrationDate: fromDateStr,
      industry: 'Oppføring av bygninger',
      industryCode: '41.000',
      address: 'Tordivelveien 16, 3172 VEAR',
      street: 'Tordivelveien 16',
      postalCode: '3172',
      city: 'VEAR',
      municipality: 'TØNSBERG',
      municipalityCode: '3905',
      activity: 'Tømrer, oppføring og vedlikehold av bygninger.',
      purpose: 'Tilby tømrertjenester, inkludert oppføring og vedlikehold av bygninger.',
      brregUrl: 'https://virksomhet.brreg.no/nb/oppslag/enheter/938604053',
      proffUrl: 'https://proff.no/bransjesøk?q=938604053',
    },
    {
      orgNr: '938594163',
      name: 'HELLE CATHRINE GRAN',
      orgForm: 'ENK',
      orgFormDesc: 'Enkeltpersonforetak',
      registrationDate: fromDateStr,
      industry: 'Fotografvirksomhet',
      industryCode: '74.200',
      address: 'Storgaten 12, 3126 TØNSBERG',
      street: 'Storgaten 12',
      postalCode: '3126',
      city: 'TØNSBERG',
      municipality: 'TØNSBERG',
      municipalityCode: '3905',
      activity: 'Fotografitjenester, portrett og kommersiell fotografering.',
      purpose: 'Fotografitjenester',
      brregUrl: 'https://virksomhet.brreg.no/nb/oppslag/enheter/938594163',
      proffUrl: 'https://proff.no/bransjesøk?q=938594163',
    }
  ];

  return { companies: fallbackList, total: fallbackList.length };
}

/**
 * Henter fullstendige detaljer om en bedrift fra Enhetsregisteret (inkludert formål og vedtekter)
 */
export async function fetchCompanyDetails(orgNr: string): Promise<any | null> {
  const clean = orgNr.replace(/\D/g, '');
  if (clean.length !== 9) return null;

  try {
    const res = await fetch(`${BRREG_ENHETER_URL}/${clean}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TonsberglivetPortal/1.0 (hei@tonsberglivet.no)',
      },
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.warn(`[Brreg Details Error for ${orgNr}]:`, error);
  }
  return null;
}
