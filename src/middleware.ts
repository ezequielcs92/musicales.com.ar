import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresca la sesion de Supabase antes de que la lean los componentes de
 * servidor.
 *
 * IMPORTANTE: el matcher de abajo NO cubre todo el sitio, a proposito.
 *
 * El middleware corre dentro del worker y consume CPU en cada pedido que
 * intercepta. En el plan gratuito de Cloudflare hay 10 ms de CPU por
 * invocacion, y las paginas publicas —que son la enorme mayoria del trafico y
 * del inventario publicitario— no necesitan sesion para nada. Dejarlas fuera
 * mantiene el sitio publico sin costo de middleware.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // No usar getSession() aca: lee la cookie sin verificarla contra el servidor
  // de auth, y la cookie la puede manipular el cliente. getUser() valida.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith("/admin")) {
    const login = request.nextUrl.clone();
    login.pathname = "/ingresar";
    login.searchParams.set("volver", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/ingresar", "/auth/:path*"],
};
