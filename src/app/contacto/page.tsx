import type { Metadata } from "next";
import Link from "next/link";

import { PaginaPublica, Prosa } from "@/components/PaginaPublica";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Cómo comunicarte con la redacción de Musicales.com.ar.",
};

const MOTIVOS = [
  {
    titulo: "Corregir un dato",
    texto:
      "Una función que cambió de horario, un taller que cerró la inscripción, un elenco desactualizado. Es lo que más nos sirve recibir.",
  },
  {
    titulo: "Sumar un taller o una audición",
    texto:
      "Si dirigís una escuela o estás produciendo, contanos. Aparecer no tiene costo y no hay contraprestación.",
  },
  {
    titulo: "Escribir con nosotros",
    texto:
      "Buscamos gente que vea musicales y quiera escribir sobre lo que ve. No hace falta experiencia previa en medios.",
  },
  {
    titulo: "Prensa y materiales",
    texto:
      "Envíos de prensa, fotos de producción y fechas de estreno. Indicá siempre el crédito fotográfico.",
  },
];

export default function Contacto() {
  return (
    <PaginaPublica
      antetitulo="Contacto"
      titulo="Escribinos."
      bajada="Leemos todo. Las correcciones de cartelera tienen prioridad."
    >
      <div className="flex flex-col gap-10">
        <Prosa>
          <p>
            La vía es el correo:{" "}
            <a href="mailto:contacto@musicales.com.ar">
              contacto@musicales.com.ar
            </a>
          </p>
          <p>
            Respondemos en unos días. Si escribís por un dato equivocado en la
            cartelera, poné <strong>«corrección»</strong> en el asunto y lo
            miramos primero.
          </p>
        </Prosa>

        <ul className="grid gap-5 sm:grid-cols-2">
          {MOTIVOS.map((m) => (
            <li key={m.titulo} className="tarjeta flex flex-col gap-2 p-6">
              <h2 className="font-display text-lg uppercase leading-none tracking-tight">
                {m.titulo}
              </h2>
              <p className="text-[0.94rem] text-[var(--muted)]">{m.texto}</p>
            </li>
          ))}
        </ul>

        <Prosa>
          <p>
            Sobre qué hacemos con tus datos cuando nos escribís, mirá la{" "}
            <Link href="/privacidad">política de privacidad</Link>.
          </p>
        </Prosa>
      </div>
    </PaginaPublica>
  );
}
