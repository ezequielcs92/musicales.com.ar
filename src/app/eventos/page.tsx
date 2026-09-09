import type { Metadata } from "next";
import Link from "next/link";

import { PaginaPublica } from "@/components/PaginaPublica";
import { clientePublico, fecha } from "@/lib/publico";

export const metadata: Metadata = {
  title: "Eventos y convocatorias",
  description:
    "Festivales, ciclos y convocatorias de teatro musical en Argentina.",
};

export const revalidate = 3600;

const ETIQUETA_TIPO: Record<string, string> = {
  festival: "Festival",
  ciclo: "Ciclo",
  encuentro: "Encuentro",
  premiacion: "Premiación",
  concurso: "Concurso",
};

export default async function Eventos() {
  const supabase = clientePublico();
  const hoy = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("events")
    .select(
      "id, title, kind, description, organizer, city, starts_on, ends_on, website, source_url, has_open_call, call_closes_at, how_to_submit, venues(name)",
    )
    .or(`ends_on.gte.${hoy},ends_on.is.null`)
    .order("starts_on", { ascending: true, nullsFirst: false })
    .limit(60);

  const eventos = data ?? [];

  return (
    <PaginaPublica
      antetitulo="Eventos"
      titulo="Festivales, ciclos y convocatorias."
      bajada={
        eventos.length
          ? `${eventos.length} ${eventos.length === 1 ? "evento vigente" : "eventos vigentes"}. Dónde hay musicales fuera de la cartelera habitual, y dónde podés mandar tu proyecto.`
          : "Dónde hay musicales fuera de la cartelera habitual, y dónde podés mandar tu proyecto."
      }
    >
      {error ? (
        <p role="alert" className="text-[var(--primary)]">
          No pudimos cargar los eventos. Probá de nuevo en unos minutos.
        </p>
      ) : eventos.length === 0 ? (
        <div className="flex max-w-[62ch] flex-col gap-4">
          <p className="text-[1.05rem]">
            No hay eventos ni convocatorias vigentes cargados en este momento.
          </p>
          <p className="text-[var(--muted)]">
            Relevamos de fuentes oficiales. Si organizás un festival, un ciclo o
            una convocatoria,{" "}
            <Link
              href="/contacto"
              className="text-[var(--primary)] underline underline-offset-2"
            >
              escribinos
            </Link>
            : publicar no tiene costo ni contraprestación.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-5">
          {eventos.map((e) => {
            const sala = Array.isArray(e.venues) ? e.venues[0] : e.venues;

            return (
              <li key={e.id} className="tarjeta flex flex-col gap-3 p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip chip-estreno">
                    {ETIQUETA_TIPO[e.kind] ?? e.kind}
                  </span>
                  {e.has_open_call && (
                    <span className="chip chip-ultimas">Recibe propuestas</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <h2 className="font-display text-xl uppercase leading-tight tracking-tight">
                    {e.title}
                  </h2>
                  <p className="text-sm text-[var(--muted)]">
                    {e.organizer}
                    {sala?.name && ` · ${sala.name}`}
                    {e.city && ` · ${e.city}`}
                  </p>
                </div>

                {e.description && (
                  <p className="max-w-[70ch] leading-relaxed">{e.description}</p>
                )}

                {e.has_open_call && e.how_to_submit && (
                  <p className="max-w-[70ch] text-[0.94rem]">
                    <strong>Cómo enviar:</strong> {e.how_to_submit}
                  </p>
                )}

                <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.84rem] text-[var(--muted)]">
                  {e.starts_on && (
                    <span>
                      {fecha(e.starts_on)}
                      {e.ends_on &&
                        e.ends_on !== e.starts_on &&
                        ` al ${fecha(e.ends_on)}`}
                    </span>
                  )}
                  {e.call_closes_at && (
                    <span className="text-[var(--ultimas)]">
                      La convocatoria cierra el {fecha(e.call_closes_at)}
                    </span>
                  )}
                  <a
                    href={e.website ?? e.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--primary)] underline underline-offset-2"
                  >
                    Bases e información ↗
                  </a>
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </PaginaPublica>
  );
}
