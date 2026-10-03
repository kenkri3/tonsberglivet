// Riksantikvaren & Kulturminnesøk Service for Tønsberglivet
// Official heritage data for Norway's oldest town (founded 871 AD)

export interface HeritageSite {
  id: string;
  name: string;
  epoch: 'Vikingtid' | 'Middelalder' | 'Nyere tid' | 'Jernalder';
  category: string;
  yearBuilt: string;
  shortDesc: string;
  fullDesc: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  imageUrl: string;
  heritageId: string;
  tips: string;
}

export const TONSBERG_HERITAGE_SITES: HeritageSite[] = [
  {
    id: 'slottsfjellet-castrum',
    name: 'Castrum Tunsbergis & Slottsfjellet',
    epoch: 'Middelalder',
    category: 'Kongsgård & Festning',
    yearBuilt: 'Ca. 1200-1300-tallet',
    shortDesc: 'Nordens største middelalderborg og kongesete for kong Håkon Håkonsson og Magnus Lagabøte.',
    fullDesc: 'Castrum Tunsbergis var et mektig befestet kongesete med ringmurer, teglkastell og Mikaelskirken. Ruinene på fjellet vitner om Tønsbergs posisjon som Norges politiske maktsentrum i høymiddelalderen.',
    location: 'Slottsfjellet, 3126 Tønsberg',
    coordinates: { lat: 59.2715, lng: 10.4060 },
    imageUrl: '/images/tonsberg/nordens-storste-middelalderborg-og.jpg',
    heritageId: 'Kulturminne-ID: 86022',
    tips: 'Nyt 360-graders utsikt over hele Tønsberg og fjorden. Tårnet er åpent i sommersesongen.'
  },
  {
    id: 'oseberghaugen',
    name: 'Oseberghaugen (Vikinggraven)',
    epoch: 'Vikingtid',
    category: 'Vikinggrav & Skipsfunn',
    yearBuilt: 'År 834 e.Kr.',
    shortDesc: 'Funngraven til det verdensberømte Osebergskipet, en av verdens viktigste arkeologiske oppdagelser.',
    fullDesc: 'Her ble to mektige vikingkvinner gravlagt i år 834 sammen med et praktfullt, utskåret vikingskip, hester, hunder, vogner og tekstiler. Skipet ble gravd ut i 1904 og er et globalt ikon for vikingtiden.',
    location: 'Slagendalen, 3115 Tønsberg',
    coordinates: { lat: 59.3050, lng: 10.4633 },
    imageUrl: '/images/tonsberg/generelt-heritage.jpg',
    heritageId: 'Kulturminne-ID: 41829',
    tips: 'Besøk også Vikingodden på Tønsberg Brygge for å se det fullskala rekonstruerte Osebergskipet Saga Oseberg!'
  },
  {
    id: 'olavsklostret',
    name: 'Olavsklostret (Rundkirken)',
    epoch: 'Middelalder',
    category: 'Kloster & Kirkeruin',
    yearBuilt: 'Ca. 1180 e.Kr.',
    shortDesc: 'Nordens største bevarte rundkirke fra middelalderen tilhørende Premonstratenserordenen.',
    fullDesc: 'Olavsklostret var et mektig klosteranlegg innviet til Olav den hellige. Deler av klosteret og den unike rundkirken ligger bevart under Tønsberg bibliotek og ved Storgaten.',
    location: 'Storgaten / Biblioteket, 3126 Tønsberg',
    coordinates: { lat: 59.2688, lng: 10.4095 },
    imageUrl: '/images/tonsberg/slottsfjellet-taarnet-festival.jpg',
    heritageId: 'Kulturminne-ID: 21394',
    tips: 'Se de bevarte hvelvingene og klosterveggene integrert inne i Tønsberg og Færder bibliotek.'
  },
  {
    id: 'sondre-hella',
    name: 'Søndre Hella Gravfelt',
    epoch: 'Jernalder',
    category: 'Vikinggraver & Kystkultur',
    yearBuilt: 'Ca. 500-1000 e.Kr.',
    shortDesc: 'Et av Vestfolds flotteste gravfelt med over 20 gravrøyser fra jernalder og vikingtid ved Vestfjorden.',
    fullDesc: 'Søndre Hella ligger idyllisk til langs kyststien på Nøtterøy. Her vandrer du blant århundregamle eiketrær og synlige gravhauger med spektakulær utsikt mot fjorden.',
    location: 'Hella, Nøtterøy / Færder',
    coordinates: { lat: 59.2250, lng: 10.3750 },
    imageUrl: '/images/tonsberg/generelt-heritage-2.jpg',
    heritageId: 'Kulturminne-ID: 12948',
    tips: 'Perfekt turmål for barnefamilier som vil kombinere norgeshistorie med bading fra svabergene.'
  },
  {
    id: 'sem-kirke',
    name: 'Sem Kirke (Vestfolds eldste steinkirke)',
    epoch: 'Middelalder',
    category: 'Steinkirke',
    yearBuilt: 'Ca. 1100 e.Kr.',
    shortDesc: 'Vestfolds eldste bevarte romanske steinkirke, bygget i nær tilknytning til Jarlsberg Hovedgård.',
    fullDesc: 'Sem kirke ble reist i naturstein i første halvdel av 1100-tallet. Kirken var opprinnelig fylkeskirke og knyttet til kongsgården Sæheim, senere setegård for grevene på Jarlsberg.',
    location: 'Sem, 3170 Tønsberg',
    coordinates: { lat: 59.2842, lng: 10.3831 },
    imageUrl: '/images/tonsberg/generelt-heritage-3.jpg',
    heritageId: 'Kulturminne-ID: 85412',
    tips: 'Kombiner med en spasertur i den historiske alleen ved Jarlsberg Hovedgård.'
  }
];

export async function fetchHeritageSites(): Promise<HeritageSite[]> {
  return TONSBERG_HERITAGE_SITES;
}
