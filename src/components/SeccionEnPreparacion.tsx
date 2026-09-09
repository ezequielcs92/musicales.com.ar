import Link from "next/link";

import { PaginaPublica } from "@/components/PaginaPublica";

/**
 * Seccion anunciada pero todavia sin datos.
 *
 * Existe para que la navegacion no termine en un 404, pero va `noindex` hasta
 * que tenga contenido real: una pagina vacia indexada es contenido de poco
 * valor y eso pesa en contra al postular a AdSense.
 */
export function SeccionEnPreparacion({
  antetitulo,
  titulo,
  bajada,
  promesas,
  cuando,
}: {
  antetitulo: string;
  titulo: string;
  bajada: string;
  promesas: { clave: string; texto: string }[];
  cuando: string;
}) {
  return (
    <PaginaPublica antetitulo={antetitulo} titulo={titulo} bajada={bajada}>
      <div className="flex flex-col gap-10">
        <ul className="grid gap-5 sm:grid-cols-2">
          {promesas.map((p) => (
            <li key={p.clave} className="tarjeta flex flex-col gap-2 p-6">
              <h2 className="font-display text-lg uppercase leading-none tracking-tight">
                {p.clave}
              </h2>
              <p className="text-[0.94rem] text-[var(--muted)]">{p.texto}</p>
            </li>
          ))}
        </ul>

        <div className="flex max-w-[64ch] flex-col gap-4 border-l-2 border-[var(--primary)] pl-5">
          <p className="text-[1.02rem] leading-relaxed">{cuando}</p>
          <p className="text-[0.94rem] text-[var(--muted)]">
            ¿Tenés información para esta sección?{" "}
            <Link
              href="/contacto"
              className="text-[var(--primary)] underline underline-offset-2"
            >
              Escribinos
            </Link>
            . Nos sirve más un dato de primera mano que diez horas de búsqueda.
          </p>
        </div>
      </div>
    </PaginaPublica>
  );
}

/** Las secciones sin datos no se indexan todavia. */
export const NO_INDEXAR = { robots: { index: false, follow: true } } as const;
