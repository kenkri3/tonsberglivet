import { Metadata } from 'next';
import NyheterClient from './NyheterClient';

export const metadata: Metadata = {
  title: 'Nyheter - Tønsberglivet',
  description: 'Siste nytt fra Tønsberg. Les om bylivet, hverdagslivet, næringslivet og reiselivet i Tønsberg.',
};

export default function NyheterPage() {
  return <NyheterClient />;
}
