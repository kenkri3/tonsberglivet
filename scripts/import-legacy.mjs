/**
 * Migrering av alt innhold fra kundens eksisterende nettsted (WordPress) inn i
 * den nye plattformens database.
 *
 * Kilden er den offentlige sitemapen og de offentlige sidene. Ingenting diktes
 * opp: all tekst, alle bilder og alle fakta kommer ordrett fra kildesiden.
 *
 *   node scripts/import-legacy.mjs survey     # kartlegg alle URL-er fra sitemap
 *   node scripts/import-legacy.mjs fetch      # last ned sidene til scratch/legacy-html
 *   node scripts/import-legacy.mjs parse      # tolk cachet HTML -> scratch/legacy-data.json
 *   node scripts/import-legacy.mjs images     # last ned ORIGINALbilder i full storrelse
 *   node scripts/import-legacy.mjs import     # skriv til databasen (idempotent)
 *   node scripts/import-legacy.mjs report     # oppsummer hva som ligger i datafilen
 *
 * Alt caches, så en ny kjøring ikke belaster kildesiden.
 */

import { mkdir, writeFile, readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CACHE_DIR = path.join(ROOT, 'scratch', 'legacy-html');
const IMAGE_DIR = path.join(ROOT, 'public', 'images', 'legacy');
const DATA_PATH = path.join(ROOT, 'scratch', 'legacy-data.json');
const SURVEY_PATH = path.join(ROOT, 'scratch', 'legacy-urls.json');

const SITE = 'https://tonsberglivet.no';
const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'nb-NO,nb;q=0.9,en;q=0.8',
};

/**
 * Hvilke sitemaper som blir hva i vår database.
 * `type` styrer hvilken parser og hvilken Prisma-modell innholdet ender i.
 */
const KILDER = [
  { sitemap: 'wp-sitemap-posts-page-1.xml', type: 'page' },
  { sitemap: 'wp-sitemap-posts-nyheter-1.xml', type: 'article' },
  { sitemap: 'wp-sitemap-posts-bedrifter-1.xml', type: 'business' },
  { sitemap: 'wp-sitemap-posts-eventer-1.xml', type: 'event' },
  { sitemap: 'wp-sitemap-posts-prosjekter-1.xml', type: 'project' },
  { sitemap: 'wp-sitemap-posts-bylivet-1.xml', type: 'page' },
  { sitemap: 'wp-sitemap-posts-hverdagslivet-1.xml', type: 'page' },
  { sitemap: 'wp-sitemap-posts-naeringslivet-1.xml', type: 'page' },
  { sitemap: 'wp-sitemap-posts-reiselivet-1.xml', type: 'page' },
  { sitemap: 'wp-sitemap-posts-studentlivet-1.xml', type: 'page' },
  { sitemap: 'wp-sitemap-posts-utviklingsomrader-1.xml', type: 'page' },
  { sitemap: 'wp-sitemap-posts-events-foynhagen-1.xml', type: 'event' },
  { sitemap: 'wp-sitemap-posts-events-foyn-1.xml', type: 'event' },
  { sitemap: 'wp-sitemap-posts-events-notteroy-1.xml', type: 'event' },
  { sitemap: 'wp-sitemap-posts-events-park-1.xml', type: 'event' },
  { sitemap: 'wp-sitemap-posts-events-bibliotek-1.xml', type: 'event' },
  { sitemap: 'wp-sitemap-posts-events-filmhus-1.xml', type: 'event' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const hent = async (url) => {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
};

/** Fjerner tagger og dekoder de vanligste entitetene. */
const renTekst = (html) =>
  String(html ?? '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&#8211;|&ndash;/g, '–')
    .replace(/&#8230;|&hellip;/g, '…')
    .replace(/&aelig;|&AElig;/g, 'æ')
    .replace(/&oslash;|&Oslash;/g, 'ø')
    .replace(/&aring;|&Aring;/g, 'å')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const slugFraUrl = (url) =>
  decodeURIComponent(url.replace(SITE, '').replace(/\/+$/, '').split('/').filter(Boolean).pop() ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** WordPress lagrer flere størrelser. Vi vil ha originalen, ikke -600x402. */
const originalbilde = (url) =>
  String(url ?? '')
    .split('?')[0]
    .replace(/-\d{2,4}x\d{2,4}(?=\.[a-zA-Z]+$)/, '');

const bildeFilnavn = (url) => {
  const base = originalbilde(url).split('/').pop() ?? '';
  return base.replace(/[^a-zA-Z0-9._-]/g, '_');
};

const stiTilCache = (url) => path.join(CACHE_DIR, `${slugFraUrl(url)}.html`);

// ─────────────────────────────────────────────────────────────────────────────
// survey
// ─────────────────────────────────────────────────────────────────────────────
async function survey() {
  await mkdir(path.dirname(SURVEY_PATH), { recursive: true });
  const resultat = [];

  for (const kilde of KILDER) {
    try {
      const xml = await hent(`${SITE}/${kilde.sitemap}`);
      const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
        .map((m) => m[1])
        .filter((u) => u !== `${SITE}/${kilde.sitemap}`);
      for (const u of urls) {
        resultat.push({ url: u, type: kilde.type, sitemap: kilde.sitemap, slug: slugFraUrl(u) });
      }
      console.log(`  ${kilde.sitemap.padEnd(46)} ${urls.length} URL-er -> ${kilde.type}`);
    } catch (err) {
      console.log(`  ${kilde.sitemap.padEnd(46)} FEIL: ${err.message}`);
    }
  }

  await writeFile(SURVEY_PATH, JSON.stringify(resultat, null, 2), 'utf8');
  const perType = resultat.reduce((a, r) => ({ ...a, [r.type]: (a[r.type] ?? 0) + 1 }), {});
  console.log(`\nTotalt ${resultat.length} URL-er:`);
  for (const [t, n] of Object.entries(perType)) console.log(`  ${t.padEnd(12)} ${n}`);
  console.log(`\nSkrevet til ${SURVEY_PATH}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// fetch
// ─────────────────────────────────────────────────────────────────────────────
async function fetchAll() {
  const alle = JSON.parse(await readFile(SURVEY_PATH, 'utf8'));
  await mkdir(CACHE_DIR, { recursive: true });

  let hentet = 0;
  let cachet = 0;
  let feilet = 0;

  for (const [i, post] of alle.entries()) {
    const fil = stiTilCache(post.url);
    if (existsSync(fil)) {
      cachet++;
      continue;
    }
    try {
      const html = await hent(post.url);
      await writeFile(fil, html, 'utf8');
      hentet++;
    } catch (err) {
      feilet++;
      if (feilet <= 10) console.log(`  FEIL ${post.url}: ${err.message}`);
    }
    if ((hentet + feilet) % 25 === 0 && hentet > 0) {
      console.log(`  ${i + 1}/${alle.length} – hentet ${hentet}, cachet ${cachet}, feilet ${feilet}`);
    }
    await sleep(150); // høflig pacing mot kildesiden
  }

  console.log(`\nFerdig: ${hentet} hentet, ${cachet} fra cache, ${feilet} feilet.`);
  console.log(`Cache: ${CACHE_DIR}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// parse
// ─────────────────────────────────────────────────────────────────────────────

/** Henter JSON-LD fra siden – strukturerte data WordPress selv publiserer. */
function jsonLd(html) {
  const blokker = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  for (const b of blokker) {
    try {
      const data = JSON.parse(b[1]);
      const liste = Array.isArray(data) ? data : data['@graph'] ? data['@graph'] : [data];
      const treff = liste.find((x) => x && typeof x === 'object' && x['@type']);
      if (treff) return treff;
    } catch {
      /* hopp over ugyldig JSON */
    }
  }
  return null;
}

/**
 * Cookie-banneret ligger HELT sist i HTML-en og inneholder selv et <h1>
 * («Vi bruker cookies!»). Uten dette klippet tolket parseren banneret som siden.
 */
const utenCookiebanner = (html) => html.replace(/<div id="privacy-window"[\s\S]*$/i, '');

/**
 * Plukker ut det bildet som faktisk hører til innholdet.
 *
 * Vi må ikke falle tilbake på og:image: på disse sidene peker den på temaets
 * delingsbilde (themes/foxglove/share.jpg) for alt som ikke har eget bilde.
 * Logoer og klistremerker holdes utenfor.
 */
function velgBilde(html) {
  const kandidater = [...html.matchAll(/<img\b[^>]*>/gi)]
    .map((m) => ({
      src: m[0].match(/\bsrc="([^"]+)"/i)?.[1] ?? '',
      cls: m[0].match(/\bclass="([^"]*)"/i)?.[1] ?? '',
      alt: m[0].match(/\balt="([^"]*)"/i)?.[1] ?? '',
    }))
    .filter((i) => i.src.includes('/wp-content/uploads/'))
    .filter((i) => !/logo|sticker|staende|TL_hvit|BL-|share\.jpg|swv|placeholder/i.test(i.src))
    .filter((i) => !/logo|sticker/i.test(i.cls));

  // Innholdsbildene er merket «frame» (event) eller «fit» (prosjekt/side).
  const merket = kandidater.find((i) => /\b(frame|fit)\b/.test(i.cls));
  return originalbilde((merket ?? kandidater[0])?.src ?? '');
}

/** Bedriftssider: h1 + fakta-blokker merket Adresse/Telefon/E-post/Nettside. */
function parseBedrift(html, post) {
  const navn = renTekst(html.match(/<h1[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '');
  if (!navn) return null;

  // Beskrivelsen ligger i første <p> etter h1, men «Gavekort»-merket kan stå
  // foran. Vi hopper over badge-teksten.
  const etterH1 = html.slice(html.search(/<h1[^>]*class="[^"]*title[^"]*"/i));
  const raa = renTekst(etterH1.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? '');
  const beskrivelse = raa.replace(/^(Gavekort|Nyhet|Tilbud)\s*\n+/, '').trim();

  const faktum = (etikett) => {
    const re = new RegExp(
      `<h3[^>]*>\\s*${etikett}\\s*</h3>\\s*(?:<p[^>]*>([\\s\\S]*?)</p>|<a[^>]*>([\\s\\S]*?)</a>)`,
      'i'
    );
    const m = html.match(re);
    return renTekst(m?.[1] ?? m?.[2] ?? '');
  };

  const tags = [...html.matchAll(/<li class="tag-item[^"]*">([\s\S]*?)<\/li>/gi)].map((m) =>
    renTekst(m[1])
  );

  const lenke = (protokoll) => {
    const re = new RegExp(`href="(${protokoll}[^"]+)"`, 'i');
    return html.match(re)?.[1] ?? '';
  };

  // Bedriftssidene på kildesiden viser ikke bedriftens eget bilde i det hele
  // tatt – bare logoen. Vi lar derfor bilde stå tomt i stedet for å fylle inn
  // temaets delingsbilde, som ville sett ut som et ekte bilde.
  return {
    type: 'business',
    slug: post.slug,
    kilde: post.url,
    navn,
    beskrivelse,
    adresse: faktum('Adresse'),
    telefon: faktum('Telefon'),
    epost: faktum('E-post'),
    nettside: faktum('Nettside') || lenke('https?://(?!tonsberglivet)'),
    kategori: tags[1] ?? tags[0] ?? '',
    merker: tags,
    bilde: '',
  };
}

/** Event- og prosjektsider har JSON-LD med strukturert innhold. */
function parseEvent(html, post) {
  const ld = jsonLd(html);
  const navn =
    renTekst(ld?.name ?? '') ||
    renTekst(html.match(/<h3[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/h3>/i)?.[1] ?? '');
  if (!navn) return null;

  // JSON-LD sin image kan peke på delingsbildet; bruk heller bildet i siden.
  const ldBlide = typeof ld?.image === 'string' ? ld.image : (ld?.image?.url ?? '');
  const img = velgBilde(html) || (/share\.jpg/.test(ldBlide) ? '' : originalbilde(ldBlide));

  const sted =
    typeof ld?.location === 'string' ? ld.location : (ld?.location?.name ?? '');
  const adresse =
    typeof ld?.location?.address === 'string'
      ? ld.location.address
      : ld?.location?.address?.streetAddress ?? '';

  return {
    type: 'event',
    slug: post.slug,
    kilde: post.url,
    tittel: navn,
    startDato: ld?.startDate ?? '',
    sluttDato: ld?.endDate ?? '',
    beskrivelse: renTekst(ld?.description ?? ''),
    sted: renTekst(sted),
    adresse: renTekst(adresse),
    billettlenke: ld?.url ?? post.url,
    arrangor: typeof ld?.organizer === 'string' ? ld.organizer : (ld?.organizer?.name ?? ''),
    bilde: img,
  };
}

function parseProsjekt(html, post) {
  const tittel = renTekst(
    html.match(/<h3[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/h3>/i)?.[1] ?? ''
  );
  if (!tittel) return null;

  const img = velgBilde(html);

  // Brødteksten ligger i wysiwyg-blokker.
  const avsnitt = [...html.matchAll(/<div[^>]*class="[^"]*wysiwyg[^"]*"[^>]*>([\s\S]*?)<\/div>/gi)]
    .map((m) => renTekst(m[1]))
    .filter((t) => t.length > 30);

  return {
    type: 'project',
    slug: post.slug,
    kilde: post.url,
    tittel,
    ingress: renTekst(html.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? ''),
    innhold: avsnitt.join('\n\n'),
    bilde: img,
  };
}

function parseSide(html, post) {
  const tittel =
    renTekst(html.match(/<h1[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '') ||
    renTekst(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '');
  if (!tittel) return null;

  const avsnitt = [...html.matchAll(/<div[^>]*class="[^"]*(?:wysiwyg|rich-text)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi)]
    .map((m) => renTekst(m[1]))
    .filter((t) => t.length > 30);

  const bilder = [...html.matchAll(/<img[^>]*src="([^"]*wp-content\/uploads[^"]*)"/gi)]
    .map((m) => originalbilde(m[1]))
    .filter((u) => !/logo|sticker|staende|TL_hvit|BL-hvit|share\.jpg/i.test(u));

  return {
    type: 'page',
    slug: post.slug,
    kilde: post.url,
    sti: post.url.replace(SITE, '') || '/',
    tittel,
    ingress: renTekst(html.match(/<h1[^>]*>[\s\S]*?<\/h1>\s*(?:<[^>]+>\s*)*<p[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? ''),
    innhold: avsnitt.join('\n\n'),
    bilde: velgBilde(html),
    bilder: [...new Set(bilder)],
  };
}

async function parseAll() {
  const alle = JSON.parse(await readFile(SURVEY_PATH, 'utf8'));
  const ut = [];
  const feilet = [];

  for (const post of alle) {
    const fil = stiTilCache(post.url);
    if (!existsSync(fil)) {
      feilet.push({ ...post, grunn: 'ikke cachet' });
      continue;
    }
    const html = utenCookiebanner(await readFile(fil, 'utf8'));
    let data = null;
    try {
      if (post.type === 'business') data = parseBedrift(html, post);
      else if (post.type === 'event') data = parseEvent(html, post);
      else if (post.type === 'project') data = parseProsjekt(html, post);
      else if (post.type === 'page') data = parseSide(html, post);
      else if (post.type === 'article') data = null; // dekkes av news-archive.json
    } catch (err) {
      feilet.push({ ...post, grunn: err.message });
      continue;
    }
    if (data) ut.push(data);
    else feilet.push({ ...post, grunn: 'fant ikke tittel' });
  }

  await writeFile(DATA_PATH, JSON.stringify(ut, null, 2), 'utf8');

  const perType = ut.reduce((a, r) => ({ ...a, [r.type]: (a[r.type] ?? 0) + 1 }), {});
  console.log(`Parset ${ut.length} elementer:`);
  for (const [t, n] of Object.entries(perType)) console.log(`  ${t.padEnd(12)} ${n}`);
  console.log(`Ikke tolket: ${feilet.length}`);
  const grupper = feilet.reduce((a, f) => ({ ...a, [f.grunn]: (a[f.grunn] ?? 0) + 1 }), {});
  for (const [g, n] of Object.entries(grupper)) console.log(`   ${g}: ${n}`);
  console.log(`\nSkrevet til ${DATA_PATH}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// report
// ─────────────────────────────────────────────────────────────────────────────
async function report() {
  const data = JSON.parse(await readFile(DATA_PATH, 'utf8'));
  console.log(`Elementer: ${data.length}\n`);

  const medBilde = data.filter((d) => d.bilde).length;
  console.log(`Med bilde: ${medBilde} (${Math.round((medBilde / data.length) * 100)} %)`);

  const eksempler = { business: 2, event: 2, project: 1, page: 2 };
  for (const [type, antall] of Object.entries(eksempler)) {
    const rader = data.filter((d) => d.type === type).slice(0, antall);
    for (const r of rader) {
      console.log(`\n--- ${r.type}: ${r.tittel ?? r.navn} (${r.slug})`);
      console.log(`    kilde:   ${r.kilde}`);
      console.log(`    bilde:   ${r.bilde || '(ingen)'}`);
      if (r.adresse) console.log(`    adresse: ${r.adresse}`);
      if (r.telefon) console.log(`    telefon: ${r.telefon}`);
      if (r.startDato) console.log(`    start:   ${r.startDato}`);
      if (r.innhold) console.log(`    innhold: ${r.innhold.slice(0, 120)}…`);
      if (r.beskrivelse) console.log(`    tekst:   ${r.beskrivelse.slice(0, 120)}…`);
    }
  }

  const utenBilde = data.filter((d) => !d.bilde).slice(0, 8);
  if (utenBilde.length) {
    console.log(`\nEksempler uten bilde (${data.filter((d) => !d.bilde).length} totalt):`);
    utenBilde.forEach((d) => console.log(`   ${d.type} ${d.slug}`));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// images
// ─────────────────────────────────────────────────────────────────────────────
async function images() {
  const data = JSON.parse(await readFile(DATA_PATH, 'utf8'));
  await mkdir(IMAGE_DIR, { recursive: true });

  const unike = [...new Set(data.map((d) => d.bilde).filter(Boolean))];
  console.log(`Unike bilder å hente: ${unike.length}`);

  let hentet = 0;
  let cachet = 0;
  let feilet = 0;
  let hoppetOver = 0;
  let totaltBytes = 0;
  let storste = { navn: '', bytes: 0 };
  const kart = {};

  // Tak: enkelte originalbilder er på flere megabyte. Nettstedet lastes fra
  // Railway, så vi vil ikke blåse opp repoet og deployen med dem. Bildene over
  // taket beholdes som ekstern URL og kan lastes opp til bildebanken senere.
  const MAKS_BYTES = Number(process.env.LEGACY_IMAGE_MAX_BYTES ?? 1_500_000);

  for (const url of unike) {
    const fil = bildeFilnavn(url);
    const dest = path.join(IMAGE_DIR, fil);
    if (existsSync(dest)) {
      cachet++;
      kart[url] = `/images/legacy/${fil}`;
      continue;
    }
    try {
      const res = await fetch(url, { headers: HEADERS });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > MAKS_BYTES) {
        hoppetOver++;
        kart[url] = url; // behold kildens URL i stedet for å miste bildet
        continue;
      }
      await writeFile(dest, buf);
      kart[url] = `/images/legacy/${fil}`;
      hentet++;
      totaltBytes += buf.length;
      if (buf.length > storste.bytes) storste = { navn: fil, bytes: buf.length };
    } catch (err) {
      feilet++;
      if (feilet <= 8) console.log(`  FEIL ${url}: ${err.message}`);
    }
    await sleep(80);
    if ((hentet + feilet + hoppetOver) % 50 === 0 && hentet + hoppetOver > 0) {
      console.log(
        `  ${hentet + cachet + feilet + hoppetOver}/${unike.length} – hentet ${hentet}, ` +
          `cachet ${cachet}, for store ${hoppetOver}, feilet ${feilet}`
      );
    }
  }

  await writeFile(path.join(ROOT, 'scratch', 'legacy-images.json'), JSON.stringify(kart, null, 2), 'utf8');
  console.log(`\nFerdig: ${hentet} hentet, ${cachet} fra cache, ${hoppetOver} for store, ${feilet} feilet.`);
  console.log(`Nedlastet totalt: ${(totaltBytes / 1_048_576).toFixed(1)} MB`);
  if (storste.navn) console.log(`Største: ${storste.navn} (${(storste.bytes / 1_048_576).toFixed(1)} MB)`);
  console.log(`Bilder: ${IMAGE_DIR}`);
  console.log(`Kart:   scratch/legacy-images.json`);
}

// ─────────────────────────────────────────────────────────────────────────────
// news-images — oppgraderer nyhetsbildene fra WordPress-thumbnail til original
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Nyhetsarkivet ble bygget med WordPress sine nedskalerte varianter (600x400).
 * Det er dem man ser som kornete kort på nettstedet. Originalen ligger på samme
 * URL uten «-600x400»-suffikset, og er ofte mange ganger større.
 *
 * Vi finner originalens URL i de allerede cachede artikelsidene
 * (scratch/wp-html) og skriver den ned i public/images/nyheter med SAMME
 * filnavn, slik at alt som peker på bildet fortsetter å virke.
 */
async function newsImages() {
  const arkiv = JSON.parse(await readFile(path.join(ROOT, 'src', 'data', 'news-archive.json'), 'utf8'));
  const NYHET_DIR = path.join(ROOT, 'public', 'images', 'nyheter');
  const WP_CACHE = path.join(ROOT, 'scratch', 'wp-html');
  await mkdir(NYHET_DIR, { recursive: true });

  let oppgradert = 0;
  let uendret = 0;
  let hoppetOver = 0;
  let feilet = 0;
  let forBytes = 0;
  let etterBytes = 0;

  for (const artikkel of arkiv) {
    const src = artikkel.featuredImage?.src ?? '';
    if (!src) continue;
    const dest = path.join(ROOT, 'public', src.replace(/^\//, ''));

    const cacheFil = path.join(WP_CACHE, `${artikkel.slug}.html`);
    if (!existsSync(cacheFil)) {
      hoppetOver++;
      continue;
    }

    const html = utenCookiebanner(await readFile(cacheFil, 'utf8'));
    const originalUrl = velgBilde(html);
    if (!originalUrl) {
      hoppetOver++;
      continue;
    }

    const gammel = existsSync(dest) ? (await readFile(dest)).length : 0;

    try {
      const res = await fetch(originalUrl, { headers: HEADERS });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());

      // Bare overskriv hvis originalen faktisk er større, så vi aldri bytter
      // ned kvaliteten ved en feil.
      if (buf.length <= gammel) {
        uendret++;
        continue;
      }
      await writeFile(dest, buf);
      oppgradert++;
      forBytes += gammel;
      etterBytes += buf.length;
      console.log(
        `  ${artikkel.slug.slice(0, 42).padEnd(44)} ` +
          `${(gammel / 1024).toFixed(0).padStart(5)} KB -> ${(buf.length / 1024).toFixed(0).padStart(6)} KB`
      );
    } catch (err) {
      feilet++;
      if (feilet <= 5) console.log(`  FEIL ${artikkel.slug}: ${err.message}`);
    }
    await sleep(60);
  }

  console.log(`\nOppgradert: ${oppgradert} bilder`);
  console.log(`Uendret (originalen var ikke større): ${uendret}`);
  console.log(`Hoppet over (ingen cache/original):  ${hoppetOver}`);
  console.log(`Feilet: ${feilet}`);
  if (oppgradert) {
    console.log(
      `\nBildedata: ${(forBytes / 1_048_576).toFixed(1)} MB -> ${(etterBytes / 1_048_576).toFixed(1)} MB ` +
        `(${(etterBytes / Math.max(forBytes, 1)).toFixed(1)}x)`
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// import — skriver til databasen
// ─────────────────────────────────────────────────────────────────────────────

const ARTIKKEL_KATEGORIER = ['BYLIVET', 'HVERDAGSLIVET', 'NAERINGSLIVET', 'REISELIVET', 'STUDENTLIVET'];
const EVENT_KATEGORIER = ['ARRANGEMENT', 'KONSERT', 'MARKED', 'KURS', 'BARN', 'SPORT', 'KULTUR', 'FESTIVAL'];
const BEDRIFT_KATEGORIER = [
  'SHOPPING', 'MAT_DRIKKE', 'AKTIVITET', 'OVERNATTING',
  'FRISOR_VELVERE', 'KULTUR', 'BARN', 'ANNET',
];

/** Norske etiketter fra kildesiden -> Prisma-enum. Ukjent verdi blir fallback. */
const ETIKETT_TIL_ENUM = {
  'mat & drikke': 'MAT_DRIKKE',
  'mat og drikke': 'MAT_DRIKKE',
  shopping: 'SHOPPING',
  aktivitet: 'AKTIVITET',
  opplevelse: 'AKTIVITET',
  overnatting: 'OVERNATTING',
  'frisør & velvære': 'FRISOR_VELVERE',
  'frisor & velvare': 'FRISOR_VELVERE',
  kultur: 'KULTUR',
  barn: 'BARN',
  arrangement: 'ARRANGEMENT',
  konsert: 'KONSERT',
  marked: 'MARKED',
  kurs: 'KURS',
  sport: 'SPORT',
  festival: 'FESTIVAL',
};

const tilEnum = (verdi, gyldige, fallback) => {
  const v = String(verdi ?? '').trim();
  if (!v) return fallback;
  const direkte = gyldige.find((g) => g === v.toUpperCase());
  if (direkte) return direkte;
  return ETIKETT_TIL_ENUM[v.toLowerCase()] ?? fallback;
};

const lagSlug = (verdi) =>
  String(verdi ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Gjør blokk-innhold fra nyhetsarkivet om til én sammenhengende tekst. */
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

async function importer() {
  const [{ PrismaClient }, { PrismaPg }, { default: pg }, dotenv] = await Promise.all([
    import('@prisma/client'),
    import('@prisma/adapter-pg'),
    import('pg'),
    import('dotenv'),
  ]);
  dotenv.config();

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL mangler.');
    process.exit(1);
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg(new pg.Pool({ connectionString })),
  });

  const data = JSON.parse(await readFile(DATA_PATH, 'utf8'));
  const arkiv = JSON.parse(await readFile(path.join(ROOT, 'src', 'data', 'news-archive.json'), 'utf8'));
  const bildekart = existsSync(path.join(ROOT, 'scratch', 'legacy-images.json'))
    ? JSON.parse(await readFile(path.join(ROOT, 'scratch', 'legacy-images.json'), 'utf8'))
    : {};

  const teller = { article: 0, event: 0, business: 0, project: 0, page: 0, image: 0 };
  const feil = [];

  /**
   * Oppretter/oppdaterer en Image-rad og returnerer id-en.
   *
   * Bildet kan komme i tre former fra kildene: en ren URL-streng (skrapede
   * sider), et objekt `{ src, alt, width, height }` (nyhetsarkivet) eller tomt.
   */
  const sikreBilde = async (bilde, altFallback) => {
    let url = '';
    let alt = altFallback ?? null;

    if (typeof bilde === 'string') {
      url = bilde;
    } else if (bilde && typeof bilde === 'object') {
      url = bilde.src ?? '';
      alt = bilde.alt ?? altFallback ?? null;
    }

    // Allerede lokalt lagrede bilder (nyhetsarkivet) skal ikke gjennom kartet.
    if (!url) return null;
    const lokal = url.startsWith('/images/') ? url : (bildekart[url] ?? url);
    const id = `legacy-${lagSlug(url.startsWith('/images/') ? url : bildeFilnavn(url))}`.slice(0, 60);
    if (!id) return null;
    try {
      await prisma.image.upsert({
        where: { id },
        update: { alt: alt ?? undefined, url: lokal },
        create: {
          id,
          url: lokal,
          filename: bildeFilnavn(url),
          alt: alt ?? null,
          gdprStatus: 'APPROVED',
          gdprNotes: 'Migrert fra kundens eksisterende nettsted (publisert der).',
          tags: [],
          aiTags: [],
        },
      });
      teller.image++;
      return id;
    } catch (err) {
      feil.push(`bilde ${url}: ${err.message.slice(0, 120)}`);
      return null;
    }
  };

  // ── Artikler (fra det allerede importerte nyhetsarkivet) ──────────────────
  for (const a of arkiv) {
    try {
      const bildeId = await sikreBilde(a.featuredImage, a.title);
      const publishedAt = a.publishedAt ? new Date(a.publishedAt) : new Date();
      await prisma.article.upsert({
        where: { slug: a.slug },
        update: {
          title: a.title,
          excerpt: a.excerpt ?? null,
          content: blokkerTilTekst(a.blocks),
          category: tilEnum(a.category, ARTIKKEL_KATEGORIER, 'BYLIVET'),
          published: true,
          publishedAt,
          ...(bildeId ? { imageId: bildeId } : {}),
        },
        create: {
          title: a.title,
          slug: a.slug,
          excerpt: a.excerpt ?? null,
          content: blokkerTilTekst(a.blocks),
          category: tilEnum(a.category, ARTIKKEL_KATEGORIER, 'BYLIVET'),
          published: true,
          publishedAt,
          ...(bildeId ? { imageId: bildeId } : {}),
        },
      });
      teller.article++;
    } catch (err) {
      feil.push(`artikkel ${a.slug}: ${err.message.slice(0, 120)}`);
    }
  }

  // ── Bedrifter ─────────────────────────────────────────────────────────────
  for (const b of data.filter((d) => d.type === 'business')) {
    try {
      const kategori = tilEnum(b.kategori, BEDRIFT_KATEGORIER, 'ANNET');
      const verdier = {
        name: b.navn,
        description: b.beskrivelse || null,
        address: b.adresse || null,
        phone: b.telefon || null,
        email: b.epost || null,
        website: b.nettside || null,
        category: kategori,
        published: true,
      };
      await prisma.business.upsert({
        where: { slug: b.slug },
        update: verdier,
        create: { ...verdier, slug: b.slug },
      });
      teller.business++;
    } catch (err) {
      feil.push(`bedrift ${b.slug}: ${err.message.slice(0, 120)}`);
    }
  }

  // ── Arrangementer ─────────────────────────────────────────────────────────
  for (const e of data.filter((d) => d.type === 'event')) {
    const start = e.startDato ? new Date(e.startDato) : null;
    if (!start || Number.isNaN(start.getTime())) continue;
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
      feil.push(`arrangement ${e.slug}: ${err.message.slice(0, 120)}`);
    }
  }

  // ── Prosjekter ────────────────────────────────────────────────────────────
  for (const p of data.filter((d) => d.type === 'project')) {
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
      feil.push(`prosjekt ${p.slug}: ${err.message.slice(0, 120)}`);
    }
  }

  // ── Sider ─────────────────────────────────────────────────────────────────
  for (const s of data.filter((d) => d.type === 'page')) {
    const slug = lagSlug(s.sti || s.slug);
    if (!slug) continue;
    try {
      const innhold = [s.ingress, s.innhold].filter(Boolean).join('\n\n') || s.tittel;
      await prisma.page.upsert({
        where: { slug },
        update: { title: s.tittel, content: innhold, published: true },
        create: { title: s.tittel, slug, content: innhold, published: true },
      });
      teller.page++;
    } catch (err) {
      feil.push(`side ${slug}: ${err.message.slice(0, 120)}`);
    }
  }

  console.log('\n=== Importert ===');
  for (const [k, v] of Object.entries(teller)) console.log(`  ${k.padEnd(10)} ${v}`);
  if (feil.length) {
    console.log(`\nFeil: ${feil.length}`);
    feil.slice(0, 15).forEach((f) => console.log('   ' + f));
  }

  const slutt = {
    article: await prisma.article.count(),
    event: await prisma.event.count(),
    business: await prisma.business.count(),
    project: await prisma.project.count(),
    page: await prisma.page.count(),
    image: await prisma.image.count(),
  };
  console.log('\n=== Antall i databasen nå ===');
  for (const [k, v] of Object.entries(slutt)) console.log(`  ${k.padEnd(10)} ${v}`);

  await prisma.$disconnect();
}

// ─────────────────────────────────────────────────────────────────────────────

const kommando = process.argv[2];
const kommandoer = {
  survey,
  fetch: fetchAll,
  parse: parseAll,
  report,
  images,
  'news-images': newsImages,
  import: importer,
};

if (!kommando || !kommandoer[kommando]) {
  console.log('Bruk: node scripts/import-legacy.mjs <survey|fetch|parse|images|import|report>');
  process.exit(1);
}

try {
  await kommandoer[kommando]();
} catch (err) {
  console.error(`Feilet i «${kommando}»:`, err.message);
  process.exit(1);
}
