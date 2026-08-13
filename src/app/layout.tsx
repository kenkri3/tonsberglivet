import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
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
    <html lang="nb" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        {/* Forhindre flash av feil tema */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('tonsberglivet-theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
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
          <Header />
          <main className="flex-1 pt-[var(--header-height)]">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
