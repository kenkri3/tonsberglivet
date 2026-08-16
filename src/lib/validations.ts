import { z } from 'zod';

/**
 * XSS & HTML injection sanitizer helper.
 * Strips HTML tags and suspicious script content.
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/**
 * Torvleie / Booking validation schema
 */
export const bookingSchema = z.object({
  name: z.string().min(2, 'Navn må ha minst 2 tegn').transform(sanitizeInput),
  email: z.string().email('Ugyldig e-postadresse'),
  phone: z.string().min(8, 'Telefonnummer må ha minst 8 siffer').transform(sanitizeInput),
  type: z.enum(['DAGPLASS', 'SESONG', 'HELAAR']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  message: z.string().max(2000, 'Meldingen kan ikke overstige 2000 tegn').transform(sanitizeInput).optional(),
});

/**
 * Contact Form validation schema
 */
export const contactSchema = z.object({
  name: z.string().min(2, 'Navn må ha minst 2 tegn').transform(sanitizeInput),
  email: z.string().email('Ugyldig e-postadresse'),
  subject: z.string().min(3, 'Emne må ha minst 3 tegn').transform(sanitizeInput).optional(),
  message: z.string().min(10, 'Meldingen må være på minst 10 tegn').max(3000).transform(sanitizeInput),
});

/**
 * Partner Application validation schema
 */
export const partnerAppSchema = z.object({
  contactName: z.string().min(2, 'Navn må ha minst 2 tegn').transform(sanitizeInput),
  businessName: z.string().min(2, 'Bedriftsnavn må ha minst 2 tegn').transform(sanitizeInput),
  email: z.string().email('Ugyldig e-postadresse'),
  phone: z.string().min(8, 'Telefonnummer må ha minst 8 siffer').transform(sanitizeInput).optional(),
  message: z.string().max(2000).transform(sanitizeInput).optional(),
});

/**
 * Newsletter validation schema
 */
export const newsletterSchema = z.object({
  email: z.string().email('Ugyldig e-postadresse'),
});
