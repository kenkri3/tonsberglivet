// NAV Arbeidsplassen Open Data API Service for Tønsberglivet
// Public open API from https://arbeidsplassen.nav.no/public-opendata/

const NAV_JOBS_URL = 'https://arbeidsplassen.nav.no/public-opendata/api/v1/ads';

export interface JobVacancy {
  id: string;
  title: string;
  employer: string;
  location: string;
  municipality: string;
  engagementType: string; // Heltid, Deltid, Sesong, Vikariat
  extent: string; // 100%, 50%, etc.
  applicationDeadline: string;
  published: string;
  link: string;
  isStudentFriendly: boolean;
  descriptionSnippet?: string;
  sector?: string;
}

export const FALLBACK_TONSBERG_JOBS: JobVacancy[] = [
  {
    id: 'tbg-job-1',
    title: 'Sykepleier / Spesialsykepleier - Medisinsk avdeling',
    employer: 'Sykehuset i Vestfold HF',
    location: 'Tønsberg',
    municipality: 'Tønsberg',
    engagementType: 'Fast',
    extent: '100%',
    applicationDeadline: 'Snarest',
    published: 'I dag',
    link: 'https://arbeidsplassen.nav.no',
    isStudentFriendly: false,
    descriptionSnippet: 'Spennende stilling ved et av Norges mest moderne akuttsykehus midt i Tønsberg.',
    sector: 'Offentlig'
  },
  {
    id: 'tbg-job-2',
    title: 'Sommervert & Servitør - Sommersesongen',
    employer: 'Foynhagen AS',
    location: 'Tønsberg Brygge',
    municipality: 'Tønsberg',
    engagementType: 'Sesong / Deltid',
    extent: 'Deltid / Sesong',
    applicationDeadline: 'Løpende',
    published: 'I dag',
    link: 'https://arbeidsplassen.nav.no',
    isStudentFriendly: true,
    descriptionSnippet: 'Bli med på teamet på Norges mest populære konsertarena og uteservering på brygga!',
    sector: 'Privat'
  },
  {
    id: 'tbg-job-3',
    title: 'Fullstack Utvikler / TypeScript & Cloud',
    employer: 'Tech-Hub Tønsberg / Hi5',
    location: 'Tønsberg Sentrum',
    municipality: 'Tønsberg',
    engagementType: 'Fast',
    extent: '100%',
    applicationDeadline: '15. november',
    published: 'I går',
    link: 'https://arbeidsplassen.nav.no',
    isStudentFriendly: false,
    descriptionSnippet: 'Arbeid med moderne skyteknologi fra nyoppussede lokaler i gründerkvartalet.',
    sector: 'Privat'
  },
  {
    id: 'tbg-job-4',
    title: 'Deltidsmedarbeider butikk & kundeservice',
    employer: 'Alti Farmandstredet',
    location: 'Farmandstredet, Tønsberg',
    municipality: 'Tønsberg',
    engagementType: 'Deltid',
    extent: '20-40%',
    applicationDeadline: 'Snarest',
    published: '3 dager siden',
    link: 'https://arbeidsplassen.nav.no',
    isStudentFriendly: true,
    descriptionSnippet: 'Perfekt deltidsjobb for studenter ved USN Campus Vestfold. Fleksible kvelds- og helgevakter.',
    sector: 'Privat'
  },
  {
    id: 'tbg-job-5',
    title: 'Lærer / Grunnskolelærer 1.-7. trinn',
    employer: 'Tønsberg Kommune',
    location: 'Sem skole',
    municipality: 'Tønsberg',
    engagementType: 'Fast',
    extent: '100%',
    applicationDeadline: '1. desember',
    published: 'Denne uken',
    link: 'https://arbeidsplassen.nav.no',
    isStudentFriendly: false,
    descriptionSnippet: 'Bli en del av det fremtidsrettede skolemiljøet i Tønsberg kommune med fokus på trivsel og mestring.',
    sector: 'Kommune'
  }
];

export async function fetchLiveJobs(onlyStudent = false, limit = 10): Promise<JobVacancy[]> {
  try {
    const params = new URLSearchParams({
      municipalities: 'TØNSBERG,FÆRDER',
      size: String(Math.max(limit * 2, 20)),
    });

    const res = await fetch(`${NAV_JOBS_URL}?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TonsberglivetPortal/1.0 (hei@tonsberglivet.no)'
      },
      next: { revalidate: 3600 } // Cache 1 hour
    });

    if (res.ok) {
      const data = await res.json();
      const content = data?.content || [];

      const formatted: JobVacancy[] = content.map((item: any) => {
        const title = item.title || 'Ledig stilling';
        const employer = item.businessName || item.employer?.name || 'Bedrift i Tønsberg';
        const location = item.workLocations?.[0]?.city || item.locationList?.[0]?.city || 'Tønsberg';
        const municipality = item.workLocations?.[0]?.municipal || 'Tønsberg';
        const engagementType = item.engagementType || item.properties?.engagementtype || 'Fast';
        const extent = item.extent || item.properties?.extent || '100%';
        const deadline = item.applicationDeadline || item.properties?.applicationdue || 'Snarest';
        const publishedDate = item.published ? new Date(item.published).toLocaleDateString('no-NO') : 'Nylig';

        const isStudent =
          engagementType.toLowerCase().includes('deltid') ||
          extent.toLowerCase().includes('deltid') ||
          title.toLowerCase().includes('student') ||
          title.toLowerCase().includes('sommer') ||
          title.toLowerCase().includes('ekstrahjelp');

        return {
          id: item.uuid || item.id || String(Math.random()),
          title,
          employer,
          location,
          municipality,
          engagementType,
          extent,
          applicationDeadline: deadline,
          published: publishedDate,
          link: item.link || `https://arbeidsplassen.nav.no/stillinger/stilling/${item.uuid}`,
          isStudentFriendly: isStudent,
          descriptionSnippet: item.description?.replace(/<[^>]*>?/gm, '').slice(0, 140) + '...',
          sector: item.properties?.sector || 'Privat'
        };
      });

      const filtered = onlyStudent ? formatted.filter(j => j.isStudentFriendly) : formatted;
      if (filtered.length > 0) {
        return filtered.slice(0, limit);
      }
    }
  } catch (error) {
    console.warn('NAV Arbeidsplassen API feilet, bruker fallback stillinger:', error);
  }

  const fallback = onlyStudent ? FALLBACK_TONSBERG_JOBS.filter(j => j.isStudentFriendly) : FALLBACK_TONSBERG_JOBS;
  return fallback.slice(0, limit);
}
