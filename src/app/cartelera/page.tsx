import type { Metadata } from "next";

import { NO_INDEXAR, SeccionEnPreparacion } from "@/components/SeccionEnPreparacion";

export const metadata: Metadata = {
  title: "Cartelera",
  description: "Cartelera de teatro musical en Buenos Aires.",
  ...NO_INDEXAR,
};

const PROMESAS = [
  { clave: "Funciones, no temporadas", texto: "Qué se da hoy y a qué hora, no una lista genérica que quedó vieja en marzo." },
  { clave: "Elenco de esa función", texto: "Titular, alternate, cover o swing. Quién estaba realmente la noche que fuiste." },
  { clave: "Dónde comprar", texto: "Enlace directo a la boletería oficial. No publicamos precios: los de la boletería siempre están al día y los nuestros no." },
  { clave: "Filtros que sirven", texto: "Por sala, barrio, día y precio. Para decidir la salida de esta noche." },
];

export default function Cartelera() {
  return (
    <SeccionEnPreparacion
      antetitulo="En preparación"
      titulo={"Qué musicales hay en cartel."}
      bajada={"Funciones reales, sala por sala, con precios y horarios. Buenos Aires y Gran Buenos Aires."}
      promesas={PROMESAS}
      cuando={"Es la próxima sección en construirse. Estamos relevando salas, temporadas y funciones del circuito de Corrientes, el Complejo Teatral y las salas del conurbano con programación de musical."}
    />
  );
}
