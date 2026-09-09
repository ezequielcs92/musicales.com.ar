import type { Metadata } from "next";

import { PaginaPublica } from "@/components/PaginaPublica";
import { clientePublico } from "@/lib/publico";

import { ListaSalas, type SalaPublica } from "./ListaSalas";

export const metadata: Metadata = {
  title: "Salas",
  description:
    "Salas de teatro de la Ciudad de Buenos Aires: dirección, capacidad y cómo contactarlas.",
};

// Las salas casi no cambian. Se regenera una vez por día.
export const revalidate = 86400;

export default async function Salas() {
  const supabase = clientePublico();
  const { data, error } = await supabase
    .from("venues")
    .select("id, slug, name, address, neighborhood, seats, phone, email, website, socials, lat, lng")
    .order("name");

  const salas: SalaPublica[] = (data ?? []).map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    address: s.address,
    neighborhood: s.neighborhood,
    seats: s.seats,
    phone: s.phone,
    email: s.email,
    website: s.website,
    instagram:
      (s.socials as Record<string, string> | null)?.instagram ?? null,
    lat: s.lat ? Number(s.lat) : null,
    lng: s.lng ? Number(s.lng) : null,
  }));

  return (
    <PaginaPublica
      antetitulo="Salas"
      titulo="Las salas, y cómo contactarlas."
      bajada={`${salas.length} salas de teatro de la Ciudad de Buenos Aires, con dirección, capacidad y la vía para escribirles o llamarlas.`}
    >
      {error ? (
        <p role="alert" className="text-[var(--primary)]">
          No pudimos cargar las salas. Probá de nuevo en unos minutos.
        </p>
      ) : (
        <>
          <ListaSalas salas={salas} />
          <p className="mt-10 max-w-[64ch] border-l-2 border-[var(--primary)] pl-5 text-[0.9rem] text-[var(--muted)]">
            Datos de{" "}
            <a
              href="https://data.buenosaires.gob.ar/dataset/espacios-culturales"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--primary)] underline underline-offset-2"
            >
              Buenos Aires Data ↗
            </a>
            , Ministerio de Cultura de la Ciudad. Si administrás una sala y
            querés corregir o completar su ficha, escribinos.
          </p>
        </>
      )}
    </PaginaPublica>
  );
}
