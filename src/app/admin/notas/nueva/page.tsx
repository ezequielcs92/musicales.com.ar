import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { sesion } from "@/lib/auth";
import { estadosPermitidos, puedeRedactar } from "@/lib/editorial";

import { EditorNota } from "../EditorNota";

export const metadata: Metadata = { title: "Nota nueva" };

export default async function NotaNueva() {
  const s = await sesion();
  if (!s) redirect("/ingresar?volver=/admin/notas/nueva");
  if (!puedeRedactar(s.rol)) redirect("/admin");

  return (
    <div className="flex flex-col gap-7">
      <h1 className="font-display text-3xl">Nota nueva</h1>
      <EditorNota
        estados={estadosPermitidos(s.rol)}
        avisoColaborador={s.rol === "colaborador"}
      />
    </div>
  );
}
