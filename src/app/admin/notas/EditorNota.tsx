"use client";

import dynamic from "next/dynamic";
import { useActionState, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { ETIQUETA_ESTADO, SECCIONES, type Estado } from "@/lib/editorial";
import { renderizarContenido, requiereModoFuente } from "@/lib/contenido";
import { guardarNota, type EstadoFormulario } from "./acciones";

const EditorVisual = dynamic(() => import("@/components/admin/EditorVisual"), { ssr: false, loading: () => <div className="admin-prose" role="status">Cargando editor visual…</div> });
type Nota = { id: string; title: string; section: string; status: string; dek: string | null; body_mdx: string };

export function EditorNota({ nota, estados, avisoColaborador }: { nota?: Nota; estados: Estado[]; avisoColaborador: boolean }) {
  const [title, setTitle] = useState(nota?.title ?? "");
  const [dek, setDek] = useState(nota?.dek ?? "");
  const [body, setBody] = useState(nota?.body_mdx ?? "");
  const [section, setSection] = useState(nota?.section ?? "noticias");
  const [status, setStatus] = useState(nota?.status ?? "borrador");
  const [modo, setModo] = useState<"visual" | "fuente" | "previa">(() => requiereModoFuente(nota?.body_mdx ?? "") ? "fuente" : "visual");
  const [guardado, setGuardado] = useState(() => JSON.stringify([nota?.title ?? "", nota?.dek ?? "", nota?.body_mdx ?? "", nota?.section ?? "noticias", nota?.status ?? "borrador"]));
  const actual = JSON.stringify([title, dek, body, section, status]);
  const modificado = actual !== guardado;
  const [estado, accion, pendiente] = useActionState<EstadoFormulario, FormData>(async (prev, data) => {
    const resultado = await guardarNota(prev, data);
    if (resultado.ok) setGuardado(JSON.stringify([String(data.get("title") ?? ""), String(data.get("dek") ?? ""), String(data.get("body_mdx") ?? ""), String(data.get("section") ?? ""), String(data.get("status") ?? "")]));
    return resultado;
  }, {});
  const palabras = body.trim() ? body.trim().split(/\s+/).length : 0;
  const fuenteNecesaria = requiereModoFuente(body);

  useEffect(() => {
    if (!modificado || pendiente) return;
    const salir = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    const navegar = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest("a") : null;
      if (!link || link.target === "_blank" || link.hasAttribute("download") || link.getAttribute("href")?.startsWith("#") || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      if (!window.confirm("Tenés cambios sin guardar. ¿Querés salir de la nota?")) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener("beforeunload", salir);
    document.addEventListener("click", navegar, true);
    return () => { window.removeEventListener("beforeunload", salir); document.removeEventListener("click", navegar, true); };
  }, [modificado, pendiente]);

  return <form action={accion} className="admin-editor-grid">
    {nota && <input type="hidden" name="id" value={nota.id} />}
    <input type="hidden" name="body_mdx" value={body} />
    <div className="admin-editor-main">
      <label><span className="admin-label">Título de la nota</span><input name="title" required maxLength={220} value={title} onChange={(event) => setTitle(event.target.value)} disabled={pendiente} placeholder="Escribí un título…" className="admin-input admin-title-input" /></label>
      <section className="admin-card" aria-label="Editor del cuerpo">
        <div className="admin-editor-tabs"><strong>Contenido</strong><div role="group" aria-label="Modo del editor">
          <button type="button" aria-pressed={modo === "visual"} disabled={pendiente || (fuenteNecesaria && modo !== "visual")} title={fuenteNecesaria ? "Este contenido conserva formato avanzado en el modo Texto" : undefined} onClick={() => setModo("visual")}>Visual</button>
          <button type="button" aria-pressed={modo === "fuente"} disabled={pendiente} onClick={() => setModo("fuente")}>Texto</button>
          <button type="button" aria-pressed={modo === "previa"} disabled={pendiente} onClick={() => setModo("previa")}>Vista previa</button>
        </div></div>
        {fuenteNecesaria && modo === "fuente" && <p className="admin-source-warning">Esta nota contiene formato avanzado. Se conserva en modo Texto para que no pierdas contenido; podés consultar la vista previa.</p>}
        {modo === "visual" ? <EditorVisual value={body} onChange={setBody} disabled={pendiente} /> : modo === "fuente" ? <textarea aria-label="Cuerpo de la nota en Markdown" className="admin-input admin-source" value={body} onChange={(event) => setBody(event.target.value)} maxLength={400000} disabled={pendiente} spellCheck={false} /> : <article className="admin-prose" aria-label="Vista previa del cuerpo" dangerouslySetInnerHTML={{ __html: renderizarContenido(body) || "<p>El contenido de tu nota aparecerá acá.</p>" }} />}
        <div className="admin-editor-bottom"><span>{palabras} {palabras === 1 ? "palabra" : "palabras"} · {Math.max(1, Math.ceil(palabras / 200))} min de lectura aprox.</span><span>{pendiente ? "Guardando…" : modificado ? "Cambios sin guardar" : "Sin cambios pendientes"}</span></div>
      </section>
      <section className="admin-card"><div className="admin-card-header"><h2>Bajada</h2><span className="admin-editor-count">Opcional</span></div><div className="admin-card-body"><label><span className="admin-sr-only">Bajada de la nota</span><textarea name="dek" value={dek} onChange={(event) => setDek(event.target.value)} rows={3} maxLength={600} className="admin-input" disabled={pendiente} placeholder="Un resumen breve que invite a seguir leyendo." /></label><p className="admin-field-help">Complementá el título con el dato principal de la historia.</p></div></section>
    </div>
    <aside className="admin-editor-aside" aria-label="Opciones de la nota">
      <section className="admin-card"><div className="admin-card-header"><h2>Publicación</h2></div><div className="admin-card-body admin-publish-options">
        <label><span className="admin-label">Estado</span><select name="status" value={status} onChange={(event) => setStatus(event.target.value)} className="admin-input" disabled={pendiente}>{estados.map((e) => <option key={e} value={e}>{ETIQUETA_ESTADO[e]}</option>)}</select></label>
        <p className="admin-field-help">{status === "publicado" ? "Al guardar, la nota queda publicada." : status === "en_revision" ? "Al guardar, la nota pasa a revisión editorial." : "Guardá tus cambios para continuar después."}</p>
        {avisoColaborador && <p className="admin-field-help">Podés escribir y enviar a revisión. La publicación queda a cargo de un editor.</p>}
      </div><div className="admin-publish-footer"><button type="submit" disabled={pendiente} className="admin-button"><Save size={16} aria-hidden="true" />{pendiente ? "Guardando…" : status === "publicado" ? "Guardar y publicar" : status === "en_revision" ? "Enviar a revisión" : "Guardar cambios"}</button>
        {estado.error && <p role="alert" className="admin-editor-feedback">{estado.error}</p>}{estado.ok && !modificado && <p role="status" className="admin-editor-feedback">{estado.ok}</p>}
      </div></section>
      <section className="admin-card"><div className="admin-card-header"><h2>Sección</h2></div><div className="admin-card-body"><label><span className="admin-sr-only">Sección de la nota</span><select name="section" value={section} onChange={(event) => setSection(event.target.value)} className="admin-input" disabled={pendiente} style={{ width: "100%" }}>{SECCIONES.map((s) => <option key={s.valor} value={s.valor}>{s.etiqueta}</option>)}</select></label></div></section>
      <section className="admin-card"><div className="admin-card-header"><h2>Antes de guardar</h2></div><div className="admin-card-body"><p className="admin-field-help">Revisá nombres, créditos y enlaces. Usá la vista previa para comprobar títulos, listas e imágenes.</p></div></section>
    </aside>
  </form>;
}
