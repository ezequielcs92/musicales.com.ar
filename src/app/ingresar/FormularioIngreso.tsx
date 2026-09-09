"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { ingresar, type EstadoIngreso } from "./acciones";

function Boton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-sala px-5 py-3 font-display text-sm uppercase tracking-wide text-papel transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-papel-3 dark:text-ink"
    >
      {pending ? "Entrando…" : "Entrar"}
    </button>
  );
}

export function FormularioIngreso({ volver }: { volver: string }) {
  const [estado, accion] = useActionState<EstadoIngreso, FormData>(ingresar, {});

  const campo =
    "w-full border border-rule bg-papel-2 px-4 py-3 text-base outline-none focus-visible:border-telon focus-visible:ring-1 focus-visible:ring-telon";
  const etiqueta =
    "font-mono text-[0.68rem] uppercase tracking-[0.13em] text-muted";

  return (
    <form action={accion} className="flex flex-col gap-4">
      <input type="hidden" name="volver" value={volver} />

      <label className="flex flex-col gap-2">
        <span className={etiqueta}>Correo electrónico</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="username"
          className={campo}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className={etiqueta}>Contraseña</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className={campo}
        />
      </label>

      <Boton />

      {estado.error && (
        <p role="alert" className="text-sm text-telon">
          {estado.error}
        </p>
      )}
    </form>
  );
}
