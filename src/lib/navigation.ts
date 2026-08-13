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
      { label: 'Nyheter', href: '/nyheter?kategori=bylivet' },
      { label: 'Hva skjer?', href: '/eventer' },
      { label: 'Gavekort', href: '/bylivet/gavekort' },
      { label: 'Torvleie', href: '/bylivet/torvleie' },
      { label: 'Shopping', href: '/bylivet?filter=shopping' },
      { label: 'Mat & drikke', href: '/bylivet?filter=mat-drikke' },
      { label: 'Aktivitet', href: '/bylivet?filter=aktivitet' },
    ],
  },
  {
    label: 'Hverdagslivet',
    href: '/hverdagslivet',
    children: [
      { label: 'Nyheter', href: '/nyheter?kategori=hverdagslivet' },
      { label: '10 gode grunner', href: '/hverdagslivet#grunner' },
    ],
  },
  {
    label: 'Næringslivet',
    href: '/naeringslivet',
    children: [
      { label: 'Nyheter', href: '/nyheter?kategori=naeringslivet' },
      { label: 'Fakta om Tønsberg', href: '/naeringslivet#fakta' },
      { label: 'Bedriftene i Tønsberg', href: '/naeringslivet#bedrifter' },
      { label: 'Næringsarealer', href: '/naeringslivet#arealer' },
      { label: 'Etablering', href: '/naeringslivet#etablering' },
      { label: 'Menneskene & kompetansen', href: '/naeringslivet#kompetanse' },
      { label: 'Kontakt oss', href: '/kontakt' },
    ],
  },
  {
    label: 'Reiselivet',
    href: '/reiselivet',
    children: [
      { label: 'Nyheter', href: '/nyheter?kategori=reiselivet' },
      { label: '10 grunner til å besøke', href: '/reiselivet#grunner' },
      { label: 'Aktivitet', href: '/reiselivet#aktivitet' },
      { label: 'Overnatting', href: '/reiselivet#overnatting' },
      { label: 'Mat & drikke', href: '/reiselivet#mat-drikke' },
      { label: 'Shopping', href: '/reiselivet#shopping' },
    ],
  },
  {
    label: 'Studentlivet',
    href: '/studentlivet',
    children: [
      { label: 'Bolig og økonomi', href: '/studentlivet#bolig' },
      { label: 'Helse og trivsel', href: '/studentlivet#helse' },
      { label: 'Studenttilbud', href: '/studentlivet#tilbud' },
      { label: 'Fritid og nettverk', href: '/studentlivet#fritid' },
    ],
  },
];

export const secondaryNavigation: NavItem[] = [
  { label: 'Om oss', href: '/om-oss' },
  { label: 'Prosjekter', href: '/prosjekter' },
  { label: 'Partnere', href: '/om-oss/partnere' },
  { label: 'Kontakt', href: '/kontakt' },
  { label: 'Presserom', href: '/om-oss/presserom' },
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
    { label: 'Bli partner', href: '/om-oss/partnere#bli-partner' },
  ],
};
