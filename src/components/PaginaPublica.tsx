import type { ReactNode } from "react";

import { Cabecera } from "@/components/Cabecera";
import { PieDePagina } from "@/components/PieDePagina";

/**
 * Envoltura de las paginas publicas: cabecera, contenido y pie.
 *
 * No es un layout de Next a proposito: el layout raiz tambien envuelve /admin
 * y /ingresar, que tienen su propia cabecera. Un componente explicito deja
 * claro cual es publica y cual no.
 */
export function PaginaPublica({
  antetitulo,
  titulo,
  bajada,
  children,
}: {
  antetitulo?: string;
  titulo: string;
  bajada?: string;
  children: ReactNode;
}) {
  return (
    <>
      <Cabecera />

      <section className="seccion-oscura">
        <div className="contenedor flex flex-col gap-4 pb-16 pt-12 sm:pb-20 sm:pt-16">
          {antetitulo && <p className="antetitulo">{antetitulo}</p>}
          <h1 className="titular-seccion max-w-[18ch]">{titulo}</h1>
          {bajada && <p className="bajada">{bajada}</p>}
        </div>
      </section>

      <main className="seccion">
        <div className="contenedor">{children}</div>
      </main>

      <PieDePagina />
    </>
  );
}

/** Texto corrido legible: medida acotada y aire entre parrafos. */
export function Prosa({ children }: { children: ReactNode }) {
  return (
    <div className="flex max-w-[68ch] flex-col gap-5 text-[1.02rem] leading-relaxed [&_a]:text-[var(--primary)] [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:uppercase [&_h2]:leading-none [&_li]:mb-2 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:pl-5">
      {children}
    </div>
  );
}
