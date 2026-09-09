import Link from "next/link";

import { Estrellas } from "@/components/Estrellas";
import { PaginaPublica } from "@/components/PaginaPublica";
import type { Seccion } from "@/lib/editorial";
import { fecha } from "@/lib/publico";

/**
 * La URL de una seccion no siempre coincide con su valor en la base:
 * `/criticas` es mas natural en castellano que `/reviews`, que es como se
 * llama el enumerado. El mapeo vive acá y en un solo lugar.
 */
export const SECCIONES_PUBLICAS: Record<
  string,
  { seccion: Seccion; titulo: string; bajada: string; descripcion: string }
> = {
  noticias: {
    seccion: "noticias",
    titulo: "Noticias del ambiente.",
    bajada:
      "Estrenos, cambios de elenco, cierres de temporada. Lo que pasa acá y lo que llega de afuera.",
    descripcion:
      "Noticias del teatro musical argentino e internacional.",
  },
  blog: {
    seccion: "blog",
    titulo: "Notas de tema libre.",
    bajada:
      "Historia, oficio y por qué un musical funciona y otro no. Lo que no es noticia pero vale contarlo.",
    descripcion: "Notas y ensayos sobre el mundo del teatro musical.",
  },
  opiniones: {
    seccion: "opiniones",
    titulo: "Opiniones.",
    bajada: "Columnas firmadas sobre lo que pasa en el ambiente.",
    descripcion: "Columnas de opinión sobre teatro musical argentino.",
  },
  criticas: {
    seccion: "reviews",
    titulo: "Críticas.",
    bajada:
      "De obras, salas y productoras. Cada una dice de qué función habla y con qué elenco.",
    descripcion:
      "Críticas de teatro musical con puntaje, fecha de función y elenco.",
  },
  entrevistas: {
    seccion: "entrevistas",
    titulo: "Entrevistas.",
    bajada: "Conversaciones con quienes hacen el musical argentino.",
    descripcion: "Entrevistas a artistas y productores de teatro musical.",
  },
};

export type NotaListado = {
  id: string;
  slug: string;
  title: string;
  dek: string | null;
  published_at: string | null;
  rating: number | null;
  seen_on: string | null;
  autor: string | null;
};

export function ListadoEditorial({
  ruta,
  notas,
  error,
}: {
  ruta: string;
  notas: NotaListado[];
  error: boolean;
}) {
  const cfg = SECCIONES_PUBLICAS[ruta];

  return (
    <PaginaPublica
      antetitulo={cfg.seccion === "reviews" ? "Críticas" : cfg.titulo.replace(".", "")}
      titulo={cfg.titulo}
      bajada={cfg.bajada}
    >
      {error ? (
        <p role="alert" className="text-[var(--primary)]">
          No pudimos cargar esta sección. Probá de nuevo en unos minutos.
        </p>
      ) : notas.length === 0 ? (
        <div className="flex max-w-[60ch] flex-col gap-4">
          <p className="text-[1.05rem]">
            Todavía no publicamos nada en esta sección.
          </p>
          <p className="text-[var(--muted)]">
            El sitio se está armando y la redacción recién arranca. Si querés
            escribir con nosotros,{" "}
            <Link
              href="/contacto"
              className="text-[var(--primary)] underline underline-offset-2"
            >
              escribinos
            </Link>
            : no hace falta experiencia previa en medios.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-[var(--line)] border-t border-[var(--line)]">
          {notas.map((n) => (
            <li key={n.id}>
              <Link
                href={`/${ruta}/${n.slug}`}
                className="flex flex-col gap-2 py-7 transition-colors hover:bg-[var(--surface-2)]"
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-[var(--muted)]">
                  {n.published_at && <time dateTime={n.published_at}>{fecha(n.published_at)}</time>}
                  {n.autor && <span>{n.autor}</span>}
                </div>
                <h2 className="font-display text-2xl uppercase leading-none tracking-tight text-balance sm:text-3xl">
                  {n.title}
                </h2>
                {n.dek && (
                  <p className="max-w-[70ch] text-[var(--muted)]">{n.dek}</p>
                )}
                {n.rating !== null && (
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <Estrellas puntaje={Number(n.rating)} />
                    {n.seen_on && (
                      <span className="text-[0.8rem] text-[var(--muted)]">
                        función del {fecha(n.seen_on, false)}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PaginaPublica>
  );
}
