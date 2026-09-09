import { LogoMarca } from "@/components/LogoMarca";

const SECCIONES = [
  { nombre: "Cartelera", detalle: "Que musicales hay en cartel, donde y a que precio" },
  { nombre: "Criticas", detalle: "Reseñas de las funciones, con la fecha en que se vieron" },
  { nombre: "Noticias", detalle: "Estrenos, cambios de elenco, cierres de temporada" },
  { nombre: "Talleres", detalle: "Talleres de montaje, separados del entrenamiento semanal" },
  { nombre: "Audiciones", detalle: "Convocatorias abiertas, con roles, bases y plazos" },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-14 px-6 py-20">
      <header className="flex flex-col items-center gap-7 text-center">
        <LogoMarca size={34} />
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.26em] text-muted">
          Teatro musical argentino
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <h1 className="font-display text-3xl leading-tight text-balance sm:text-4xl">
          Estamos construyendo el sitio.
        </h1>
        <p className="max-w-[54ch] text-lg leading-relaxed text-ink-soft">
          Un solo lugar para saber que musicales hay en cartel en Buenos Aires,
          que talleres de montaje tienen inscripcion abierta y que audiciones
          estan convocando. Con criticas que dicen de que funcion hablan.
        </p>
      </div>

      <ul className="flex flex-col border-t border-rule">
        {SECCIONES.map((s) => (
          <li
            key={s.nombre}
            className="flex flex-col gap-1 border-b border-rule py-4 sm:flex-row sm:items-baseline sm:gap-6"
          >
            <span className="font-display text-base uppercase tracking-wide sm:w-32 sm:shrink-0">
              {s.nombre}
            </span>
            <span className="text-[0.95rem] text-muted">{s.detalle}</span>
          </li>
        ))}
      </ul>

      <footer className="font-mono text-[0.68rem] uppercase leading-relaxed tracking-[0.1em] text-muted">
        <p>Buenos Aires y Gran Buenos Aires · Temporada 2026</p>
      </footer>
    </main>
  );
}
