import type { Metadata } from "next";
import Link from "next/link";

import { PaginaPublica } from "@/components/PaginaPublica";
import { clientePublico, fecha } from "@/lib/publico";

export const metadata: Metadata = {
  title: "Cartelera",
  description:
    "Qué musicales hay en cartel en Buenos Aires: sala, elenco y dónde comprar entradas.",
};

// La cartelera cambia de semana a semana, no de minuto a minuto.
export const revalidate = 900;

const ETIQUETA_ESTADO: Record<string, { texto: string; chip: string }> = {
  en_cartel: { texto: "En cartel", chip: "chip-cartel" },
  anunciada: { texto: "Anunciada", chip: "chip-estreno" },
  finalizada: { texto: "Finalizada", chip: "chip-ultimas" },
};

export default async function Cartelera() {
  const supabase = clientePublico();

  const { data, error } = await supabase
    .from("runs")
    .select(
      "id, status, opens_on, closes_on, ticket_url, producer, productions(slug, title, synopsis, is_original_arg, duration_min), venues(name, address, neighborhood)",
    )
    .in("status", ["en_cartel", "anunciada"])
    .order("status")
    .order("opens_on", { ascending: false })
    .limit(60);

  const temporadas = data ?? [];

  return (
    <PaginaPublica
      antetitulo="Cartelera"
      titulo="Qué musicales hay en cartel."
      bajada={
        temporadas.length
          ? `${temporadas.length} ${temporadas.length === 1 ? "título" : "títulos"} en cartel o anunciados en Buenos Aires y Gran Buenos Aires.`
          : "Sala, elenco y dónde comprar. Buenos Aires y Gran Buenos Aires."
      }
    >
      {error ? (
        <p role="alert" className="text-[var(--primary)]">
          No pudimos cargar la cartelera. Probá de nuevo en unos minutos.
        </p>
      ) : temporadas.length === 0 ? (
        <div className="flex max-w-[64ch] flex-col gap-5">
          <p className="text-[1.05rem]">
            La cartelera todavía no está cargada.
          </p>
          <p className="text-[var(--muted)]">
            Podríamos haberla llenado con lo que aparece en las búsquedas, y de
            hecho lo intentamos: los datos se contradecían entre fuentes. Una
            obra figuraba en una sala en la que no estaba. Publicar eso habría
            sido peor que no publicar nada, porque el sentido de esta sección es
            que puedas confiar en lo que dice antes de comprar una entrada.
          </p>
          <p className="text-[var(--muted)]">
            La estamos armando contra las boleterías y las productoras, una obra
            por vez. Mientras tanto,{" "}
            <Link
              href="/salas"
              className="text-[var(--primary)] underline underline-offset-2"
            >
              las salas ya están cargadas
            </Link>{" "}
            con su teléfono y su web, que es por donde se confirma una función.
          </p>
          <p className="text-[var(--muted)]">
            ¿Estás produciendo un musical?{" "}
            <Link
              href="/contacto"
              className="text-[var(--primary)] underline underline-offset-2"
            >
              Escribinos
            </Link>{" "}
            y lo cargamos.
          </p>
        </div>
      ) : (
        <ul className="grid gap-5 md:grid-cols-2">
          {temporadas.map((t) => {
            const obra = Array.isArray(t.productions)
              ? t.productions[0]
              : t.productions;
            const sala = Array.isArray(t.venues) ? t.venues[0] : t.venues;
            const estado = ETIQUETA_ESTADO[t.status] ?? {
              texto: t.status,
              chip: "chip-estreno",
            };

            return (
              <li key={t.id} className="tarjeta flex flex-col gap-3 p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`chip ${estado.chip}`}>{estado.texto}</span>
                  {obra?.is_original_arg && (
                    <span className="chip chip-estreno">Original argentino</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <h2 className="font-display text-2xl uppercase leading-none tracking-tight">
                    {obra?.title}
                  </h2>
                  <p className="text-sm text-[var(--muted)]">
                    {sala?.name}
                    {sala?.neighborhood && ` · ${sala.neighborhood}`}
                    {obra?.duration_min && ` · ${obra.duration_min} min`}
                  </p>
                </div>

                {obra?.synopsis && (
                  <p className="text-[0.95rem] leading-relaxed text-[var(--muted)]">
                    {obra.synopsis}
                  </p>
                )}

                <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.84rem] text-[var(--muted)]">
                  {t.opens_on && <span>Desde el {fecha(t.opens_on)}</span>}
                  {t.closes_on && <span>hasta el {fecha(t.closes_on)}</span>}
                </p>

                {/* Reemplaza al precio: la boletería tiene el valor vigente. */}
                {t.ticket_url && (
                  <a
                    href={t.ticket_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="boton w-fit text-sm"
                  >
                    Comprar entradas ↗
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </PaginaPublica>
  );
}
