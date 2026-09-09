import type { Metadata } from "next";

import { NO_INDEXAR, SeccionEnPreparacion } from "@/components/SeccionEnPreparacion";

export const metadata: Metadata = {
  title: "Eventos y Convocatorias",
  description: "Festivales, ciclos y convocatorias de teatro musical en Argentina.",
  ...NO_INDEXAR,
};

const PROMESAS = [
  { clave: "Festivales y ciclos", texto: "Encuentros que incluyen musicales, con fechas y sedes." },
  { clave: "Convocatorias abiertas", texto: "Qué se puede presentar, con qué requisitos y hasta cuándo hay tiempo." },
  { clave: "Cómo enviar tu propuesta", texto: "Las bases completas y el enlace al formulario oficial. Sin intermediarios." },
  { clave: "Premiaciones", texto: "Los premios del sector, sus ternas y sus fechas." },
];

export default function Eventos() {
  return (
    <SeccionEnPreparacion
      antetitulo="En preparación"
      titulo={"Festivales, ciclos y convocatorias."}
      bajada={"Dónde hay musicales fuera de la cartelera habitual, y dónde podés mandar tu proyecto."}
      promesas={PROMESAS}
      cuando={"Vamos a relevar de fuentes oficiales. Si organizás un festival o una convocatoria, escribinos: publicar no tiene costo ni contraprestación."}
    />
  );
}
