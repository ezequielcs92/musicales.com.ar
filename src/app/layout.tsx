import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";

import "./globals.css";

// Poppins para todo lo que se lee; Friend Bestie para lo que grita. Friend
// Bestie es la tipografia de la marca: la misma con la que esta dibujado el
// logo, asi que titulos y logotipo hablan el mismo idioma.
//
// LICENCIA: se usa bajo licencia webfont adquirida. El archivo del repositorio
// esta subconjuntado a latino (43 KB) y NO debe reemplazarse por el .otf
// completo ni publicarse fuera de este sitio.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const friendBestie = localFont({
  src: "../fonts/friend-bestie.woff2",
  variable: "--font-friend",
  display: "swap",
  weight: "400",
  // Ajusta la fuente de respaldo al ancho de la real: sin esto, el titulo
  // salta de tamaño cuando termina de cargar y eso es CLS, que es lo que
  // castiga Core Web Vitals.
  adjustFontFallback: "Arial",
});

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://musicales.com.ar";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Musicales.com.ar — Teatro musical argentino",
    template: "%s — Musicales.com.ar",
  },
  description:
    "Cartelera, críticas, talleres de montaje y audiciones de teatro musical en Buenos Aires.",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Musicales.com.ar",
    url: SITE,
    images: [{ url: "/marca/open-graph.png", width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f4fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0614" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-AR"
      className={`${poppins.variable} ${friendBestie.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
