import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { sesion } from "@/lib/auth";
import { esStaff, estadosPermitidos, type Estado } from "@/lib/editorial";
import { renderizarContenido } from "@/lib/contenido";
import { EstadoNota } from "@/components/admin/EstadoNota";
import { EditorNota } from "../EditorNota";

export const metadata: Metadata = { title: "Editar nota" };
export default async function EditarNota({ params }: PageProps<"/admin/notas/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();
  const s = await sesion();
  if (!s) return null;
  const { data: nota, error } = await s.supabase.from("articles").select("id, title, section, status, dek, body_mdx, slug, published_at, updated_at, author_id").eq("id", id).maybeSingle();
  if (error) return <p role="alert" className="admin-notice admin-notice-error">No se pudo cargar la nota. Volvé a intentar.</p>;
  if (!nota) notFound();
  const estado = nota.status as Estado;
  const soloLectura = !esStaff(s.rol) && (nota.author_id !== s.user.id || (s.rol === "colaborador" && estado !== "borrador"));
  return <>
    <Link href="/admin/notas" className="admin-breadcrumb"><ChevronLeft size={14} aria-hidden="true" /> Volver a notas</Link>
    <div className="admin-page-heading"><div><h1>{soloLectura ? "Consultar nota" : "Editar nota"}</h1><p>{nota.published_at ? `Publicada el ${new Date(nota.published_at).toLocaleDateString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })}` : "Trabajá el contenido y elegí cuándo enviarlo a revisión."}</p></div><EstadoNota estado={estado} /></div>
    {soloLectura ? <>
      <p className="admin-notice">Esta nota está disponible para lectura. {s.rol === "colaborador" ? "Si necesitás modificarla, pedíselo a un editor." : "Solo su autor o un editor pueden modificarla."}</p>
      <article className="admin-card"><div className="admin-card-body"><h2 style={{ fontSize: 25, fontWeight: 600 }}>{nota.title}</h2>{nota.dek && <p className="admin-muted">{nota.dek}</p>}</div><div className="admin-prose" dangerouslySetInnerHTML={{ __html: renderizarContenido(nota.body_mdx) || "<p>Sin contenido.</p>" }} /></article>
    </> : <EditorNota nota={nota} estados={estadosPermitidos(s.rol)} avisoColaborador={s.rol === "colaborador"} />}
  </>;
}
