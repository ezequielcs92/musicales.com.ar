import type { Metadata } from "next";

import { NO_INDEXAR, SeccionEnPreparacion } from "@/components/SeccionEnPreparacion";

export const metadata: Metadata = {
  title: "Audiciones",
  description: "Audiciones y castings de teatro musical en Argentina.",
  ...NO_INDEXAR,
};

const PROMESAS = [
  { clave: "Solo verificadas", texto: "Publicamos después de chequear contra la fuente oficial. Preferimos llegar tarde a publicar algo que no existe." },
  { clave: "Roles y perfiles buscados", texto: "Edades, cuerdas vocales y estilos de danza que pide cada convocatoria." },
  { clave: "Si exige ARCA", texto: "Las convocatorias oficiales piden inscripción fiscal vigente. Saberlo antes te ahorra el viaje." },
  { clave: "Plazos claros", texto: "Desde cuándo y hasta cuándo. Las vencidas se archivan, no se dejan colgadas." },
];

export default function Audiciones() {
  return (
    <SeccionEnPreparacion
      antetitulo="En preparación"
      titulo={"Convocatorias abiertas, verificadas."}
      bajada={"Qué se está buscando, con qué requisitos y hasta cuándo hay tiempo."}
      promesas={PROMESAS}
      cuando={"Vamos a relevar de las fuentes que son confiables: Complejo Teatral de Buenos Aires, Teatro Nacional Cervantes y las productoras comerciales."}
    />
  );
}
