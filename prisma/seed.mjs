/**
 * Seed for bildebanken.
 *
 * Fyller Image/ImageFolder med de ekte Tønsberg-bildene som ligger i
 * public/images/tonsberg. Hvert bilde brukes på nøyaktig én plass i nettstedet,
 * og alle er hentet fra Tønsberglivet sitt eget bildearkiv – ingen arkiv-,
 * stock- eller AI-bilder.
 *
 * Tittel og alt-tekst er hentet fra det siden faktisk viser, så bildebanken
 * beskriver bildene med samme ord som skjermleseren får.
 *
 * Kjøres med:  npm run db:seed
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role, ArticleCategory, TaskStatus, TaskPriority } from '@prisma/client';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

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
    "filename": "Dirigent foran publikum på Slottsfjellfestivalen",
    "alt": "Dirigent foran publikum på Slottsfjellfestivalen",
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
    "filename": "Barista som lager kaffe på kafé i Tønsberg",
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
    "url": "/images/tonsberg/mat-drikke-uteservering-paa-brygga.jpg",
    "filename": "Barn ved bordet utenfor en rød sjøbod",
    "alt": "Barn ved bordet utenfor en rød sjøbod",
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
    "url": "/images/tonsberg/barnas-tonsberg-paa-torvet.jpg",
    "filename": "Barnas Tønsberg",
    "alt": "Barnas Tønsberg",
    "width": 1536,
    "height": 2048,
    "sizeBytes": 379338,
    "format": "jpg",
    "folder": "Bylivet",
    "tags": [
      "Tønsberg",
      "Bylivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/buffet-under-spis-ute-uka-i-tonsbe.jpg",
    "filename": "Buffet under Spis Ute Uka i Tønsberg",
    "alt": "Buffet under Spis Ute Uka i Tønsberg",
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
    "url": "/images/tonsberg/barista-som-lager-kaffe-paa-kaf-i--3.jpg",
    "filename": "Burger og pommes frites på kafé i Tønsberg",
    "alt": "Burger og pommes frites på kafé i Tønsberg",
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
    "url": "/images/tonsberg/butikkvindu-med-lyskrone-i-tonsber.jpg",
    "filename": "Butikkvindu med lyskrone i Tønsberg sentrum",
    "alt": "Butikkvindu med lyskrone i Tønsberg sentrum",
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
    "url": "/images/tonsberg/farmandstredet-kjopesenter-tonsber.jpg",
    "filename": "Farmandstredet Kjøpesenter",
    "alt": "Farmandstredet Kjøpesenter",
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
    "url": "/images/tonsberg/fest-med-lilla-lyssetting-i-tonsbe.jpg",
    "filename": "Fest med lilla lyssetting i Tønsberg",
    "alt": "Fest med lilla lyssetting i Tønsberg",
    "width": 1600,
    "height": 1068,
    "sizeBytes": 220359,
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
    "filename": "Fire kvinner i hvitt tøy",
    "alt": "Fire kvinner i hvitt tøy",
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
    "url": "/images/tonsberg/folkefest-med-flaggborter-i-tonsbe.jpg",
    "filename": "Folkefest med flaggborter i Tønsberg",
    "alt": "Folkefest med flaggborter i Tønsberg",
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
    "url": "/images/tonsberg/shopping-i-tonsberg-unike-nisjebut.jpg",
    "filename": "Folkeliv i handlegaten i Tønsberg",
    "alt": "Folkeliv i handlegaten i Tønsberg",
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
    "url": "/images/tonsberg/bylivet-i-tonsberg-i-bilder-bildeg.jpg",
    "filename": "Folkeliv på brygga i Tønsberg en sommerkveld",
    "alt": "Folkeliv på brygga i Tønsberg en sommerkveld",
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
    "url": "/images/tonsberg/folkemengde-paa-tonsberg-torv-mark.jpg",
    "filename": "Folkemengde på Tønsberg Torv",
    "alt": "Folkemengde på Tønsberg Torv",
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
    "url": "/images/tonsberg/gjester-paa-restaurant-i-tonsberg-.jpg",
    "filename": "Gjester på restaurant i Tønsberg",
    "alt": "Gjester på restaurant i Tønsberg",
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
    "url": "/images/tonsberg/butikkvindu-med-lyskrone-i-tonsber-2.jpg",
    "filename": "Julepyntet gate i Tønsberg sentrum",
    "alt": "Julepyntet gate i Tønsberg sentrum",
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
    "url": "/images/tonsberg/kajakk-padling-padle-gjennom-kanal.jpg",
    "filename": "Kajakk & Padling",
    "alt": "Kajakk & Padling",
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
    "url": "/images/tonsberg/kvinne-som-danser-paa-tonsberg-tor.jpg",
    "filename": "Kvinne som danser på Tønsberg Torv",
    "alt": "Kvinne som danser på Tønsberg Torv",
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
    "url": "/images/tonsberg/kvinne-ved-en-blomster-og-gronnsak.jpg",
    "filename": "Kvinne ved en blomster- og grønnsaksbod i Tønsberg",
    "alt": "Kvinne ved en blomster- og grønnsaksbod i Tønsberg",
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
    "url": "/images/tonsberg/langbord-med-folk-paa-matfestival-.jpg",
    "filename": "Langbord med folk på matfestival i Tønsberg",
    "alt": "Langbord med folk på matfestival i Tønsberg",
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
    "url": "/images/tonsberg/barista-som-lager-kaffe-paa-kaf-i--4.jpg",
    "filename": "Makroner i disken på en kafé i Tønsberg",
    "alt": "Makroner i disken på en kafé i Tønsberg",
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
    "url": "/images/tonsberg/butikkvindu-med-lyskrone-i-tonsber-3.jpg",
    "filename": "Markedsbod med saft og grønnsaker i Tønsberg",
    "alt": "Markedsbod med saft og grønnsaker i Tønsberg",
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
    "url": "/images/tonsberg/markedsbod-med-smykker-paa-tonsber.jpg",
    "filename": "Markedsbod med smykker på Tønsberg Torv",
    "alt": "Markedsbod med smykker på Tønsberg Torv",
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
    "url": "/images/tonsberg/markedsboder-med-klaer-paa-tonsber.jpg",
    "filename": "Markedsboder med klær på Tønsberg Torv",
    "alt": "Markedsboder med klær på Tønsberg Torv",
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
    "url": "/images/tonsberg/matglede-interior-design-skandinav.jpg",
    "filename": "Matglede, Interiør & Design",
    "alt": "Matglede, Interiør & Design",
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
    "filename": "Nisjebutikker & Mote",
    "alt": "Nisjebutikker & Mote",
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
    "url": "/images/tonsberg/oseberg-kulturhus-scene-konserter.jpg",
    "filename": "Oseberg Kulturhus",
    "alt": "Oseberg Kulturhus",
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
    "url": "/images/tonsberg/barista-som-lager-kaffe-paa-kaf-i--2.jpg",
    "filename": "Servering av lokal mat på marked i Tønsberg",
    "alt": "Servering av lokal mat på marked i Tønsberg",
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
    "url": "/images/tonsberg/slottsfjellet-taarnet-paa-aasen.jpg",
    "filename": "Slottsfjellet & Tårnet",
    "alt": "Slottsfjellet & Tårnet",
    "width": 1600,
    "height": 900,
    "sizeBytes": 294691,
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
    "filename": "Torvhandler med keramikk på Tønsberg Torv",
    "alt": "Torvhandler med keramikk på Tønsberg Torv",
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
    "url": "/images/tonsberg/tonsberg-bibliotek-byliv-kulturmot.jpg",
    "filename": "Tønsberg Bibliotek & Byliv",
    "alt": "Tønsberg Bibliotek & Byliv",
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
    "url": "/images/tonsberg/tonsberg-brygge-om-kvelden-absolut.jpg",
    "filename": "Tønsberg Brygge om kvelden",
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
    "filename": "Tønsberg Torv & Markedsplass",
    "alt": "Tønsberg Torv & Markedsplass",
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
    "url": "/images/tonsberg/tonsberg-torv-med-domkirken-i-bakg.jpg",
    "filename": "Tønsberg Torv med Domkirken i bakgrunnen",
    "alt": "Tønsberg Torv med Domkirken i bakgrunnen",
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
    "url": "/images/tonsberg/kultur-aktiviteter-historie-teater.jpg",
    "filename": "Utendørskonsert i Tønsberg",
    "alt": "Utendørskonsert i Tønsberg",
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
    "filename": "Vikingodden & Oseberg",
    "alt": "Vikingodden & Oseberg",
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
    "url": "/images/tonsberg/band-som-opptrer-i-tonsberg-studen.jpg",
    "filename": "Band som opptrer i tonsberg studen",
    "alt": "Band som opptrer i tonsberg studen",
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
    "url": "/images/tonsberg/barnepublikum-foran-en-utendorssce.jpg",
    "filename": "Barnepublikum foran en utendørsscene i Tønsberg",
    "alt": "Barnepublikum foran en utendørsscene i Tønsberg",
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
    "url": "/images/tonsberg/byggekran-mot-kveldshimmelen-i-ton.jpg",
    "filename": "Byggekran mot kveldshimmelen i ton",
    "alt": "Byggekran mot kveldshimmelen i ton",
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
    "url": "/images/tonsberg/dagens-program-paa-torvet-sommer-k.jpg",
    "filename": "Dagens program paa torvet sommer k",
    "alt": "Dagens program paa torvet sommer k",
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
    "alt": "Faerderbiennalen havneliv smak paa",
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
    "url": "/images/tonsberg/familie-som-spiser-uteservering-pa.jpg",
    "filename": "Familie som spiser uteservering på brygga",
    "alt": "Familie som spiser uteservering på brygga",
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
    "url": "/images/tonsberg/folk-i-gatene-ved-brygga-i-tonsber.jpg",
    "filename": "Folk i gatene ved brygga i Tønsberg",
    "alt": "Folk i gatene ved brygga i Tønsberg",
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
    "url": "/images/tonsberg/foynhagen-utendoersscene.jpg",
    "filename": "Foynhagen utendoersscene",
    "alt": "Foynhagen utendoersscene",
    "width": 1600,
    "height": 1067,
    "sizeBytes": 305790,
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
    "alt": "Generelt heritage",
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
    "filename": "Generelt heritage (2)",
    "alt": "Generelt heritage (2)",
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
    "url": "/images/tonsberg/generelt-heritage.jpg",
    "filename": "Generelt heritage (3)",
    "alt": "Generelt heritage (3)",
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
    "url": "/images/tonsberg/generelt-ticketmaster.jpg",
    "filename": "Generelt ticketmaster",
    "alt": "Generelt ticketmaster",
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
    "url": "/images/tonsberg/konsert-i-foynhagen-livemusikk-ved.jpg",
    "filename": "Konsert i foynhagen livemusikk ved",
    "alt": "Konsert i foynhagen livemusikk ved",
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
    "url": "/images/tonsberg/kvinne-med-gaveeske-i-en-butikk-st.jpg",
    "filename": "Kvinne med gaveeske i en butikk",
    "alt": "Kvinne med gaveeske i en butikk",
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
    "url": "/images/tonsberg/kvinne-med-kaffekopp-i-en-sofa-hje.jpg",
    "filename": "Kvinne med kaffekopp i en sofa hje",
    "alt": "Kvinne med kaffekopp i en sofa hje",
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
    "url": "/images/tonsberg/matmarked-lokale-raavarer-besok-bo.jpg",
    "filename": "Matmarked lokale raavarer besok bo",
    "alt": "Matmarked lokale raavarer besok bo",
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
    "alt": "Matmarked torvleie i helgen kortre",
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
    "url": "/images/tonsberg/slottsfjellet-luftfoto-festomraadet.jpg",
    "filename": "Middelalderfigurer ved Slottsfjellet om kvelden",
    "alt": "Middelalderfigurer ved Slottsfjellet om kvelden",
    "width": 1600,
    "height": 1200,
    "sizeBytes": 369835,
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
    "alt": "Nordens storste middelalderborg og",
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
    "url": "/images/tonsberg/opplyst-paviljong-med-publikum-i-t.jpg",
    "filename": "Opplyst paviljong med publikum i t",
    "alt": "Opplyst paviljong med publikum i t",
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
    "url": "/images/tonsberg/picnic-paa-svabergene-i-faerder-na.jpg",
    "filename": "Picnic på svabergene i Færder nasjonalpark",
    "alt": "Picnic på svabergene i Færder nasjonalpark",
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
    "url": "/images/tonsberg/slottsfjellet-taarnet-festival.jpg",
    "filename": "Slottsfjellet taarnet festival",
    "alt": "Slottsfjellet taarnet festival",
    "width": 1600,
    "height": 900,
    "sizeBytes": 299165,
    "format": "jpg",
    "folder": "Generelt",
    "tags": [
      "Tønsberg",
      "Generelt"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/solnedgang-over-byfjorden-med-slot.jpg",
    "filename": "Solnedgang over byfjorden med Slottsfjellstårnet",
    "alt": "Solnedgang over byfjorden med Slottsfjellstårnet",
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
    "url": "/images/tonsberg/stand-med-lokalproduserte-varer-in.jpg",
    "filename": "Stand med lokalproduserte varer innendørs i Tønsberg",
    "alt": "Stand med lokalproduserte varer innendørs i Tønsberg",
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
    "url": "/images/tonsberg/student-park.jpg",
    "filename": "Studenter på plenen ved USN Campus Vestfold",
    "alt": "Studenter på plenen ved USN Campus Vestfold",
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
    "url": "/images/tonsberg/hero-aerial.jpg",
    "filename": "Tønsberg Brygge og byfjorden sett fra luften",
    "alt": "Tønsberg Brygge og byfjorden sett fra luften",
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
    "url": "/images/tonsberg/utsikt-mot-slottsfjellet-over-byfj.jpg",
    "filename": "Utsikt mot Slottsfjellet over Byfjorden i Tønsberg",
    "alt": "Utsikt mot Slottsfjellet over Byfjorden i Tønsberg",
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
    "url": "/images/tonsberg/hverdagslivet-i-tonsberg-i-bilder-.jpg",
    "filename": "Boligområde med bekk og lekende barn i Tønsberg",
    "alt": "Boligområde med bekk og lekende barn i Tønsberg",
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
    "url": "/images/tonsberg/gutter-som-hopper-i-sjoen-i-tonsbe.jpg",
    "filename": "Gutter som hopper i sjøen i Tønsberg",
    "alt": "Gutter som hopper i sjøen i Tønsberg",
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
    "url": "/images/tonsberg/maskotene-ellie-og-timba-paa-tonsb.jpg",
    "filename": "Maskotene Ellie og Timba på Tønsberg Torv",
    "alt": "Maskotene Ellie og Timba på Tønsberg Torv",
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
    "url": "/images/tonsberg/solstoler-med-slottsfjellstaarnet-.jpg",
    "filename": "Solstoler med Slottsfjellstårnet i bakgrunnen",
    "alt": "Solstoler med Slottsfjellstårnet i bakgrunnen",
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
    "url": "/images/tonsberg/gruppe-i-dress-foran-en-gullvegg-i.jpg",
    "filename": "Gruppe i dress foran en gullvegg i Tønsberg",
    "alt": "Gruppe i dress foran en gullvegg i Tønsberg",
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
    "filename": "Tønsberg stasjonsområde sett fra luften",
    "alt": "Tønsberg stasjonsområde sett fra luften",
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
    "url": "/images/tonsberg/nyheter-siste-nytt-fra-tonsberg-fo.jpg",
    "filename": "Folkemengde på brygga i Tønsberg",
    "alt": "Folkemengde på brygga i Tønsberg",
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
    "url": "/images/tonsberg/foynkvartalet-bryggekanten-kaldnes.jpg",
    "filename": "Foynkvartalet & Bryggekanten",
    "alt": "Foynkvartalet & Bryggekanten",
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
    "url": "/images/tonsberg/gruppebilde-ute-i-tonsberg-absolut.jpg",
    "filename": "Gruppebilde ute i Tønsberg",
    "alt": "Gruppebilde ute i Tønsberg",
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
    "url": "/images/tonsberg/kaldnes-vest-sjofronten-statens-pa.jpg",
    "filename": "Kaldnes Vest & Sjøfronten",
    "alt": "Kaldnes Vest & Sjøfronten",
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
    "url": "/images/tonsberg/arbeidsliv-verneutstyr.jpg",
    "filename": "Lærling med hørselsvern og vernebriller",
    "alt": "Lærling med hørselsvern og vernebriller",
    "width": 1200,
    "height": 675,
    "sizeBytes": 63311,
    "format": "jpg",
    "folder": "Næringslivet",
    "tags": [
      "Tønsberg",
      "Næringslivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/mann-med-sykkel-i-tonsberg-sentrum.jpg",
    "filename": "Mann med sykkel i Tønsberg sentrum",
    "alt": "Mann med sykkel i Tønsberg sentrum",
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
    "url": "/images/tonsberg/etablering-naeringsarealer-etabler.jpg",
    "filename": "Næringsbygg med Skagerrak Sparebank i Tønsberg",
    "alt": "Næringsbygg med Skagerrak Sparebank i Tønsberg",
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
    "url": "/images/tonsberg/statens-park-regional-klynge-for-h.jpg",
    "filename": "Statens Park",
    "alt": "Statens Park",
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
    "url": "/images/tonsberg/naeringsareal-under-utbygging.jpg",
    "filename": "Tønsberg Stasjonsområde",
    "alt": "Tønsberg Stasjonsområde",
    "width": 1290,
    "height": 1402,
    "sizeBytes": 319536,
    "format": "jpg",
    "folder": "Næringslivet",
    "tags": [
      "Tønsberg",
      "Næringslivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/om-tonsberglivet-hvem-er-vi-bolige.jpg",
    "filename": "Boliger langs kanalen i Tønsberg",
    "alt": "Boliger langs kanalen i Tønsberg",
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
    "url": "/images/tonsberg/vaare-partnere-sammen-for-tonsberg.jpg",
    "filename": "Fire kvinner fra partnerbedriftene i Tønsberg",
    "alt": "Fire kvinner fra partnerbedriftene i Tønsberg",
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
    "url": "/images/tonsberg/presserom-mediekontakt-pressemeldi.jpg",
    "filename": "Havneområde med kran i Tønsberg",
    "alt": "Havneområde med kran i Tønsberg",
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
    "url": "/images/tonsberg/prisutdeling-med-diplom-og-blomste.jpg",
    "filename": "Prisutdeling med diplom og blomster",
    "alt": "Prisutdeling med diplom og blomster",
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
    "url": "/images/tonsberg/barn-i-byen.jpg",
    "filename": "Barn i byen",
    "alt": "Barn i byen",
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
    "filename": "Bondens marked på Torvet",
    "alt": "Bondens marked på Torvet",
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
    "alt": "Gjenbruksmarked",
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
    "filename": "Handelens dager",
    "alt": "Handelens dager",
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
    "filename": "Høstfest på Slottsfjellet",
    "alt": "Høstfest på Slottsfjellet",
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
    "alt": "Innflytterfesten",
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
    "filename": "Jul i Tønsberg",
    "alt": "Jul i Tønsberg",
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
    "filename": "Nyt Tønsberg — Spis Ute Uka",
    "alt": "Nyt Tønsberg — Spis Ute Uka",
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
    "filename": "Tønsbergdagen",
    "alt": "Tønsbergdagen",
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
    "url": "/images/tonsberg/tonsbergprisen-utdeling.jpg",
    "filename": "Utdeling av Tønsbergprisen 2024",
    "alt": "Utdeling av Tønsbergprisen 2024",
    "width": 1600,
    "height": 1068,
    "sizeBytes": 310896,
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
    "filename": "Bolærne Øyene",
    "alt": "Bolærne Øyene",
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
    "url": "/images/tonsberg/engo-gaard-hotel-restaurant-havna-.jpg",
    "filename": "Engø Gård Hotel & Restaurant",
    "alt": "Engø Gård Hotel & Restaurant",
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
    "url": "/images/tonsberg/faerder-nasjonalpark-bolaerne-oyen.jpg",
    "filename": "Færder Nasjonalpark",
    "alt": "Færder Nasjonalpark",
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
    "url": "/images/tonsberg/havna-hotel-tjome.jpg",
    "filename": "Havna Hotel Tjøme",
    "alt": "Havna Hotel Tjøme",
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
    "url": "/images/tonsberg/hotel-klubben-quality-hotel-tonsbe.jpg",
    "filename": "Hotel Klubben",
    "alt": "Hotel Klubben",
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
    "url": "/images/tonsberg/jordbrukslandskap-paa-tjome-relati.jpg",
    "filename": "Jordbrukslandskap på Tjøme",
    "alt": "Jordbrukslandskap på Tjøme",
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
    "url": "/images/tonsberg/kvinne-i-middelalderdrakt-paa-slot.jpg",
    "filename": "Kvinne i middelalderdrakt på Slottsfjellet",
    "alt": "Kvinne i middelalderdrakt på Slottsfjellet",
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
    "url": "/images/tonsberg/opplev-faerder-tonsbergs-reiseliv-.jpg",
    "filename": "Kvinne ved sjøen i Færder",
    "alt": "Kvinne ved sjøen i Færder",
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
    "url": "/images/tonsberg/overnatting-byhotell-skjaergaardsp.jpg",
    "filename": "Marina med seilbåter i Tønsberg",
    "alt": "Marina med seilbåter i Tønsberg",
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
    "url": "/images/tonsberg/moutmarka-bekkevika.jpg",
    "filename": "Moutmarka & Bekkevika",
    "alt": "Moutmarka & Bekkevika",
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
    "url": "/images/tonsberg/morkt-lokale-med-lyssetting-i-tons.jpg",
    "filename": "Mørkt lokale med lyssetting i Tønsberg",
    "alt": "Mørkt lokale med lyssetting i Tønsberg",
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
    "url": "/images/tonsberg/quality-hotel-tonsberg-engo-gaard-.jpg",
    "filename": "Quality Hotel Tønsberg",
    "alt": "Quality Hotel Tønsberg",
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
    "url": "/images/tonsberg/seilskip-ved-brygga-i-tonsberg-rel.jpg",
    "filename": "Seilskip ved brygga i Tønsberg",
    "alt": "Seilskip ved brygga i Tønsberg",
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
    "url": "/images/tonsberg/sjobod-og-badegjester-ved-vannet-p.jpg",
    "filename": "Sjøbod og badegjester ved vannet på Tjøme",
    "alt": "Sjøbod og badegjester ved vannet på Tjøme",
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
    "url": "/images/tonsberg/brygge-solnedgang.jpg",
    "filename": "Solnedgang over Tønsberg Brygge med Slottsfjellet i bakgrunnen",
    "alt": "Solnedgang over Tønsberg Brygge med Slottsfjellet i bakgrunnen",
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
    "url": "/images/tonsberg/reiselivet-storgaten-vinter.jpg",
    "filename": "Storgaten i Tønsberg i vinterstemning",
    "alt": "Storgaten i Tønsberg i vinterstemning",
    "width": 1600,
    "height": 1067,
    "sizeBytes": 273968,
    "format": "jpg",
    "folder": "Reiselivet",
    "tags": [
      "Tønsberg",
      "Reiselivet"
    ],
    "location": "Tønsberg"
  },
  {
    "url": "/images/tonsberg/tonsberg-by-og-kanal-sett-fra-luft.jpg",
    "filename": "Tønsberg by og kanal sett fra luften",
    "alt": "Tønsberg by og kanal sett fra luften",
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
    "url": "/images/tonsberg/verdens-ende-vippefyret-faerder-na.jpg",
    "filename": "Verdens Ende & Vippefyret",
    "alt": "Verdens Ende & Vippefyret",
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
    "url": "/images/tonsberg/opplevelser-kulturarv-natur-fra-vi.jpg",
    "filename": "Vippefyret på Verdens Ende",
    "alt": "Vippefyret på Verdens Ende",
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
    "url": "/images/tonsberg/kollektivtransport-tog-aktiviteter.jpg",
    "filename": "Aktiviteter om bord på et skip i Tønsberg",
    "alt": "Aktiviteter om bord på et skip i Tønsberg",
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
    "url": "/images/tonsberg/foredrag-paa-en-scene-i-tonsberg-k.jpg",
    "filename": "Foredrag på en scene i Tønsberg",
    "alt": "Foredrag på en scene i Tønsberg",
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
    "url": "/images/tonsberg/ung-arena-tonsberg-lopegruppe-fora.jpg",
    "filename": "Løpegruppe foran butikkene i Tønsberg",
    "alt": "Løpegruppe foran butikkene i Tønsberg",
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
  },
  {
    "url": "/images/tonsberg/studentbolig-rabatter-studere-ved-.jpg",
    "filename": "Strandpromenade med studentboliger i Tønsberg",
    "alt": "Strandpromenade med studentboliger i Tønsberg",
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
    "url": "/images/tonsberg/studentsamskipnaden-ssn-student-so.jpg",
    "filename": "Student som leser en bok",
    "alt": "Student som leser en bok",
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
    "url": "/images/tonsberg/studentlivet-usn.jpg",
    "filename": "Studenter i gangen på USN Campus Vestfold",
    "alt": "Studenter i gangen på USN Campus Vestfold",
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
    "url": "/images/tonsberg/studentfest-med-norsk-flagg-studen.jpg",
    "filename": "Studentfest med norsk flagg",
    "alt": "Studentfest med norsk flagg",
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
    "url": "/images/tonsberg/studentrabatter-i-sentrum-ungdom-s.jpg",
    "filename": "Ungdom som heier i Tønsberg sentrum",
    "alt": "Ungdom som heier i Tønsberg sentrum",
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
    "url": "/images/tonsberg/studentlivet-i-bilder-bilder-fra-u.jpg",
    "filename": "Videosamtale på et nettbrett",
    "alt": "Videosamtale på et nettbrett",
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

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function seedTeamAndContent() {
  console.log('--- Seeder team, brukere, artikler og oppgaver ---');
  const adminPassword = process.env.ADMIN_PASSWORD || 'Tonsberg2026!';
  const hashedAdminPassword = hashPassword(adminPassword);

  const kenneth = await prisma.user.upsert({
    where: { email: 'kenkri3@gmail.com' },
    update: { name: 'Kenneth Kristiansen', role: Role.ADMIN, title: 'Systemadministrator & Eier', active: true, password: hashedAdminPassword },
    create: { email: 'kenkri3@gmail.com', name: 'Kenneth Kristiansen', role: Role.ADMIN, title: 'Systemadministrator & Eier', active: true, password: hashedAdminPassword },
  });

  const cecilie = await prisma.user.upsert({
    where: { email: 'cecilie@tonsberglivet.no' },
    update: { name: 'Cecilie Bækken Dahl', role: Role.ADMIN, title: 'Daglig leder, Tønsberglivet', active: true, password: hashedAdminPassword },
    create: { email: 'cecilie@tonsberglivet.no', name: 'Cecilie Bækken Dahl', role: Role.ADMIN, title: 'Daglig leder, Tønsberglivet', active: true, password: hashedAdminPassword },
  });

  const editor = await prisma.user.upsert({
    where: { email: 'redaksjon@tonsberglivet.no' },
    update: { name: 'Redaksjonen Tønsberglivet', role: Role.EDITOR, title: 'Innholdsredaktør & Kommunikasjon', active: true, password: hashPassword('Redaksjon2026!') },
    create: { email: 'redaksjon@tonsberglivet.no', name: 'Redaksjonen Tønsberglivet', role: Role.EDITOR, title: 'Innholdsredaktør & Kommunikasjon', active: true, password: hashPassword('Redaksjon2026!') },
  });

  // Artikler
  const articleCount = await prisma.article.count();
  if (articleCount === 0) {
    const archivePath = path.join(process.cwd(), 'src', 'data', 'news-archive.json');
    if (fs.existsSync(archivePath)) {
      const newsArchive = JSON.parse(fs.readFileSync(archivePath, 'utf8'));
      const categoryMap = {
        BYLIVET: ArticleCategory.BYLIVET,
        HVERDAGSLIVET: ArticleCategory.HVERDAGSLIVET,
        NAERINGSLIVET: ArticleCategory.NAERINGSLIVET,
        REISELIVET: ArticleCategory.REISELIVET,
        STUDENTLIVET: ArticleCategory.STUDENTLIVET,
      };
      for (const item of newsArchive) {
        const cat = categoryMap[item.category] || ArticleCategory.BYLIVET;
        const bodyContent = (item.blocks || []).map((b) => (b.type === 'quote' ? `> ${b.text}` : b.text)).join('\n\n');
        try {
          await prisma.article.create({
            data: {
              title: item.title,
              slug: item.slug || item.id,
              excerpt: item.excerpt || null,
              content: bodyContent || item.excerpt || item.title,
              category: cat,
              published: true,
              publishedAt: item.publishedAt ? new Date(item.publishedAt) : new Date(),
              authorId: cecilie.id,
            },
          });
        } catch (e) {}
      }
    }
  }

  // Tasks
  const taskCount = await prisma.teamTask.count();
  if (taskCount === 0) {
    await prisma.teamTask.createMany({
      data: [
        { title: 'Korrektur på høstprogrammet for Tønsberg Torv', description: 'Gå gjennom datoer, utstillere og tillatelser for torvleie.', status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, assignedToId: cecilie.id, createdById: kenneth.id },
        { title: 'Gjennomgå nye bedriftsprofiler fra Brønnøysund', description: 'Kvalitetssikre kategorier og kontaktinfo for nylig etablerte selskaper.', status: TaskStatus.PENDING, priority: TaskPriority.MEDIUM, assignedToId: editor.id, createdById: cecilie.id },
        { title: 'Oppdatere bildebank med høstbilder', description: 'Sikre at alle bilder har godkjent GDPR-status og korrekte alt-tekster.', status: TaskStatus.COMPLETED, priority: TaskPriority.LOW, assignedToId: editor.id, createdById: cecilie.id },
      ],
    });
  }

  // Notes
  const noteCount = await prisma.internalNote.count();
  if (noteCount === 0) {
    await prisma.internalNote.create({
      data: {
        content: 'Velkommen til Tønsberglivet Team & Samhandling! Her kan redaksjonen og ledelsen samarbeide om artikler, torvleie, arrangementer og daglige oppgaver på tvers av enheter.',
        pinned: true,
        authorId: cecilie.id,
      },
    });
  }

  // Activity
  const actCount = await prisma.activityLog.count();
  if (actCount === 0) {
    await prisma.activityLog.createMany({
      data: [
        { userName: 'Kenneth Kristiansen', userEmail: 'kenkri3@gmail.com', userRole: 'ADMIN', action: 'SYSTEM_INITIALIZED', details: 'Initialiserte PostgreSQL database og koblet til Railway produksjon.', targetType: 'System' },
        { userName: 'Kenneth Kristiansen', userEmail: 'kenkri3@gmail.com', userRole: 'ADMIN', action: 'TEAM_MODULE_ACTIVATED', details: 'Aktiverte Team & Samhandlingshub med brukeradministrasjon, oppgaver og notater.', targetType: 'User' },
        { userName: 'Cecilie Bækken Dahl', userEmail: 'cecilie@tonsberglivet.no', userRole: 'ADMIN', action: 'CONTENT_SYNCED', details: 'Synkroniserte artikler og bildebank med det offisielle arkivet for Tønsberg.', targetType: 'Article' },
      ],
    });
  }
}
