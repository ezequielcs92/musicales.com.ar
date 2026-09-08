"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { ETIQUETA_ESTADO, SECCIONES, type Estado } from "@/lib/editorial";

import { guardarNota, type EstadoFormulario } from "./acciones";

type Nota = {
  id: string;
  title: string;
  section: string;
  status: string;
  dek: string | null;
  body_mdx: string;
};

function Guardar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-sala px-5 py-3 font-display text-sm uppercase tracking-wide text-papel hover:opacity-90 disabled:opacity-50 dark:bg-papel-3 dark:text-ink"
    >
      {pending ? "Guardando…" : "Guardar"}
    </button>
  );
}

export function EditorNota({
  nota,
  estados,
  avisoColaborador,
}: {
  nota?: Nota;
  estados: Estado[];
  avisoColaborador: boolean;
}) {
  const [estado, accion] = useActionState<EstadoFormulario, FormData>(
    guardarNota,
    {},
  );

  const campo =
    "w-full border border-rule bg-papel-2 px-3 py-2 text-base outline-none focus-visible:border-telon focus-visible:ring-1 focus-visible:ring-telon";
  const etiqueta =
    "font-mono text-[0.66rem] uppercase tracking-[0.13em] text-muted";

  return (
    <form action={accion} className="flex flex-col gap-6">
      {nota && <input type="hidden" name="id" value={nota.id} />}

      <label className="flex flex-col gap-2">
        <span className={etiqueta}>Título</span>
        <input
          name="title"
          required
          defaultValue={nota?.title ?? ""}
          className={`${campo} font-display text-xl`}
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className={etiqueta}>Sección</span>
          <select
            name="section"
            defaultValue={nota?.section ?? "noticias"}
            className={campo}
          >
            {SECCIONES.map((s) => (
              <option key={s.valor} value={s.valor}>
                {s.etiqueta}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className={etiqueta}>Estado</span>
          <select
            name="status"
            defaultValue={nota?.status ?? "borrador"}
            className={campo}
          >
            {estados.map((e) => (
              <option key={e} value={e}>
                {ETIQUETA_ESTADO[e]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {avisoColaborador && (
        <p className="border-l-2 border-rule pl-4 text-sm text-muted">
          Como colaborador podés escribir y enviar a revisión. Publicar lo hace
          un editor. Una vez enviada, la nota deja de estar en tus manos.
        </p>
      )}

      <label className="flex flex-col gap-2">
        <span className={etiqueta}>Bajada</span>
        <textarea
          name="dek"
          rows={2}
          defaultValue={nota?.dek ?? ""}
          className={campo}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className={etiqueta}>Cuerpo</span>
        <textarea
          name="body_mdx"
          rows={18}
          defaultValue={nota?.body_mdx ?? ""}
          className={`${campo} font-mono text-sm leading-relaxed`}
        />
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <Guardar />
        {estado.error && (
          <p role="alert" className="text-sm text-telon">
            {estado.error}
          </p>
        )}
        {estado.ok && (
          <p role="status" className="text-sm text-en-cartel">
            {estado.ok}
          </p>
        )}
      </div>
    </form>
  );
}
