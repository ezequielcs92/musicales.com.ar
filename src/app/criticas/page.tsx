import type { Metadata } from "next";

import { NO_INDEXAR, SeccionEnPreparacion } from "@/components/SeccionEnPreparacion";

export const metadata: Metadata = {
  title: "Críticas",
  description: "Críticas de teatro musical argentino.",
  ...NO_INDEXAR,
};

const PROMESAS = [
  { clave: "Con fecha de función", texto: "Una crítica sin fecha es una opinión sobre una obra que ya cambió de elenco." },
  { clave: "Con el elenco de esa noche", texto: "Quién hacía cada rol cuando se escribió. Es parte de la crítica, no un dato de color." },
  { clave: "Firmadas", texto: "Cada texto lleva autor. Las opiniones tienen responsable." },
  { clave: "Separadas de las reseñas del público", texto: "La crítica la firma la redacción. Más adelante el público va a poder puntuar aparte." },
];

export default function Criticas() {
  return (
    <SeccionEnPreparacion
      antetitulo="En preparación"
      titulo={"Críticas que dicen qué noche vieron."}
      bajada={"Reseñas firmadas, con la fecha de la función y el elenco que estaba en escena."}
      promesas={PROMESAS}
      cuando={"Las primeras críticas salen cuando la cartelera esté cargada: no tiene sentido criticar una función sin poder enlazar a la obra, la sala y el elenco."}
    />
  );
}
