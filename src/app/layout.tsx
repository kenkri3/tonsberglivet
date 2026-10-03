import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";
import { ClientLayout } from "@/components/layout/ClientLayout";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  // Lys er standardskinnet. Vi annonserer derfor én lys farge i stedet for å
  // la nettleseren velge ut fra operativsystemets mørkmodus.
  themeColor: "#ffffff",
};

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Tønsberglivet — Mer synlighet, mer stolthet, mer liv, mer kraft",
    template: "%s | Tønsberglivet",
  },
  description:
    "Tønsberglivet er et samarbeid mellom aktører som vil bidra til mer synlighet, mer stolthet, mer liv og mer kraft i hele regionen.",
  keywords: [
    "Tønsberg",
    "Tønsberglivet",
    "byliv",
    "reiseliv",
    "næringsliv",
    "studentliv",
    "Færder",
    "Vestfold",
  ],
  openGraph: {
    type: "website",
    locale: "nb_NO",
    url: "https://tonsberglivet.no",
    siteName: "Tønsberglivet",
    title: "Tønsberglivet — Mer synlighet, mer stolthet, mer liv, mer kraft",
    description:
      "Tønsberglivet er et samarbeid mellom aktører som vil bidra til mer synlighet, mer stolthet, mer liv og mer kraft i hele regionen.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tønsberglivet",
    description:
      "Tønsberglivet er et samarbeid mellom aktører som vil bidra til mer synlighet, mer stolthet, mer liv og mer kraft i hele regionen.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {


  return (
    <html lang="nb" className={`${inter.variable} ${playfair.variable} h-full`} suppressHydrationWarning>
      <head>
        {/*
          Forhindrer flash av feil tema ved lasting.

          Lys er standard for hele systemet. Vi ser derfor BARE på et aktivt
          valg brukeren selv har tatt (localStorage). Vi faller ikke tilbake på
          operativsystemets `prefers-color-scheme` — gjorde vi det, ble hele
          nettstedet mørkt for alle som har mørkmodus i Windows eller macOS,
          uavhengig av hva vi har bestemt at standarden skal være.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (localStorage.getItem('tonsberglivet-theme') === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <ThemeProvider>
          <OrganizationJsonLd />
          <ClientLayout>{children}</ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}

