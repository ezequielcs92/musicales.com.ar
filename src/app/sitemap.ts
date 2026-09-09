import type { MetadataRoute } from "next";

import { clientePublico } from "@/lib/publico";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://musicales.com.ar";

// Se regenera con el sitio: una sala o una obra nueva entra sin desplegar.
export const revalidate = 3600;

/**
 * El sitemap sale de la base, no de una lista escrita a mano.
 *
 * Las páginas de sala y de obra son el activo de SEO del proyecto: cada una
 * puede posicionar por su nombre, que es como la gente busca. Dejarlas fuera
 * del sitemap era tener 314 páginas y declarar cinco.
 *
 * Las secciones sin datos siguen fuera: están marcadas `noindex` y pedirle a
 * Google que rastree lo que le decimos que no indexe es contradictorio.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ahora = new Date();
  const supabase = clientePublico();

  const [salas, obras, notas] = await Promise.all([
    supabase.from("venues").select("slug, updated_at").limit(1000),
    supabase.from("productions").select("slug, updated_at").limit(500),
    supabase
      .from("articles")
      .select("slug, section, updated_at")
      .eq("status", "publicado")
      .limit(500),
  ]);

  const fijas: MetadataRoute.Sitemap = [
    { url: SITE, lastModified: ahora, changeFrequency: "daily", priority: 1 },
    {
      url: `${SITE}/cartelera`,
      lastModified: ahora,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE}/talleres`,
      lastModified: ahora,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE}/salas`,
      lastModified: ahora,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE}/acerca`,
      lastModified: ahora,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${SITE}/contacto`,
      lastModified: ahora,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${SITE}/privacidad`,
      lastModified: ahora,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE}/terminos`,
      lastModified: ahora,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const RUTA_SECCION: Record<string, string> = {
    noticias: "noticias",
    blog: "blog",
    opiniones: "opiniones",
    reviews: "criticas",
    entrevistas: "entrevistas",
  };

  return [
    ...fijas,
    ...(obras.data ?? []).map((o) => ({
      url: `${SITE}/obra/${o.slug}`,
      lastModified: new Date(o.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...(salas.data ?? []).map((s) => ({
      url: `${SITE}/sala/${s.slug}`,
      lastModified: new Date(s.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...(notas.data ?? [])
      .filter((n) => RUTA_SECCION[n.section])
      .map((n) => ({
        url: `${SITE}/${RUTA_SECCION[n.section]}/${n.slug}`,
        lastModified: new Date(n.updated_at),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
  ];
}
