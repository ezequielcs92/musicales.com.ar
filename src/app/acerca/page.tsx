import type { Metadata } from "next";
import Link from "next/link";

import { PaginaPublica, Prosa } from "@/components/PaginaPublica";

export const metadata: Metadata = {
  title: "Acerca de",
  description:
    "Qué es Musicales.com.ar, quiénes lo hacen y con qué criterio se publica.",
};

export default function Acerca() {
  return (
    <PaginaPublica
      antetitulo="Acerca de"
      titulo="Un medio dedicado al teatro musical argentino."
      bajada="Cartelera, críticas, talleres de montaje y audiciones. Buenos Aires y Gran Buenos Aires."
    >
      <Prosa>
        <p>
          <strong>Musicales.com.ar</strong> nació de una molestia concreta: la
          información del teatro musical argentino está repartida entre cuentas
          de Instagram, historias que se borran a las 24 horas y carteleras
          generales que no distinguen un musical de una obra de texto.
        </p>

        <h2>Qué hacemos distinto</h2>
        <p>
          Tres datos que a una cartelera general no le importan y que en este
          ambiente son la conversación entera:
        </p>
        <ul>
          <li>
            <strong>Quién hacía el rol la noche que fuiste.</strong> Registramos
            titular, alternate, cover y swing. Ninguna cartelera generalista lo
            publica.
          </li>
          <li>
            <strong>Si un taller termina en función o no.</strong> Un taller de
            montaje y un entrenamiento semanal son dos cosas distintas y acá son
            dos filtros distintos.
          </li>
          <li>
            <strong>Si una audición exige inscripción en ARCA.</strong> Las
            convocatorias oficiales lo piden, y saberlo antes te ahorra preparar
            una audición a la que no podés presentarte.
          </li>
        </ul>

        <h2>Cómo publicamos</h2>
        <p>
          Las <strong>críticas</strong> las firma la redacción y dicen siempre de
          qué función hablan y con qué elenco. Una crítica sin fecha es una
          opinión sobre una obra que ya cambió.
        </p>
        <p>
          Las <strong>audiciones</strong> se publican solo después de
          verificarlas contra la fuente oficial. Preferimos llegar tarde a
          publicar una convocatoria que no existe.
        </p>
        <p>
          La <strong>cartelera</strong> se revisa semanalmente. Si ves un dato
          vencido, escribinos: es el error que más nos importa corregir.
        </p>

        <h2>Quiénes somos</h2>
        <p>
          Un proyecto independiente, sin vínculo con productoras ni salas. No
          cobramos por aparecer en la cartelera, en el listado de talleres ni en
          el de audiciones, y no publicamos contenido pago sin identificarlo como
          tal.
        </p>
        <p>
          El sitio se sostiene con publicidad. Eso no condiciona qué se cubre ni
          qué se opina.
        </p>

        <h2>Escribinos</h2>
        <p>
          Para correcciones, propuestas de cobertura o para sumarte a escribir,
          entrá en <Link href="/contacto">contacto</Link>.
        </p>
      </Prosa>
    </PaginaPublica>
  );
}
