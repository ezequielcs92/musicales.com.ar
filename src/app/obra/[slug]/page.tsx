import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Estrellas } from "@/components/Estrellas";
import { PaginaPublica } from "@/components/PaginaPublica";
import { clientePublico, fecha } from "@/lib/publico";

export const revalidate = 3600;

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://musicales.com.ar";

async function traer(slug: string) {
  const supabase = clientePublico();
  const { data } = await supabase
    .from("productions")
    .select(
      "slug, title, original_title, synopsis, composer, lyricist, book_author, translator, is_original_arg, duration_min, age_rating, runs(id, status, schedule_note, opens_on, closes_on, ticket_url, producer, venues(slug, name, address, neighborhood))",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return null;

  // Las críticas de esta obra: es lo que conecta la cartelera con la redacción.
  const { data: criticas } = await supabase
    .from("articles")
    .select("slug, title, dek, rating, seen_on, published_at")
    .eq("section", "reviews")
    .eq("status", "publicado")
    .eq("related_production_id", (data as { id?: string }).id ?? "")
    .order("published_at", { ascending: false })
    .limit(5);

  return { obra: data, criticas: criticas ?? [] };
}

export async function generateStaticParams() {
  const supabase = clientePublico();
  const { data } = await supabase.from("productions").select("slug").limit(500);
  return (data ?? []).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/obra/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const r = await traer(slug);
  if (!r) return { title: "Obra no encontrada" };

  const run = r.obra.runs?.[0];
  const sala = Array.isArray(run?.venues) ? run?.venues[0] : run?.venues;

  return {
    title: r.obra.title,
    description: `${r.obra.title}${sala ? ` en ${sala.name}` : ""}. Funciones, ficha y dónde comprar entradas.`,
    alternates: { canonical: `${SITE}/obra/${r.obra.slug}` },
  };
}

export default async function Obra({ params }: PageProps<"/obra/[slug]">) {
  const { slug } = await params;
  const r = await traer(slug);
  if (!r) notFound();

  const { obra, criticas } = r;
  const enCartel = (obra.runs ?? []).filter((x) => x.status === "en_cartel");
  const run = enCartel[0] ?? obra.runs?.[0];
  const sala = Array.isArray(run?.venues) ? run?.venues[0] : run?.venues;

  // TheaterEvent es lo que habilita el bloque de eventos en los resultados de
  // Google. Solo se declara cuando hay sala y fecha reales.
  const jsonLd =
    run && sala
      ? {
          "@context": "https://schema.org",
          "@type": "TheaterEvent",
          name: obra.title,
          ...(run.opens_on && { startDate: run.opens_on }),
          ...(run.closes_on && { endDate: run.closes_on }),
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode:
            "https://schema.org/OfflineEventAttendanceMode",
          location: {
            "@type": "PerformingArtsTheater",
            name: sala.name,
            ...(sala.address && {
              address: {
                "@type": "PostalAddress",
                streetAddress: sala.address,
                addressLocality: sala.neighborhood ?? undefined,
                addressCountry: "AR",
              },
            }),
          },
          ...(run.ticket_url && {
            offers: {
              "@type": "Offer",
              url: run.ticket_url,
              availability: "https://schema.org/InStock",
            },
          }),
        }
      : null;

  const dato = "flex flex-col gap-1 border-b border-[var(--line)] py-4";
  const etiqueta =
    "font-mono text-[0.66rem] uppercase tracking-[0.12em] text-[var(--muted)]";

  const ficha = [
    ["Título original", obra.original_title],
    ["Música", obra.composer],
    ["Letras", obra.lyricist],
    ["Libro", obra.book_author],
    ["Traducción", obra.translator],
    ["Dirección", run?.producer],
    ["Duración", obra.duration_min ? `${obra.duration_min} minutos` : null],
    ["Clasificación", obra.age_rating],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <>
      <PaginaPublica
        antetitulo={enCartel.length ? "En cartel" : "Obra"}
        titulo={obra.title}
        bajada={
          sala
            ? `${sala.name}${sala.neighborhood ? ` · ${sala.neighborhood}` : ""}`
            : undefined
        }
      >
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col gap-8">
            {run?.schedule_note && (
              <section className="flex flex-col gap-3">
                <h2 className={etiqueta}>Funciones</h2>
                <p className="font-display text-2xl uppercase leading-none tracking-tight text-[var(--bombilla)]">
                  {run.schedule_note}
                </p>
                {run.closes_on && (
                  <p className="text-[var(--muted)]">
                    Hasta el {fecha(run.closes_on)}
                  </p>
                )}
                {run.ticket_url && (
                  <a
                    href={run.ticket_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="boton w-fit"
                  >
                    Comprar entradas ↗
                  </a>
                )}
                <p className="text-[0.84rem] text-[var(--muted)]">
                  Los horarios cambian sin aviso. Confirmá con la sala antes de
                  ir.
                </p>
              </section>
            )}

            {obra.synopsis && (
              <section className="flex flex-col gap-3">
                <h2 className={etiqueta}>De qué va</h2>
                <p className="max-w-[66ch] leading-relaxed">{obra.synopsis}</p>
              </section>
            )}

            <section className="flex flex-col gap-3">
              <h2 className={etiqueta}>Críticas</h2>
              {criticas.length === 0 ? (
                <p className="text-[var(--muted)]">
                  Todavía no publicamos una crítica de esta obra.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {criticas.map((c) => (
                    <li key={c.slug} className="tarjeta flex flex-col gap-2 p-5">
                      <Link
                        href={`/criticas/${c.slug}`}
                        className="font-display text-lg uppercase leading-tight tracking-tight hover:underline"
                      >
                        {c.title}
                      </Link>
                      {c.rating !== null && (
                        <div className="flex flex-wrap items-center gap-3">
                          <Estrellas puntaje={Number(c.rating)} />
                          {c.seen_on && (
                            <span className="text-[0.8rem] text-[var(--muted)]">
                              función del {fecha(c.seen_on, false)}
                            </span>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="flex flex-col gap-6">
            {ficha.length > 0 && (
              <div>
                <h2 className={etiqueta}>Ficha</h2>
                <dl className="mt-2 border-t border-[var(--line)]">
                  {ficha.map(([k, v]) => (
                    <div key={k} className={dato}>
                      <dt className={etiqueta}>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                  {obra.is_original_arg && (
                    <div className={dato}>
                      <dt className={etiqueta}>Origen</dt>
                      <dd>Musical original argentino</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {sala && (
              <div>
                <h2 className={etiqueta}>Sala</h2>
                <div className="tarjeta mt-2 flex flex-col gap-2 p-5">
                  <Link
                    href={`/sala/${sala.slug}`}
                    className="font-display text-lg uppercase leading-none tracking-tight hover:underline"
                  >
                    {sala.name}
                  </Link>
                  <span className="text-sm text-[var(--muted)]">
                    {sala.address}
                  </span>
                </div>
              </div>
            )}
          </aside>
        </div>
      </PaginaPublica>

      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </>
  );
}
