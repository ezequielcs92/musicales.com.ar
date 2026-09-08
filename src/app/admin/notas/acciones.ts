"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { sesion } from "@/lib/auth";
import { estadosPermitidos, puedeRedactar, type Estado } from "@/lib/editorial";

export type EstadoFormulario = { error?: string; ok?: string };

/** Titulo -> slug. Sin acentos, sin puntuacion, sin guiones colgando. */
function aSlug(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Traduce el error de Postgres a algo que le sirva a quien esta escribiendo. */
function explicar(error: { code?: string; message: string }): string {
  // 42501 lo levantan nuestros disparadores, y su mensaje ya esta redactado
  // para una persona. Se muestra tal cual.
  if (error.code === "42501") return error.message;
  if (error.code === "23505") {
    return "Ya existe una nota con ese título. Cambiá el título o el enlace.";
  }
  if (error.code === "23514") {
    return "Los datos no cumplen una regla de la base. Si es una crítica, revisá el puntaje y la fecha de la función.";
  }
  return `No se pudo guardar: ${error.message}`;
}

export async function guardarNota(
  _prev: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  // Las Server Actions se pueden invocar con un POST directo, sin pasar por la
  // interfaz. Se verifica aca aunque RLS lo verifique de nuevo en la base.
  const s = await sesion();
  if (!s) return { error: "Tu sesión venció. Volvé a ingresar." };
  if (!puedeRedactar(s.rol)) {
    return { error: "Tu cuenta no tiene permisos para escribir notas." };
  }

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const section = String(formData.get("section") ?? "").trim();
  const status = String(formData.get("status") ?? "borrador").trim() as Estado;
  const dek = String(formData.get("dek") ?? "").trim();
  const body_mdx = String(formData.get("body_mdx") ?? "");

  if (!title) return { error: "La nota necesita un título." };
  if (!section) return { error: "Elegí una sección." };

  if (!estadosPermitidos(s.rol).includes(status)) {
    return {
      error:
        s.rol === "colaborador"
          ? "Un colaborador no puede publicar. Enviá la nota a revisión."
          : "No podés mover la nota a ese estado.",
    };
  }

  const campos = {
    title,
    section: section as "noticias" | "opiniones" | "reviews" | "entrevistas",
    status,
    dek: dek || null,
    body_mdx,
  };

  // --- Nota nueva ---------------------------------------------------------
  if (!id) {
    const { data, error } = await s.supabase
      .from("articles")
      .insert({ ...campos, slug: aSlug(title), author_id: s.user.id })
      .select("id")
      .single();

    if (error) return { error: explicar(error) };
    revalidatePath("/admin/notas");
    redirect(`/admin/notas/${data.id}`);
  }

  // --- Nota existente -----------------------------------------------------
  const { data, error } = await s.supabase
    .from("articles")
    .update(campos)
    .eq("id", id)
    .select("id");

  if (error) return { error: explicar(error) };

  // Cuando RLS filtra un UPDATE no devuelve error: devuelve cero filas. Sin
  // este control, la interfaz diria "guardado" sin haber guardado nada.
  if (!data || data.length === 0) {
    return {
      error:
        "No se guardó: ya no tenés permiso para editar esta nota. Suele pasar cuando otra persona la tomó o cuando pasó a revisión.",
    };
  }

  revalidatePath("/admin/notas");
  revalidatePath(`/admin/notas/${id}`);
  return { ok: "Cambios guardados." };
}
