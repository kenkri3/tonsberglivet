import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sanitizeInput } from '@/lib/validations';
import { requireEditorOrAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export interface ProjectItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  content: string;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
  leadPartner: string;
  timeline: string;
  budgetStatus: string;
  published: boolean;
}

const initialProjects: ProjectItem[] = [
  {
    id: 'prj-1',
    title: 'Kaldnes Vest Byutvikling',
    slug: 'kaldnes-vest-byutvikling',
    category: 'Byutvikling & Næring',
    description: 'Transformasjon av det tidligere verftsområdet til en moderne, levende fjordbydel med boliger, næring og friområder.',
    content: 'Kaldnes Vest representerer Tønsbergs største byutviklingsprosjekt i nyere tid. Sammen med Kaldnes AS og Tønsberg kommune knyttes bydelen tettere til sentrumskjernen via gang- og sykkelbru over Kanalen.',
    status: 'ACTIVE',
    leadPartner: 'Tønsberg Kommune & Kaldnes AS',
    timeline: '2024–2028',
    budgetStatus: 'Kommunal og privat finansiering',
    published: true,
  },
  {
    id: 'prj-2',
    title: 'Slottsfjellsatsingen & Middelalderarven',
    slug: 'slottsfjellsatsingen',
    category: 'Kulturarv & Reiseliv',
    description: 'Bærekraftig formidling og tilrettelegging av Slottsfjellet som nasjonalt kulturminne og samlingspunkt.',
    content: 'Oppgradering av stier, historisk skilting og digitale guider for turister og skoleklasser, i samarbeid med Slottsfjellsmuseet og Vestfold fylkeskommune.',
    status: 'ACTIVE',
    leadPartner: 'Slottsfjellsmuseet & Tønsberg Kommune',
    timeline: '2025–2027',
    budgetStatus: 'Riksantikvaren & fylkesmidler',
    published: true,
  },
  {
    id: 'prj-3',
    title: 'Tønsberg Torv Oppgradering & Byrom',
    slug: 'tonsberg-torv-oppgradering',
    category: 'Byrom & Handel',
    description: 'Vitalisering av byens hjerte med universell utforming, faste salgsplasser for lokalmat og arrangementsfasiliteter.',
    content: 'Gjennom digital torvbooking og tilrettelegging for foodtrucks, kunstnere og markeder skaper vi et levende byrom året rundt.',
    status: 'ACTIVE',
    leadPartner: 'Tønsberglivet & Bydrift Tønsberg',
    timeline: 'Kontinuerlig drift',
    budgetStatus: 'Driftsbudsjett Tønsberglivet',
    published: true,
  },
  {
    id: 'prj-4',
    title: 'Bærekraftig Kystby & Ren Fjord',
    slug: 'baerekraftig-kystby',
    category: 'Miljø & Mobilitet',
    description: 'Klimasatsing med elektrifisering av båtruter i Kanalen, solcelledrevne bryggelys og marin opprydding.',
    content: 'Prosjektet sikrer at veksten i besøkstall skjer på en miljøvennlig måte med fokus på sirkulære løsninger og bevaring av Oslofjorden.',
    status: 'ACTIVE',
    leadPartner: 'Tønsberg Havn & Miljødirektoratet',
    timeline: '2024–2026',
    budgetStatus: 'Klimasats-tilskudd',
    published: true,
  },
  {
    id: 'prj-5',
    title: 'Gründergata & Historiske Nordbyen',
    slug: 'grundergata-nordbyen',
    category: 'Næringsutvikling',
    description: 'Profilering og tilrettelegging for unike nisjebutikker, håndverkere og gründerbedrifter i Nordbyens trehusbebyggelse.',
    content: 'Nordbyen har en unik atmosfære. Prosjektet gir nyetablerte bedrifter synlighet og mentorstøtte fra Hi5 Gründerhub og næringslivet.',
    status: 'ACTIVE',
    leadPartner: 'Hi5 Gründerhub & Tønsberg Næringsforening',
    timeline: '2025–2027',
    budgetStatus: 'Næringsfondet',
    published: true,
  },
  {
    id: 'prj-6',
    title: 'Julebyen Tønsberg & Vintermagi',
    slug: 'julebyen-tonsberg',
    category: 'Sesong & Fellesløft',
    description: 'Felles julebelysning, julemarked på Torvet, skøytebane og kulturopplevelser gjennom hele adventstiden.',
    content: 'Et samlende prosjekt for handelsstanden og innbyggerne som skaper julestemning fra Torvet til Brygga og Farmandstredet.',
    status: 'UPCOMING',
    leadPartner: 'Tønsberglivet & Handelsstanden',
    timeline: 'November–Desember 2026',
    budgetStatus: 'Spleiselag næringsliv og kommune',
    published: true,
  },
];

let inMemoryProjects: ProjectItem[] = [...initialProjects];

export async function GET() {
  try {
    const dbProjects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
    if (dbProjects.length > 0) {
      return NextResponse.json({
        success: true,
        source: 'DATABASE',
        data: dbProjects,
        total: dbProjects.length,
      });
    }
  } catch {
    // Fallback til in-memory
  }

  return NextResponse.json({
    success: true,
    source: 'OFFICIAL_REGISTRY',
    data: inMemoryProjects,
    total: inMemoryProjects.length,
  });
}

export async function POST(request: Request) {
  const auth = requireEditorOrAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, category, description, content, status, leadPartner, timeline, budgetStatus } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Tittel er påkrevd' }, { status: 400 });
    }

    const cleanTitle = sanitizeInput(title);
    const slug = cleanTitle
      .toLowerCase()
      .replace(/æ/g, 'ae')
      .replace(/ø/g, 'o')
      .replace(/å/g, 'a')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const newProject: ProjectItem = {
      id: `prj-${Date.now()}`,
      title: cleanTitle,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      category: category ? sanitizeInput(category) : 'Byutvikling',
      description: description ? sanitizeInput(description) : 'Byutviklingsprosjekt i Tønsberg.',
      content: content ? sanitizeInput(content) : '',
      status: status === 'COMPLETED' ? 'COMPLETED' : status === 'UPCOMING' ? 'UPCOMING' : 'ACTIVE',
      leadPartner: leadPartner ? sanitizeInput(leadPartner) : 'Tønsberglivet',
      timeline: timeline ? sanitizeInput(timeline) : '2026',
      budgetStatus: budgetStatus ? sanitizeInput(budgetStatus) : 'Finansiert',
      published: true,
    };

    try {
      await prisma.project.create({
        data: {
          title: newProject.title,
          slug: newProject.slug,
          description: newProject.description,
          content: newProject.content,
          status: newProject.status === 'COMPLETED' ? 'COMPLETED' : newProject.status === 'UPCOMING' ? 'UPCOMING' : 'ACTIVE',
          published: true,
        },
      });
    } catch {
      // Lagre i minnet
    }

    inMemoryProjects.unshift(newProject);

    return NextResponse.json({
      success: true,
      message: `Prosjekt «${newProject.title}» er opprettet!`,
      data: newProject,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Feil ved opprettelse av prosjekt' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = requireEditorOrAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Mangler prosjekt-ID' }, { status: 400 });
    }

    try {
      await prisma.project.delete({ where: { id } });
    } catch {
      // Ignorer DB-feil
    }

    inMemoryProjects = inMemoryProjects.filter((p) => p.id !== id);
    return NextResponse.json({ success: true, message: 'Prosjekt slettet' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Feil ved sletting av prosjekt' }, { status: 500 });
  }
}
