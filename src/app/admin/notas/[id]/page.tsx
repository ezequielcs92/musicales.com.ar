import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { sesion } from "@/lib/auth";
import { ETIQUETA_ESTADO, estadosPermitidos, type Estado } from "@/lib/editorial";

import { EditorNota } from "../EditorNota";

export const metadata: Metadata = { title: "Editar nota" };

export default async function EditarNota({ params }: PageProps<"/admin/notas/[id]">) {
  const { id } = await params;
  const s = await sesion();
  if (!s) return null;

  // Sin comprobar permisos a mano: si RLS no deja verla, no vuelve nada.
  const { data: nota } = await s.supabase
    .from("articles")
    .select("id, title, section, status, dek, body_mdx, slug, published_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (!nota) notFound();

  const estado = nota.status as Estado;

  // Un colaborador conserva la nota solo mientras es borrador. Se le muestra el
  // estado real en vez de un formulario que la base va a rechazar igual.
  const soloLectura = s.rol === "colaborador" && estado !== "borrador";

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-3">
        <Link
          href="/admin/notas"
          className="self-start font-mono text-[0.64rem] uppercase tracking-[0.1em] text-muted hover:text-ink"
        >
          ← Notas
        </Link>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <h1 className="font-display text-3xl">{nota.title}</h1>
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-muted">
            {ETIQUETA_ESTADO[estado]}
            {nota.published_at &&
              ` · publicada el ${new Date(nota.published_at).toLocaleDateString("es-AR")}`}
          </span>
        </div>
        <p className="font-mono text-[0.64rem] text-muted">/{nota.slug}</p>
      </div>

      {soloLectura ? (
        <div className="flex flex-col gap-4">
          <p className="border-l-2 border-bombilla bg-ultimas-bg px-4 py-3 text-sm text-ultimas">
            Esta nota está en revisión, así que ya no la podés editar. Si
            necesitás cambiar algo, pedíselo a un editor.
          </p>
          <article className="whitespace-pre-wrap border border-rule bg-papel-2 p-5 font-mono text-sm leading-relaxed text-ink-soft">
            {nota.body_mdx || "(sin cuerpo)"}
          </article>
        </div>
      ) : (
        <EditorNota
          nota={{
            id: nota.id,
            title: nota.title,
            section: nota.section,
            status: nota.status,
            dek: nota.dek,
            body_mdx: nota.body_mdx,
          }}
          estados={estadosPermitidos(s.rol)}
          avisoColaborador={s.rol === "colaborador"}
        />
      )}
    </div>
  );
}
