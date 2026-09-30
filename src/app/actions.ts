'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { bookingSchema, contactSchema } from '@/lib/validations';
import { sendAgentNotification } from '@/lib/notifications';

/**
 * Server Action for Torvleie Booking submission.
 * Directly saves to Railway PostgreSQL via Prisma and notifies agent.
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

    const booking = await prisma.bookingRequest.create({
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

    // Varsle autonom agent i Slack/Teams/Discord
    await sendAgentNotification({
      type: 'NEW_BOOKING',
      title: 'Ny forespørsel om torvleie',
      description: `${validated.name} søker om stand/torvplass på Torvet.`,
      fields: [
        { label: 'Søker', value: validated.name },
        { label: 'E-post', value: validated.email },
        { label: 'Type leie', value: validated.type },
        { label: 'Dato', value: validated.startDate || 'Fleksibel' },
        { label: 'Melding', value: validated.message || 'Ingen' },
      ],
      actionId: booking.id,
    });

    revalidatePath('/admin/torvleie');
    revalidatePath('/admin/booking');
    return { success: true, message: 'Forespørsel om torvleie er mottatt!' };
  } catch (error: any) {
    return { success: false, error: error?.errors || 'Feil ved innsending' };
  }
}

/**
 * Server Action for Contact Form submission.
 * Directly saves to Railway PostgreSQL via Prisma and notifies agent.
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

    // Varsle autonom agent i Slack/Teams/Discord
    await sendAgentNotification({
      type: 'NEW_MESSAGE',
      title: 'Ny publikumshenvendelse',
      description: `${validated.name}: "${validated.subject || 'Generelt spørsmål'}"`,
      fields: [
        { label: 'Fra', value: `${validated.name} (${validated.email})` },
        { label: 'Emne', value: validated.subject || 'Ingen emne' },
        { label: 'Innhold', value: validated.message.slice(0, 200) },
      ],
    });

    revalidatePath('/admin/meldinger');
    return { success: true, message: 'Meldingen din er mottatt!' };
  } catch (error: any) {
    return { success: false, error: error?.errors || 'Feil ved innsending' };
  }
}
