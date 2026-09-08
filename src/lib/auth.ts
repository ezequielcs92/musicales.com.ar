import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Rol } from "@/lib/editorial";

/**
 * Sesion del usuario actual, con su rol.
 *
 * El rol sale de `app_metadata` del JWT, que solo escribe el servidor.
 * `user_metadata` no sirve: lo edita el propio usuario desde el navegador.
 *
 * Este modulo es `server-only`: importarlo desde un componente de cliente
 * rompe la compilacion a proposito. El vocabulario compartido vive en
 * `editorial.ts`.
 */
export async function sesion() {
  const supabase = await createClient();

  // getUser() valida contra el servidor de auth. getSession() confia en una
  // cookie que el cliente puede manipular.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const rol = ((user.app_metadata as Record<string, unknown> | undefined)
    ?.role ?? "suscriptor") as Rol;

  return { user, rol, supabase };
}
