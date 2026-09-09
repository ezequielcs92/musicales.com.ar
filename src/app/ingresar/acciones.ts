"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type EstadoIngreso = { error?: string };

export async function ingresar(
  _prev: EstadoIngreso,
  formData: FormData,
): Promise<EstadoIngreso> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  // Solo rutas internas: un `volver` con host propio seria un redirect abierto.
  const pedido = String(formData.get("volver") ?? "/admin");
  const volver =
    pedido.startsWith("/") && !pedido.startsWith("//") ? pedido : "/admin";

  if (!email || !password) {
    return { error: "Completá el correo y la contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Supabase devuelve el mismo error para usuario inexistente y contraseña
    // incorrecta, y esta bien que sea asi: distinguirlos le confirmaria a un
    // atacante que direcciones tienen cuenta.
    if (error.message.toLowerCase().includes("invalid login")) {
      return { error: "Correo o contraseña incorrectos." };
    }
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return { error: "La cuenta todavía no está confirmada." };
    }
    return { error: `No se pudo ingresar: ${error.message}` };
  }

  // El redirect va fuera del try: `redirect()` funciona lanzando una excepcion
  // que Next intercepta, y atraparla lo romperia.
  redirect(volver);
}
