import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const memoryImages = [
  {
    id: 'img-1',
    title: 'Torvet i sommer-sol',
    url: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80',
    folder: 'Bylivet',
    photographer: 'Per Eide',
    gdprStatus: 'APPROVED',
    aiTags: ['Torvet', 'Sommer', 'Folkeliv', 'Uteservering'],
    uploadedAt: '2026-08-01',
  },
  {
    id: 'img-2',
    title: 'Slottsfjellet og Tårnet',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    folder: 'Kultur & Historie',
    photographer: 'Tønsberglivet Arkiv',
    gdprStatus: 'APPROVED',
    aiTags: ['Slottsfjellet', 'Tårnet', 'Historie', 'Utsikt'],
    uploadedAt: '2026-08-03',
  },
  {
    id: 'img-3',
    title: 'Verdens Ende Vippefyr',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    folder: 'Reiselivet',
    photographer: 'Visit Færder',
    gdprStatus: 'APPROVED',
    aiTags: ['Verdens Ende', 'Vippefyr', 'Skjærgård', 'Kyst'],
    uploadedAt: '2026-08-05',
  },
];

export async function GET() {
  try {
    const images = await prisma.image.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: images });
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
