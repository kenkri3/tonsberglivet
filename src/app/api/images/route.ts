import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const memoryImages = [
  {
    id: 'img-1',
    title: 'Tønsberg Brygge og Havnepromenade',
    url: '/images/hero.jpg',
    folder: 'Bylivet',
    photographer: 'Tønsberglivet Arkiv',
    gdprStatus: 'APPROVED',
    aiTags: ['Brygga', 'Havn', 'Solnedgang', 'Bylivet', 'Båtliv'],
    uploadedAt: '2026-08-01',
  },
  {
    id: 'img-2',
    title: 'Slottsfjellet og Tårnet',
    url: '/images/slottsfjellet.jpg',
    folder: 'Kultur & Historie',
    photographer: 'Tønsberglivet Arkiv',
    gdprStatus: 'APPROVED',
    aiTags: ['Slottsfjellet', 'Tårnet', 'Historie', 'Utsikt', 'Middelalder'],
    uploadedAt: '2026-08-03',
  },
  {
    id: 'img-3',
    title: 'Matmarked og ferske bakervarer på Torvet',
    url: '/images/food.jpg',
    folder: 'Næringslivet',
    photographer: 'Tønsberglivet Arkiv',
    gdprStatus: 'APPROVED',
    aiTags: ['Torvet', 'Matmarked', 'Surdeigsbrød', 'Lokalmat', 'Gründer'],
    uploadedAt: '2026-08-05',
  },
  {
    id: 'img-4',
    title: 'Gründergata og Nordbyens trehus',
    url: '/images/grundergata.jpg',
    folder: 'Bylivet',
    photographer: 'Tønsberglivet Arkiv',
    gdprStatus: 'APPROVED',
    aiTags: ['Gründergata', 'Nordbyen', 'Trehus', 'Kulturarv', 'Shopping'],
    uploadedAt: '2026-08-06',
  },
  {
    id: 'img-5',
    title: 'Kanalen og Bryggestemning',
    url: '/images/brygge.jpg',
    folder: 'Bylivet',
    photographer: 'Tønsberglivet Arkiv',
    gdprStatus: 'APPROVED',
    aiTags: ['Kanalen', 'Brygga', 'Uteservering', 'Sommer'],
    uploadedAt: '2026-08-08',
  },
  {
    id: 'img-6',
    title: 'Kultur og konsertopplevelser',
    url: '/images/kultur.jpg',
    folder: 'Kultur & Historie',
    photographer: 'Tønsberglivet Arkiv',
    gdprStatus: 'APPROVED',
    aiTags: ['Kultur', 'Konsert', 'Foynhagen', 'Musikk'],
    uploadedAt: '2026-08-10',
  },
  {
    id: 'img-7',
    title: 'Færder Skjærgård og Kystnatur',
    url: '/images/skjaergard.jpg',
    folder: 'Reiselivet',
    photographer: 'Visit Færder',
    gdprStatus: 'APPROVED',
    aiTags: ['Færder', 'Skjærgård', 'Svaberg', 'Nasjonalpark', 'Kyst'],
    uploadedAt: '2026-08-12',
  },
  {
    id: 'img-8',
    title: 'Studentlivet ved USN Campus Vestfold',
    url: '/images/student.jpg',
    folder: 'Studentlivet',
    photographer: 'USN Kommunikasjon',
    gdprStatus: 'APPROVED',
    aiTags: ['Student', 'USN', 'Campus Vestfold', 'Bakkenteigen', 'Utdanning'],
    uploadedAt: '2026-08-14',
  },
  {
    id: 'img-9',
    title: 'Shopping i gågater og nisjebutikker',
    url: '/images/shopping.jpg',
    folder: 'Bylivet',
    photographer: 'Tønsberglivet Arkiv',
    gdprStatus: 'APPROVED',
    aiTags: ['Handel', 'Shopping', 'Gågater', 'Sentrumsgavekortet'],
    uploadedAt: '2026-08-16',
  },
  {
    id: 'img-10',
    title: 'Sommerfestival og Mangfold på Kaikanten',
    url: '/images/regnbue.jpg',
    folder: 'Kultur & Historie',
    photographer: 'Tønsberglivet Arkiv',
    gdprStatus: 'APPROVED',
    aiTags: ['Festival', 'Folkefest', 'Mangfold', 'Sommer', 'Fellesskap'],
    uploadedAt: '2026-08-18',
  },
];

export async function GET() {
  try {
    const images = await prisma.image.findMany({
      orderBy: { createdAt: 'desc' },
    });
    if (images && images.length > 0) {
      return NextResponse.json({ success: true, data: images });
    }
    return NextResponse.json({ success: true, data: memoryImages });
  } catch (e) {
    return NextResponse.json({ success: true, data: memoryImages });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, url, folder, photographer, aiTags, gdprStatus } = body;

    if (!title || !url) {
      return NextResponse.json({ success: false, error: 'Tittel og URL er påkrevd' }, { status: 400 });
    }

    try {
      const img = await prisma.image.create({
        data: {
          filename: title,
          url,
          photographer: photographer || 'Tønsberglivet',
          gdprStatus: (gdprStatus as any) || 'APPROVED',
          aiTags: Array.isArray(aiTags) ? aiTags : ['Tønsberg'],
        },
      });
      return NextResponse.json({ success: true, data: img }, { status: 201 });
    } catch (e) {
      const newImg = {
        id: `img-${Date.now()}`,
        title,
        url,
        folder: folder || 'Bylivet',
        photographer: photographer || 'Tønsberglivet',
        gdprStatus: gdprStatus || 'APPROVED',
        aiTags: aiTags || ['Tønsberg'],
        uploadedAt: new Date().toISOString().split('T')[0],
      };
      memoryImages.unshift(newImg);
      return NextResponse.json({ success: true, data: newImg }, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Feil ved lagring av bilde' }, { status: 500 });
  }
}
