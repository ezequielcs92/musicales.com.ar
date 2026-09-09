import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://musicales.com.ar";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // El panel y el ingreso no tienen nada que buscar y sus URLs con
        // parametros generan rastreo inutil.
        disallow: ["/admin", "/admin/", "/ingresar", "/auth/"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
