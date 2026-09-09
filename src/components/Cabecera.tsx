import Link from "next/link";

import { LogoMarca } from "@/components/LogoMarca";

const ENLACES = [
  { href: "/cartelera", texto: "Cartelera" },
  { href: "/criticas", texto: "Críticas" },
  { href: "/talleres", texto: "Talleres" },
  { href: "/audiciones", texto: "Audiciones" },
];

export function Cabecera() {
  return (
    <header className="seccion-oscura relative z-10">
      {/* Una sola fila, sin envolver: el logo mide ~187 px a tamaño de
          escritorio y con el boton al lado no entra en un telefono. Se achica
          en pantallas chicas en vez de partir la cabecera en dos. */}
      <div className="contenedor flex items-center justify-between gap-4 py-4 sm:py-5">
        <Link
          href="/"
          aria-label="Musicales.com.ar — inicio"
          className="shrink-0"
        >
          <span className="hidden sm:block">
            <LogoMarca size={22} dark />
          </span>
          <span className="sm:hidden">
            <LogoMarca size={16} dark />
          </span>
        </Link>

        <nav aria-label="Secciones" className="ml-auto hidden gap-7 md:flex">
          {ENLACES.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className="text-sm font-medium text-[var(--on-dark-muted)] transition-colors hover:text-white"
            >
              {e.texto}
            </Link>
          ))}
        </nav>

        <Link
          href="/ingresar"
          className="boton shrink-0 px-4 py-2 text-sm sm:px-6 sm:py-3 md:ml-4"
        >
          Redacción
        </Link>
      </div>
    </header>
  );
}
