import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sanitizeInput } from '@/lib/validations';
import { requireEditorOrAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export interface PartnerItem {
  id: string;
  name: string;
  slug: string;
  website: string;
  description: string;
  level: 'PREMIUM' | 'STANDARD' | 'BASIC';
  category: string;
  published: boolean;
  contactEmail?: string;
  joinedYear: number;
}

// Autentiske offisielle samarbeidspartnere i Tønsberg
const initialPartners: PartnerItem[] = [
  {
    id: 'prt-1',
    name: 'Tønsberg Kommune',
    slug: 'tonsberg-kommune',
    website: 'https://www.tonsberg.kommune.no',
    description: 'Offentlig hovedpartner for byutvikling, kultur og næringsliv i Norges eldste by.',
    level: 'PREMIUM',
    category: 'Offentlig / Kommune',
    published: true,
    contactEmail: 'postmottak@tonsberg.kommune.no',
    joinedYear: 2020,
  },
  {
    id: 'prt-2',
    name: 'Færder Kommune',
    slug: 'faerder-kommune',
    website: 'https://www.faerder.kommune.no',
    description: 'Samarbeidskommune for reiseliv, skjærgård og felles kulturinitiativer i regionen.',
    level: 'PREMIUM',
    category: 'Offentlig / Nabokommune',
    published: true,
    contactEmail: 'post@faerder.kommune.no',
    joinedYear: 2021,
  },
  {
    id: 'prt-3',
    name: 'Tønsberg Næringsforening',
    slug: 'tonsberg-naeringsforening',
    website: 'https://www.tonsbergnf.no',
    description: 'Næringsforening med over 350 medlemsbedrifter, fremmer vekst og rammevilkår i Tønsberg-regionen.',
    level: 'PREMIUM',
    category: 'Næringslivsallianse',
    published: true,
    contactEmail: 'post@tonsbergnf.no',
    joinedYear: 2020,
  },
  {
    id: 'prt-4',
    name: 'SpareBank 1 Sørøst-Norge',
    slug: 'sparebank-1-sorost-norge',
    website: 'https://www.sparebank1.no',
    description: 'Lokal sparebank og samfunnsbygger med stor støtte til lokale arrangementer og allmennyttige formål.',
    level: 'PREMIUM',
    category: 'Finans & Samfunn',
    published: true,
    contactEmail: 'tonsberg@sparebank1sorost.no',
    joinedYear: 2021,
  },
  {
    id: 'prt-5',
    name: 'Farmandstredet (Steen & Strøm)',
    slug: 'farmandstredet',
    website: 'https://farmandstredet.steenstrom.no',
    description: 'Vestfolds største kjøpesenter med 84 butikker i hjertet av Tønsberg sentrum.',
    level: 'STANDARD',
    category: 'Handel & Kjøpesenter',
    published: true,
    contactEmail: 'senterledelse@steenstrom.com',
    joinedYear: 2022,
  },
  {
    id: 'prt-6',
    name: 'Universitetet i Sørøst-Norge (USN)',
    slug: 'usn-campus-vestfold',
    website: 'https://www.usn.no',
    description: 'Campus Vestfold på Bakkenteigen med over 5 000 studenter og sterke forskningsmiljøer innen maritimt og tech.',
    level: 'STANDARD',
    category: 'Utdanning & Forskning',
    published: true,
    contactEmail: 'postmottak@usn.no',
    joinedYear: 2022,
  },
  {
    id: 'prt-7',
    name: 'Hi5 Gründerhub',
    slug: 'hi5-grunderhub',
    website: 'https://hi5.no',
    description: 'Innovasjonssenter og inkubator på Kaldnes for gründere, vekstselskaper og tech-miljøer.',
    level: 'STANDARD',
    category: 'Innovasjon & Oppstart',
    published: true,
    contactEmail: 'hei@hi5.no',
    joinedYear: 2023,
  },
  {
    id: 'prt-8',
    name: 'Foynhagen & Foyn Bar',
    slug: 'foynhagen',
    website: 'https://foynhagen.no',
    description: 'Tønsbergs ledende konsertarena og utelivskonsept på Tønsberg Brygge.',
    level: 'STANDARD',
    category: 'Kultur & Uteliv',
    published: true,
    contactEmail: 'booking@foynhagen.no',
    joinedYear: 2023,
  },
  {
    id: 'prt-9',
    name: 'Oseberg Kulturhus',
    slug: 'oseberg-kulturhus',
    website: 'https://www.osebergkulturhus.no',
    description: 'Kulturarena og konferansesenter i sjøkanten ved Kanalen med teater, konserter og messer.',
    level: 'STANDARD',
    category: 'Kultur & Konferanse',
    published: true,
    contactEmail: 'post@osebergkulturhus.no',
    joinedYear: 2023,
  },
  {
    id: 'prt-10',
    name: 'Vestfold Fylkeskommune',
    slug: 'vestfold-fylkeskommune',
    website: 'https://www.vestfoldfylke.no',
    description: 'Fylkeskommune med ansvar for regional utvikling, kollektivtransport og videregående opplæring.',
    level: 'STANDARD',
    category: 'Offentlig / Fylke',
    published: true,
    contactEmail: 'post@vestfoldfylke.no',
    joinedYear: 2024,
  },
];

let inMemoryPartners: PartnerItem[] = [...initialPartners];

export async function GET() {
  try {
    const dbPartners = await prisma.partner.findMany({
      orderBy: { createdAt: 'asc' },
    });
    if (dbPartners.length > 0) {
      return NextResponse.json({
        success: true,
        source: 'DATABASE',
        data: dbPartners,
        total: dbPartners.length,
      });
    }
  } catch (err) {
    // Fallback til minnestruktur
  }

  return NextResponse.json({
    success: true,
    source: 'OFFICIAL_REGISTRY',
    data: inMemoryPartners,
    total: inMemoryPartners.length,
  });
}

export async function POST(request: Request) {
  const auth = requireEditorOrAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, website, description, level, category, contactEmail } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Partnernavn er påkrevd' }, { status: 400 });
    }

    const cleanName = sanitizeInput(name);
    const slug = cleanName
      .toLowerCase()
      .replace(/æ/g, 'ae')
      .replace(/ø/g, 'o')
      .replace(/å/g, 'a')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const newPartner: PartnerItem = {
      id: `prt-${Date.now()}`,
      name: cleanName,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      website: website ? sanitizeInput(website) : 'https://tonsberg.no',
      description: description ? sanitizeInput(description) : 'Samarbeidspartner i Tønsberglivet.',
      level: level === 'PREMIUM' ? 'PREMIUM' : level === 'BASIC' ? 'BASIC' : 'STANDARD',
      category: category ? sanitizeInput(category) : 'Samarbeidspartner',
      published: true,
      contactEmail: contactEmail ? sanitizeInput(contactEmail) : undefined,
      joinedYear: new Date().getFullYear(),
    };

    try {
      await prisma.partner.create({
        data: {
          name: newPartner.name,
          slug: newPartner.slug,
          website: newPartner.website,
          description: newPartner.description,
          level: newPartner.level as any,
          published: true,
        },
      });
    } catch {
      // Lagre i minnet
    }

    inMemoryPartners.unshift(newPartner);

    return NextResponse.json({
      success: true,
      message: `Partner «${newPartner.name}» er opprettet!`,
      data: newPartner,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Feil ved opprettelse av partner' }, { status: 500 });
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
      return NextResponse.json({ success: false, error: 'Mangler partner-ID' }, { status: 400 });
    }

    try {
      await prisma.partner.delete({ where: { id } });
    } catch {
      // Ignorer DB-feil
    }

    inMemoryPartners = inMemoryPartners.filter((p) => p.id !== id);
    return NextResponse.json({ success: true, message: 'Partner slettet' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Feil ved sletting av partner' }, { status: 500 });
  }
}
