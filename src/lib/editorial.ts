/**
 * Vocabulario editorial y reglas de rol.
 *
 * Sin dependencias de servidor a proposito: lo importan tanto los componentes
 * de servidor como los de cliente. Todo lo que necesite cookies o sesion va en
 * `auth.ts`, que es `server-only`.
 */

export type Rol =
  | "administrador"
  | "editor"
  | "autor"
  | "colaborador"
  | "suscriptor";

export type Estado =
  | "borrador"
  | "en_revision"
  | "programado"
  | "publicado"
  | "archivado";

export type Seccion = "noticias" | "opiniones" | "reviews" | "entrevistas";

export const esStaff = (rol: Rol) => rol === "editor" || rol === "administrador";

export const puedeRedactar = (rol: Rol) =>
  rol === "colaborador" || rol === "autor" || esStaff(rol);

/**
 * Estados a los que este rol puede mover una nota.
 *
 * Es la version en la interfaz de la misma regla que aplica el disparador de la
 * base. Aca evita ofrecer un boton que va a fallar; alla la hace cumplir de
 * verdad, incluso si alguien invoca la accion con un POST directo.
 */
export function estadosPermitidos(rol: Rol): Estado[] {
  if (rol === "colaborador") return ["borrador", "en_revision"];
  if (rol === "autor" || esStaff(rol))
    return ["borrador", "en_revision", "programado", "publicado", "archivado"];
  return [];
}

export const ETIQUETA_ESTADO: Record<Estado, string> = {
  borrador: "Borrador",
  en_revision: "En revisión",
  programado: "Programada",
  publicado: "Publicada",
  archivado: "Archivada",
};

export const ETIQUETA_ROL: Record<Rol, string> = {
  administrador: "Administrador",
  editor: "Editor",
  autor: "Autor",
  colaborador: "Colaborador",
  suscriptor: "Suscriptor",
};

export const SECCIONES: { valor: Seccion; etiqueta: string }[] = [
  { valor: "noticias", etiqueta: "Noticias" },
  { valor: "opiniones", etiqueta: "Opiniones" },
  { valor: "reviews", etiqueta: "Críticas" },
  { valor: "entrevistas", etiqueta: "Entrevistas" },
];
