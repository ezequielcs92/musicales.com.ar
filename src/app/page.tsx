import Link from "next/link";

import { Cabecera } from "@/components/Cabecera";
import { PieDePagina } from "@/components/PieDePagina";

// Temporada 2026 relevada. Todavia no sale de la base: la cartelera se conecta
// en la fase 2. Se marca aca para que nadie lo confunda con datos en vivo.
const EN_CARTEL = [
  {
    titulo: "Drácula, la resurrección",
    sala: "Teatro El Nacional",
    dato: "Miércoles a domingo · 20:30",
    estado: "cartel" as const,
    etiqueta: "En cartel",
  },
  {
    titulo: "Company",
    sala: "Dirección de Fer Dente",
    dato: "Jueves a domingo · 21:00",
    estado: "ultimas" as const,
    etiqueta: "Últimas funciones",
  },
  {
    titulo: "Hairspray",
    sala: "Con Damián Betular",
    dato: "Desde el 4 de abril",
    estado: "estreno" as const,
    etiqueta: "Estreno",
  },
  {
    titulo: "Chicago",
    sala: "Dirección de Ricky Pashkus",
    dato: "Viernes a domingo · 20:00",
    estado: "cartel" as const,
    etiqueta: "En cartel",
  },
];

const SECCIONES = [
  {
    titulo: "Cartelera",
    texto:
      "Qué musicales hay hoy, en qué sala, a qué hora y desde cuánto. Con las funciones reales, no una lista que quedó vieja en marzo.",
  },
  {
    titulo: "Críticas",
    texto:
      "Reseñas que dicen de qué función hablan y con qué elenco. Una crítica sin fecha es una opinión sobre una obra que ya cambió.",
  },
  {
    titulo: "Talleres",
    texto:
      "Los talleres de montaje separados del entrenamiento semanal. Si termina en función, lo vas a poder filtrar.",
  },
  {
    titulo: "Audiciones",
    texto:
      "Convocatorias abiertas con roles buscados, requisitos y plazos. Solo las verificadas contra la fuente oficial.",
  },
];

const DIFERENCIAS = [
  {
    clave: "Titular, alternate, cover y swing",
    texto:
      "Quién hacía el rol la noche que fuiste. Es la información que más se busca en el ambiente y que ninguna cartelera generalista publica.",
  },
  {
    clave: "Montaje o entrenamiento",
    texto:
      "Un taller que termina en función no es lo mismo que una clase semanal. Son dos búsquedas distintas y acá son dos filtros distintos.",
  },
  {
    clave: "Si la convocatoria pide ARCA",
    texto:
      "Las audiciones oficiales exigen inscripción fiscal vigente. Saberlo antes de preparar una audición te ahorra el viaje.",
  },
];

const CHIP = {
  cartel: "chip chip-cartel",
  ultimas: "chip chip-ultimas",
  estreno: "chip chip-estreno",
};

export default function Home() {
  return (
    <>
      <Cabecera />

      {/* --- Portada ------------------------------------------------------- */}
      <section className="seccion-oscura relative overflow-hidden">
        {/* Luz de escenario. Decorativa y barata: un gradiente, no una imagen. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, var(--magenta) 0%, var(--primary) 45%, transparent 70%)",
          }}
        />

        <div className="contenedor relative grid items-center gap-14 pb-24 pt-16 lg:grid-cols-[1.15fr_1fr] lg:pb-32 lg:pt-20">
          <div className="flex flex-col items-start gap-7">
            <div className="entrada flex flex-col gap-4">
              <div className="bombillas" aria-hidden="true">
                {Array.from({ length: 8 }, (_, i) => (
                  <i key={i} />
                ))}
              </div>
              <p className="antetitulo">Teatro musical argentino</p>
            </div>

            {/* Sin salto manual: Friend Bestie es mas ancha que la sustituta
                que habia antes y un <br> fijo estiraba el titular a cinco
                renglones. Se deja que corte solo dentro de su medida. */}
            <h1 className="titular entrada entrada-2 max-w-[11ch]">
              Todo el musical argentino en{" "}
              <span className="destacado">un solo lugar.</span>
            </h1>

            <p className="bajada entrada entrada-3">
              Cartelera con funciones reales, críticas que dicen qué noche
              vieron, talleres de montaje con inscripción abierta y audiciones
              verificadas. Lo que hoy está repartido en veinte cuentas de
              Instagram.
            </p>

            <div className="entrada entrada-4 flex flex-wrap gap-3">
              <Link href="/cartelera" className="boton">
                Ver la cartelera
              </Link>
              <Link href="#que-hay" className="boton boton-fantasma">
                Qué vas a encontrar
              </Link>
            </div>
          </div>

          {/* La marquesina: el gesto de la marca hecho objeto. */}
          <div className="entrada entrada-3 tarjeta w-full overflow-hidden p-0">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
              <span className="antetitulo">Esta semana</span>
              <div className="bombillas" aria-hidden="true">
                {Array.from({ length: 5 }, (_, i) => (
                  <i key={i} />
                ))}
              </div>
            </div>
            <ul className="flex flex-col">
              {EN_CARTEL.map((o) => (
                <li
                  key={o.titulo}
                  className="flex flex-col gap-2 border-b border-white/10 px-5 py-4 last:border-b-0"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={CHIP[o.estado]}>{o.etiqueta}</span>
                    <span className="text-[0.7rem] text-[var(--on-dark-muted)]">
                      {o.dato}
                    </span>
                  </div>
                  <span className="font-display text-xl uppercase leading-none tracking-tight">
                    {o.titulo}
                  </span>
                  <span className="text-sm text-[var(--on-dark-muted)]">
                    {o.sala}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* --- Qué vas a encontrar ------------------------------------------- */}
      <section id="que-hay" className="seccion">
        <div className="contenedor flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <p className="antetitulo">Cuatro secciones</p>
            <h2 className="titular-seccion max-w-[16ch]">
              Lo que el ambiente busca y nadie ordena.
            </h2>
          </div>

          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SECCIONES.map((s, i) => (
              <li key={s.titulo} className="tarjeta flex flex-col gap-3 p-6">
                <span className="font-display text-3xl leading-none text-[var(--violet)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-xl uppercase leading-none tracking-tight">
                  {s.titulo}
                </h3>
                <p className="text-[0.94rem] text-[var(--muted)]">{s.texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --- Por qué existe ------------------------------------------------ */}
      <section className="seccion seccion-oscura">
        <div className="contenedor grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div className="flex flex-col gap-5">
            <p className="antetitulo">Por qué existe</p>
            <h2 className="titular-seccion max-w-[14ch]">
              Los datos que solo importan acá.
            </h2>
            <p className="bajada">
              Una cartelera de teatro general no distingue un cover de un
              titular ni un montaje de una clase. Para el resto del público da
              igual. Para el del musical, es toda la conversación.
            </p>
          </div>

          <ul className="flex flex-col gap-px overflow-hidden rounded-[var(--radio)] border border-white/10">
            {DIFERENCIAS.map((d) => (
              <li
                key={d.clave}
                className="flex flex-col gap-2 border-b border-white/10 bg-white/[0.03] px-6 py-6 last:border-b-0"
              >
                <h3 className="font-display text-lg uppercase leading-none tracking-tight">
                  {d.clave}
                </h3>
                <p className="text-[0.95rem] text-[var(--on-dark-muted)]">
                  {d.texto}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --- Estado del proyecto ------------------------------------------- */}
      <section className="seccion" style={{ background: "var(--primary)" }}>
        <div className="contenedor flex flex-col items-start gap-7 text-white">
          <p
            className="antetitulo"
            style={{ color: "rgb(255 255 255 / 0.72)" }}
          >
            En construcción
          </p>
          <h2 className="titular-seccion max-w-[18ch]">
            El sitio se está armando. La cartelera llega primero.
          </h2>
          <p className="bajada" style={{ color: "rgb(255 255 255 / 0.85)" }}>
            Ya funcionan la base de datos, los permisos de la redacción y el
            panel de publicación. Lo próximo es cargar las salas, las temporadas
            y las funciones de Buenos Aires y el conurbano.
          </p>
          <Link
            href="/contacto"
            className="boton"
            style={{ background: "#fff", color: "var(--primary)" }}
          >
            Escribinos
          </Link>
        </div>
      </section>

      <PieDePagina />
    </>
  );
}
