/**
 * Skriver det migrerte innholdet fra kundens eksisterende nettsted inn i databasen.
 *
 * Innholdet ligger ferdig tolket i `prisma/legacy-content.json` (sider,
 * bedrifter, arrangementer, prosjekter) og `src/data/news-archive.json`
 * (artikler). Begge er versjonert, så dette steget trenger verken nettverk
 * eller skraping – det kan derfor kjøre som en del av deployen.
 *
 * Skrapingen gjøres én gang lokalt:
 *   node scripts/import-legacy.mjs survey
 *   node scripts/import-legacy.mjs fetch
 *   node scripts/import-legacy.mjs parse      # skriver prisma/legacy-content.json
 *
 * Deretter kan dette skriptet kjøres hvor som helst med DATABASE_URL satt:
 *   node scripts/seed-legacy-content.mjs            # hopper over hvis gjort
 *   node scripts/seed-legacy-content.mjs --force    # kjører uansett
 *   node scripts/seed-legacy-content.mjs --dry-run  # viser hva som ville skjedd
 *
 * Skriptet er idempotent: alt skrives med upsert på slug, så det kan kjøres
 * om igjen uten å lage duplikater eller overskrive redaksjonelle endringer
 * uten videre.
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const INNHOLD = path.join(ROOT, 'prisma', 'legacy-content.json');
const ARKIV = path.join(ROOT, 'src', 'data', 'news-archive.json');
const LEGACY_BILDER = path.join(ROOT, 'public', 'images', 'legacy');

const force = process.argv.includes('--force');
const dryRun = process.argv.includes('--dry-run');

// ── Enums (må matche prisma/schema.prisma) ───────────────────────────────────
const ARTIKKEL_KATEGORIER = ['BYLIVET', 'HVERDAGSLIVET', 'NAERINGSLIVET', 'REISELIVET', 'STUDENTLIVET'];
const EVENT_KATEGORIER = ['ARRANGEMENT', 'KONSERT', 'MARKED', 'KURS', 'BARN', 'SPORT', 'KULTUR', 'FESTIVAL'];
const BEDRIFT_KATEGORIER = [
  'SHOPPING', 'MAT_DRIKKE', 'AKTIVITET', 'OVERNATTING',
  'FRISOR_VELVERE', 'KULTUR', 'BARN', 'ANNET',
];

const ETIKETT_TIL_ENUM = {
  matdrikke: 'MAT_DRIKKE',
  matogdrikke: 'MAT_DRIKKE',
  shopping: 'SHOPPING',
  aktivitet: 'AKTIVITET',
  opplevelse: 'AKTIVITET',
  overnatting: 'OVERNATTING',
  frisorvelvare: 'FRISOR_VELVERE',
  kultur: 'KULTUR',
  barn: 'BARN',
  arrangement: 'ARRANGEMENT',
  konsert: 'KONSERT',
  marked: 'MARKED',
  kurs: 'KURS',
  sport: 'SPORT',
  festival: 'FESTIVAL',
};

const bokstaver = (verdi) =>
  String(verdi ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a');

const tilEnum = (verdi, gyldige, fallback) => {
  const v = String(verdi ?? '').trim();
  if (!v) return fallback;
  const direkte = gyldige.find((g) => g === v.toUpperCase());
  if (direkte) return direkte;
  return ETIKETT_TIL_ENUM[bokstaver(v).replace(/[^a-z0-9]/g, '')] ?? fallback;
};

const lagSlug = (verdi) =>
  bokstaver(verdi)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const bildeFilnavn = (url) =>
  String(url ?? '')
    .split('?')[0]
    .split('/')
    .pop()
    .replace(/[^a-zA-Z0-9._-]/g, '_');

const blokkerTilTekst = (blokker) => {
  if (!Array.isArray(blokker)) return String(blokker ?? '');
  return blokker
    .map((b) => {
      if (typeof b === 'string') return b;
      if (b?.type === 'heading') return `## ${b.text ?? ''}`;
      if (b?.type === 'quote') return `> ${b.text ?? ''}`;
      if (b?.type === 'list' && Array.isArray(b.items)) return b.items.map((i) => `- ${i}`).join('\n');
      return b?.text ?? '';
    })
    .filter(Boolean)
    .join('\n\n');
};

/**
 * Bilder: bruk den lokale filen hvis den finnes i public/, ellers kildens URL.
 *
 * De 78 MB legacy-bildene er bevisst ikke lagt i git ennå (de bør til
 * bildebanken/Cloudinary). Denne sjekken gjør at migreringen virker begge
 * steder: lokalt vises de komprimerte bildene, i produksjon peker vi på
 * kilden inntil bildene er lastet opp.
 */
const bildeUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('/images/')) return url;
  const fil = bildeFilnavn(url);
  return existsSync(path.join(LEGACY_BILDER, fil)) ? `/images/legacy/${fil}` : url;
};

async function main() {
  const [{ PrismaClient }, { PrismaPg }, { default: pg }, dotenv] = await Promise.all([
    import('@prisma/client'),
    import('@prisma/adapter-pg'),
    import('pg'),
    import('dotenv'),
  ]);
  // quiet: dotenv 17 skriver ellers et reklametips til deploy-loggen.
  dotenv.config({ quiet: true });

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('[seed-legacy] DATABASE_URL mangler.');
    process.exit(1);
  }
  if (!existsSync(INNHOLD)) {
    console.error(`[seed-legacy] Finner ikke ${INNHOLD}. Kjør \`npm run legacy:parse\` først.`);
    process.exit(1);
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg(new pg.Pool({ connectionString })) });

  const data = JSON.parse(readFileSync(INNHOLD, 'utf8'));
  const arkiv = existsSync(ARKIV) ? JSON.parse(readFileSync(ARKIV, 'utf8')) : [];

  // ── Rette bildelenker som peker på en fil som ikke finnes ────────────────
  // To problemer, begge fra tidligere importer:
  //
  //   1. Lenken peker på kildens URL fordi bildene ikke lå i repoet ennå.
  //   2. Lenken har feil filendelse – .webp der filen er .jpg. Dette er den
  //      verre av de to: raden ser komplett ut i databasen, men next/image
  //      svarer 400 og kortet viser et brutt bildeikon i nettleseren.
  //
  // Vi løser begge ved å se etter filen på disk med alle kjente endelser.
  // Steget er billig når det ikke er noe å gjøre (én spørring), og kjøres før
  // hopp-over-sjekken under, ellers ville lenkene aldri blitt oppdatert.
  const BILDEMAPPER = ['legacy', 'nyheter', 'tonsberg'];
  const ENDELSER = ['.webp', '.jpg', '.jpeg', '.png', '.avif'];

  /** Finner stien til filen på disk, uansett hvilken endelse lenken oppgir. */
  const finnPaaDisk = (url) => {
    const sti = String(url ?? '');
    if (sti.startsWith('/images/') && existsSync(path.join(ROOT, 'public', sti))) return sti;

    const fil = bildeFilnavn(sti);
    const stamme = fil.replace(/\.[^.]+$/, '');
    for (const mappe of BILDEMAPPER) {
      for (const endelse of ENDELSER) {
        const kandidat = `/images/${mappe}/${stamme}${endelse}`;
        if (existsSync(path.join(ROOT, 'public', kandidat))) return kandidat;
      }
    }
    return null;
  };

  if (existsSync(path.join(ROOT, 'public', 'images', 'legacy'))) {
    try {
      const alle = await prisma.image.findMany({ select: { id: true, url: true } });
      let rettet = 0;
      for (const bilde of alle) {
        const riktig = finnPaaDisk(bilde.url);
        if (riktig && riktig !== bilde.url) {
          await prisma.image.update({ where: { id: bilde.id }, data: { url: riktig } });
          rettet++;
        }
      }
      if (rettet > 0) {
        console.log(`[seed-legacy] Rettet ${rettet} bildelenker til filer som faktisk finnes.`);
      }
    } catch (err) {
      console.warn('[seed-legacy] Kunne ikke oppdatere bildelenker:', err.message);
    }
  }

  // ── Hopp over hvis innholdet allerede er på plass ─────────────────────────
  const [antallArtikler, antallEvents, antallSider, antallProsjekter] = await Promise.all([
    prisma.article.count(),
    prisma.event.count(),
    prisma.page.count(),
    prisma.project.count(),
  ]);

  if (
    !force &&
    antallArtikler >= arkiv.length * 0.9 &&
    antallEvents >= 1000 &&
    antallSider >= 50 &&
    antallProsjekter >= 20
  ) {
    console.log(
      `[seed-legacy] Innholdet er allerede importert (${antallArtikler} artikler, ${antallEvents} arrangementer, ${antallSider} sider, ${antallProsjekter} prosjekter). Bruk --force for å kjøre på nytt.`
    );
    await prisma.$disconnect();
    return;
  }

  console.log(
    `[seed-legacy] Importerer: ${arkiv.length} artikler, ` +
      `${data.filter((d) => d.type === 'event').length} arrangementer, ` +
      `${data.filter((d) => d.type === 'business').length} bedrifter, ` +
      `${data.filter((d) => d.type === 'page').length} sider, ` +
      `${data.filter((d) => d.type === 'project').length} prosjekter.`
  );

  if (dryRun) {
    console.log('[seed-legacy] Tørrkjøring – ingenting skrevet.');
    await prisma.$disconnect();
    return;
  }

  const teller = { article: 0, event: 0, business: 0, project: 0, page: 0, image: 0 };
  const feil = [];

  const kjørIChunks = async (items, batchSize, fn) => {
    for (let i = 0; i < items.length; i += batchSize) {
      await Promise.all(items.slice(i, i + batchSize).map(fn));
    }
  };

  /** Oppretter/oppdaterer en Image-rad og returnerer id-en. */
  const sikreBilde = async (bilde, altFallback) => {
    let url = '';
    let alt = altFallback ?? null;

    if (typeof bilde === 'string') url = bilde;
    else if (bilde && typeof bilde === 'object') {
      url = bilde.src ?? '';
      alt = bilde.alt ?? altFallback ?? null;
    }
    if (!url) return null;

    const lokal = bildeUrl(url);
    const id = `legacy-${lagSlug(bildeFilnavn(url))}`.slice(0, 60);
    if (!id) return null;

    try {
      await prisma.image.upsert({
        where: { id },
        update: { alt, url: lokal },
        create: {
          id,
          url: lokal,
          filename: bildeFilnavn(url),
          alt,
          gdprStatus: 'APPROVED',
          gdprNotes: 'Migrert fra kundens eksisterende nettsted (publisert der).',
          tags: [],
          aiTags: [],
        },
      });
      teller.image++;
      return id;
    } catch (err) {
      feil.push(`bilde ${url}: ${String(err.message).slice(0, 100)}`);
      return null;
    }
  };

  // ── Artikler ──────────────────────────────────────────────────────────────
  await kjørIChunks(arkiv, 15, async (a) => {
    try {
      const bildeId = await sikreBilde(a.featuredImage, a.title);
      const publishedAt = a.publishedAt ? new Date(a.publishedAt) : new Date();
      const verdier = {
        title: a.title,
        excerpt: a.excerpt ?? null,
        content: blokkerTilTekst(a.blocks),
        category: tilEnum(a.category, ARTIKKEL_KATEGORIER, 'BYLIVET'),
        published: true,
        publishedAt,
        ...(bildeId ? { imageId: bildeId } : {}),
      };
      await prisma.article.upsert({
        where: { slug: a.slug },
        update: verdier,
        create: { ...verdier, slug: a.slug },
      });
      teller.article++;
    } catch (err) {
      feil.push(`artikkel ${a.slug}: ${String(err.message).slice(0, 100)}`);
    }
  });

  // ── Bedrifter ─────────────────────────────────────────────────────────────
  await kjørIChunks(data.filter((d) => d.type === 'business'), 15, async (b) => {
    try {
      const verdier = {
        name: b.navn,
        description: b.beskrivelse || null,
        address: b.adresse || null,
        phone: b.telefon || null,
        email: b.epost || null,
        website: b.nettside || null,
        category: tilEnum(b.kategori, BEDRIFT_KATEGORIER, 'ANNET'),
        published: true,
      };
      await prisma.business.upsert({
        where: { slug: b.slug },
        update: verdier,
        create: { ...verdier, slug: b.slug },
      });
      teller.business++;
    } catch (err) {
      feil.push(`bedrift ${b.slug}: ${String(err.message).slice(0, 100)}`);
    }
  });

  // ── Arrangementer ─────────────────────────────────────────────────────────
  await kjørIChunks(data.filter((d) => d.type === 'event'), 15, async (e) => {
    const start = e.startDato ? new Date(e.startDato) : null;
    if (!start || Number.isNaN(start.getTime())) return;
    try {
      const bildeId = await sikreBilde(e.bilde, e.tittel);
      const slutt = e.sluttDato ? new Date(e.sluttDato) : null;
      const verdier = {
        title: e.tittel,
        description: e.beskrivelse || null,
        location: e.sted || null,
        address: e.adresse || null,
        startDate: start,
        endDate: slutt && !Number.isNaN(slutt.getTime()) ? slutt : null,
        externalUrl: e.billettlenke || null,
        category: tilEnum(e.kategori, EVENT_KATEGORIER, 'ARRANGEMENT'),
        published: true,
        ...(bildeId ? { imageId: bildeId } : {}),
      };
      await prisma.event.upsert({
        where: { slug: e.slug },
        update: verdier,
        create: { ...verdier, slug: e.slug },
      });
      teller.event++;
    } catch (err) {
      feil.push(`arrangement ${e.slug}: ${String(err.message).slice(0, 100)}`);
    }
  });

  // ── Prosjekter ────────────────────────────────────────────────────────────
  await kjørIChunks(data.filter((d) => d.type === 'project'), 15, async (p) => {
    try {
      const bildeId = await sikreBilde(p.bilde, p.tittel);
      const verdier = {
        title: p.tittel,
        description: p.ingress || null,
        content: p.innhold || null,
        status: 'ACTIVE',
        published: true,
        ...(bildeId ? { imageId: bildeId } : {}),
      };
      await prisma.project.upsert({
        where: { slug: p.slug },
        update: verdier,
        create: { ...verdier, slug: p.slug },
      });
      teller.project++;
    } catch (err) {
      feil.push(`prosjekt ${p.slug}: ${String(err.message).slice(0, 100)}`);
    }
  });

  // ── Sider ─────────────────────────────────────────────────────────────────
  await kjørIChunks(data.filter((d) => d.type === 'page'), 15, async (s) => {
    const slug = lagSlug(s.sti || s.slug);
    if (!slug) return;
    try {
      const innhold = [s.ingress, s.innhold].filter(Boolean).join('\n\n') || s.tittel;
      await prisma.page.upsert({
        where: { slug },
        update: { title: s.tittel, content: innhold, published: true },
        create: { title: s.tittel, slug, content: innhold, published: true },
      });
      teller.page++;
    } catch (err) {
      feil.push(`side ${slug}: ${String(err.message).slice(0, 100)}`);
    }
  });

  console.log('\n[seed-legacy] Skrevet:');
  for (const [k, v] of Object.entries(teller)) console.log(`  ${k.padEnd(10)} ${v}`);
  if (feil.length) {
    console.log(`\n[seed-legacy] Feil: ${feil.length}`);
    feil.slice(0, 10).forEach((f) => console.log('   ' + f));
  }

  const slutt = {
    article: await prisma.article.count(),
    event: await prisma.event.count(),
    business: await prisma.business.count(),
    project: await prisma.project.count(),
    page: await prisma.page.count(),
    image: await prisma.image.count(),
  };
  console.log('\n[seed-legacy] Antall i databasen nå:');
  for (const [k, v] of Object.entries(slutt)) console.log(`  ${k.padEnd(10)} ${v}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('[seed-legacy] FEILET:', err.message);
  process.exit(1);
});
