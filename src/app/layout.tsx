import type { Metadata, Viewport } from "next";
import { Archivo, Oswald } from "next/font/google";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { contact, site } from "@/content/site";
import { MotionProvider } from "@/components/providers/MotionProvider";
import "./globals.css";

// Títulos: condensada em caixa alta (estilo do Instagram da Backstag), com peso médio
const display = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});

// Texto e interface: grotesca encorpada, legível no celular
const sans = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const title = `${site.name} | ${site.positioning}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: `%s | ${site.name}` },
  description: site.valueProposition,
  applicationName: site.name,
  keywords: [
    "consultoria empresarial",
    "gestão empresarial",
    "organização de processos",
    "marketing digital",
    "desenvolvimento de sites",
    "automação com inteligência artificial",
    "Backstag",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: site.fullName,
    title,
    description: site.valueProposition,
  },
  twitter: { card: "summary_large_image", title, description: site.valueProposition },
  robots: site.indexing ? { index: true, follow: true } : { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
};

// Dados estruturados apenas com informações reais e fornecidas.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.fullName,
  description: site.valueProposition,
  url: site.url,
  slogan: site.tagline,
  sameAs: [contact.instagramUrl],
  founder: { "@type": "Person", name: "Douglas Nascimento" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${display.variable} ${sans.variable}`}
      suppressHydrationWarning
    >
      <body className="text-paper antialiased">
        <noscript>
          <style>{`[data-reveal],.rv{opacity:1!important;transform:none!important;clip-path:none!important}`}</style>
        </noscript>
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-gold focus:px-4 focus:py-2 focus:text-ink"
        >
          Pular para o conteúdo
        </a>
        <AmbientBackground />
        <MotionProvider>{children}</MotionProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
