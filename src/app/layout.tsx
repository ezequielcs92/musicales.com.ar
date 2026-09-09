import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://musicales.com.ar";
export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Musicales.com.ar — Teatro musical argentino", template: "%s — Musicales.com.ar" },
  description: "Cartelera, críticas, talleres de montaje y audiciones de teatro musical en Buenos Aires.",
  openGraph: { type: "website", locale: "es_AR", siteName: "Musicales.com.ar", url: SITE, images: [{ url: "/marca/open-graph.png", width: 1200, height: 630 }] },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f4f3f6" }, { media: "(prefers-color-scheme: dark)", color: "#131019" }] };
export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="es-AR" className={`${poppins.variable} h-full antialiased`}><body className="flex min-h-full flex-col">{children}</body></html>;
}
