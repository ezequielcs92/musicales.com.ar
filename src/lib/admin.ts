import "server-only";
import { esStaff, type Estado } from "@/lib/editorial";
import type { sesion } from "@/lib/auth";

type Sesion = NonNullable<Awaited<ReturnType<typeof sesion>>>;
export const ORDEN_ESTADOS: Estado[] = ["borrador", "en_revision", "programado", "publicado", "archivado"];

export async function contarNotas(s: Sesion) {
  return Promise.all(ORDEN_ESTADOS.map(async (estado) => {
    let query = s.supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", estado);
    if (!esStaff(s.rol)) query = query.eq("author_id", s.user.id);
    const { count, error } = await query;
    return { estado, cantidad: error ? null : count ?? 0, error: Boolean(error) };
  }));
}
