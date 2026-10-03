/**
 * Engangsimport av de ekte nyhetssakene fra den gamle WordPress-siden
 * (tonsberglivet.no/nyheter/) inn i den nye portalen.
 *
 * Kjøres i tre trinn, med cache slik at en ny kjøring ikke belaster kildesiden:
 *
 *   node scripts/import-wp-news.mjs fetch    # henter alle saksidene til scratch/wp-html
 *   node scripts/import-wp-news.mjs build    # parser, laster ned bilder, skriver src/data/news-archive.json
 *
 * Kilden er den offentlige sitemapen (wp-sitemap-posts-nyheter-1.xml) og de
 * offentlige sakssidene. Ingenting diktes opp: all tekst og alle bilder kommer
 * ordrett fra kildesiden.
 */

import { mkdir, readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CACHE_DIR = path.join(ROOT, 'scratch', 'wp-html');
const IMAGE_DIR = path.join(ROOT, 'public', 'images', 'nyheter');
const ARCHIVE_PATH = path.join(ROOT, 'src', 'data', 'news-archive.json');
const SITEMAP_URL = 'https://tonsberglivet.no/wp-sitemap-posts-nyheter-1.xml';

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'nb-NO,nb;q=0.9,en;q=0.8',
};

const CATEGORY_MAP = {
  bylivet: 'BYLIVET',
  hverdagslivet: 'HVERDAGSLIVET',
  næringslivet: 'NAERINGSLIVET',
  naeringslivet: 'NAERINGSLIVET',
  reiselivet: 'REISELIVET',
  studentlivet: 'STUDENTLIVET',
  // Saker merket med husets eget brand hører ikke til en av de fem seksjonene.
  tønsberglivet: 'TONSBERGLIVET',
  tonsberglivet: 'TONSBERGLIVET',
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchText(url, { binary = false, attempts = 4 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(url, { headers: BROWSER_HEADERS, redirect: 'follow' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return binary ? Buffer.from(await res.arrayBuffer()) : await res.text();
    } catch (error) {
      lastError = error;
      await sleep(600 * attempt * attempt);
    }
  }
  throw new Error(`${url}: ${lastError?.message}`);
}

/* ── Tekstvask ─────────────────────────────────────────────────────────── */

const NAMED_ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  laquo: '«',
  raquo: '»',
  copy: '©',
  reg: '®',
  aelig: 'æ',
  oslash: 'ø',
  aring: 'å',
  AElig: 'Æ',
  Oslash: 'Ø',
  Aring: 'Å',
  auml: 'ä',
  ouml: 'ö',
  uuml: 'ü',
  eacute: 'é',
  egrave: 'è',
  ocirc: 'ô',
};

function decodeEntities(text) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (match, name) => NAMED_ENTITIES[name] ?? NAMED_ENTITIES[name.toLowerCase()] ?? match);
}

function stripTags(html) {
  return decodeEntities(
    html
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<br\s*\/?>/gi, ' ')
      // Taggen erstattes med mellomrom, ikke med tom streng: kilden deler ofte en
      // setning i flere <span>-er, og uten dette smelter ordene sammen
      // («Publisert29. september 2025»).
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?»)]|…)/g, '$1')
    .replace(/([«(])\s+/g, '$1')
    .trim();
}

/* ── Parsing av én saksside ────────────────────────────────────────────── */

function parseJsonLd(html) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const block of blocks) {
    try {
      const parsed = JSON.parse(block[1]);
      const nodes = Array.isArray(parsed) ? parsed : [parsed];
      for (const node of nodes) {
        if (node && (node['@type'] === 'NewsArticle' || node['@type'] === 'Article')) return node;
      }
    } catch {
      // Ignorer ugyldig JSON-LD og prøv neste blokk.
    }
  }
  return null;
}

function slugFromUrl(url) {
  return new URL(url).pathname.replace(/\/+$/, '').split('/').pop();
}

function parseArticle(html, url) {
  const slug = slugFromUrl(url);
  const ld = parseJsonLd(html) ?? {};

  const headerIdx = html.indexOf('news-single-header');
  if (headerIdx === -1) throw new Error(`${slug}: fant ikke sakshodet (news-single-header)`);

  // Sakshodet slutter etter tag-listen. Enkelte sider mangler lukket </section>,
  // så den kan ikke brukes som markør.
  const tagsStart = html.indexOf('<ul class="tags', headerIdx);
  let headerEnd;
  if (tagsStart !== -1) {
    const tagsEnd = html.indexOf('</ul>', tagsStart);
    headerEnd = tagsEnd === -1 ? tagsStart : tagsEnd + '</ul>'.length;
  } else {
    headerEnd = html.indexOf('</section>', headerIdx);
    if (headerEnd === -1) headerEnd = html.indexOf('</main>', headerIdx);
    if (headerEnd === -1) throw new Error(`${slug}: fant ikke slutten på sakshodet`);
  }
  const headerHtml = html.slice(headerIdx, headerEnd);
  const bodyStart = headerEnd;

  const footerIdx = html.indexOf('global-footer', bodyStart);
  const rawBody = html.slice(bodyStart, footerIdx > 0 ? footerIdx : html.length);
  const bodyHtml = rawBody.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ');

  const title =
    decodeEntities(String(ld.headline ?? '')).trim() ||
    stripTags((headerHtml.match(/<h3[^>]*class="title xlarge"[^>]*>([\s\S]*?)<\/h3>/i) ?? [])[1] ?? '');
  if (!title) throw new Error(`${slug}: fant ikke tittel`);

  const ingressHtml = (headerHtml.match(/<div class="paragraph large">([\s\S]*?)<\/div>/i) ?? [])[1] ?? '';
  // Enkelte saker bruker <br /> som avsnittsskille i ingressen – og har hele
  // innholdet sitt der, uten egne <p>-elementer i brødteksten.
  const ingressParagraphs = ingressHtml
    .split(/<br\s*\/?>/i)
    .map((part) => stripTags(part))
    .filter(Boolean);
  const ingress = ingressParagraphs.join(' ');

  const categoryRaw = stripTags(
    (headerHtml.match(/class="tag-item tag-item-brand"[^>]*>([\s\S]*?)<\/span>/i) ?? [])[1] ?? '',
  );
  const category = CATEGORY_MAP[categoryRaw.toLowerCase()] ?? null;

  const publishedAt = String(ld.datePublished ?? '').trim();
  if (!publishedAt) throw new Error(`${slug}: mangler datePublished`);

  const author = stripTags(String(ld.author?.name ?? '')).trim() || 'Tønsberglivet';

  const ldImages = Array.isArray(ld.image) ? ld.image : ld.image ? [ld.image] : [];
  const featuredFromHeader = (headerHtml.match(/<img[^>]+src="([^"]+)"/i) ?? [])[1] ?? '';
  const featuredUrl = featuredFromHeader || ldImages[0] || '';

  // Blokker i dokumentrekkefølge: mellomtitler, avsnitt, sitater, lister og bilder.
  const blocks = [];
  const blockRegex =
    /<(h[2-6]|p|ul|ol|figure|blockquote)\b([^>]*)>([\s\S]*?)<\/\1>|<div class="links[^"]*">([\s\S]*?)<\/div>/gi;
  for (const match of bodyHtml.matchAll(blockRegex)) {
    if (match[4] !== undefined) {
      // CTA-knapper i saken («Book torvplass her») er ekte lenker og tas med.
      for (const anchor of match[4].matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
        const label = stripTags(
          (anchor[2].match(/<span class="label">([\s\S]*?)<\/span>/i) ?? [])[1] ?? anchor[2],
        );
        if (label) blocks.push({ type: 'link', text: label, href: decodeEntities(anchor[1]) });
      }
      continue;
    }

    const tag = match[1].toLowerCase();
    const attrs = match[2];
    const inner = match[3];

    if (tag === 'figure') {
      const img = inner.match(/<img[^>]+>/i);
      const src = img ? (img[0].match(/src="([^"]+)"/i) ?? [])[1] : '';
      const alt = img ? stripTags((img[0].match(/alt="([^"]*)"/i) ?? [])[1] ?? '') : '';
      const caption = stripTags((inner.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i) ?? [])[1] ?? '');
      if (src) blocks.push({ type: 'image', src, alt: alt || caption });
      continue;
    }

    if (tag === 'ul' || tag === 'ol') {
      const items = [...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
        .map((item) => stripTags(item[1]))
        .filter(Boolean);
      if (items.length > 0) blocks.push({ type: 'list', items });
      continue;
    }

    const text = stripTags(inner);
    if (!text) continue;

    if (tag === 'blockquote') {
      blocks.push({ type: 'quote', text });
      continue;
    }
    if (tag.startsWith('h')) {
      // Sakshodet er allerede plukket ut; hopp over titler som er innebygd i header-markup.
      if (attrs.includes('xlarge')) continue;
      blocks.push({ type: 'heading', text });
      continue;
    }
    // Avsnitt som åpner med tankestrek er sitater i kilden.
    if (/^[–—-]\s/.test(text) && /sier|forteller|mener|uttaler/.test(text)) {
      blocks.push({ type: 'quote', text });
      continue;
    }
    blocks.push({ type: 'paragraph', text });
  }

  if (blocks.length === 0) {
    // Noen saker har hele innholdet i ingressen (ofte med <br /> mellom linjene).
    for (const paragraph of ingressParagraphs) blocks.push({ type: 'paragraph', text: paragraph });
  }

  if (blocks.length === 0) throw new Error(`${slug}: fant ingen brødtekst`);

  return {
    id: slug,
    slug,
    title,
    category,
    categoryRaw,
    publishedAt,
    author,
    excerpt: ingress || blocks.find((block) => block.type === 'paragraph')?.text?.slice(0, 220) || '',
    blocks,
    featuredUrl,
    sourceUrl: url,
  };
}

/* ── Trinn: fetch ──────────────────────────────────────────────────────── */

async function listArticleUrls() {
  const xml = await fetchText(SITEMAP_URL);
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => match[1].trim())
    .filter((url) => url.includes('/nyheter/') && !url.endsWith('/nyheter/'));
}

async function fetchAll() {
  await mkdir(CACHE_DIR, { recursive: true });
  const urls = await listArticleUrls();
  console.log(`Fant ${urls.length} saker i sitemapen.`);

  let fetched = 0;
  let cached = 0;
  const failed = [];

  const queue = [...urls];
  const workers = Array.from({ length: 4 }, async () => {
    while (queue.length > 0) {
      const url = queue.shift();
      const slug = slugFromUrl(url);
      const file = path.join(CACHE_DIR, `${slug}.html`);
      if (existsSync(file)) {
        cached++;
        continue;
      }
      try {
        const html = await fetchText(url);
        await writeFile(file, html, 'utf8');
        fetched++;
        if (fetched % 20 === 0) console.log(`  hentet ${fetched} ...`);
      } catch (error) {
        failed.push({ url, error: error.message });
        console.log(`  FEIL ${slug}: ${error.message}`);
      }
      await sleep(120);
    }
  });
  await Promise.all(workers);

  console.log(`Hentet ${fetched} nye sider, ${cached} fra cache, ${failed.length} feilet.`);
  return failed;
}

/* ── Trinn: build ──────────────────────────────────────────────────────── */

function extensionFor(url) {
  const clean = url.split('?')[0].toLowerCase();
  const match = clean.match(/\.(jpe?g|png|webp|gif|avif)$/);
  return match ? match[1].replace('jpeg', 'jpg') : 'jpg';
}

function localImagePath(url, slug, index) {
  const ext = extensionFor(url);
  const base = index === 0 ? slug : `${slug}-${index}`;
  return `/images/nyheter/${base}.${ext}`;
}

async function downloadImage(url, targetPath) {
  if (existsSync(targetPath)) return false;
  const buffer = await fetchText(url, { binary: true });
  await writeFile(targetPath, buffer);
  return true;
}

async function build({ resizeMaxWidth = 1600 } = {}) {
  await mkdir(IMAGE_DIR, { recursive: true });
  await mkdir(path.dirname(ARCHIVE_PATH), { recursive: true });

  const files = (await readdir(CACHE_DIR)).filter((file) => file.endsWith('.html'));
  console.log(`Parser ${files.length} sider fra cache.`);

  const articles = [];
  const errors = [];
  const imagePlan = new Map(); // fjernt-URL -> lokal sti

  for (const file of files) {
    const html = await readFile(path.join(CACHE_DIR, file), 'utf8');
    const slug = file.replace(/\.html$/, '');
    const url = `https://tonsberglivet.no/nyheter/${slug}/`;
    try {
      const parsed = parseArticle(html, url);

      if (!parsed.category) {
        errors.push(`${slug}: ukjent kategori «${parsed.categoryRaw}»`);
        parsed.category = 'BYLIVET';
      }

      let imageIndex = 0;
      // Flere saker kan dele samme kildebilde. Da gjenbruker vi den lokale filen
      // i stedet for å planlegge en ny sti som aldri blir lastet ned.
      const planImage = (remote, nextIndex) => {
        const existing = imagePlan.get(remote);
        if (existing) return existing;
        const local = localImagePath(remote, parsed.slug, nextIndex());
        imagePlan.set(remote, local);
        return local;
      };

      const blocks = [];
      for (const block of parsed.blocks) {
        if (block.type !== 'image') {
          blocks.push(block);
          continue;
        }
        // Hopp over duplikatet av hovedbildet inne i brødteksten.
        if (block.src === parsed.featuredUrl) continue;
        const local = planImage(block.src, () => ++imageIndex);
        blocks.push({ type: 'image', src: local, alt: block.alt ?? '' });
      }

      let featured = null;
      if (parsed.featuredUrl) {
        const local = planImage(parsed.featuredUrl, () => 0);
        featured = { src: local, alt: parsed.title };
      }

      articles.push({
        id: parsed.id,
        slug: parsed.slug,
        title: parsed.title,
        category: parsed.category,
        publishedAt: parsed.publishedAt,
        author: parsed.author,
        excerpt: parsed.excerpt,
        blocks,
        featuredImage: featured,
        sourceUrl: parsed.sourceUrl,
      });
    } catch (error) {
      errors.push(`${slug}: ${error.message}`);
    }
  }

  articles.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  console.log(`Parset ${articles.length} saker, ${errors.length} problem.`);
  for (const error of errors) console.log(`  ${error}`);

  console.log(`Laster ned ${imagePlan.size} bilder ...`);
  let downloaded = 0;
  let bytes = 0;
  const entries = [...imagePlan.entries()];
  const queue = [...entries];
  const workers = Array.from({ length: 4 }, async () => {
    while (queue.length > 0) {
      const [remote, local] = queue.shift();
      const target = path.join(ROOT, 'public', local.replace(/^\//, ''));
      try {
        const isNew = await downloadImage(remote, target);
        if (isNew) {
          downloaded++;
          bytes += (await stat(target)).size;
        }
      } catch (error) {
        console.log(`  BILDE-FEIL ${remote}: ${error.message}`);
      }
      await sleep(80);
    }
  });
  await Promise.all(workers);
  console.log(`Lastet ned ${downloaded} nye bilder (${(bytes / 1024 / 1024).toFixed(1)} MB).`);

  await writeFile(ARCHIVE_PATH, `${JSON.stringify(articles, null, 1)}\n`, 'utf8');
  console.log(`Skrev ${ARCHIVE_PATH} (${articles.length} saker).`);
  console.log(`Bildestørrelse bør begrenses til maks ${resizeMaxWidth}px bredde etterpå.`);
}

const mode = process.argv[2];
if (mode === 'fetch') {
  await fetchAll();
} else if (mode === 'build') {
  await build();
} else {
  console.log('Bruk: node scripts/import-wp-news.mjs fetch|build');
}
