import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Cierra el ingreso por enlace: canjea el codigo por una sesion y devuelve al
 * visitante a donde queria ir.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Solo rutas internas: un `volver` con host propio seria un redirect abierto.
  const solicitado = searchParams.get("volver") ?? "/admin";
  const volver = solicitado.startsWith("/") && !solicitado.startsWith("//")
    ? solicitado
    : "/admin";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${volver}`);
    }
  }

  const fallo = new URL("/ingresar", origin);
  fallo.searchParams.set("error", "enlace");
  return NextResponse.redirect(fallo);
}
