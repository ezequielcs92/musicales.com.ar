import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://musicales.com.ar";

/**
 * Solo van las paginas con contenido real. Las secciones todavia sin datos
 * estan marcadas `noindex`, asi que incluirlas seria pedirle a Google que
 * rastree algo que le estamos diciendo que no indexe.
 *
 * Cuando la cartelera tenga datos, esto pasa a generarse desde la base.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const ahora = new Date();

  return [
    { url: SITE, lastModified: ahora, changeFrequency: "daily", priority: 1 },
    {
      url: `${SITE}/acerca`,
      lastModified: ahora,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITE}/contacto`,
      lastModified: ahora,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITE}/privacidad`,
      lastModified: ahora,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE}/terminos`,
      lastModified: ahora,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
