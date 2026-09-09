import type { Metadata } from "next";
import Link from "next/link";

import { PaginaPublica, Prosa } from "@/components/PaginaPublica";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Qué datos recoge Musicales.com.ar, para qué los usa y cómo ejercer tus derechos.",
};

export default function Privacidad() {
  return (
    <PaginaPublica
      antetitulo="Última actualización · 9 de septiembre de 2026"
      titulo="Política de privacidad"
      bajada="Qué datos recogemos, para qué, y cómo pedir que los borremos."
    >
      <Prosa>
        <h2>Quién es responsable</h2>
        <p>
          Musicales.com.ar es el responsable del tratamiento de los datos
          descritos acá. Para cualquier consulta:{" "}
          <a href="mailto:contacto@musicales.com.ar">
            contacto@musicales.com.ar
          </a>
          .
        </p>

        <h2>Qué datos recogemos</h2>
        <ul>
          <li>
            <strong>Si nos escribís:</strong> tu dirección de correo y lo que
            nos cuentes. Lo usamos para responderte y nada más.
          </li>
          <li>
            <strong>Si cargás un taller o una audición:</strong> nombre y
            contacto de quien lo envía, para verificar el dato antes de
            publicarlo.
          </li>
          <li>
            <strong>Si tenés cuenta de redacción:</strong> correo y nombre para
            mostrar. Las contraseñas las guarda cifradas nuestro proveedor de
            autenticación; nosotros no las vemos.
          </li>
          <li>
            <strong>De cualquier visita:</strong> estadísticas agregadas de uso
            —páginas vistas, país, tipo de dispositivo—. No identifican a nadie.
          </li>
        </ul>
        <p>
          No pedimos ni guardamos datos de tarjetas, documentos de identidad ni
          información sensible.
        </p>

        <h2>Cookies y publicidad</h2>
        <p>
          La analítica que usamos es <strong>sin cookies</strong>: mide visitas
          de forma agregada y no sigue a las personas entre sitios.
        </p>
        <p>
          El sitio se financia con publicidad. Cuando la publicidad esté activa,
          proveedores externos —incluido Google— podrán usar cookies para
          mostrar avisos según tus visitas a este y a otros sitios. Podés
          desactivar la publicidad personalizada de Google en la{" "}
          <a
            href="https://www.google.com/settings/ads"
            rel="noopener noreferrer"
            target="_blank"
          >
            configuración de anuncios de Google
          </a>{" "}
          y gestionar las cookies de otros proveedores en{" "}
          <a
            href="https://www.aboutads.info/choices/"
            rel="noopener noreferrer"
            target="_blank"
          >
            aboutads.info
          </a>
          .
        </p>
        <p>
          Si iniciás sesión, usamos una cookie técnica para mantener la sesión
          abierta. Sin ella el ingreso no funciona.
        </p>

        <h2>Con quién compartimos</h2>
        <p>
          No vendemos ni cedemos datos. Trabajamos con proveedores que los
          procesan por cuenta nuestra: <strong>Cloudflare</strong> (alojamiento
          y analítica), <strong>Supabase</strong> (base de datos y cuentas) y,
          cuando esté activa, <strong>Google AdSense</strong> (publicidad).
          Algunos operan servidores fuera de Argentina.
        </p>

        <h2>Cuánto tiempo los guardamos</h2>
        <p>
          Los correos de contacto, mientras sean útiles para el intercambio. Las
          cuentas, mientras existan: si pedís la baja, borramos la cuenta y sus
          datos asociados.
        </p>

        <h2>Tus derechos</h2>
        <p>
          Podés pedir acceder, rectificar, actualizar o suprimir tus datos
          personales escribiendo a{" "}
          <a href="mailto:contacto@musicales.com.ar">
            contacto@musicales.com.ar
          </a>
          . Respondemos en un plazo razonable y sin costo.
        </p>
        <p>
          En Argentina el tratamiento de datos personales se rige por la{" "}
          <strong>Ley 25.326</strong>. La autoridad de control es la Agencia de
          Acceso a la Información Pública, ante la cual podés reclamar si
          considerás que no atendimos tu pedido.
        </p>

        <h2>Menores</h2>
        <p>
          El sitio no está dirigido a menores de 13 años y no recogemos datos de
          esa franja de forma consciente.
        </p>

        <h2>Cambios</h2>
        <p>
          Si esta política cambia, actualizamos la fecha del encabezado. Los
          cambios de fondo se avisan en el sitio.
        </p>
        <p>
          Ver también los <Link href="/terminos">términos de uso</Link>.
        </p>
      </Prosa>
    </PaginaPublica>
  );
}
