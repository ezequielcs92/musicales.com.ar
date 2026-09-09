import type { Metadata } from "next";
import Link from "next/link";

import { PaginaPublica, Prosa } from "@/components/PaginaPublica";

export const metadata: Metadata = {
  title: "Términos de uso",
  description: "Condiciones de uso de Musicales.com.ar.",
};

export default function Terminos() {
  return (
    <PaginaPublica
      antetitulo="Última actualización · 9 de septiembre de 2026"
      titulo="Términos de uso"
      bajada="Las reglas del sitio, en castellano y sin vueltas."
    >
      <Prosa>
        <h2>Qué es esto</h2>
        <p>
          Musicales.com.ar es un medio independiente sobre teatro musical
          argentino. Usar el sitio implica aceptar estos términos.
        </p>

        <h2>La información de cartelera</h2>
        <p>
          Publicamos funciones, precios, talleres y audiciones con el mayor
          cuidado posible, pero <strong>los datos cambian</strong>: una función
          se suspende, un precio sube, una inscripción cierra antes.{" "}
          <strong>
            Confirmá siempre con la sala, la escuela o la productora antes de
            comprar una entrada o de viajar a una audición.
          </strong>{" "}
          No respondemos por gastos derivados de un dato desactualizado.
        </p>
        <p>
          Si encontrás un error, escribinos: lo corregimos y te lo agradecemos.
        </p>

        <h2>Enlaces a otros sitios</h2>
        <p>
          Enlazamos a boleterías, escuelas y convocatorias oficiales. No
          controlamos esos sitios ni respondemos por su contenido, sus precios
          ni sus políticas.
        </p>

        <h2>Lo que publicás vos</h2>
        <p>
          Si cargás un taller o una audición, garantizás que la información es
          veraz y que tenés derecho a difundirla. Nos reservamos publicar,
          editar o rechazar cualquier envío, y damos de baja lo que resulte
          falso, engañoso o abusivo.
        </p>

        <h2>Contenido del sitio</h2>
        <p>
          Los textos y las piezas gráficas propias son de Musicales.com.ar.
          Podés citarnos con atribución y enlace; no reproducir notas completas
          sin permiso.
        </p>
        <p>
          Las fotos de producción pertenecen a sus autores y se usan con crédito
          bajo autorización de prensa. Si sos titular de una imagen y querés que
          la retiremos, escribinos y la bajamos.
        </p>

        <h2>Críticas y opiniones</h2>
        <p>
          Las críticas son opiniones fundadas de quien las firma sobre una
          función concreta, con su fecha y su elenco indicados. No son
          afirmaciones de hecho sobre personas ni instituciones.
        </p>

        <h2>Publicidad</h2>
        <p>
          El sitio se financia con publicidad, que se muestra identificada como
          tal. Los anunciantes no deciden qué se cubre ni qué se opina. El
          contenido pago, si lo hubiera, se identifica siempre.
        </p>

        <h2>Disponibilidad</h2>
        <p>
          Hacemos lo posible por mantener el sitio en línea, pero puede haber
          interrupciones por mantenimiento o por causas ajenas.
        </p>

        <h2>Ley aplicable</h2>
        <p>
          Estos términos se rigen por las leyes de la República Argentina. Para
          cualquier controversia se aplican los tribunales competentes de la
          Ciudad Autónoma de Buenos Aires.
        </p>
        <p>
          Sobre datos personales, ver la{" "}
          <Link href="/privacidad">política de privacidad</Link>.
        </p>
      </Prosa>
    </PaginaPublica>
  );
}
