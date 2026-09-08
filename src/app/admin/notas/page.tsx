import Link from "next/link";

import { sesion } from "@/lib/auth";
import { ETIQUETA_ESTADO, esStaff, type Estado } from "@/lib/editorial";

const COLOR_ESTADO: Record<Estado, string> = {
  borrador: "bg-papel-3 text-muted",
  en_revision: "bg-ultimas-bg text-ultimas",
  programado: "bg-telon-soft text-telon",
  publicado: "bg-en-cartel-bg text-en-cartel",
  archivado: "bg-papel-3 text-muted",
};

export default async function Notas({ searchParams }: PageProps<"/admin/notas">) {
  const s = await sesion();
  if (!s) return null;

  const params = await searchParams;
  const filtro = typeof params.estado === "string" ? params.estado : null;

  let consulta = s.supabase
    .from("articles")
    .select("id, title, section, status, updated_at, author_id, profiles!articles_author_id_fkey(display_name)")
    .order("updated_at", { ascending: false })
    .limit(100);

  if (filtro) consulta = consulta.eq("status", filtro as Estado);

  const { data: notas, error } = await consulta;

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="font-display text-3xl">Notas</h1>
        <Link
          href="/admin/notas/nueva"
          className="bg-sala px-4 py-2 font-display text-xs uppercase tracking-wide text-papel hover:opacity-90 dark:bg-papel-3 dark:text-ink"
        >
          Escribir una nota
        </Link>
      </div>

      <nav className="flex flex-wrap gap-x-5 gap-y-2 border-b border-rule pb-3">
        <Link
          href="/admin/notas"
          className={`font-mono text-[0.66rem] uppercase tracking-[0.1em] ${
            filtro ? "text-muted hover:text-ink" : "text-telon"
          }`}
        >
          Todas
        </Link>
        {(Object.keys(ETIQUETA_ESTADO) as Estado[]).map((e) => (
          <Link
            key={e}
            href={`/admin/notas?estado=${e}`}
            className={`font-mono text-[0.66rem] uppercase tracking-[0.1em] ${
              filtro === e ? "text-telon" : "text-muted hover:text-ink"
            }`}
          >
            {ETIQUETA_ESTADO[e]}
          </Link>
        ))}
      </nav>

      {error && (
        <p role="alert" className="text-sm text-telon">
          No se pudieron cargar las notas: {error.message}
        </p>
      )}

      {notas && notas.length === 0 && (
        <p className="py-10 text-center text-ink-soft">
          {filtro
            ? "No hay notas en ese estado."
            : "Todavía no hay ninguna nota. Empezá por la primera."}
        </p>
      )}

      <ul className="flex flex-col">
        {notas?.map((n) => {
          const autor = Array.isArray(n.profiles) ? n.profiles[0] : n.profiles;
          const propia = n.author_id === s.user.id;
          return (
            <li key={n.id} className="border-b border-rule">
              <Link
                href={`/admin/notas/${n.id}`}
                className="flex flex-col gap-2 py-4 hover:bg-papel-2 sm:flex-row sm:items-baseline sm:gap-5"
              >
                <span
                  className={`inline-block shrink-0 self-start rounded-sm px-2 py-1 font-mono text-[0.58rem] uppercase tracking-[0.08em] ${
                    COLOR_ESTADO[n.status as Estado]
                  }`}
                >
                  {ETIQUETA_ESTADO[n.status as Estado]}
                </span>
                <span className="flex-1 font-display text-base leading-snug">
                  {n.title}
                </span>
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted">
                  {esStaff(s.rol) && !propia && autor?.display_name
                    ? `${autor.display_name} · `
                    : ""}
                  {new Date(n.updated_at).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
