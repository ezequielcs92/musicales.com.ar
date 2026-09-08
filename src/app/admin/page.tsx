import Link from "next/link";

import { sesion } from "@/lib/auth";
import { ETIQUETA_ESTADO, esStaff, type Estado } from "@/lib/editorial";

export default async function PanelInicio() {
  const s = await sesion();
  if (!s) return null;

  // Sin filtros: las politicas RLS ya deciden que ve cada rol. El colaborador
  // recibe solo lo suyo aunque la consulta pida todo.
  const { data: notas } = await s.supabase
    .from("articles")
    .select("id, status")
    .order("updated_at", { ascending: false });

  const porEstado = new Map<Estado, number>();
  for (const n of notas ?? []) {
    const e = n.status as Estado;
    porEstado.set(e, (porEstado.get(e) ?? 0) + 1);
  }

  const orden: Estado[] = [
    "borrador",
    "en_revision",
    "programado",
    "publicado",
    "archivado",
  ];

  const enRevision = porEstado.get("en_revision") ?? 0;

  return (
    <div className="flex flex-col gap-9">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl">Panel</h1>
        <p className="text-ink-soft">
          {esStaff(s.rol)
            ? "Ves todas las notas de la redacción."
            : "Ves solo tus notas."}
        </p>
      </div>

      {esStaff(s.rol) && enRevision > 0 && (
        <Link
          href="/admin/notas?estado=en_revision"
          className="flex items-baseline gap-3 border-l-2 border-bombilla bg-ultimas-bg px-4 py-3 text-ultimas"
        >
          <span className="font-display text-lg">{enRevision}</span>
          <span className="text-sm">
            {enRevision === 1 ? "nota espera revisión" : "notas esperan revisión"}
          </span>
        </Link>
      )}

      <ul className="grid grid-cols-2 gap-px border border-rule bg-rule sm:grid-cols-5">
        {orden.map((e) => (
          <li key={e} className="flex flex-col gap-1 bg-papel-2 px-4 py-5">
            <span className="font-display text-2xl tabular-nums">
              {porEstado.get(e) ?? 0}
            </span>
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted">
              {ETIQUETA_ESTADO[e]}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/notas/nueva"
          className="bg-sala px-5 py-3 font-display text-sm uppercase tracking-wide text-papel hover:opacity-90 dark:bg-papel-3 dark:text-ink"
        >
          Escribir una nota
        </Link>
        <Link
          href="/admin/notas"
          className="border border-rule px-5 py-3 font-display text-sm uppercase tracking-wide hover:border-ink"
        >
          Ver todas
        </Link>
      </div>
    </div>
  );
}
