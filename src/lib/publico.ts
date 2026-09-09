import "server-only";

import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

/**
 * Cliente de solo lectura para las paginas publicas.
 *
 * No lee cookies: estas paginas se generan y se cachean, y no dependen de
 * quien las mire. Usar el cliente con cookies aca convertiria cada pagina en
 * dinamica y perderiamos el cacheado, que es lo que sostiene los Core Web
 * Vitals y con ellos el ingreso.
 */
export function clientePublico() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

/** Fecha legible en castellano rioplatense, con la zona horaria correcta. */
export function fecha(iso: string | null, conAno = true) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    ...(conAno && { year: "numeric" }),
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

export const SIN_DATOS =
  "Todavía no hay nada cargado en esta sección. Estamos relevando.";
