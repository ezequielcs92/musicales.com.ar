"use client";

import { useDeferredValue, useMemo, useState } from "react";

export type SalaPublica = {
  id: string;
  slug: string;
  name: string;
  address: string | null;
  neighborhood: string | null;
  seats: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  lat: number | null;
  lng: number | null;
};

const sinAcentos = (t: string) =>
  t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** Telefono a formato marcable: se queda solo con digitos y el + inicial. */
const aTel = (t: string) => "tel:" + t.replace(/[^\d+]/g, "").slice(0, 20);

export function ListaSalas({ salas }: { salas: SalaPublica[] }) {
  const [texto, setTexto] = useState("");
  const [barrio, setBarrio] = useState("");
  const [soloContacto, setSoloContacto] = useState(false);
  // Con 300 y pico de salas, filtrar en cada tecla traba la escritura.
  const busqueda = useDeferredValue(texto);

  const barrios = useMemo(
    () =>
      [...new Set(salas.map((s) => s.neighborhood).filter(Boolean))].sort(
        (a, b) => a!.localeCompare(b!, "es"),
      ) as string[],
    [salas],
  );

  const visibles = useMemo(() => {
    const q = sinAcentos(busqueda.trim());
    return salas.filter((s) => {
      if (barrio && s.neighborhood !== barrio) return false;
      if (soloContacto && !s.phone && !s.email && !s.website) return false;
      if (!q) return true;
      return (
        sinAcentos(s.name).includes(q) ||
        sinAcentos(s.address ?? "").includes(q) ||
        sinAcentos(s.neighborhood ?? "").includes(q)
      );
    });
  }, [salas, busqueda, barrio, soloContacto]);

  const campo =
    "w-full rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 py-3 text-base outline-none focus-visible:border-[var(--primary)]";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <label>
            <span className="sr-only">Buscar sala por nombre, dirección o barrio</span>
            <input
              type="search"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Buscar por nombre, dirección o barrio…"
              className={campo}
            />
          </label>
          <label>
            <span className="sr-only">Filtrar por barrio</span>
            <select
              value={barrio}
              onChange={(e) => setBarrio(e.target.value)}
              className={campo}
            >
              <option value="">Todos los barrios</option>
              {barrios.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-[var(--muted)]">
            <input
              type="checkbox"
              checked={soloContacto}
              onChange={(e) => setSoloContacto(e.target.checked)}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            Solo las que tienen forma de contacto
          </label>
          <p className="font-mono text-xs tabular-nums text-[var(--muted)]">
            {visibles.length} de {salas.length}
          </p>
        </div>
      </div>

      {visibles.length === 0 ? (
        <p className="py-12 text-center text-[var(--muted)]">
          No encontramos salas con esa búsqueda.
        </p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {visibles.map((s) => {
            const mapa =
              s.lat && s.lng
                ? `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`
                : null;

            return (
              <li key={s.id} className="tarjeta flex flex-col gap-3 p-5">
                <div className="flex flex-col gap-1">
                  <h2 className="font-display text-lg uppercase leading-tight tracking-tight">
                    {s.name}
                  </h2>
                  <p className="text-sm text-[var(--muted)]">
                    {s.address}
                    {s.neighborhood && ` · ${s.neighborhood}`}
                    {s.seats && ` · ${s.seats.toLocaleString("es-AR")} butacas`}
                  </p>
                </div>

                {/* El proposito de la seccion: que se pueda contactar. Cada via
                    es accionable, no texto para copiar a mano. */}
                <div className="flex flex-wrap gap-2">
                  {s.phone && (
                    <a href={aTel(s.phone)} className="chip chip-estreno">
                      Llamar
                    </a>
                  )}
                  {s.email && (
                    <a href={`mailto:${s.email}`} className="chip chip-estreno">
                      Escribir
                    </a>
                  )}
                  {s.website && (
                    <a
                      href={
                        s.website.startsWith("http")
                          ? s.website
                          : `https://${s.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="chip chip-estreno"
                    >
                      Sitio ↗
                    </a>
                  )}
                  {s.instagram && (
                    <a
                      href={`https://instagram.com/${s.instagram.replace(/^@|^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/$/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="chip chip-estreno"
                    >
                      Instagram ↗
                    </a>
                  )}
                  {mapa && (
                    <a
                      href={mapa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="chip chip-cartel"
                    >
                      Cómo llegar ↗
                    </a>
                  )}
                  {!s.phone && !s.email && !s.website && !s.instagram && (
                    <span className="text-xs text-[var(--muted)]">
                      Sin datos de contacto publicados
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
