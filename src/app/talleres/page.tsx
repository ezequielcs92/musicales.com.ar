import type { Metadata } from "next";

import { PaginaPublica } from "@/components/PaginaPublica";
import type { TipoFormacion } from "@/lib/editorial";
import { clientePublico } from "@/lib/publico";

import { ListaTalleres, type TallerPublico } from "./ListaTalleres";

export const metadata: Metadata = {
  title: "Talleres y formación",
  description:
    "Talleres de montaje, carreras, cursos y workshops de teatro musical en Buenos Aires y Gran Buenos Aires.",
};

// Los talleres cambian por temporada, no por hora. Sin `searchParams`, la
// pagina queda estatica y se regenera sola: el visitante recibe HTML cacheado
// y el worker no ejecuta nada.
export const revalidate = 3600;

export default async function Talleres() {
  const supabase = clientePublico();
  const { data, error } = await supabase
    .from("workshops")
    .select(
      "id, title, kind, description, enrollment_open, source_url, verified_at, schools(name, neighborhood, city)",
    )
    .order("enrollment_open", { ascending: false })
    .order("title");

  const talleres: TallerPublico[] = (data ?? []).map((t) => {
    const escuela = Array.isArray(t.schools) ? t.schools[0] : t.schools;
    return {
      id: t.id,
      title: t.title,
      kind: t.kind as TipoFormacion,
      description: t.description,
      enrollment_open: t.enrollment_open,
      source_url: t.source_url,
      verified_at: t.verified_at,
      escuela: escuela?.name ?? null,
      donde:
        [escuela?.neighborhood, escuela?.city].filter(Boolean).join(", ") ||
        null,
    };
  });

  const abiertos = talleres.filter((t) => t.enrollment_open).length;

  return (
    <PaginaPublica
      antetitulo="Formación"
      titulo="Dónde formarte en teatro musical."
      bajada={
        talleres.length
          ? `${talleres.length} propuestas relevadas, ${abiertos} con inscripción abierta. Con lo que informa cada escuela y el enlace para consultarle directo.`
          : "Talleres de montaje, carreras, cursos y workshops."
      }
    >
      {error ? (
        <p role="alert" className="text-[var(--primary)]">
          No pudimos cargar los talleres. Probá de nuevo en unos minutos.
        </p>
      ) : (
        <ListaTalleres talleres={talleres} />
      )}
    </PaginaPublica>
  );
}
