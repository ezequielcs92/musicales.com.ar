import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";

// Archivo se usa en su eje condensado: es la letra de los carteles de teatro.
// El eje wdth permite que "Dracula, la resurreccion" y "Company" entren en la
// misma ficha sin cambiar de cuerpo.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://musicales.com.ar";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Musicales.com.ar — Teatro musical argentino",
    // El nombre de marca va al final: Google trunca por la izquierda y lo que
    // importa que sobreviva es el titulo de la nota, no la marca.
    template: "%s — Musicales.com.ar",
  },
  description:
    "Cartelera, criticas, talleres de montaje y audiciones de teatro musical en Buenos Aires.",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Musicales.com.ar",
    url: SITE,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f3f6" },
    { media: "(prefers-color-scheme: dark)", color: "#131019" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-AR"
      className={`${archivo.variable} ${sourceSerif.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
