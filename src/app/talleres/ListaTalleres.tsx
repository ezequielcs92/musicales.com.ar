"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ETIQUETA_FORMACION, type TipoFormacion } from "@/lib/editorial";

export type TallerPublico = {
  id: string;
  title: string;
  kind: TipoFormacion;
  description: string | null;
  enrollment_open: boolean;
  source_url: string;
  verified_at: string | null;
  escuela: string | null;
  donde: string | null;
};

const FILTROS: { valor: TipoFormacion | ""; etiqueta: string }[] = [
  { valor: "", etiqueta: "Todo" },
  { valor: "montaje", etiqueta: "Montaje" },
  { valor: "carrera", etiqueta: "Carreras" },
  { valor: "curso", etiqueta: "Cursos" },
  { valor: "especializacion", etiqueta: "Especializaciones" },
  { valor: "workshop", etiqueta: "Workshops" },
];

/**
 * Filtrado en el navegador, no por URL.
 *
 * Con este volumen, mandar el filtro al servidor convertiria la pagina en
 * dinamica: consulta a la base en cada visita y CPU del worker gastado en algo
 * que el navegador resuelve al instante. La pagina queda cacheada y el filtro
 * responde sin recargar.
 */
export function ListaTalleres({ talleres }: { talleres: TallerPublico[] }) {
  const [tipo, setTipo] = useState<TipoFormacion | "">("");
  const [soloAbiertos, setSoloAbiertos] = useState(false);

  const visibles = useMemo(
    () =>
      talleres.filter(
        (t) =>
          (!tipo || t.kind === tipo) && (!soloAbiertos || t.enrollment_open),
      ),
    [talleres, tipo, soloAbiertos],
  );

  const cuenta = (v: TipoFormacion | "") =>
    talleres.filter(
      (t) => (!v || t.kind === v) && (!soloAbiertos || t.enrollment_open),
    ).length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div
          role="group"
          aria-label="Filtrar por tipo de formación"
          className="flex flex-wrap gap-2"
        >
          {FILTROS.map((f) => {
            const activo = tipo === f.valor;
            const n = cuenta(f.valor);
            return (
              <button
                key={f.valor || "todo"}
                type="button"
                onClick={() => setTipo(f.valor)}
                aria-pressed={activo}
                disabled={n === 0 && !activo}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40 ${
                  activo
                    ? "border-transparent bg-[var(--primary)] text-white"
                    : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--text)]"
                }`}
              >
                {f.etiqueta}{" "}
                <span className="tabular-nums opacity-70">{n}</span>
              </button>
            );
          })}
        </div>

        <label className="inline-flex w-fit cursor-pointer items-center gap-2 text-sm text-[var(--muted)]">
          <input
            type="checkbox"
            checked={soloAbiertos}
            onChange={(e) => setSoloAbiertos(e.target.checked)}
            className="h-4 w-4 accent-[var(--primary)]"
          />
          Solo con inscripción abierta
        </label>
      </div>

      {visibles.length === 0 ? (
        <p className="py-12 text-center text-[var(--muted)]">
          No hay talleres con ese filtro.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {visibles.map((t) => (
            <li key={t.id} className="tarjeta flex flex-col gap-3 p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`chip ${
                    t.kind === "montaje" ? "chip-cartel" : "chip-estreno"
                  }`}
                >
                  {ETIQUETA_FORMACION[t.kind]}
                </span>
                {t.enrollment_open && (
                  <span className="chip chip-ultimas">Inscripción abierta</span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <h2 className="font-display text-xl uppercase leading-tight tracking-tight">
                  {t.title}
                </h2>
                <p className="text-sm text-[var(--muted)]">
                  {t.escuela}
                  {t.donde && ` · ${t.donde}`}
                </p>
              </div>

              {t.description && (
                <p className="max-w-[70ch] text-[0.96rem] leading-relaxed">
                  {t.description}
                </p>
              )}

              {/* La fuente no es un adorno: es la regla editorial. Se
                  reproduce lo que informa la escuela y se enlaza a ella. */}
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.82rem] text-[var(--muted)]">
                <a
                  href={t.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--primary)] underline underline-offset-2"
                >
                  Ver en el sitio de la escuela ↗
                </a>
                <span>
                  {t.verified_at
                    ? "Confirmado con la escuela"
                    : "Según lo que publica la escuela"}
                </span>
              </p>
            </li>
          ))}
        </ul>
      )}

      <p className="max-w-[64ch] border-l-2 border-[var(--primary)] pl-5 text-[0.94rem] text-[var(--muted)]">
        Los aranceles no se publican acá: cambian seguido y la escuela es quien
        tiene el dato al día. Si dirigís una escuela y querés aparecer o
        corregir algo,{" "}
        <Link
          href="/contacto"
          className="text-[var(--primary)] underline underline-offset-2"
        >
          escribinos
        </Link>
        . No tiene costo.
      </p>
    </div>
  );
}
