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
 * Gjør en valideringsfeil om til en kort, lesbar norsk feilmelding (streng).
 * Alle API-ruter skal returnere `error` som streng – aldri rå Zod-issue-array,
 * som ville bryte enhver konsument som rendrer `json.error`.
 */
export function formatZodError(error: unknown): string {
  if (error && typeof error === 'object' && 'issues' in error) {
    const issues = (error as { issues?: Array<{ path?: Array<string | number>; message?: string }> }).issues;
    if (Array.isArray(issues)) {
      const messages = Array.from(
        new Set(
          issues.map((issue) => {
            const field = Array.isArray(issue.path) ? issue.path.filter(Boolean).join('.') : '';
            const text = issue.message || 'ugyldig verdi';
            return field ? `${field}: ${text}` : text;
          })
        )
      );
      if (messages.length > 0) return `Ugyldige data: ${messages.join('; ')}`;
    }
  }
  return 'Ugyldige data innsendt';
}

/**
 * Dato som må kunne tolkes. Uten dette slapp «IKKE-EN-DATO» gjennom Zod,
 * `new Date(...)` ble Invalid Date, og Prisma kastet — slik at en brukerfeil
 * endte som en 503 «teknisk feil» i stedet for en forklarende 400.
 */
const optionalDateString = z
  .string()
  .optional()
  .refine((value) => value === undefined || value === '' || !isNaN(new Date(value).getTime()), {
    message: 'Ugyldig dato. Bruk formatet ÅÅÅÅ-MM-DD.',
  });

/**
 * Torvleie / Booking validation schema
 */
export const bookingSchema = z.object({
  name: z.string().min(2, 'Navn må ha minst 2 tegn').transform(sanitizeInput),
  email: z.string().email('Ugyldig e-postadresse'),
  phone: z.string().min(8, 'Telefonnummer må ha minst 8 siffer').transform(sanitizeInput),
  type: z.enum(['DAGPLASS', 'SESONG', 'HELAAR'], {
    error: 'Velg en gyldig leieavtale (DAGPLASS, SESONG eller HELAAR)',
  }),
  startDate: optionalDateString,
  endDate: optionalDateString,
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
