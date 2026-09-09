import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PaginaPublica } from "@/components/PaginaPublica";
import { clientePublico } from "@/lib/publico";

export const revalidate = 86400;

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://musicales.com.ar";

async function traer(slug: string) {
  const supabase = clientePublico();
  const { data } = await supabase
    .from("venues")
    .select(
      "slug, name, address, neighborhood, city, seats, phone, email, website, socials, lat, lng, wheelchair_access, runs(id, status, schedule_note, ticket_url, closes_on, productions(slug, title))",
    )
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

// Las 310 salas se generan al compilar: son páginas estables y cada una puede
// posicionar por su nombre, que es como la busca la gente.
export async function generateStaticParams() {
  const supabase = clientePublico();
  const { data } = await supabase.from("venues").select("slug").limit(500);
  return (data ?? []).map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/sala/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const sala = await traer(slug);
  if (!sala) return { title: "Sala no encontrada" };

  const donde = [sala.address, sala.neighborhood].filter(Boolean).join(", ");
  return {
    title: sala.name,
    description: `${sala.name}${donde ? `, ${donde}` : ""}. Cómo llegar, cómo contactarla y qué musicales hay en cartel.`,
    alternates: { canonical: `${SITE}/sala/${sala.slug}` },
  };
}

export default async function Sala({ params }: PageProps<"/sala/[slug]">) {
  const { slug } = await params;
  const sala = await traer(slug);
  if (!sala) notFound();

  const redes = (sala.socials ?? {}) as Record<string, string>;
  const enCartel = (sala.runs ?? []).filter((r) => r.status === "en_cartel");
  const mapa =
    sala.lat && sala.lng
      ? `https://www.google.com/maps/search/?api=1&query=${sala.lat},${sala.lng}`
      : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PerformingArtsTheater",
    name: sala.name,
    ...(sala.address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: sala.address,
        addressLocality: sala.neighborhood ?? sala.city,
        addressCountry: "AR",
      },
    }),
    ...(sala.lat &&
      sala.lng && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: sala.lat,
          longitude: sala.lng,
        },
      }),
    ...(sala.phone && { telephone: sala.phone }),
    ...(sala.email && { email: sala.email }),
    ...(sala.website && { sameAs: [sala.website] }),
    ...(sala.seats && { maximumAttendeeCapacity: sala.seats }),
  };

  const dato = "flex flex-col gap-1 border-b border-[var(--line)] py-4";
  const etiqueta =
    "font-mono text-[0.66rem] uppercase tracking-[0.12em] text-[var(--muted)]";

  return (
    <>
      <PaginaPublica
        antetitulo="Sala"
        titulo={sala.name}
        bajada={[sala.address, sala.neighborhood].filter(Boolean).join(" · ")}
      >
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col gap-6">
            <section>
              <h2 className="font-display text-xl uppercase tracking-tight">
                Cómo contactarla
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {sala.phone && (
                  <a
                    href={`tel:${sala.phone.replace(/[^\d+]/g, "")}`}
                    className="chip chip-estreno"
                  >
                    {sala.phone}
                  </a>
                )}
                {sala.email && (
                  <a href={`mailto:${sala.email}`} className="chip chip-estreno">
                    {sala.email}
                  </a>
                )}
                {sala.website && (
                  <a
                    href={
                      sala.website.startsWith("http")
                        ? sala.website
                        : `https://${sala.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="chip chip-estreno"
                  >
                    Sitio oficial ↗
                  </a>
                )}
                {redes.instagram && (
                  <a
                    href={`https://instagram.com/${redes.instagram.replace(/^@|^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/$/, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="chip chip-estreno"
                  >
                    Instagram ↗
                  </a>
                )}
                {mapa && (
                  <a
                    href={mapa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="chip chip-cartel"
                  >
                    Cómo llegar ↗
                  </a>
                )}
              </div>
              {!sala.phone && !sala.email && !sala.website && (
                <p className="mt-4 text-[var(--muted)]">
                  No tenemos datos de contacto de esta sala.{" "}
                  <Link
                    href="/contacto"
                    className="text-[var(--primary)] underline underline-offset-2"
                  >
                    Si los tenés, escribinos
                  </Link>
                  .
                </p>
              )}
            </section>

            <section>
              <h2 className="font-display text-xl uppercase tracking-tight">
                Qué hay en cartel
              </h2>
              {enCartel.length === 0 ? (
                <p className="mt-4 text-[var(--muted)]">
                  No tenemos musicales cargados en esta sala ahora mismo. Puede
                  haber otro tipo de espectáculos: este sitio cubre solo teatro
                  musical.
                </p>
              ) : (
                <ul className="mt-4 flex flex-col gap-3">
                  {enCartel.map((r) => {
                    const obra = Array.isArray(r.productions)
                      ? r.productions[0]
                      : r.productions;
                    return (
                      <li key={r.id} className="tarjeta flex flex-col gap-2 p-5">
                        <Link
                          href={`/obra/${obra?.slug}`}
                          className="font-display text-lg uppercase leading-none tracking-tight hover:underline"
                        >
                          {obra?.title}
                        </Link>
                        {r.schedule_note && (
                          <span className="font-mono text-[0.78rem] uppercase tracking-[0.06em] text-[var(--bombilla)]">
                            {r.schedule_note}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          <aside>
            <h2 className={etiqueta}>Datos de la sala</h2>
            <dl className="mt-2 border-t border-[var(--line)]">
              <div className={dato}>
                <dt className={etiqueta}>Dirección</dt>
                <dd>{sala.address ?? "No informada"}</dd>
              </div>
              {sala.neighborhood && (
                <div className={dato}>
                  <dt className={etiqueta}>Barrio</dt>
                  <dd>{sala.neighborhood}</dd>
                </div>
              )}
              {sala.seats && (
                <div className={dato}>
                  <dt className={etiqueta}>Capacidad</dt>
                  <dd className="tabular-nums">
                    {sala.seats.toLocaleString("es-AR")} butacas
                  </dd>
                </div>
              )}
              {sala.wheelchair_access !== null && (
                <div className={dato}>
                  <dt className={etiqueta}>Accesibilidad</dt>
                  <dd>
                    {sala.wheelchair_access
                      ? "Accesible en silla de ruedas"
                      : "Sin acceso en silla de ruedas"}
                  </dd>
                </div>
              )}
            </dl>
            <p className="mt-4 text-[0.84rem] text-[var(--muted)]">
              Datos de{" "}
              <a
                href="https://data.buenosaires.gob.ar/dataset/espacios-culturales"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--primary)] underline underline-offset-2"
              >
                Buenos Aires Data ↗
              </a>
              .
            </p>
          </aside>
        </div>
      </PaginaPublica>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
