'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ConsentBanner } from '@/components/ui/ConsentBanner';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <>
      <Header />
      <main className="flex-1 pt-[var(--header-height)]">{children}</main>
      <Footer />
      <ConsentBanner />
    </>
  );
}
