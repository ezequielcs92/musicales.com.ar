import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

/**
 * Cliente de Supabase para componentes de cliente.
 *
 * La clave publica viaja al navegador a proposito: no es un secreto. Lo que
 * protege los datos son las politicas RLS, no esconder la clave.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
