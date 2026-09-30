// Official Beaches & Bathing Water Quality Service for Tønsberg & Færder
// Public data from Tønsberg kommune, Færder kommune and FHI

export interface BeachSpot {
  id: string;
  name: string;
  municipality: 'Tønsberg' | 'Færder';
  type: 'Sandstrand' | 'Svaberg' | 'Gresslette' | 'Kombinasjon';
  waterQuality: 'Utmerket' | 'God' | 'Mindre god';
  facilities: string[];
  hasWheelchairRamp: boolean;
  hasDivingTower: boolean;
  hasKiosk: boolean;
  busConnection: string;
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export const OFFICIAL_BEACHES: BeachSpot[] = [
  {
    id: 'ringshaugstranda',
    name: 'Ringshaugstranda',
    municipality: 'Tønsberg',
    type: 'Sandstrand',
    waterQuality: 'Utmerket',
    facilities: ['Toalettanlegg', 'Kiosk & Servering', 'Rullestolrampe ut i vannet', 'Stupebrygge', 'Volleyballbane', 'Stor P-plass'],
    hasWheelchairRamp: true,
    hasDivingTower: true,
    hasKiosk: true,
    busConnection: 'Buss 116 / 115 fra Tønsberg Rutebilstasjon',
    description: 'Tønsbergs mest kjente og populære sandstrand. Langgrunt, barnevennlig og med fantastisk utsikt mot Oslofjorden.',
    coordinates: { lat: 59.2612, lng: 10.4935 }
  },
  {
    id: 'skallevoldstranda',
    name: 'Skallevoldstranda',
    municipality: 'Tønsberg',
    type: 'Sandstrand',
    waterQuality: 'Utmerket',
    facilities: ['Toaletter', 'Lekeplass', 'Grillplass', 'Kyststi', 'P-plass'],
    hasWheelchairRamp: true,
    hasDivingTower: false,
    hasKiosk: false,
    busConnection: 'Buss 116 mot Skallevold',
    description: 'Flott, roligere sandstrand med store gressletter, populær for barnefamilier og brettseilere/kitere.',
    coordinates: { lat: 59.2780, lng: 10.4850 }
  },
  {
    id: 'karlsvika',
    name: 'Karlsvika & Karlsvikodden',
    municipality: 'Tønsberg',
    type: 'Kombinasjon',
    waterQuality: 'Utmerket',
    facilities: ['Toalett', 'Rastebenker', 'Gressletter', 'Svaberg'],
    hasWheelchairRamp: false,
    hasDivingTower: false,
    hasKiosk: false,
    busConnection: 'Buss 116',
    description: 'Naturskjønn bukt og odde med flott blanding av gressbakker, rullesteiner og blanke badesvaberg langs kyststien.',
    coordinates: { lat: 59.2850, lng: 10.4780 }
  },
  {
    id: 'fjaerholmen',
    name: 'Fjærholmen Badestrand',
    municipality: 'Færder',
    type: 'Sandstrand',
    waterQuality: 'Utmerket',
    facilities: ['Toaletter', 'Kiosk', 'Badebrygge', 'Seilsenter', 'Volleyballbane'],
    hasWheelchairRamp: true,
    hasDivingTower: true,
    hasKiosk: true,
    busConnection: 'Buss 115 til Fjærholmen',
    description: 'Ytterst på Nøtterøy med utsikt mot Bolærne-skjærgården. Kombinerer herlig badeliv med Tønsberg Seilforenings anlegg.',
    coordinates: { lat: 59.2278, lng: 10.4589 }
  },
  {
    id: 'lilleskagen',
    name: 'Lilleskagen (Hvasser)',
    municipality: 'Færder',
    type: 'Sandstrand',
    waterQuality: 'Utmerket',
    facilities: ['Utedo', 'Søppelkasser', 'Tursti'],
    hasWheelchairRamp: false,
    hasDivingTower: false,
    hasKiosk: false,
    busConnection: 'Buss 02 til Sandøsund, deretter kyststi',
    description: 'Kåret til en av Norges vakreste strender med finkornet hvit skjellsand og krystallklart vann midt i Færder nasjonalpark.',
    coordinates: { lat: 59.0754, lng: 10.4512 }
  }
];

export async function fetchBeaches(): Promise<BeachSpot[]> {
  return OFFICIAL_BEACHES;
}
