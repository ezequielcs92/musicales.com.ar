import Link from "next/link";

import { Estrellas } from "@/components/Estrellas";
import { Cabecera } from "@/components/Cabecera";
import { PieDePagina } from "@/components/PieDePagina";
import { renderizarContenido } from "@/lib/contenido";
import { fecha } from "@/lib/publico";

export type NotaCompleta = {
  slug: string;
  title: string;
  dek: string | null;
  body_mdx: string;
  published_at: string | null;
  updated_at: string;
  rating: number | null;
  seen_on: string | null;
  autor: string | null;
  obra: string | null;
  sala: string | null;
  productora: string | null;
};

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://musicales.com.ar";

export function Articulo({
  nota,
  ruta,
  etiquetaSeccion,
}: {
  nota: NotaCompleta;
  ruta: string;
  etiquetaSeccion: string;
}) {
  const esCritica = nota.rating !== null;
  const sujeto = nota.obra ?? nota.sala ?? nota.productora;

  // Datos estructurados. En una critica, `Review` con `reviewRating` es lo que
  // habilita las estrellas en los resultados de Google; en el resto,
  // `NewsArticle`. Se arma con lo que hay, sin inventar campos.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": esCritica ? "Review" : "NewsArticle",
    headline: nota.title,
    ...(nota.dek && { description: nota.dek }),
    datePublished: nota.published_at,
    dateModified: nota.updated_at,
    ...(nota.autor && { author: { "@type": "Person", name: nota.autor } }),
    publisher: {
      "@type": "Organization",
      name: "Musicales.com.ar",
      url: SITE,
    },
    mainEntityOfPage: `${SITE}/${ruta}/${nota.slug}`,
    ...(esCritica && {
      reviewRating: {
        "@type": "Rating",
        ratingValue: nota.rating,
        bestRating: 5,
        worstRating: 1,
      },
      ...(sujeto && {
        itemReviewed: {
          "@type": nota.sala
            ? "PerformingArtsTheater"
            : nota.productora
              ? "Organization"
              : "TheaterEvent",
          name: sujeto,
        },
      }),
    }),
  };

  return (
    <>
      <Cabecera />

      <article>
        <header className="seccion-oscura">
          <div className="contenedor flex flex-col gap-5 pb-14 pt-10 sm:pb-16 sm:pt-14">
            <Link href={`/${ruta}`} className="antetitulo w-fit">
              {etiquetaSeccion}
            </Link>

            <h1 className="titular max-w-[20ch]">{nota.title}</h1>

            {nota.dek && (
              <p className="bajada max-w-[62ch] text-[1.12rem]">{nota.dek}</p>
            )}

            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
              {esCritica && <Estrellas puntaje={Number(nota.rating)} tamano={20} />}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-[var(--on-dark-muted)]">
                {nota.autor && <span>{nota.autor}</span>}
                {nota.published_at && (
                  <time dateTime={nota.published_at}>
                    {fecha(nota.published_at)}
                  </time>
                )}
              </div>
            </div>

            {/* Lo que distingue a una critica seria: de qué función habla. */}
            {esCritica && (nota.seen_on || sujeto) && (
              <p className="w-fit border-l-2 border-[var(--bombilla)] pl-4 text-[0.9rem] text-[var(--on-dark-muted)]">
                {sujeto && <>Sobre <strong>{sujeto}</strong></>}
                {sujeto && nota.seen_on && " · "}
                {nota.seen_on && <>función del {fecha(nota.seen_on)}</>}
              </p>
            )}
          </div>
        </header>

        <div className="seccion">
          <div className="contenedor">
            <div
              className="prosa max-w-[68ch]"
              dangerouslySetInnerHTML={{
                __html: renderizarContenido(nota.body_mdx),
              }}
            />

            <p className="mt-12 max-w-[68ch] border-t border-[var(--line)] pt-6 text-[0.9rem] text-[var(--muted)]">
              ¿Encontraste un error o querés responder?{" "}
              <Link
                href="/contacto"
                className="text-[var(--primary)] underline underline-offset-2"
              >
                Escribinos
              </Link>
              .
            </p>
          </div>
        </div>
      </article>

      <PieDePagina />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
