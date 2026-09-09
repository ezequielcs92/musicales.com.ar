import type { Metadata, Viewport } from "next";
import { Anton, Poppins } from "next/font/google";

import "./globals.css";

// Poppins para todo lo que se lee; Anton para lo que grita. Anton es la letra
// del afiche de teatro: pesada, angosta, pensada para que un titulo largo entre
// en un espacio angosto y se lea desde la vereda de enfrente.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
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
      className={`${poppins.variable} ${anton.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
