import Link from "next/link";
import { FileText, Plus, Search } from "lucide-react";
import { sesion } from "@/lib/auth";
import { contarNotas } from "@/lib/admin";
import { ETIQUETA_ESTADO, SECCIONES, esStaff, type Estado, type Seccion } from "@/lib/editorial";
import { EstadoNota } from "@/components/admin/EstadoNota";

const POR_PAGINA = 20;
export default async function Notas({ searchParams }: PageProps<"/admin/notas">) {
  const s = await sesion();
  if (!s) return null;
  const params = await searchParams;
  const filtro = typeof params.estado === "string" && Object.hasOwn(ETIQUETA_ESTADO, params.estado) ? params.estado as Estado : "";
  const seccion = typeof params.seccion === "string" && SECCIONES.some((item) => item.valor === params.seccion) ? params.seccion as Seccion : "";
  const busqueda = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const pagina = Math.min(10000, Math.max(1, Number.parseInt(typeof params.pagina === "string" ? params.pagina : "1", 10) || 1));
  function enlace(overrides: Record<string, string>) {
    const query = new URLSearchParams({ ...(filtro && { estado: filtro }), ...(seccion && { seccion }), ...(busqueda && { q: busqueda }), ...overrides });
    for (const [key, value] of [...query]) if (!value) query.delete(key);
    return `/admin/notas${query.size ? `?${query}` : ""}` as const;
  }
  let consulta = s.supabase.from("articles").select("id, title, section, status, updated_at, author_id, profiles!articles_author_id_fkey(display_name)", { count: "exact" }).order("updated_at", { ascending: false }).order("id").range((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA - 1);
  if (!esStaff(s.rol)) consulta = consulta.eq("author_id", s.user.id);
  if (filtro) consulta = consulta.eq("status", filtro);
  if (seccion) consulta = consulta.eq("section", seccion);
  if (busqueda) consulta = consulta.ilike("title", `%${busqueda.replace(/[\\%_]/g, "\\$&")}%`);
  const [{ data: notas, error, count }, conteos] = await Promise.all([consulta, contarNotas(s)]);
  const total = count ?? 0;
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const totalEstados = conteos.some((item) => item.error) ? null : conteos.reduce((sum, item) => sum + (item.cantidad ?? 0), 0);
  return <>
    <div className="admin-page-heading"><div><h1>Notas</h1><p>{esStaff(s.rol) ? "Organizá y editá las publicaciones de la redacción." : "Administrá tus borradores y publicaciones."}</p></div><Link href="/admin/notas/nueva" className="admin-button"><Plus size={17} aria-hidden="true" /> Añadir nueva</Link></div>
    <nav className="admin-filter-tabs" aria-label="Filtrar notas por estado"><Link href={enlace({ estado: "", pagina: "" })} aria-current={!filtro ? "page" : undefined}>Todas {totalEstados !== null ? `(${totalEstados})` : ""}</Link>{conteos.map(({ estado, cantidad }) => <Link key={estado} href={enlace({ estado, pagina: "" })} aria-current={filtro === estado ? "page" : undefined}>{ETIQUETA_ESTADO[estado]} {cantidad !== null ? `(${cantidad})` : ""}</Link>)}</nav>
    <form action="/admin/notas" method="get" className="admin-filter-form">
      {filtro && <input type="hidden" name="estado" value={filtro} />}
      <label className="admin-search"><span className="admin-sr-only">Buscar notas por título</span><Search size={17} aria-hidden="true" /><input className="admin-input" type="search" name="q" defaultValue={busqueda} placeholder="Buscar por título…" maxLength={100} /></label>
      <label><span className="admin-sr-only">Filtrar por sección</span><select className="admin-input" name="seccion" defaultValue={seccion}><option value="">Todas las secciones</option>{SECCIONES.map((item) => <option key={item.valor} value={item.valor}>{item.etiqueta}</option>)}</select></label>
      <button className="admin-button admin-button-secondary" type="submit">Filtrar</button>{(filtro || seccion || busqueda) && <Link href="/admin/notas" className="admin-link">Limpiar filtros</Link>}
    </form>
    {error ? <p role="alert" className="admin-notice admin-notice-error">No se pudieron cargar las notas. Volvé a intentar en unos minutos.</p> : <section className="admin-card" aria-label="Listado de notas">
      {notas?.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th scope="col">Título</th><th scope="col">Autor</th><th scope="col">Sección</th><th scope="col">Estado</th><th scope="col">Actualización</th></tr></thead><tbody>{notas.map((nota) => {
        const autor = Array.isArray(nota.profiles) ? nota.profiles[0] : nota.profiles;
        return <tr key={nota.id}><td><Link href={`/admin/notas/${nota.id}`} className="admin-note-title">{nota.title}</Link><Link href={`/admin/notas/${nota.id}`} className="admin-row-action">Abrir nota</Link></td><td>{nota.author_id === s.user.id ? "Vos" : autor?.display_name || "Redacción"}</td><td>{SECCIONES.find((item) => item.valor === nota.section)?.etiqueta}</td><td><EstadoNota estado={nota.status as Estado} /></td><td><time dateTime={nota.updated_at}>{new Date(nota.updated_at).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric", timeZone: "America/Argentina/Buenos_Aires" })}</time></td></tr>;
      })}</tbody></table></div> : <div className="admin-empty"><FileText size={30} aria-hidden="true" /><h2>{filtro || seccion || busqueda ? "No hay notas con estos filtros" : "Todavía no hay notas"}</h2><p>{filtro || seccion || busqueda ? "Probá otra búsqueda o volvé al listado completo." : "Empezá a escribir la primera historia de la redacción."}</p><Link href={filtro || seccion || busqueda ? "/admin/notas" : "/admin/notas/nueva"} className="admin-link">{filtro || seccion || busqueda ? "Ver todas las notas" : "Crear una nota"} →</Link></div>}
      <div className="admin-pagination"><span>{total} {total === 1 ? "nota" : "notas"}</span><div>{pagina > 1 && <Link className="admin-link" href={enlace({ pagina: String(pagina - 1) })}>← Anterior</Link>}<span>Página {pagina} de {paginas}</span>{pagina < paginas && <Link className="admin-link" href={enlace({ pagina: String(pagina + 1) })}>Siguiente →</Link>}</div></div>
    </section>}
  </>;
}
