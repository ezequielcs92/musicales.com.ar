import type { Metadata } from "next";

import {
  ListadoEditorial,
  SECCIONES_PUBLICAS,
  type NotaListado,
} from "@/components/Editorial";
import { clientePublico } from "@/lib/publico";

const RUTA = "opiniones";
const CFG = SECCIONES_PUBLICAS[RUTA];

export const metadata: Metadata = {
  title: CFG.titulo.replace(".", ""),
  description: CFG.descripcion,
};

// Una nota nueva tiene que aparecer pronto, pero no en cada visita.
export const revalidate = 600;

export default async function Seccion() {
  const supabase = clientePublico();
  const { data, error } = await supabase
    .from("articles")
    .select("id, slug, title, dek, published_at, rating, seen_on, profiles!articles_author_id_fkey(display_name)")
    .eq("section", CFG.seccion)
    .eq("status", "publicado")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(50);

  const notas: NotaListado[] = (data ?? []).map((n) => {
    const autor = Array.isArray(n.profiles) ? n.profiles[0] : n.profiles;
    return {
      id: n.id,
      slug: n.slug,
      title: n.title,
      dek: n.dek,
      published_at: n.published_at,
      rating: n.rating,
      seen_on: n.seen_on,
      autor: autor?.display_name ?? null,
    };
  });

  return <ListadoEditorial ruta={RUTA} notas={notas} error={Boolean(error)} />;
}
