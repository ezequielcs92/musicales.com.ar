import type { Metadata } from "next";

import { NO_INDEXAR, SeccionEnPreparacion } from "@/components/SeccionEnPreparacion";

export const metadata: Metadata = {
  title: "Salas",
  description: "Salas de teatro musical en Buenos Aires: contacto y cómo llegar.",
  ...NO_INDEXAR,
};

const PROMESAS = [
  { clave: "Formas de contacto reales", texto: "Teléfono, correo, WhatsApp y redes. Con la vía que de verdad contesta, no la que figura de adorno." },
  { clave: "Cómo llegar", texto: "Dirección, barrio y ubicación. Para decidir si te queda cerca antes de sacar la entrada." },
  { clave: "Capacidad y accesibilidad", texto: "Cuántas butacas tiene y si es accesible en silla de ruedas." },
  { clave: "Qué hay en cartel ahí", texto: "Todo lo que se está dando en esa sala, enlazado a su ficha." },
];

export default function Salas() {
  return (
    <SeccionEnPreparacion
      antetitulo="En preparación"
      titulo={"Las salas, y cómo contactarlas."}
      bajada={"Dónde queda cada una, cómo se llega y por dónde escribirles. Pensado para que puedas comunicarte, no solo para saber que existen."}
      promesas={PROMESAS}
      cuando={"Se carga junto con la cartelera: una función sin sala es un dato incompleto. Si trabajás en una sala y querés revisar tus datos, escribinos."}
    />
  );
}
