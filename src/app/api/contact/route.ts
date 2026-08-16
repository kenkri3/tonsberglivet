import { NextResponse } from 'next/server';
import { contactSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';

const memoryMessages: Array<{
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  read: boolean;
  createdAt: string;
}> = [
  {
    id: 'msg-1',
    name: 'Erik Larsen',
    email: 'erik@gmail.com',
    subject: 'Forespørsel om annonsering',
    message: 'Hei, vi ønsker informasjon om annonseplasser under Tønsbergdagen.',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'msg-2',
    name: 'Maria Johansen',
    email: 'maria@firma.no',
    subject: 'Interesse for partnerskap',
    message: 'Vår bedrift har nylig etablert seg i Kaldnes Vest og vi ønsker å bli partner.',
    read: false,
    createdAt: new Date().toISOString(),
  },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = contactSchema.parse(body);

    try {
      const msg = await prisma.contactMessage.create({
        data: {
          name: validated.name,
          email: validated.email,
          subject: validated.subject,
          message: validated.message,
        },
      });
      return NextResponse.json({ success: true, message: 'Meldingen din er sendt! Vi svarer så fort som mulig.', data: msg }, { status: 201 });
    } catch (e) {
      const newMsg = {
        id: `msg-${Date.now()}`,
        name: validated.name,
        email: validated.email,
        subject: validated.subject,
        message: validated.message,
        read: false,
        createdAt: new Date().toISOString(),
      };
      memoryMessages.unshift(newMsg);
      return NextResponse.json({ success: true, message: 'Meldingen din er mottatt!', data: newMsg }, { status: 201 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.errors || 'Ugyldig skjema' },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    const msgs = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: msgs });
  } catch (e) {
    return NextResponse.json({ success: true, data: memoryMessages });
  }
}
