import { NextResponse } from 'next/server';
import { bookingSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';

// Memory fallback store if database is not migrated yet in local dev environment
const memoryBookings: Array<{
  id: string;
  name: string;
  email: string;
  phone?: string;
  type: string;
  startDate?: string;
  endDate?: string;
  message?: string;
  status: string;
  createdAt: string;
}> = [
  {
    id: 'req-1',
    name: 'Tønsberg Frukt AS',
    email: 'post@tonsbergfrukt.no',
    phone: '98765432',
    type: 'SESONG',
    startDate: '2026-06-01',
    endDate: '2026-08-31',
    message: 'Ønsker bodplass for salg av jordbær og epler på Torvet i sommer.',
    status: 'NEW',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'req-2',
    name: 'Vestfold Håndverk',
    email: 'info@vh.no',
    phone: '41234567',
    type: 'DAGPLASS',
    startDate: '2026-08-22',
    message: 'Kompakt stand under Bondens marked.',
    status: 'APPROVED',
    createdAt: new Date().toISOString(),
  },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = bookingSchema.parse(body);

    try {
      const booking = await prisma.bookingRequest.create({
        data: {
          name: validated.name,
          email: validated.email,
          phone: validated.phone,
          type: validated.type,
          startDate: validated.startDate ? new Date(validated.startDate) : null,
          endDate: validated.endDate ? new Date(validated.endDate) : null,
          message: validated.message,
          status: 'NEW',
        },
      });
      return NextResponse.json({ success: true, data: booking }, { status: 201 });
    } catch (dbError) {
      console.warn('Prisma DB unavailable, storing booking in memory fallback:', dbError);
      const newBooking = {
        id: `req-${Date.now()}`,
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        type: validated.type,
        startDate: validated.startDate,
        endDate: validated.endDate,
        message: validated.message,
        status: 'NEW',
        createdAt: new Date().toISOString(),
      };
      memoryBookings.unshift(newBooking);
      return NextResponse.json({ success: true, data: newBooking }, { status: 201 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.errors || 'Ugyldige data innsendt' },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    const bookings = await prisma.bookingRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: bookings });
  } catch (e) {
    return NextResponse.json({ success: true, data: memoryBookings });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    if (!id || !['APPROVED', 'REJECTED', 'PROCESSING'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Ugyldig status' }, { status: 400 });
    }

    try {
      const updated = await prisma.bookingRequest.update({
        where: { id },
        data: { status },
      });
      return NextResponse.json({ success: true, data: updated });
    } catch (e) {
      const booking = memoryBookings.find((b) => b.id === id);
      if (booking) booking.status = status;
      return NextResponse.json({ success: true, data: booking });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Feil ved oppdatering' }, { status: 500 });
  }
}
