import type { Metadata } from "next";

import { NO_INDEXAR, SeccionEnPreparacion } from "@/components/SeccionEnPreparacion";

export const metadata: Metadata = {
  title: "Talleres",
  description: "Talleres de montaje de comedia musical en Buenos Aires.",
  ...NO_INDEXAR,
};

const PROMESAS = [
  { clave: "Montaje o entrenamiento", texto: "Un taller que termina en función no es una clase semanal. Son dos búsquedas y acá son dos filtros." },
  { clave: "Con inscripción abierta", texto: "Filtrable por si está tomando gente ahora y hasta cuándo." },
  { clave: "Si pide audición previa", texto: "Para saber si podés anotarte directo o hay que preparar algo." },
  { clave: "Precio y modalidad", texto: "Cuota, duración, día y horario. Los datos que decidís antes de escribir un mensaje." },
];

export default function Talleres() {
  return (
    <SeccionEnPreparacion
      antetitulo="En preparación"
      titulo={"Talleres de montaje, separados del entrenamiento."}
      bajada={"Dónde formarte, con qué modalidad, cuánto sale y si termina en función."}
      promesas={PROMESAS}
      cuando={"Estamos relevando las escuelas del área metropolitana. Si dirigís una y querés aparecer, escribinos: no tiene costo ni contraprestación."}
    />
  );
}
