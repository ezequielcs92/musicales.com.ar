import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Articulo, type NotaCompleta } from "@/components/Articulo";
import { SECCIONES_PUBLICAS } from "@/components/Editorial";
import { clientePublico } from "@/lib/publico";

const RUTA = "blog";
const SECCION = SECCIONES_PUBLICAS[RUTA].seccion;

export const revalidate = 600;

const CAMPOS =
  "slug, title, dek, body_mdx, published_at, updated_at, rating, seen_on, profiles!articles_author_id_fkey(display_name), productions!articles_related_production_id_fkey(title), venues!articles_reviewed_venue_id_fkey(name), companies!articles_reviewed_company_id_fkey(name)";

async function traer(slug: string) {
  const supabase = clientePublico();
  const { data } = await supabase
    .from("articles")
    .select(CAMPOS)
    .eq("slug", slug)
    .eq("section", SECCION)
    .eq("status", "publicado")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();

  if (!data) return null;

  const uno = <T,>(v: T | T[] | null): T | null =>
    Array.isArray(v) ? (v[0] ?? null) : v;

  const nota: NotaCompleta = {
    slug: data.slug,
    title: data.title,
    dek: data.dek,
    body_mdx: data.body_mdx,
    published_at: data.published_at,
    updated_at: data.updated_at,
    rating: data.rating,
    seen_on: data.seen_on,
    autor: uno(data.profiles)?.display_name ?? null,
    obra: uno(data.productions)?.title ?? null,
    sala: uno(data.venues)?.name ?? null,
    productora: uno(data.companies)?.name ?? null,
  };
  return nota;
}

// Las notas publicadas se generan al compilar; una nueva entra por
// revalidacion sin necesidad de volver a desplegar.
export async function generateStaticParams() {
  const supabase = clientePublico();
  const { data } = await supabase
    .from("articles")
    .select("slug")
    .eq("section", SECCION)
    .eq("status", "publicado")
    .limit(200);
  return (data ?? []).map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const nota = await traer(slug);
  if (!nota) return { title: "Nota no encontrada" };

  return {
    title: nota.title,
    description: nota.dek ?? undefined,
    openGraph: {
      type: "article",
      title: nota.title,
      description: nota.dek ?? undefined,
      publishedTime: nota.published_at ?? undefined,
    },
  };
}

export default async function Nota({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const nota = await traer(slug);
  if (!nota) notFound();

  return <Articulo nota={nota} ruta={RUTA} etiquetaSeccion="Blog" />;
}
