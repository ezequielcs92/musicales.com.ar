import type { Metadata } from "next";
import Link from "next/link";

import { PaginaPublica } from "@/components/PaginaPublica";
import { clientePublico, fecha } from "@/lib/publico";

export const metadata: Metadata = {
  title: "Audiciones y castings",
  description:
    "Convocatorias abiertas de teatro musical en Argentina: roles buscados, requisitos y plazos.",
};

// Una convocatoria puede abrir cualquier día y los plazos suelen ser cortos.
export const revalidate = 900;

const ETIQUETA_TIPO: Record<string, string> = {
  obra: "Casting para un montaje",
  representacion: "Representante buscando talento",
  ensamble: "Ensamble, cover o swing",
};

export default async function Audiciones() {
  const supabase = clientePublico();
  const ahora = new Date().toISOString();

  // Vigentes: las que todavía no cerraron, y las que no declaran cierre.
  const { data, error } = await supabase
    .from("auditions")
    .select(
      "id, title, kind, organizer, description, requirements, how_to_apply, requires_arca, is_paid, city, closes_at, source_url, contact_email, productions(title)",
    )
    .or(`closes_at.gte.${ahora},closes_at.is.null`)
    .order("closes_at", { ascending: true, nullsFirst: false })
    .limit(60);

  const abiertas = data ?? [];

  return (
    <PaginaPublica
      antetitulo="Audiciones"
      titulo="Convocatorias abiertas, verificadas."
      bajada={
        abiertas.length
          ? `${abiertas.length} ${abiertas.length === 1 ? "convocatoria vigente" : "convocatorias vigentes"}. Publicamos solo lo que pudimos chequear contra la fuente oficial.`
          : "Qué se está buscando, con qué requisitos y hasta cuándo hay tiempo."
      }
    >
      {error ? (
        <p role="alert" className="text-[var(--primary)]">
          No pudimos cargar las convocatorias. Probá de nuevo en unos minutos.
        </p>
      ) : abiertas.length === 0 ? (
        <div className="flex max-w-[62ch] flex-col gap-4">
          <p className="text-[1.05rem]">
            No hay convocatorias vigentes cargadas en este momento.
          </p>
          <p className="text-[var(--muted)]">
            Relevamos de las fuentes que son confiables: el Complejo Teatral de
            Buenos Aires, el Teatro Nacional Cervantes y las productoras
            comerciales. Preferimos que la sección esté vacía antes que publicar
            una convocatoria que no existe.
          </p>
          <p className="text-[var(--muted)]">
            ¿Estás buscando elenco?{" "}
            <Link
              href="/contacto"
              className="text-[var(--primary)] underline underline-offset-2"
            >
              Escribinos
            </Link>{" "}
            y la publicamos sin costo.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-5">
          {abiertas.map((a) => {
            const obra = Array.isArray(a.productions)
              ? a.productions[0]
              : a.productions;

            return (
              <li key={a.id} className="tarjeta flex flex-col gap-3 p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip chip-estreno">
                    {ETIQUETA_TIPO[a.kind] ?? a.kind}
                  </span>
                  {a.is_paid && (
                    <span className="chip chip-cartel">Remunerada</span>
                  )}
                  {/* Filtro que nadie más ofrece y que evita un viaje al
                      pedo: las convocatorias oficiales exigen inscripción
                      fiscal vigente. */}
                  {a.requires_arca && (
                    <span className="chip chip-ultimas">Pide ARCA</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <h2 className="font-display text-xl uppercase leading-tight tracking-tight">
                    {a.title}
                  </h2>
                  <p className="text-sm text-[var(--muted)]">
                    {a.organizer}
                    {obra?.title && ` · ${obra.title}`}
                    {a.city && ` · ${a.city}`}
                  </p>
                </div>

                {a.description && (
                  <p className="max-w-[70ch] leading-relaxed">{a.description}</p>
                )}
                {a.requirements && (
                  <p className="max-w-[70ch] text-[0.94rem] text-[var(--muted)]">
                    <strong>Requisitos:</strong> {a.requirements}
                  </p>
                )}
                {a.how_to_apply && (
                  <p className="max-w-[70ch] text-[0.94rem]">
                    <strong>Cómo postularse:</strong> {a.how_to_apply}
                  </p>
                )}

                <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.84rem] text-[var(--muted)]">
                  {a.closes_at && (
                    <span className="text-[var(--ultimas)]">
                      Cierra el {fecha(a.closes_at)}
                    </span>
                  )}
                  {a.source_url && (
                    <a
                      href={a.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--primary)] underline underline-offset-2"
                    >
                      Bases oficiales ↗
                    </a>
                  )}
                  {a.contact_email && (
                    <a
                      href={`mailto:${a.contact_email}`}
                      className="text-[var(--primary)] underline underline-offset-2"
                    >
                      Escribir
                    </a>
                  )}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </PaginaPublica>
  );
}
