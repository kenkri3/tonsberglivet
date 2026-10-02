/**
 * Seed for bildebanken.
 *
 * Fyller Image/ImageFolder med de ekte Tønsberg-bildene som ligger i
 * public/images/tonsberg. Hvert bilde brukes på nøyaktig én plass i nettstedet,
 * og alle er hentet fra Tønsberglivet sitt eget bildearkiv – ingen arkiv- eller
 * AI-bilder.
 *
 * Kjøres med:  npm run db:seed
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const FOLDERS = [
  "Arrangementer",
  "Bylivet",
  "Generelt",
  "Hverdagslivet",
  "Kontakt",
  "Nyheter",
  "Næringslivet",
  "Om oss",
  "Prosjekter",
  "Reiselivet",
  "Studentlivet"
];

const IMAGES = [
  {
    "url": "/images/tonsberg/hva-skjer-i-tonsberg-arrangementer.jpg",
    "filename": "Hva skjer i tonsberg arrangementer",
    "alt": "Konsertscene i Tønsberg",
    "width": 1600,
    "height": 1067,
    "sizeBytes": 222253,
    "format": "jpg",
    "folder": "Arrangementer",
    "tags": [
      "Tønsberg",
      "Arrangementer"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/barista-som-lager-kaffe-paa-kaf-i-.jpg",
    "filename": "Barista som lager kaffe paa kaf i",
    "alt": "Barista som lager kaffe på kafé i Tønsberg",
    "width": 1200,
    "height": 675,
    "sizeBytes": 96993,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/barista-som-lager-kaffe-paa-kaf-i--2.jpg",
    "filename": "Barista som lager kaffe paa kaf i",
    "alt": "Barista som lager kaffe på kafé i Tønsberg",
    "width": 1200,
    "height": 675,
    "sizeBytes": 95886,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/barista-som-lager-kaffe-paa-kaf-i--3.jpg",
    "filename": "Barista som lager kaffe paa kaf i",
    "alt": "Barista som lager kaffe på kafé i Tønsberg",
    "width": 1080,
    "height": 1080,
    "sizeBytes": 96553,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/barista-som-lager-kaffe-paa-kaf-i--4.jpg",
    "filename": "Barista som lager kaffe paa kaf i",
    "alt": "Barista som lager kaffe på kafé i Tønsberg",
    "width": 980,
    "height": 980,
    "sizeBytes": 119137,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/barnas-tonsberg-kunstprosjekter-ve.jpg",
    "filename": "Barnas tonsberg kunstprosjekter ve",
    "alt": "Barnas tonsberg kunstprosjekter ve – Tønsberg",
    "width": 1600,
    "height": 1131,
    "sizeBytes": 306918,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/byen-kledd-i-regnbuens-farger-i-to.jpg",
    "filename": "Byen kledd i regnbuens farger i to",
    "alt": "Byen kledd i regnbuens farger i Tønsberg",
    "width": 1600,
    "height": 1200,
    "sizeBytes": 283561,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/bylivet-i-tonsberg-i-bilder-bildeg.jpg",
    "filename": "Bylivet i tonsberg i bilder bildeg",
    "alt": "Tønsberg Brygge om kvelden",
    "width": 1600,
    "height": 867,
    "sizeBytes": 169030,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/familie-som-spiser-uteservering-pa.jpg",
    "filename": "Familie som spiser uteservering pa",
    "alt": "Familie som spiser uteservering på Tønsberg Brygge",
    "width": 1200,
    "height": 675,
    "sizeBytes": 130271,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/farmandstredet-kjopesenter-tonsber.jpg",
    "filename": "Farmandstredet kjopesenter tonsber",
    "alt": "Farmandstredet kjopesenter tonsber – Tønsberg",
    "width": 720,
    "height": 900,
    "sizeBytes": 138937,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/folkefest-i-tonsberg-relative-aspe.jpg",
    "filename": "Folkefest i tonsberg relative aspe",
    "alt": "Folkefest i Tønsberg",
    "width": 1200,
    "height": 675,
    "sizeBytes": 119082,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/gate-med-lys-og-folk-i-tonsberg-se.jpg",
    "filename": "Gate med lys og folk i tonsberg se",
    "alt": "Gate med lys og folk i Tønsberg sentrum",
    "width": 972,
    "height": 702,
    "sizeBytes": 146178,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/gateliv-i-tonsberg-sentrum-grid-gr.jpg",
    "filename": "Gateliv i tonsberg sentrum grid gr",
    "alt": "Gateliv i Tønsberg sentrum",
    "width": 1600,
    "height": 883,
    "sizeBytes": 199001,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/kajakk-padling-padle-gjennom-kanal.jpg",
    "filename": "Kajakk padling padle gjennom kanal",
    "alt": "Kajakk padling padle gjennom kanal – Tønsberg",
    "width": 1600,
    "height": 900,
    "sizeBytes": 190710,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/kultur-aktiviteter-historie-teater.jpg",
    "filename": "Kultur aktiviteter historie teater",
    "alt": "Vikingodden i Tønsberg",
    "width": 1600,
    "height": 1068,
    "sizeBytes": 310043,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/local-25.jpg",
    "filename": "Local",
    "alt": "Local – Tønsberg",
    "width": 1200,
    "height": 1600,
    "sizeBytes": 447715,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/lokalproduserte-varer-til-salgs-pa.jpg",
    "filename": "Lokalproduserte varer til salgs pa",
    "alt": "Lokalproduserte varer til salgs på torvet",
    "width": 1366,
    "height": 1370,
    "sizeBytes": 160937,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/markedsboder-med-klaer-og-haandver.jpg",
    "filename": "Markedsboder med klaer og haandver",
    "alt": "Markedsboder med klær og håndverk i Tønsberg sentrum",
    "width": 1080,
    "height": 1080,
    "sizeBytes": 112083,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/markedsboder-med-klaer-og-haandver-2.jpg",
    "filename": "Markedsboder med klaer og haandver",
    "alt": "Markedsboder med klær og håndverk i Tønsberg sentrum",
    "width": 1600,
    "height": 1067,
    "sizeBytes": 244665,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/markedsboder-med-klaer-og-haandver-3.jpg",
    "filename": "Markedsboder med klaer og haandver",
    "alt": "Markedsboder med klær og håndverk i Tønsberg sentrum",
    "width": 1200,
    "height": 675,
    "sizeBytes": 124929,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/markedsboder-med-klaer-og-haandver-4.jpg",
    "filename": "Markedsboder med klaer og haandver",
    "alt": "Markedsboder med klær og håndverk i Tønsberg",
    "width": 1600,
    "height": 1067,
    "sizeBytes": 247724,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/markedsboder-paa-tonsberg-torv-gri.jpg",
    "filename": "Markedsboder paa tonsberg torv gri",
    "alt": "Markedsboder på Tønsberg Torv",
    "width": 1512,
    "height": 1080,
    "sizeBytes": 171411,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/mat-drikke-uteservering-paa-brygga.jpg",
    "filename": "Mat drikke uteservering paa brygga",
    "alt": "Kveldssol over brygga i Tønsberg",
    "width": 1290,
    "height": 943,
    "sizeBytes": 139177,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/mat-og-servering-langs-brygga-spis.jpg",
    "filename": "Mat og servering langs brygga spis",
    "alt": "Mat og servering langs brygga",
    "width": 1600,
    "height": 1067,
    "sizeBytes": 172486,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/matglede-interior-design-skandinav.jpg",
    "filename": "Matglede interior design skandinav",
    "alt": "Matglede interior design skandinav – Tønsberg",
    "width": 1200,
    "height": 675,
    "sizeBytes": 99451,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/nisjebutikker-mote-farmandstredet-.jpg",
    "filename": "Nisjebutikker mote farmandstredet",
    "alt": "Nisjebutikker mote farmandstredet – Tønsberg",
    "width": 1501,
    "height": 2000,
    "sizeBytes": 353890,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/oseberg-kulturhus.jpg",
    "filename": "Oseberg kulturhus",
    "alt": "Oseberg kulturhus – Tønsberg",
    "width": 1600,
    "height": 1068,
    "sizeBytes": 165043,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/sentrumsgavekortet-gaven-som-glede.jpg",
    "filename": "Sentrumsgavekortet gaven som glede",
    "alt": "Stemning i gatebildet i Tønsberg sentrum",
    "width": 1600,
    "height": 1034,
    "sizeBytes": 138676,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/shopping-i-tonsberg-unike-nisjebut.jpg",
    "filename": "Shopping i tonsberg unike nisjebut",
    "alt": "Folkeliv og handel i Tønsberg sentrum",
    "width": 1600,
    "height": 667,
    "sizeBytes": 135816,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/slottsfjellet-taarnet.jpg",
    "filename": "Slottsfjellet taarnet",
    "alt": "Slottsfjellet taarnet – Tønsberg",
    "width": 1261,
    "height": 847,
    "sizeBytes": 123963,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/spis-ute-uka-i-tonsberg-stemning-p.jpg",
    "filename": "Spis ute uka i tonsberg stemning p",
    "alt": "Spis Ute Uka i Tønsberg",
    "width": 1200,
    "height": 900,
    "sizeBytes": 138280,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/tonsberg-bibliotek-byliv.jpg",
    "filename": "Tonsberg bibliotek byliv",
    "alt": "Tonsberg bibliotek byliv – Tønsberg",
    "width": 1600,
    "height": 1067,
    "sizeBytes": 172895,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/tonsberg-brygge-om-kvelden-min-h-s.jpg",
    "filename": "Tonsberg brygge om kvelden min h s",
    "alt": "Tønsberg Brygge om kvelden",
    "width": 1600,
    "height": 533,
    "sizeBytes": 129679,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/tonsberg-torv-markedsplass-matgled.jpg",
    "filename": "Tonsberg torv markedsplass matgled",
    "alt": "Tonsberg torv markedsplass matgled – Tønsberg",
    "width": 1200,
    "height": 900,
    "sizeBytes": 183759,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/torvleie-tonsberg-torv-torvhandler.jpg",
    "filename": "Torvleie tonsberg torv torvhandler",
    "alt": "Torvhandler som selger lokal mat på Tønsberg Torv",
    "width": 1536,
    "height": 2048,
    "sizeBytes": 439971,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/barn-som-lager-kunst-i-tonsberg-ho.jpg",
    "filename": "Barn som lager kunst i tonsberg ho",
    "alt": "Barn som lager kunst i Tønsberg",
    "width": 1255,
    "height": 810,
    "sizeBytes": 231080,
    "format": "jpg",
    "folder": "Generelt",
    "tags": [
      "Tønsberg",
      "Generelt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/bylivet-h-7-w-auto-fill-current.jpg",
    "filename": "Bylivet h 7 w auto fill current",
    "alt": "Bylivet h 7 w auto fill current – Tønsberg",
    "width": 1600,
    "height": 900,
    "sizeBytes": 195639,
    "format": "jpg",
    "folder": "Generelt",
    "tags": [
      "Tønsberg",
      "Generelt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/dagens-program-paa-torvet-sommer-k.jpg",
    "filename": "Dagens program paa torvet sommer k",
    "alt": "Dagens program paa torvet sommer k – Tønsberg",
    "width": 1600,
    "height": 1200,
    "sizeBytes": 255052,
    "format": "jpg",
    "folder": "Generelt",
    "tags": [
      "Tønsberg",
      "Generelt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/faerderbiennalen-havneliv-smak-paa.jpg",
    "filename": "Faerderbiennalen havneliv smak paa",
    "alt": "Faerderbiennalen havneliv smak paa – Tønsberg",
    "width": 1600,
    "height": 900,
    "sizeBytes": 229879,
    "format": "jpg",
    "folder": "Generelt",
    "tags": [
      "Tønsberg",
      "Generelt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/folkefest-med-musikk-og-mat-i-tons.jpg",
    "filename": "Folkefest med musikk og mat i tons",
    "alt": "Folkefest med musikk og mat i tons – Tønsberg",
    "width": 1600,
    "height": 1068,
    "sizeBytes": 220359,
    "format": "jpg",
    "folder": "Generelt",
    "tags": [
      "Tønsberg",
      "Generelt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/gate-med-lys-og-folk-i-tonsberg-se-2.jpg",
    "filename": "Gate med lys og folk i tonsberg se",
    "alt": "Gate med lys og folk i Tønsberg sentrum",
    "width": 1600,
    "height": 930,
    "sizeBytes": 224280,
    "format": "jpg",
    "folder": "Generelt",
    "tags": [
      "Tønsberg",
      "Generelt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/generelt-heritage.jpg",
    "filename": "Generelt heritage",
    "alt": "Generelt heritage – Tønsberg",
    "width": 1501,
    "height": 2000,
    "sizeBytes": 430067,
    "format": "jpg",
    "folder": "Generelt",
    "tags": [
      "Tønsberg",
      "Generelt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/generelt-heritage-2.jpg",
    "filename": "Generelt heritage",
    "alt": "Generelt heritage – Tønsberg",
    "width": 1600,
    "height": 900,
    "sizeBytes": 105208,
    "format": "jpg",
    "folder": "Generelt",
    "tags": [
      "Tønsberg",
      "Generelt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/generelt-heritage-3.jpg",
    "filename": "Generelt heritage",
    "alt": "Generelt heritage – Tønsberg",
    "width": 1570,
    "height": 960,
    "sizeBytes": 189693,
    "format": "jpg",
    "folder": "Generelt",
    "tags": [
      "Tønsberg",
      "Generelt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/generelt-ticketmaster.jpg",
    "filename": "Generelt ticketmaster",
    "alt": "Generelt ticketmaster – Tønsberg",
    "width": 1533,
    "height": 697,
    "sizeBytes": 93473,
    "format": "jpg",
    "folder": "Generelt",
    "tags": [
      "Tønsberg",
      "Generelt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/hero-aerial.jpg",
    "filename": "Hero aerial",
    "alt": "Tønsberg sett fra luften med brygge, kanal og byfjord",
    "width": 1376,
    "height": 768,
    "sizeBytes": 208523,
    "format": "jpg",
    "folder": "Generelt",
    "tags": [
      "Tønsberg",
      "Generelt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/hverdagslivet-h-7-w-auto-fill-curr.jpg",
    "filename": "Hverdagslivet h 7 w auto fill curr",
    "alt": "Hverdagslivet h 7 w auto fill curr – Tønsberg",
    "width": 1600,
    "height": 2400,
    "sizeBytes": 235880,
    "format": "jpg",
    "folder": "Generelt",
    "tags": [
      "Tønsberg",
      "Generelt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/konsert-i-foynhagen-livemusikk-ved.jpg",
    "filename": "Konsert i foynhagen livemusikk ved",
    "alt": "Konsert i foynhagen livemusikk ved – Tønsberg",
    "width": 1200,
    "height": 675,
    "sizeBytes": 128526,
    "format": "jpg",
    "folder": "Generelt",
    "tags": [
      "Tønsberg",
      "Generelt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/kultursommer-i-tonsberg.jpg",
    "filename": "Kultursommer i tonsberg",
    "alt": "Kultursommer i tonsberg – Tønsberg",
    "width": 1600,
    "height": 900,
    "sizeBytes": 294691,
    "format": "jpg",
    "folder": "Generelt",
    "tags": [
      "Tønsberg",
      "Generelt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/lokalproduserte-varer-fra-marked-i.jpg",
    "filename": "Lokalproduserte varer fra marked i",
    "alt": "Lokalproduserte varer fra marked i Tønsberg",
    "width": 1050,
    "height": 675,
    "sizeBytes": 97316,
    "format": "jpg",
    "folder": "Generelt",
    "tags": [
      "Tønsberg",
      "Generelt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/matmarked-lokale-raavarer-besok-bo.jpg",
    "filename": "Matmarked lokale raavarer besok bo",
    "alt": "Matmarked lokale raavarer besok bo – Tønsberg",
    "width": 1200,
    "height": 900,
    "sizeBytes": 70069,
    "format": "jpg",
    "folder": "Generelt",
    "tags": [
      "Tønsberg",
      "Generelt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/matmarked-torvleie-i-helgen-kortre.jpg",
    "filename": "Matmarked torvleie i helgen kortre",
    "alt": "Matmarked torvleie i helgen kortre – Tønsberg",
    "width": 1200,
    "height": 675,
    "sizeBytes": 127082,
    "format": "jpg",
    "folder": "Generelt",
    "tags": [
      "Tønsberg",
      "Generelt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/naeringslivet-h-7-w-auto-fill-curr.jpg",
    "filename": "Naeringslivet h 7 w auto fill curr",
    "alt": "Naeringslivet h 7 w auto fill curr – Tønsberg",
    "width": 1200,
    "height": 675,
    "sizeBytes": 121941,
    "format": "jpg",
    "folder": "Generelt",
    "tags": [
      "Tønsberg",
      "Generelt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/nordens-storste-bevarte-rundkirke-.jpg",
    "filename": "Nordens storste bevarte rundkirke",
    "alt": "Nordens storste bevarte rundkirke – Tønsberg",
    "width": 1200,
    "height": 630,
    "sizeBytes": 26339,
    "format": "jpg",
    "folder": "Generelt",
    "tags": [
      "Tønsberg",
      "Generelt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/nordens-storste-middelalderborg-og.jpg",
    "filename": "Nordens storste middelalderborg og",
    "alt": "Nordens storste middelalderborg og – Tønsberg",
    "width": 1050,
    "height": 850,
    "sizeBytes": 105200,
    "format": "jpg",
    "folder": "Generelt",
    "tags": [
      "Tønsberg",
      "Generelt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/reiselivet-h-7-w-auto-fill-current.jpg",
    "filename": "Reiselivet h 7 w auto fill current",
    "alt": "Reiselivet h 7 w auto fill current – Tønsberg",
    "width": 1600,
    "height": 1067,
    "sizeBytes": 129106,
    "format": "jpg",
    "folder": "Generelt",
    "tags": [
      "Tønsberg",
      "Generelt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/relative-aspect-16-9-overflow-hidd.jpg",
    "filename": "Relative aspect 16 9 overflow hidd",
    "alt": "Relative aspect 16 9 overflow hidd – Tønsberg",
    "width": 1200,
    "height": 675,
    "sizeBytes": 78718,
    "format": "jpg",
    "folder": "Generelt",
    "tags": [
      "Tønsberg",
      "Generelt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/skjaergaarden-og-faerder-nasjonalp.jpg",
    "filename": "Skjaergaarden og faerder nasjonalp",
    "alt": "Skjærgården og Færder nasjonalpark",
    "width": 1200,
    "height": 675,
    "sizeBytes": 156694,
    "format": "jpg",
    "folder": "Generelt",
    "tags": [
      "Tønsberg",
      "Generelt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/slottsfjellet.jpg",
    "filename": "Slottsfjellet",
    "alt": "Slottsfjellet Tønsberg",
    "width": 1376,
    "height": 768,
    "sizeBytes": 204438,
    "format": "jpg",
    "folder": "Generelt",
    "tags": [
      "Tønsberg",
      "Generelt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/slottsfjellstaarnet-og-ruinene-i-t.jpg",
    "filename": "Slottsfjellstaarnet og ruinene i t",
    "alt": "Slottsfjellstårnet og ruinene i Tønsberg",
    "width": 1080,
    "height": 720,
    "sizeBytes": 56797,
    "format": "jpg",
    "folder": "Generelt",
    "tags": [
      "Tønsberg",
      "Generelt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/student-park.jpg",
    "filename": "Student park",
    "alt": "Studenter ved USN Campus Vestfold",
    "width": 1584,
    "height": 1280,
    "sizeBytes": 401719,
    "format": "jpg",
    "folder": "Generelt",
    "tags": [
      "Tønsberg",
      "Generelt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/studentlivet-h-7-w-auto-fill-curre.jpg",
    "filename": "Studentlivet h 7 w auto fill curre",
    "alt": "Studentlivet h 7 w auto fill curre – Tønsberg",
    "width": 1600,
    "height": 2404,
    "sizeBytes": 409473,
    "format": "jpg",
    "folder": "Generelt",
    "tags": [
      "Tønsberg",
      "Generelt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/tonsberg-brygge-og-havn-relative-m.jpg",
    "filename": "Tonsberg brygge og havn relative m",
    "alt": "Tønsberg Brygge og Havn",
    "width": 1600,
    "height": 900,
    "sizeBytes": 110303,
    "format": "jpg",
    "folder": "Generelt",
    "tags": [
      "Tønsberg",
      "Generelt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/tonsberg-brygge-om-kvelden-slottsf.jpg",
    "filename": "Tonsberg brygge om kvelden slottsf",
    "alt": "Tønsberg Brygge om kvelden",
    "width": 1290,
    "height": 2087,
    "sizeBytes": 226058,
    "format": "jpg",
    "folder": "Generelt",
    "tags": [
      "Tønsberg",
      "Generelt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/uteservering-og-matkultur-paa-bryg.jpg",
    "filename": "Uteservering og matkultur paa bryg",
    "alt": "Uteservering og matkultur på brygga",
    "width": 1200,
    "height": 675,
    "sizeBytes": 138396,
    "format": "jpg",
    "folder": "Generelt",
    "tags": [
      "Tønsberg",
      "Generelt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/aktiviteter-for-barnefamilier-i-to.jpg",
    "filename": "Aktiviteter for barnefamilier i to",
    "alt": "Aktiviteter for barnefamilier i Tønsberg",
    "width": 1138,
    "height": 731,
    "sizeBytes": 166329,
    "format": "jpg",
    "folder": "Hverdagslivet",
    "tags": [
      "Tønsberg",
      "Hverdagslivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/bo-og-leve-i-tonsbergregionen-min-.jpg",
    "filename": "Bo og leve i tonsbergregionen min",
    "alt": "Bo og leve i Tønsbergregionen",
    "width": 1440,
    "height": 1795,
    "sizeBytes": 181810,
    "format": "jpg",
    "folder": "Hverdagslivet",
    "tags": [
      "Tønsberg",
      "Hverdagslivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/hverdagslivet-i-tonsberg-i-bilder-.jpg",
    "filename": "Hverdagslivet i tonsberg i bilder",
    "alt": "Nabolag og gatemiljø i Tønsberg",
    "width": 1600,
    "height": 900,
    "sizeBytes": 187244,
    "format": "jpg",
    "folder": "Hverdagslivet",
    "tags": [
      "Tønsberg",
      "Hverdagslivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/sommer-i-tonsberg-barnevennlige-to.jpg",
    "filename": "Sommer i tonsberg barnevennlige to",
    "alt": "Sommer i Tønsberg",
    "width": 1200,
    "height": 675,
    "sizeBytes": 171669,
    "format": "jpg",
    "folder": "Hverdagslivet",
    "tags": [
      "Tønsberg",
      "Hverdagslivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/gatebildet-i-tonsberg-sentrum-spac.jpg",
    "filename": "Gatebildet i tonsberg sentrum spac",
    "alt": "Gatebildet i Tønsberg sentrum",
    "width": 1600,
    "height": 1200,
    "sizeBytes": 296479,
    "format": "jpg",
    "folder": "Kontakt",
    "tags": [
      "Tønsberg",
      "Kontakt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/kontakt-oss-vi-horer-gjerne-fra-de.jpg",
    "filename": "Kontakt oss vi horer gjerne fra de",
    "alt": "Tønsberg Torv, like ved sentrumskontoret i Rådhusgaten",
    "width": 1200,
    "height": 675,
    "sizeBytes": 168217,
    "format": "jpg",
    "folder": "Kontakt",
    "tags": [
      "Tønsberg",
      "Kontakt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/bondens-marked-og-hostfest-paa-tor.jpg",
    "filename": "Bondens marked og hostfest paa tor",
    "alt": "Bondens marked og hostfest paa tor – Tønsberg",
    "width": 1600,
    "height": 1200,
    "sizeBytes": 315082,
    "format": "jpg",
    "folder": "Nyheter",
    "tags": [
      "Tønsberg",
      "Nyheter"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/gront-loft-felles-baerekraftsprosj.jpg",
    "filename": "Gront loft felles baerekraftsprosj",
    "alt": "Gront loft felles baerekraftsprosj – Tønsberg",
    "width": 765,
    "height": 560,
    "sizeBytes": 67139,
    "format": "jpg",
    "folder": "Nyheter",
    "tags": [
      "Tønsberg",
      "Nyheter"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/kultursommer-i-tonsberg-med-nye-ar.jpg",
    "filename": "Kultursommer i tonsberg med nye ar",
    "alt": "Kultursommer i tonsberg med nye ar – Tønsberg",
    "width": 1440,
    "height": 1075,
    "sizeBytes": 103536,
    "format": "jpg",
    "folder": "Nyheter",
    "tags": [
      "Tønsberg",
      "Nyheter"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/ny-festival-og-storsatsing-paa-bry.jpg",
    "filename": "Ny festival og storsatsing paa bry",
    "alt": "Ny festival og storsatsing paa bry – Tønsberg",
    "width": 1600,
    "height": 1067,
    "sizeBytes": 219022,
    "format": "jpg",
    "folder": "Nyheter",
    "tags": [
      "Tønsberg",
      "Nyheter"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/ny-kreativ-tech-bedrift-etablerer-.jpg",
    "filename": "Ny kreativ tech bedrift etablerer",
    "alt": "Ny kreativ tech bedrift etablerer – Tønsberg",
    "width": 1200,
    "height": 675,
    "sizeBytes": 58838,
    "format": "jpg",
    "folder": "Nyheter",
    "tags": [
      "Tønsberg",
      "Nyheter"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/nyheter-siste-nytt-fra-tonsberg-ga.jpg",
    "filename": "Nyheter siste nytt fra tonsberg ga",
    "alt": "Gatebildet i Tønsberg sentrum",
    "width": 1440,
    "height": 961,
    "sizeBytes": 205117,
    "format": "jpg",
    "folder": "Nyheter",
    "tags": [
      "Tønsberg",
      "Nyheter"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/tips-til-den-perfekte-helgen-ved-k.jpg",
    "filename": "Tips til den perfekte helgen ved k",
    "alt": "Tips til den perfekte helgen ved k – Tønsberg",
    "width": 1200,
    "height": 675,
    "sizeBytes": 100121,
    "format": "jpg",
    "folder": "Nyheter",
    "tags": [
      "Tønsberg",
      "Nyheter"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/bedriftene-i-tonsberg-7-500-bedrif.jpg",
    "filename": "Bedriftene i tonsberg 7 500 bedrif",
    "alt": "Næringsbygg i Tønsberg",
    "width": 1600,
    "height": 900,
    "sizeBytes": 273102,
    "format": "jpg",
    "folder": "Næringslivet",
    "tags": [
      "Tønsberg",
      "Næringslivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/etablering-naeringsarealer-etabler.jpg",
    "filename": "Etablering naeringsarealer etabler",
    "alt": "Gatebildet i Tønsberg sentrum",
    "width": 1440,
    "height": 1450,
    "sizeBytes": 276994,
    "format": "jpg",
    "folder": "Næringslivet",
    "tags": [
      "Tønsberg",
      "Næringslivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/foynkvartalet-bryggekanten-kaldnes.jpg",
    "filename": "Foynkvartalet bryggekanten kaldnes",
    "alt": "Foynkvartalet bryggekanten kaldnes – Tønsberg",
    "width": 1600,
    "height": 1067,
    "sizeBytes": 153955,
    "format": "jpg",
    "folder": "Næringslivet",
    "tags": [
      "Tønsberg",
      "Næringslivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/kaldnes-vest-sjofronten-statens-pa.jpg",
    "filename": "Kaldnes vest sjofronten statens pa",
    "alt": "Kaldnes vest sjofronten statens pa – Tønsberg",
    "width": 1440,
    "height": 1264,
    "sizeBytes": 159904,
    "format": "jpg",
    "folder": "Næringslivet",
    "tags": [
      "Tønsberg",
      "Næringslivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/matgr-nder-paa-torvet-max-w-7xl-mx.jpg",
    "filename": "Matgr nder paa torvet max w 7xl mx",
    "alt": "Matgründer på Torvet",
    "width": 1229,
    "height": 1843,
    "sizeBytes": 282951,
    "format": "jpg",
    "folder": "Næringslivet",
    "tags": [
      "Tønsberg",
      "Næringslivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/statens-park-regional-klynge-for-h.jpg",
    "filename": "Statens park regional klynge for h",
    "alt": "Statens park regional klynge for h – Tønsberg",
    "width": 1200,
    "height": 675,
    "sizeBytes": 75442,
    "format": "jpg",
    "folder": "Næringslivet",
    "tags": [
      "Tønsberg",
      "Næringslivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/tonsberg-by-og-havn-sett-fra-lufte.jpg",
    "filename": "Tonsberg by og havn sett fra lufte",
    "alt": "Tønsberg by og havn sett fra luften",
    "width": 1600,
    "height": 1200,
    "sizeBytes": 269177,
    "format": "jpg",
    "folder": "Næringslivet",
    "tags": [
      "Tønsberg",
      "Næringslivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/tonsberg-stasjonsomraade-foynkvart.jpg",
    "filename": "Tonsberg stasjonsomraade foynkvart",
    "alt": "Tonsberg stasjonsomraade foynkvart – Tønsberg",
    "width": 1600,
    "height": 900,
    "sizeBytes": 216035,
    "format": "jpg",
    "folder": "Næringslivet",
    "tags": [
      "Tønsberg",
      "Næringslivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/om-tonsberglivet-hvem-er-vi-tonsbe.jpg",
    "filename": "Om tonsberglivet hvem er vi tonsbe",
    "alt": "Tønsberg by og havn sett fra luften",
    "width": 1600,
    "height": 977,
    "sizeBytes": 318267,
    "format": "jpg",
    "folder": "Om oss",
    "tags": [
      "Tønsberg",
      "Om oss"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/presserom-mediekontakt-pressemeldi.jpg",
    "filename": "Presserom mediekontakt pressemeldi",
    "alt": "Tønsberg sentrum sett fra luften",
    "width": 1290,
    "height": 744,
    "sizeBytes": 62040,
    "format": "jpg",
    "folder": "Om oss",
    "tags": [
      "Tønsberg",
      "Om oss"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/utsikt-over-tonsberg-by-og-brygge-.jpg",
    "filename": "Utsikt over tonsberg by og brygge",
    "alt": "Utsikt over Tønsberg by og brygge",
    "width": 768,
    "height": 872,
    "sizeBytes": 71545,
    "format": "jpg",
    "folder": "Om oss",
    "tags": [
      "Tønsberg",
      "Om oss"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/vaare-partnere-sammen-for-tonsberg.jpg",
    "filename": "Vaare partnere sammen for tonsberg",
    "alt": "Gatebildet i Tønsberg sentrum",
    "width": 1600,
    "height": 755,
    "sizeBytes": 112010,
    "format": "jpg",
    "folder": "Om oss",
    "tags": [
      "Tønsberg",
      "Om oss"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/barn-i-byen.jpg",
    "filename": "Barn i byen",
    "alt": "Barn i byen – Tønsberg",
    "width": 1357,
    "height": 1766,
    "sizeBytes": 237729,
    "format": "jpg",
    "folder": "Prosjekter",
    "tags": [
      "Tønsberg",
      "Prosjekter"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/bondens-marked-paa-torvet.jpg",
    "filename": "Bondens marked paa torvet",
    "alt": "Bondens marked paa torvet – Tønsberg",
    "width": 960,
    "height": 503,
    "sizeBytes": 69551,
    "format": "jpg",
    "folder": "Prosjekter",
    "tags": [
      "Tønsberg",
      "Prosjekter"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/gjenbruksmarked.jpg",
    "filename": "Gjenbruksmarked",
    "alt": "Gjenbruksmarked – Tønsberg",
    "width": 1600,
    "height": 1068,
    "sizeBytes": 190698,
    "format": "jpg",
    "folder": "Prosjekter",
    "tags": [
      "Tønsberg",
      "Prosjekter"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/handelens-dager-gode-sommertilbud-.jpg",
    "filename": "Handelens dager gode sommertilbud",
    "alt": "Handelens dager gode sommertilbud – Tønsberg",
    "width": 1600,
    "height": 1200,
    "sizeBytes": 298113,
    "format": "jpg",
    "folder": "Prosjekter",
    "tags": [
      "Tønsberg",
      "Prosjekter"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/hostfest-paa-slottsfjellet.jpg",
    "filename": "Hostfest paa slottsfjellet",
    "alt": "Hostfest paa slottsfjellet – Tønsberg",
    "width": 1600,
    "height": 1143,
    "sizeBytes": 147446,
    "format": "jpg",
    "folder": "Prosjekter",
    "tags": [
      "Tønsberg",
      "Prosjekter"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/innflytterfesten.jpg",
    "filename": "Innflytterfesten",
    "alt": "Innflytterfesten – Tønsberg",
    "width": 1200,
    "height": 675,
    "sizeBytes": 99159,
    "format": "jpg",
    "folder": "Prosjekter",
    "tags": [
      "Tønsberg",
      "Prosjekter"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/jul-i-tonsberg.jpg",
    "filename": "Jul i tonsberg",
    "alt": "Jul i tonsberg – Tønsberg",
    "width": 1170,
    "height": 1440,
    "sizeBytes": 279229,
    "format": "jpg",
    "folder": "Prosjekter",
    "tags": [
      "Tønsberg",
      "Prosjekter"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/nyt-tonsberg-spis-ute-uka.jpg",
    "filename": "Nyt tonsberg spis ute uka",
    "alt": "Nyt tonsberg spis ute uka – Tønsberg",
    "width": 1600,
    "height": 900,
    "sizeBytes": 192098,
    "format": "jpg",
    "folder": "Prosjekter",
    "tags": [
      "Tønsberg",
      "Prosjekter"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/tonsbergdagen.jpg",
    "filename": "Tonsbergdagen",
    "alt": "Tonsbergdagen – Tønsberg",
    "width": 1440,
    "height": 960,
    "sizeBytes": 232586,
    "format": "jpg",
    "folder": "Prosjekter",
    "tags": [
      "Tønsberg",
      "Prosjekter"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/vaare-prosjekter-tonsberglivet-fol.jpg",
    "filename": "Vaare prosjekter tonsberglivet fol",
    "alt": "Folkefest i Tønsberg",
    "width": 1600,
    "height": 1200,
    "sizeBytes": 360259,
    "format": "jpg",
    "folder": "Prosjekter",
    "tags": [
      "Tønsberg",
      "Prosjekter"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/bolaerne-oyene-moutmarka-bekkevika.jpg",
    "filename": "Bolaerne oyene moutmarka bekkevika",
    "alt": "Bolaerne oyene moutmarka bekkevika – Tønsberg",
    "width": 960,
    "height": 502,
    "sizeBytes": 127139,
    "format": "jpg",
    "folder": "Reiselivet",
    "tags": [
      "Tønsberg",
      "Reiselivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/brygge-solnedgang.jpg",
    "filename": "Brygge solnedgang",
    "alt": "Tønsberg Brygge om kvelden",
    "width": 1200,
    "height": 675,
    "sizeBytes": 125588,
    "format": "jpg",
    "folder": "Reiselivet",
    "tags": [
      "Tønsberg",
      "Reiselivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/engo-gaard-hotel-restaurant-havna-.jpg",
    "filename": "Engo gaard hotel restaurant havna",
    "alt": "Engo gaard hotel restaurant havna – Tønsberg",
    "width": 1600,
    "height": 1067,
    "sizeBytes": 274278,
    "format": "jpg",
    "folder": "Reiselivet",
    "tags": [
      "Tønsberg",
      "Reiselivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/engo-gaard-paa-tjome-relative-aspe.jpg",
    "filename": "Engo gaard paa tjome relative aspe",
    "alt": "Engø Gård på Tjøme",
    "width": 1200,
    "height": 675,
    "sizeBytes": 136199,
    "format": "jpg",
    "folder": "Reiselivet",
    "tags": [
      "Tønsberg",
      "Reiselivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/faerder-nasjonalpark-bolaerne-oyen.jpg",
    "filename": "Faerder nasjonalpark bolaerne oyen",
    "alt": "Faerder nasjonalpark bolaerne oyen – Tønsberg",
    "width": 1600,
    "height": 1433,
    "sizeBytes": 342811,
    "format": "jpg",
    "folder": "Reiselivet",
    "tags": [
      "Tønsberg",
      "Reiselivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/faerder-nasjonalpark-og-skjaergaar.jpg",
    "filename": "Faerder nasjonalpark og skjaergaar",
    "alt": "Færder Nasjonalpark og Skjærgården",
    "width": 1200,
    "height": 675,
    "sizeBytes": 108340,
    "format": "jpg",
    "folder": "Reiselivet",
    "tags": [
      "Tønsberg",
      "Reiselivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/havna-hotel-tjome.jpg",
    "filename": "Havna hotel tjome",
    "alt": "Havna hotel tjome – Tønsberg",
    "width": 1200,
    "height": 675,
    "sizeBytes": 79957,
    "format": "jpg",
    "folder": "Reiselivet",
    "tags": [
      "Tønsberg",
      "Reiselivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/havna-hotell-tjome-ved-skjaergaard.jpg",
    "filename": "Havna hotell tjome ved skjaergaard",
    "alt": "Havna Hotell Tjøme ved skjærgården",
    "width": 1600,
    "height": 898,
    "sizeBytes": 224972,
    "format": "jpg",
    "folder": "Reiselivet",
    "tags": [
      "Tønsberg",
      "Reiselivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/hotel-klubben-quality-hotel-tonsbe.jpg",
    "filename": "Hotel klubben quality hotel tonsbe",
    "alt": "Hotel klubben quality hotel tonsbe – Tønsberg",
    "width": 1200,
    "height": 675,
    "sizeBytes": 91492,
    "format": "jpg",
    "folder": "Reiselivet",
    "tags": [
      "Tønsberg",
      "Reiselivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/hotel-klubben-ved-bryggen-relative.jpg",
    "filename": "Hotel klubben ved bryggen relative",
    "alt": "Hotel Klubben ved bryggen",
    "width": 1600,
    "height": 900,
    "sizeBytes": 241975,
    "format": "jpg",
    "folder": "Reiselivet",
    "tags": [
      "Tønsberg",
      "Reiselivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/moutmarka-bekkevika.jpg",
    "filename": "Moutmarka bekkevika",
    "alt": "Moutmarka bekkevika – Tønsberg",
    "width": 1280,
    "height": 853,
    "sizeBytes": 191751,
    "format": "jpg",
    "folder": "Reiselivet",
    "tags": [
      "Tønsberg",
      "Reiselivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/opplev-faerder-tonsbergs-reiseliv-.jpg",
    "filename": "Opplev faerder tonsbergs reiseliv",
    "alt": "Bryggekanten i Tønsberg i kveldssol",
    "width": 1170,
    "height": 1282,
    "sizeBytes": 146406,
    "format": "jpg",
    "folder": "Reiselivet",
    "tags": [
      "Tønsberg",
      "Reiselivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/opplevelser-kulturarv-natur-fra-vi.jpg",
    "filename": "Opplevelser kulturarv natur fra vi",
    "alt": "Verdens Ende og Færder fyr",
    "width": 1600,
    "height": 898,
    "sizeBytes": 143552,
    "format": "jpg",
    "folder": "Reiselivet",
    "tags": [
      "Tønsberg",
      "Reiselivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/overnatting-byhotell-skjaergaardsp.jpg",
    "filename": "Overnatting byhotell skjaergaardsp",
    "alt": "Hotell ved brygga i Tønsberg",
    "width": 1200,
    "height": 675,
    "sizeBytes": 177528,
    "format": "jpg",
    "folder": "Reiselivet",
    "tags": [
      "Tønsberg",
      "Reiselivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/quality-hotel-tonsberg-engo-gaard-.jpg",
    "filename": "Quality hotel tonsberg engo gaard",
    "alt": "Quality hotel tonsberg engo gaard – Tønsberg",
    "width": 1600,
    "height": 1066,
    "sizeBytes": 370682,
    "format": "jpg",
    "folder": "Reiselivet",
    "tags": [
      "Tønsberg",
      "Reiselivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/quality-hotel-tonsberg-takbasseng-.jpg",
    "filename": "Quality hotel tonsberg takbasseng",
    "alt": "Quality Hotel Tønsberg takbasseng",
    "width": 1600,
    "height": 1280,
    "sizeBytes": 66432,
    "format": "jpg",
    "folder": "Reiselivet",
    "tags": [
      "Tønsberg",
      "Reiselivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/slottsfjellet-og-reiselivet-i-tons.jpg",
    "filename": "Slottsfjellet og reiselivet i tons",
    "alt": "Slottsfjellet og Reiselivet i Tønsberg",
    "width": 1000,
    "height": 667,
    "sizeBytes": 71571,
    "format": "jpg",
    "folder": "Reiselivet",
    "tags": [
      "Tønsberg",
      "Reiselivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/slottsfjellet-ruinepark-og-taarnet.jpg",
    "filename": "Slottsfjellet ruinepark og taarnet",
    "alt": "Slottsfjellet ruinepark og Tårnet",
    "width": 1600,
    "height": 1067,
    "sizeBytes": 163278,
    "format": "jpg",
    "folder": "Reiselivet",
    "tags": [
      "Tønsberg",
      "Reiselivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/verdens-ende-vippefyret-faerder-na.jpg",
    "filename": "Verdens ende vippefyret faerder na",
    "alt": "Verdens ende vippefyret faerder na – Tønsberg",
    "width": 1500,
    "height": 982,
    "sizeBytes": 226440,
    "format": "jpg",
    "folder": "Reiselivet",
    "tags": [
      "Tønsberg",
      "Reiselivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/kollektivtransport-tog.jpg",
    "filename": "Kollektivtransport tog",
    "alt": "Kollektivtransport tog – Tønsberg",
    "width": 1200,
    "height": 675,
    "sizeBytes": 99183,
    "format": "jpg",
    "folder": "Studentlivet",
    "tags": [
      "Tønsberg",
      "Studentlivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/kveldsliv-og-samling-paa-brygga-st.jpg",
    "filename": "Kveldsliv og samling paa brygga st",
    "alt": "Kveldsliv og samling på Brygga",
    "width": 1200,
    "height": 675,
    "sizeBytes": 66560,
    "format": "jpg",
    "folder": "Studentlivet",
    "tags": [
      "Tønsberg",
      "Studentlivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/studentbolig-rabatter-studere-ved-.jpg",
    "filename": "Studentbolig rabatter studere ved",
    "alt": "Studenter i Tønsberg",
    "width": 1200,
    "height": 675,
    "sizeBytes": 107391,
    "format": "jpg",
    "folder": "Studentlivet",
    "tags": [
      "Tønsberg",
      "Studentlivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/studentliv-og-samhold-i-tonsberg-s.jpg",
    "filename": "Studentliv og samhold i tonsberg s",
    "alt": "Studentliv og samhold i Tønsberg",
    "width": 1120,
    "height": 1398,
    "sizeBytes": 114171,
    "format": "jpg",
    "folder": "Studentlivet",
    "tags": [
      "Tønsberg",
      "Studentlivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/studentlivet-i-bilder-bilder-fra-u.jpg",
    "filename": "Studentlivet i bilder bilder fra u",
    "alt": "Studenter som tilbringer tid sammen utendørs i Tønsberg",
    "width": 1200,
    "height": 900,
    "sizeBytes": 65287,
    "format": "jpg",
    "folder": "Studentlivet",
    "tags": [
      "Tønsberg",
      "Studentlivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/studentlivet-usn.jpg",
    "filename": "Studentlivet usn",
    "alt": "Studentlivet ved USN Campus Vestfold i Tønsberg",
    "width": 1440,
    "height": 1280,
    "sizeBytes": 165204,
    "format": "jpg",
    "folder": "Studentlivet",
    "tags": [
      "Tønsberg",
      "Studentlivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/studentrabatter-i-sentrum-ung-aren.jpg",
    "filename": "Studentrabatter i sentrum ung aren",
    "alt": "Studentrabatter i sentrum ung aren – Tønsberg",
    "width": 1200,
    "height": 675,
    "sizeBytes": 55090,
    "format": "jpg",
    "folder": "Studentlivet",
    "tags": [
      "Tønsberg",
      "Studentlivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/studentsamskipnaden-ssn-studentrab.jpg",
    "filename": "Studentsamskipnaden ssn studentrab",
    "alt": "Studentsamskipnaden ssn studentrab – Tønsberg",
    "width": 1200,
    "height": 675,
    "sizeBytes": 94823,
    "format": "jpg",
    "folder": "Studentlivet",
    "tags": [
      "Tønsberg",
      "Studentlivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/ung-arena-tonsberg-kollektivtransp.jpg",
    "filename": "Ung arena tonsberg kollektivtransp",
    "alt": "Ung arena tonsberg kollektivtransp – Tønsberg",
    "width": 1488,
    "height": 1204,
    "sizeBytes": 216332,
    "format": "jpg",
    "folder": "Studentlivet",
    "tags": [
      "Tønsberg",
      "Studentlivet"
    ],
    "location": "Tønsberg"
  }
];

async function main() {
  // Bildebanken skal speile filene som faktisk brukes – rydd og fyll på nytt.
  await prisma.image.deleteMany({});
  await prisma.imageFolder.deleteMany({});

  const folderIds = new Map();
  for (const name of FOLDERS) {
    const f = await prisma.imageFolder.create({ data: { name } });
    folderIds.set(name, f.id);
  }

  let created = 0;
  for (const img of IMAGES) {
    await prisma.image.create({
      data: {
        url: img.url,
        filename: img.filename,
        alt: img.alt,
        width: img.width,
        height: img.height,
        sizeBytes: img.sizeBytes,
        format: img.format,
        photographer: 'Tønsberglivet',
        gdprStatus: 'APPROVED',
        tags: img.tags,
        aiTags: [],
        location: img.location,
        folderId: folderIds.get(img.folder) ?? null,
      },
    });
    created++;
  }
  console.log(`Seedet ${created} bilder i ${FOLDERS.length} mapper.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
