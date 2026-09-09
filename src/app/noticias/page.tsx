import type { Metadata } from "next";

import { NO_INDEXAR, SeccionEnPreparacion } from "@/components/SeccionEnPreparacion";

export const metadata: Metadata = {
  title: "Noticias y Blog",
  description: "Noticias del teatro musical argentino e internacional.",
  ...NO_INDEXAR,
};

const PROMESAS = [
  { clave: "Nacional e internacional", texto: "Lo que pasa en Corrientes y lo que pasa en Broadway y el West End, cuando llega acá o va a llegar." },
  { clave: "Cambios de elenco", texto: "Quién entra, quién sale, quién queda de cover. Es lo que más se pregunta y lo que menos se publica." },
  { clave: "Blog de tema libre", texto: "Notas que no son noticia: historia, oficio, por qué un musical funciona y otro no." },
  { clave: "Firmadas siempre", texto: "Cada nota lleva autor y fecha. Las que se corrigen dicen que se corrigieron." },
];

export default function Noticias() {
  return (
    <SeccionEnPreparacion
      antetitulo="En preparación"
      titulo={"Noticias del ambiente, y todo lo demás."}
      bajada={"Estrenos, cambios de elenco, cierres de temporada y lo que pasa afuera. Más notas de tema libre sobre este mundo."}
      promesas={PROMESAS}
      cuando={"Es la sección que arranca primero, porque no depende de tener la base cargada. Si querés escribir, escribinos: no hace falta experiencia previa en medios."}
    />
  );
}
