import Link from "next/link";

import { LogoMarca } from "@/components/LogoMarca";

const COLUMNAS = [
  {
    titulo: "Secciones",
    enlaces: [
      { href: "/cartelera", texto: "Cartelera" },
      { href: "/criticas", texto: "Críticas" },
      { href: "/noticias", texto: "Noticias" },
      { href: "/entrevistas", texto: "Entrevistas" },
    ],
  },
  {
    titulo: "Comunidad",
    enlaces: [
      { href: "/talleres", texto: "Talleres de montaje" },
      { href: "/audiciones", texto: "Audiciones" },
      { href: "/cargar/taller", texto: "Cargar un taller" },
      { href: "/cargar/audicion", texto: "Cargar una audición" },
    ],
  },
  {
    titulo: "El sitio",
    enlaces: [
      { href: "/acerca", texto: "Acerca de" },
      { href: "/contacto", texto: "Contacto" },
      { href: "/privacidad", texto: "Privacidad" },
      { href: "/terminos", texto: "Términos" },
    ],
  },
];

export function PieDePagina() {
  return (
    <footer className="seccion-oscura border-t border-white/10">
      <div className="contenedor grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-4">
          <LogoMarca size={20} dark />
          <p className="max-w-[30ch] text-sm text-[var(--on-dark-muted)]">
            Cartelera, críticas, talleres de montaje y audiciones de teatro
            musical argentino.
          </p>
          <div className="bombillas mt-1" aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => (
              <i key={i} />
            ))}
          </div>
        </div>

        {COLUMNAS.map((col) => (
          <nav key={col.titulo} aria-label={col.titulo} className="flex flex-col gap-3">
            <h2 className="antetitulo">{col.titulo}</h2>
            <ul className="flex flex-col gap-2">
              {col.enlaces.map((e) => (
                <li key={e.href}>
                  <Link
                    href={e.href}
                    className="text-sm text-[var(--on-dark-muted)] transition-colors hover:text-white"
                  >
                    {e.texto}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="contenedor flex flex-wrap justify-between gap-3 border-t border-white/10 py-6 text-xs text-[var(--on-dark-muted)]">
        <span>© {new Date().getFullYear()} Musicales.com.ar</span>
        <span>Buenos Aires y Gran Buenos Aires · Temporada 2026</span>
      </div>
    </footer>
  );
}
