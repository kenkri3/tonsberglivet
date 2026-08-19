/* Navigasjonsdata for hele portalen */

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const navigation: NavItem[] = [
  {
    label: 'Bylivet',
    href: '/bylivet',
    children: [
      { label: 'Oversikt', href: '/bylivet' },
      { label: 'Nyheter', href: '/nyheter?kategori=bylivet' },
      { label: 'Hva skjer?', href: '/eventer' },
      { label: 'Gavekort', href: '/bylivet/gavekort' },
      { label: 'Torvleie', href: '/bylivet/torvleie' },
      { label: 'Shopping', href: '/bylivet/shopping' },
      { label: 'Mat & drikke', href: '/bylivet/mat-og-drikke' },
      { label: 'Aktivitet', href: '/bylivet/aktiviteter' },
    ],
  },
  {
    label: 'Hverdagslivet',
    href: '/hverdagslivet',
    children: [
      { label: 'Bo i Tønsberg', href: '/hverdagslivet' },
      { label: 'Nyheter', href: '/nyheter?kategori=hverdagslivet' },
      { label: '10 gode grunner', href: '/hverdagslivet#grunner' },
    ],
  },
  {
    label: 'Næringslivet',
    href: '/naeringslivet',
    children: [
      { label: 'Næringsoversikt', href: '/naeringslivet' },
      { label: 'Nyheter', href: '/nyheter?kategori=naeringslivet' },
      { label: 'Bedriftene i Tønsberg', href: '/naeringslivet/bedrifter' },
      { label: 'Etablering & Arealer', href: '/naeringslivet/etablering' },
      { label: 'Kontakt oss', href: '/kontakt' },
    ],
  },
  {
    label: 'Reiselivet',
    href: '/reiselivet',
    children: [
      { label: 'Opplev Færder & Tønsberg', href: '/reiselivet' },
      { label: 'Nyheter', href: '/nyheter?kategori=reiselivet' },
      { label: 'Overnatting', href: '/reiselivet/overnatting' },
      { label: 'Opplevelser & Natur', href: '/reiselivet/opplevelser' },
      { label: 'Mat & drikke', href: '/bylivet/mat-og-drikke' },
      { label: 'Shopping', href: '/bylivet/shopping' },
    ],
  },
  {
    label: 'Studentlivet',
    href: '/studentlivet',
    children: [
      { label: 'Student i Tønsberg', href: '/studentlivet' },
      { label: 'Bolig & Rabatter', href: '/studentlivet/bolig-og-rabatter' },
    ],
  },
];

export const secondaryNavigation: NavItem[] = [
  { label: 'Om oss', href: '/om-oss' },
  { label: 'Prosjekter', href: '/prosjekter' },
  { label: 'Partnere', href: '/om-oss/partnere' },
  { label: 'Presserom', href: '/om-oss/presserom' },
  { label: 'Kontakt', href: '/kontakt' },
];

export const footerLinks = {
  omOss: [
    { label: 'Om Tønsberglivet', href: '/om-oss' },
    { label: 'Våre partnere', href: '/om-oss/partnere' },
    { label: 'Prosjekter', href: '/prosjekter' },
    { label: 'Presserom', href: '/om-oss/presserom' },
    { label: 'Kontakt oss', href: '/kontakt' },
  ],
  utforsk: [
    { label: 'Bylivet', href: '/bylivet' },
    { label: 'Hverdagslivet', href: '/hverdagslivet' },
    { label: 'Næringslivet', href: '/naeringslivet' },
    { label: 'Reiselivet', href: '/reiselivet' },
    { label: 'Studentlivet', href: '/studentlivet' },
  ],
  tjenester: [
    { label: 'Hva skjer?', href: '/eventer' },
    { label: 'Nyheter', href: '/nyheter' },
    { label: 'Gavekort', href: '/bylivet/gavekort' },
    { label: 'Torvleie', href: '/bylivet/torvleie' },
    { label: 'Bli partner', href: '/om-oss/partnere' },
  ],
};
