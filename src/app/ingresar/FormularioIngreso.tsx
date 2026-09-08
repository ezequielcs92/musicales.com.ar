"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

type Estado = "listo" | "enviando" | "enviado" | "error";

/**
 * Ingreso por enlace de un solo uso.
 *
 * Sin contraseñas a proposito: la redaccion son unas pocas personas y una
 * contraseña mas es una contraseña mas que se puede filtrar, reutilizar o
 * perder. El enlace llega al correo y vence solo.
 */
export function FormularioIngreso({ volver }: { volver: string }) {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<Estado>("listo");
  const [detalle, setDetalle] = useState("");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEstado("enviando");

    const supabase = createClient();
    const destino = new URL("/auth/callback", window.location.origin);
    destino.searchParams.set("volver", volver);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: destino.toString() },
    });

    if (error) {
      setEstado("error");
      setDetalle(error.message);
      return;
    }
    setEstado("enviado");
  }

  if (estado === "enviado") {
    return (
      <div className="flex flex-col gap-3">
        <p className="font-display text-xl">Revisá tu correo.</p>
        <p className="text-ink-soft">
          Le mandamos un enlace de acceso a <strong>{email}</strong>. Vence en una
          hora y sirve una sola vez.
        </p>
        <button
          type="button"
          onClick={() => setEstado("listo")}
          className="self-start font-mono text-[0.7rem] uppercase tracking-[0.1em] text-telon underline underline-offset-4"
        >
          Usar otra dirección
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.13em] text-muted">
          Correo electrónico
        </span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-rule bg-papel-2 px-4 py-3 text-base outline-none focus-visible:border-telon focus-visible:ring-1 focus-visible:ring-telon"
        />
      </label>

      <button
        type="submit"
        disabled={estado === "enviando"}
        className="bg-sala px-5 py-3 font-display text-sm uppercase tracking-wide text-papel transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-papel-3 dark:text-ink"
      >
        {estado === "enviando" ? "Enviando…" : "Enviar enlace de acceso"}
      </button>

      {estado === "error" && (
        <p role="alert" className="text-sm text-telon">
          No pudimos enviar el enlace: {detalle}. Revisá que la dirección esté
          bien escrita y volvé a intentar.
        </p>
      )}
    </form>
  );
}
