"use client";

import { useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TurndownService from "turndown";
import { Bold, Italic, Strikethrough, List, ListOrdered, Quote, Link2, Unlink, ImagePlus, Undo2, Redo2, Minus, RemoveFormatting } from "lucide-react";
import { renderizarContenido, urlEditorialValida } from "@/lib/contenido";

const markdown = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced", bulletListMarker: "-", emDelimiter: "_" });
markdown.addRule("strike", { filter: ["s", "del"], replacement: (content) => `~~${content}~~` });

export default function EditorVisual({ value, onChange, disabled }: { value: string; onChange: (value: string) => void; disabled: boolean }) {
  const [initialContent] = useState(() => renderizarContenido(value));
  const [dialog, setDialog] = useState<"link" | "image" | null>(null);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [error, setError] = useState("");
  const editor = useEditor({
    extensions: [StarterKit.configure({ underline: false, heading: { levels: [1, 2, 3, 4, 5, 6] }, link: { openOnClick: false, autolink: true, defaultProtocol: "https", isAllowedUri: (url) => urlEditorialValida(url) } }), Image.configure({ allowBase64: false })],
    content: initialContent,
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editable: !disabled,
    editorProps: { attributes: { role: "textbox", "aria-label": "Cuerpo de la nota", "aria-multiline": "true", "data-testid": "editor-visual" } },
    onUpdate: ({ editor }) => onChange(markdown.turndown(editor.getHTML())),
  });

  if (!editor) return <div className="admin-prose" role="status">Cargando editor visual…</div>;

  function abrir(tipo: "link" | "image") {
    setDialog(tipo); setError(""); setAlt("");
    setUrl(tipo === "link" ? editor?.getAttributes("link").href ?? "" : "");
  }
  function insertar() {
    if (!editor || !dialog) return;
    if (!urlEditorialValida(url.trim(), dialog === "image")) { setError("Ingresá una URL válida que empiece con https://."); return; }
    if (dialog === "image") {
      if (!alt.trim()) { setError("Describí la imagen para quienes usan un lector de pantalla."); return; }
      editor.chain().focus().setImage({ src: url.trim(), alt: alt.trim() }).run();
    } else if (editor.state.selection.empty && !editor.isActive("link")) {
      editor.chain().focus().insertContent({ type: "text", text: url.trim(), marks: [{ type: "link", attrs: { href: url.trim() } }] }).run();
    } else editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
    setDialog(null);
  }
  const tools = [
    { label: "Negrita", icon: Bold, active: editor.isActive("bold"), run: () => editor.chain().focus().toggleBold().run() },
    { label: "Cursiva", icon: Italic, active: editor.isActive("italic"), run: () => editor.chain().focus().toggleItalic().run() },
    { label: "Tachado", icon: Strikethrough, active: editor.isActive("strike"), run: () => editor.chain().focus().toggleStrike().run() },
    { label: "Lista con viñetas", icon: List, active: editor.isActive("bulletList"), run: () => editor.chain().focus().toggleBulletList().run() },
    { label: "Lista numerada", icon: ListOrdered, active: editor.isActive("orderedList"), run: () => editor.chain().focus().toggleOrderedList().run() },
    { label: "Cita", icon: Quote, active: editor.isActive("blockquote"), run: () => editor.chain().focus().toggleBlockquote().run() },
  ];
  return <>
    <div className="admin-editor-toolbar" role="group" aria-label="Formato del texto">
      <select aria-label="Estilo de párrafo" value={editor.isActive("heading") ? String(editor.getAttributes("heading").level) : "p"} disabled={disabled} onChange={(event) => { if (event.target.value === "p") editor.chain().focus().setParagraph().run(); else editor.chain().focus().setHeading({ level: Number(event.target.value) as 1 | 2 | 3 | 4 | 5 | 6 }).run(); }}>
        <option value="p">Párrafo</option>{[1, 2, 3, 4, 5, 6].map((level) => <option value={level} key={level}>Título {level}</option>)}
      </select>
      {tools.map(({ label, icon: Icon, active, run }) => <button type="button" title={label} aria-label={label} aria-pressed={active} key={label} onClick={run} disabled={disabled}><Icon size={16} aria-hidden="true" /></button>)}
      <span className="admin-toolbar-separator" aria-hidden="true" />
      <button type="button" title="Insertar enlace" aria-label="Insertar enlace" onClick={() => abrir("link")} disabled={disabled}><Link2 size={16} /></button>
      <button type="button" title="Quitar enlace" aria-label="Quitar enlace" onClick={() => editor.chain().focus().unsetLink().run()} disabled={disabled || !editor.isActive("link")}><Unlink size={16} /></button>
      <button type="button" title="Insertar imagen por URL" aria-label="Insertar imagen por URL" onClick={() => abrir("image")} disabled={disabled}><ImagePlus size={16} /></button>
      <button type="button" title="Línea separadora" aria-label="Línea separadora" onClick={() => editor.chain().focus().setHorizontalRule().run()} disabled={disabled}><Minus size={16} /></button>
      <button type="button" title="Quitar formato" aria-label="Quitar formato" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} disabled={disabled}><RemoveFormatting size={16} /></button>
      <span className="admin-toolbar-separator" aria-hidden="true" />
      <button type="button" title="Deshacer" aria-label="Deshacer" onClick={() => editor.chain().focus().undo().run()} disabled={disabled || !editor.can().undo()}><Undo2 size={16} /></button>
      <button type="button" title="Rehacer" aria-label="Rehacer" onClick={() => editor.chain().focus().redo().run()} disabled={disabled || !editor.can().redo()}><Redo2 size={16} /></button>
    </div>
    {dialog && <div className="admin-inline-dialog" role="group" aria-label={dialog === "image" ? "Insertar imagen" : "Insertar enlace"}>
      <label><span className="admin-label">{dialog === "image" ? "URL de la imagen" : "Destino del enlace"}</span><input className="admin-input" type="text" inputMode="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://" autoFocus /></label>
      {dialog === "image" && <label><span className="admin-label">Descripción de la imagen</span><input className="admin-input" value={alt} onChange={(event) => setAlt(event.target.value)} /></label>}
      {error && <p role="alert" className="admin-editor-feedback">{error}</p>}
      <div className="admin-inline-dialog-actions"><button type="button" onClick={insertar} className="admin-button admin-button-small">Insertar</button><button type="button" onClick={() => { setDialog(null); editor.commands.focus(); }} className="admin-button admin-button-secondary admin-button-small">Cancelar</button></div>
    </div>}
    <EditorContent editor={editor} className="admin-editor-surface" />
  </>;
}
