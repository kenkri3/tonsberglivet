/**
 * AUTONOMOUS ENTERPRISE SEO & CONTENT ENGINE
 * For Tønsberglivet (https://tonsberglivet.no)
 * 
 * Inneholder kjernelogikk for:
 * 1. Strategisk timing & prediktiv indeksering («sweet-spot»)
 * 2. On-page arkitektur & entitets-strategi (H1, safe slug, meta description 145-158 tegn, internlenker, CTA)
 * 3. Semantisk Schema.org @graph JSON-LD generator
 * 4. Generative Engine Optimization (GEO) & AI-søkemotor faktatetthet
 * 5. Livssyklus & 301-redirect regler for utgåtte arrangementer
 */

export interface EnterpriseSeoOutput {
  title: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  read_time: string;
  author: string;
  internal_links: Array<{ text: string; url: string }>;
  schema_json_ld: {
    '@context': string;
    '@graph': any[];
  };
  timing_strategy?: 'sweet_spot' | 'near_phase' | 'evergreen' | 'expired';
}

export interface SeoAuditChecklist {
  h1Length: { valid: boolean; length: number; message: string };
  metaLength: { valid: boolean; length: number; message: string };
  slugSafe: { valid: boolean; slug: string; message: string };
  internalLinks: { valid: boolean; count: number; message: string };
  ctaCount: { valid: boolean; count: number; message: string };
  factDensity: { valid: boolean; count: number; message: string };
  schemaValid: { valid: boolean; types: string[]; message: string };
}

export interface SeoAuditScore {
  totalScore: number; // 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  checklist: SeoAuditChecklist;
  suggestions: string[];
}

/**
 * Systeminstruksjonen for den autonome SEO- og GEO-motoren.
 */
export const ENTERPRISE_SEO_SYSTEM_INSTRUCTION = `Du er en verdensledende SEO-arkitekt, teknisk innholdsstrateg og data-drevet redaktør for Tønsberglivet (https://tonsberglivet.no).

Ditt oppdrag er å automatisere produksjon av uovertruffent, autoritært og konverteringsoptimalisert innhold som dominerer både tradisjonell søkemotoroptimalisering (Google SERP) og moderne AI-søk (Generative Engine Optimization / GEO: ChatGPT Search, Perplexity, Claude, Google AI Overviews).

## 1. STRATEGISK TIMING & PREDIKTIV INDEKSERING («SWEET-SPOT»)
Planlegg alltid innhold etter følgende publiseringsvinduer:
1. Sweet Spot (7–45 dager før peak/event/sesong): Hovedvinduet for publisering. Gir søkemotorer 1–2 uker til crawling, indeksering og rangering før søkevolumet når toppen.
2. Nærfase (2–7 dager før): Helgeguider, tidskritiske oppdateringer og «Hva skjer denne uken»-innhold for impulsive søkere.
3. Eviggrønt (Evergreen Hubs): Statiske samlesider og tematiske guider som oppdateres dynamisk med ferske sanntidsdata.
4. Stoppregel: Generer ALDRI innhold for utgåtte arrangementer eller historiske datoer.

## 2. ON-PAGE ARKITEKTUR & ENTITETS-STRATEGI
Hver side og artikkel skal følge denne strenge strukturen:
- Tittel (H1): 50–60 tegn. Skarp, klikkvennlig, inneholder primærnøkkelord + geografisk/faglig entitet + verdiløfte.
- URL-Slug: URL-sikker, kun små bokstaver (a-z, 0-9 og bindestrek), ingen spesialtegn (æ, ø, å transformeres til ae, o, a), 3–5 ord med høyeste søkeintensjon.
- Meta Description / Excerpt: Nøyaktig 145–158 tegn. Direkte svar på søkeintensjonen med et tydelig handlingsdrivende handlingskall (CTA).
- Semantisk struktur:
  - H1: Hovedtittel (kun én per side).
  - Ingress: 2–3 setninger som fenger, oppsummerer kjernen og bekrefter at brukeren har havnet på riktig sted.
  - H2 & H3: Logiske underseksjoner som besvarer underliggende søkeintensjoner og spørsmål.
  - Punktlister & Infobokser: Praktiske detaljer (fakta, priser, åpningstider, adresse/lokasjon, fordeler).
  - Toveis internlenking: Minst 2–4 kontekstuelle interne lenker til portalkategoriene (/bylivet, /bylivet/torvleie, /bylivet/gavekort, /eventer, /reiselivet, /naeringslivet, /studentlivet, /kontakt).
  - Konverteringsknapper / CTA: Minst 2 tydelige handlingsoppfordringer med lenker (booking, bestilling, billetter, kontakt).

## 3. SEMANTISK SCHEMA.ORG MARKUP (JSON-LD)
Generer alltid en valid Schema.org @graph JSON-LD:
- Artikkel: Article eller BlogPosting
- Hendelse: Event, MusicEvent, Festival eller BusinessEvent
- Lokale bedrifter/attraksjoner: Restaurant, TouristAttraction, Store, CafeOrCoffeeShop
- Støtte-entiteter: BreadcrumbList (posisjon 1, 2, 3), Organization (Tønsberglivet AS), Place, GeoCoordinates (Tønsberg sentrum: 59.2675, 10.4076).

## 4. GEO & AI-SØK OPTIMALISERING (Generative Engine Optimization)
- Faktatetthet over fylltekst: Presenter fakta, priser, åpningstider, adresser, spesifikasjoner i uttrekkbare tabeller eller punktlister.
- Entitetssammenkobling: Knytt alltid innholdet til kjente Tønsberg-entiteter (Slottsfjellet, Foynhagen, Nedre Langgate, Tønsberg Torv, Færder nasjonalpark, USN Campus Vestfold, Hi5 Gründerhus).
- Autoritær lokal tone: Skriv med troverdighet og presisjon på plettfri norsk.

## 5. REGLER FOR LIVSSYKLUS & 301 REDIRECT
- Utgåtte arrangementer kaster ALDRI 404, men omdirigeres permanent (301) til /eventer.

## 6. FORMAT & OUTPUT-KRAV
Du skal KUN svare med et 100% gyldig JSON-objekt i følgende format:
{
  "title": "SEO-optimalisert H1-tittel med søkeord og geografisk/faglig forankring",
  "slug": "kort-url-sikker-slug-uten-norske-tegn",
  "meta_title": "Meta-tittel (maks 60 tegn) | Tønsberglivet",
  "meta_description": "Fengende meta-beskrivelse på 145-158 tegn som driver høy CTR...",
  "excerpt": "Ingress på 2-3 setninger som fanger leseren og besvarer kjernebehovet.",
  "content": "Fullstendig artikkel i rik Markdown med overskrifter (##, ###), punktlister, infoboks, tips og CTA-lenker...",
  "category": "Bylivet / Reiselivet / Næringslivet / Studentlivet / Kultur",
  "tags": ["Hovedord", "Entitet", "Geografi", "Relatert tema"],
  "read_time": "3 min lesetid",
  "author": "Tønsberglivet Redaksjon",
  "internal_links": [
    { "text": "Anktekst", "url": "/overordnet-kategori" }
  ],
  "schema_json_ld": {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "headline": "...",
        "description": "...",
        "breadcrumb": { "@type": "BreadcrumbList", "itemListElement": [] }
      }
    ]
  }
}`;

/**
 * Konverterer en vilkårlig tittel til en URL-sikker slug uten æ, ø, å.
 */
export function generateSafeSlug(text: string): string {
  if (!text) return 'artikkel';
  return text
    .toLowerCase()
    .trim()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .split('-')
    .slice(0, 6)
    .join('-');
}

/**
 * Beregner strategisk publiseringsvindu for en hendelse/sesong.
 */
export function calculatePublishingTiming(targetDate: Date | string): {
  window: 'sweet_spot' | 'near_phase' | 'evergreen' | 'expired';
  daysUntil: number;
  label: string;
  recommendation: string;
} {
  if (!targetDate) {
    return {
      window: 'evergreen',
      daysUntil: 0,
      label: 'Eviggrønt innhold (Evergreen Hub)',
      recommendation: 'Passer for helårsguider og statiske samlesider som oppdateres dynamisk.',
    };
  }

  const target = new Date(targetDate);
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysUntil < 0) {
    return {
      window: 'expired',
      daysUntil,
      label: 'Utgått dato (Stoppregel aktiv)',
      recommendation: 'Stoppregel: Generer ALDRI innhold for utgåtte datoer. Omdiriger til /eventer med 301.',
    };
  }

  if (daysUntil >= 7 && daysUntil <= 45) {
    return {
      window: 'sweet_spot',
      daysUntil,
      label: `Sweet Spot (${daysUntil} dager til)`,
      recommendation: 'Optimalt publiseringsvindu! Gir Google og AI-motorer 1–2 uker til crawling før søkevolum-peak.',
    };
  }

  if (daysUntil >= 2 && daysUntil < 7) {
    return {
      window: 'near_phase',
      daysUntil,
      label: `Nærfase (${daysUntil} dager til)`,
      recommendation: 'Tidskritisk publisering for helgeguider og impulsive søk («Hva skjer i helgen»).',
    };
  }

  return {
    window: 'evergreen',
    daysUntil,
    label: `Langsiktig planlegging (${daysUntil} dager til)`,
    recommendation: 'God tid. Bør klargjøres som utkast og publiseres 30–45 dager før peak.',
  };
}

/**
 * Utfører en automatisk revisjon (audit) av innholdet basert på Enterprise SEO & GEO-kriteriene.
 */
export function auditSeoQuality(output: Partial<EnterpriseSeoOutput>): SeoAuditScore {
  const suggestions: string[] = [];
  let points = 0;

  // 1. H1-tittel (mål: 50–60 tegn)
  const titleLen = output.title ? output.title.trim().length : 0;
  const h1Valid = titleLen >= 45 && titleLen <= 65;
  if (h1Valid) {
    points += 20;
  } else {
    suggestions.push(`H1-tittel er ${titleLen} tegn (anbefalt 50–60 tegn for optimal SERP-visning).`);
  }

  // 2. Meta description (mål: 145–158 tegn)
  const metaLen = output.meta_description ? output.meta_description.trim().length : 0;
  const metaValid = metaLen >= 140 && metaLen <= 165;
  if (metaValid) {
    points += 20;
  } else {
    suggestions.push(`Meta-beskrivelse er ${metaLen} tegn (mål: nøyaktig 145–158 tegn for å unngå avkutting i Google).`);
  }

  // 3. URL-sikker slug
  const slug = output.slug || '';
  const slugValid = slug.length > 0 && /^[a-z0-9-]+$/.test(slug) && !slug.includes('æ') && !slug.includes('ø') && !slug.includes('å');
  if (slugValid) {
    points += 15;
  } else {
    suggestions.push('Slug inneholder ugyldige tegn eller norske bokstaver. Må være kun a-z, 0-9 og bindestrek.');
  }

  // 4. Toveis internlenking (min. 2–4 lenker)
  const linksCount = Array.isArray(output.internal_links) ? output.internal_links.length : 0;
  const internalLinksValid = linksCount >= 2;
  if (internalLinksValid) {
    points += 15;
  } else {
    suggestions.push(`Har kun ${linksCount} internlenker. Anbefalt minimum er 2–4 kontekstuelle lenker til portalhuber.`);
  }

  // 5. Konverterings-CTA i innholdet
  const content = output.content || '';
  const ctaMatches = content.match(/(bestill|kjøp|book|reserver|les mer|meld deg på|kontakt oss|se program)/gi) || [];
  const ctaCount = ctaMatches.length;
  const ctaValid = ctaCount >= 2;
  if (ctaValid) {
    points += 15;
  } else {
    suggestions.push('Artikkelen mangler tydelige konverteringsknapper eller handlingsoppfordringer (CTA).');
  }

  // 6. Faktatetthet (punkter, tabeller, uthevinger)
  const bulletMatches = content.match(/^\s*[-*]\s+/gm) || [];
  const factDensityValid = bulletMatches.length >= 3 || content.includes('|');
  if (factDensityValid) {
    points += 10;
  } else {
    suggestions.push('Legg til en infoboks eller punktliste med åpningstider, priser eller adresser for bedre GEO/AI-søk indeksering.');
  }

  // 7. Schema.org JSON-LD
  const hasSchema = !!(output.schema_json_ld && output.schema_json_ld['@graph'] && output.schema_json_ld['@graph'].length > 0);
  const schemaTypes = hasSchema ? output.schema_json_ld!['@graph'].map((item: any) => item['@type']) : [];
  if (hasSchema) {
    points += 5;
  } else {
    suggestions.push('Schema.org @graph JSON-LD mangler.');
  }

  const totalScore = Math.min(100, points);
  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'D';
  if (totalScore >= 95) grade = 'A+';
  else if (totalScore >= 85) grade = 'A';
  else if (totalScore >= 70) grade = 'B';
  else if (totalScore >= 50) grade = 'C';

  return {
    totalScore,
    grade,
    checklist: {
      h1Length: {
        valid: h1Valid,
        length: titleLen,
        message: h1Valid ? 'Perfekt H1-lengde (50–60 tegn)' : `H1 er ${titleLen} tegn (bør være 50–60)`,
      },
      metaLength: {
        valid: metaValid,
        length: metaLen,
        message: metaValid ? 'Optimal meta-beskrivelse (145–158 tegn)' : `Meta er ${metaLen} tegn (bør være 145–158)`,
      },
      slugSafe: {
        valid: slugValid,
        slug,
        message: slugValid ? 'URL-sikker ren slug' : 'Slug trenger opprydding (ingen æ/ø/å)',
      },
      internalLinks: {
        valid: internalLinksValid,
        count: linksCount,
        message: internalLinksValid ? `${linksCount} interne lenker registrert` : 'Trenger minst 2 interne lenker',
      },
      ctaCount: {
        valid: ctaValid,
        count: ctaCount,
        message: ctaValid ? `${ctaCount} handlingsdrivende oppfordringer funnet` : 'Mangler handlingsdrivende CTA',
      },
      factDensity: {
        valid: factDensityValid,
        count: bulletMatches.length,
        message: factDensityValid ? 'Høy faktatetthet (tabeller/lister for GEO)' : 'Legg til fakta/punktliste for AI-søk',
      },
      schemaValid: {
        valid: hasSchema,
        types: schemaTypes,
        message: hasSchema ? `Schema.org @graph aktiv (${schemaTypes.join(', ')})` : 'Schema.org JSON-LD mangler',
      },
    },
    suggestions,
  };
}

/**
 * Standard Schema.org @graph generator for Tønsberglivet
 */
export function generateEnterpriseSchemaGraph(options: {
  type: 'Article' | 'Event' | 'Place' | 'Guide';
  title: string;
  description: string;
  slug: string;
  category?: string;
  datePublished?: string;
  authorName?: string;
  locationName?: string;
  locationAddress?: string;
  startDate?: string;
  endDate?: string;
  price?: string;
}) {
  const baseUrl = 'https://tonsberglivet.no';
  const url = `${baseUrl}/${options.type === 'Event' ? 'eventer' : 'nyheter'}/${options.slug}`;

  const graph: any[] = [
    // 1. Organization
    {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: 'Tønsberglivet AS',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Rådhusgaten 1',
        addressLocality: 'Tønsberg',
        postalCode: '3126',
        addressCountry: 'NO',
      },
    },
    // 2. Breadcrumbs
    {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Hjem',
          item: baseUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: options.type === 'Event' ? 'Arrangementer' : options.category || 'Nyheter',
          item: `${baseUrl}/${options.type === 'Event' ? 'eventer' : 'nyheter'}`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: options.title,
          item: url,
        },
      ],
    },
  ];

  // 3. Primærentitet
  if (options.type === 'Event') {
    graph.push({
      '@type': 'Event',
      '@id': `${url}#event`,
      name: options.title,
      description: options.description,
      url,
      startDate: options.startDate || new Date().toISOString(),
      endDate: options.endDate || options.startDate,
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      location: {
        '@type': 'Place',
        name: options.locationName || 'Tønsberg Sentrum',
        address: {
          '@type': 'PostalAddress',
          streetAddress: options.locationAddress || 'Torvet, 3110 Tønsberg',
          addressLocality: 'Tønsberg',
          addressCountry: 'NO',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 59.2675,
          longitude: 10.4076,
        },
      },
      organizer: {
        '@id': `${baseUrl}/#organization`,
      },
      offers: {
        '@type': 'Offer',
        price: options.price || '0',
        priceCurrency: 'NOK',
        availability: 'https://schema.org/InStock',
        url,
      },
    });
  } else {
    graph.push({
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: options.title,
      description: options.description,
      url,
      mainEntityOfPage: url,
      datePublished: options.datePublished || new Date().toISOString(),
      dateModified: new Date().toISOString(),
      author: {
        '@type': 'Person',
        name: options.authorName || 'Tønsberglivet Redaksjon',
      },
      publisher: {
        '@id': `${baseUrl}/#organization`,
      },
      articleSection: options.category || 'Bylivet',
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}
