import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/types/database";

/**
 * Cliente de Supabase para componentes de servidor, route handlers y acciones.
 *
 * Usa la clave publica: toda la autorizacion la resuelven las politicas RLS de
 * Postgres. Si una consulta devuelve menos filas de las esperadas, el problema
 * esta en la politica, no aca.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Los componentes de servidor no pueden escribir cookies. Es
            // esperable: el middleware ya refresco la sesion antes de llegar aca.
          }
        },
      },
    },
  );
}

/**
 * Cliente administrativo. Saltea TODAS las politicas RLS.
 *
 * Solo para tareas que necesitan atravesar la seguridad a proposito: asignar
 * roles, moderar altas de la comunidad, procesos programados. Nunca en un
 * componente que renderice datos para un visitante, y nunca en el cliente.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY. En local va en .env.local y .dev.vars; " +
        "en produccion se carga con `wrangler secret put`.",
    );
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    {
      cookies: { getAll: () => [], setAll: () => {} },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
