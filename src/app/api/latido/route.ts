import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Mantiene despierto el proyecto de Supabase.
 *
 * El plan gratuito pausa los proyectos tras una semana sin actividad de API.
 * Mientras el sitio no tenga trafico que consulte la base, nada la despierta.
 * Una tarea programada diaria pega acá y con eso alcanza.
 *
 * No expone datos: cuenta filas de una tabla publica y devuelve el numero.
 */
export async function GET() {
  const inicio = Date.now();

  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("venues")
      .select("id", { count: "exact", head: true });

    if (error) throw new Error(error.message);

    return Response.json(
      { ok: true, salas: count ?? 0, ms: Date.now() - inicio },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (e) {
    // 503 y no 200: si la base no responde, la tarea programada tiene que
    // fallar de forma visible en vez de dar por bueno el latido.
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "desconocido" },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
