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

export type Seccion =
  | "noticias"
  | "blog"
  | "opiniones"
  | "reviews"
  | "entrevistas";

/** Los cinco tipos de formacion. `montaje` es el unico que termina en funcion. */
export type TipoFormacion =
  | "montaje"
  | "carrera"
  | "curso"
  | "especializacion"
  | "workshop";

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
  { valor: "blog", etiqueta: "Blog" },
  { valor: "opiniones", etiqueta: "Opiniones" },
  { valor: "reviews", etiqueta: "Críticas" },
  { valor: "entrevistas", etiqueta: "Entrevistas" },
];

export const ETIQUETA_FORMACION: Record<TipoFormacion, string> = {
  montaje: "Taller de montaje",
  carrera: "Carrera",
  curso: "Curso",
  especializacion: "Especialización",
  workshop: "Workshop",
};

/**
 * Puntaje en estrellas: de 1 a 5, con medias. Lo mismo que impone la base,
 * repetido aca para poder validar antes de mandar el formulario.
 */
export const PUNTAJES = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] as const;

export const formatearEstrellas = (n: number) =>
  `${n.toLocaleString("es-AR")} ${n === 1 ? "estrella" : "estrellas"}`;
