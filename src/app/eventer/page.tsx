import { Metadata } from 'next';
import EventerClient from './EventerClient';

export const metadata: Metadata = {
  title: 'Hva skjer i Tønsberg - Eventer',
  description: 'Oversikt over arrangementer, konserter, markeder og kultur i Tønsberg.',
};

export default function EventerPage() {
  return <EventerClient />;
}
