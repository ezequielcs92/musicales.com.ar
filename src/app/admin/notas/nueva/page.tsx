import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { sesion } from "@/lib/auth";
import { estadosPermitidos, puedeRedactar } from "@/lib/editorial";
import { EditorNota } from "../EditorNota";

export const metadata: Metadata = { title: "Añadir nota" };
export default async function NotaNueva() {
  const s = await sesion();
  if (!s) redirect("/ingresar?volver=/admin/notas/nueva");
  if (!puedeRedactar(s.rol)) redirect("/admin");
  return <>
    <Link href="/admin/notas" className="admin-breadcrumb"><ChevronLeft size={14} aria-hidden="true" /> Volver a notas</Link>
    <div className="admin-page-heading"><div><h1>Añadir nueva nota</h1><p>Dale forma a tu próxima historia.</p></div></div>
    <EditorNota estados={estadosPermitidos(s.rol)} avisoColaborador={s.rol === "colaborador"} />
  </>;
}
