'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { bookingSchema, contactSchema } from '@/lib/validations';

/**
 * Server Action for Torvleie Booking submission.
 * Directly saves to Railway PostgreSQL via Prisma.
 */
export async function submitTorvleieAction(formData: FormData) {
  try {
    const rawData = {
      name: `${formData.get('firstName') || ''} ${formData.get('lastName') || ''}`.trim(),
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      type: formData.get('type') as string,
      startDate: formData.get('startDate') as string,
      message: formData.get('message') as string,
    };

    const validated = bookingSchema.parse(rawData);

    await prisma.bookingRequest.create({
      data: {
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        type: validated.type,
        startDate: validated.startDate ? new Date(validated.startDate) : null,
        message: validated.message,
        status: 'NEW',
      },
    });

    revalidatePath('/admin/torvleie');
    return { success: true, message: 'Forespørsel om torvleie er mottatt!' };
  } catch (error: any) {
    return { success: false, error: error?.errors || 'Feil ved innsending' };
  }
}

/**
 * Server Action for Contact Form submission.
 * Directly saves to Railway PostgreSQL via Prisma.
 */
export async function submitContactAction(formData: FormData) {
  try {
    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };

    const validated = contactSchema.parse(rawData);

    await prisma.contactMessage.create({
      data: {
        name: validated.name,
        email: validated.email,
        subject: validated.subject,
        message: validated.message,
      },
    });

    revalidatePath('/admin/meldinger');
    return { success: true, message: 'Meldingen din er mottatt!' };
  } catch (error: any) {
    return { success: false, error: error?.errors || 'Feil ved innsending' };
  }
}
