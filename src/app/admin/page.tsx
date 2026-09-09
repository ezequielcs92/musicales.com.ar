import Link from "next/link";
import { ArrowRight, FilePlus2, FileText, Plus } from "lucide-react";
import { sesion } from "@/lib/auth";
import { contarNotas } from "@/lib/admin";
import { esStaff, type Estado } from "@/lib/editorial";
import { EstadoNota } from "@/components/admin/EstadoNota";

export default async function PanelInicio() {
  const s = await sesion();
  if (!s) return null;
  let recientes = s.supabase.from("articles").select("id, title, status, section, updated_at").order("updated_at", { ascending: false }).limit(5);
  if (!esStaff(s.rol)) recientes = recientes.eq("author_id", s.user.id);
  const [conteos, { data: notas, error }] = await Promise.all([contarNotas(s), recientes]);
  const revisiones = conteos.find((item) => item.estado === "en_revision")?.cantidad ?? 0;

  return <>
    <div className="admin-page-heading"><div><h1>Escritorio</h1><p>{esStaff(s.rol) ? "Una vista general de tu redacción." : "Tus notas y tu actividad editorial."}</p></div><Link href="/admin/notas/nueva" className="admin-button"><Plus size={17} aria-hidden="true" /> Añadir nueva</Link></div>
    <section className="admin-card admin-welcome"><div><span className="admin-eyebrow">Musicales.com.ar · Redacción</span><h2>Las próximas historias empiezan acá.</h2><p>Escribí una nota, retomá un borrador o revisá qué está listo para salir. Todo el trabajo editorial, en un solo lugar.</p></div><Link href="/admin/notas/nueva" className="admin-button admin-button-secondary"><FilePlus2 size={18} aria-hidden="true" /> Escribir una nota</Link></section>
    {conteos.some((item) => item.error) && <p role="alert" className="admin-notice admin-notice-error">No se pudieron actualizar algunos contadores. Volvé a cargar el escritorio.</p>}
    <div className="admin-stats">{conteos.map(({ estado, cantidad }) => <Link href={`/admin/notas?estado=${estado}`} key={estado} className="admin-card admin-stat"><EstadoNota estado={estado} /><strong>{cantidad ?? "—"}</strong><span>Ver notas <ArrowRight size={14} aria-hidden="true" /></span></Link>)}</div>
    {esStaff(s.rol) && revisiones > 0 && <div className="admin-notice"><Link className="admin-link" href="/admin/notas?estado=en_revision">{revisiones === 1 ? "Hay una nota esperando tu revisión." : `Hay ${revisiones} notas esperando tu revisión.`} Abrir revisión →</Link></div>}
    <div className="admin-dashboard-columns">
      <section className="admin-card"><div className="admin-card-header"><h2>Actividad reciente</h2><Link href="/admin/notas" className="admin-link">Ver todas</Link></div>
        {error ? <p role="alert" className="admin-card-body">No se pudo cargar la actividad reciente.</p> : notas?.length ? <ul className="admin-recent">{notas.map((nota) => <li key={nota.id}><Link href={`/admin/notas/${nota.id}`}><div><strong>{nota.title}</strong><small>Actualizada el {new Date(nota.updated_at).toLocaleDateString("es-AR", { day: "numeric", month: "short", timeZone: "America/Argentina/Buenos_Aires" })}</small></div><EstadoNota estado={nota.status as Estado} /></Link></li>)}</ul> : <div className="admin-empty"><FileText size={29} aria-hidden="true" /><h2>Tu primera historia te espera</h2><p>Cuando empieces a escribir, tus notas aparecerán acá.</p><Link href="/admin/notas/nueva" className="admin-link">Crear la primera nota →</Link></div>}
      </section>
      <section className="admin-card"><div className="admin-card-header"><h2>Tu flujo de publicación</h2></div><ol className="admin-workflow"><li><div><strong>Escribí y guardá</strong><p>Trabajá el contenido en el editor visual. Guardalo como borrador para continuar después.</p></div></li><li><div><strong>Revisá la nota</strong><p>Comprobá el título, la bajada y los enlaces antes de avanzar.</p></div></li><li><div><strong>{s.rol === "colaborador" ? "Enviá a revisión" : "Publicá cuando esté lista"}</strong><p>{s.rol === "colaborador" ? "Un editor recibe tu nota y se ocupa de publicarla." : "Elegí el estado de publicación desde el panel de la nota."}</p></div></li></ol></section>
    </div>
  </>;
}
