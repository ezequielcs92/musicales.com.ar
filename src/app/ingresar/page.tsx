import type { Metadata } from "next";
import Link from "next/link";

import { Isotipo } from "@/components/Marquesina";

import { FormularioIngreso } from "./FormularioIngreso";

export const metadata: Metadata = {
  title: "Ingresar",
  robots: { index: false, follow: false },
};

export default async function Ingresar({ searchParams }: PageProps<"/ingresar">) {
  const params = await searchParams;
  const volver = typeof params.volver === "string" ? params.volver : "/admin";
  const enlaceVencido = params.error === "enlace";

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-9 px-6 py-20">
      <header className="flex flex-col items-center gap-5 text-center">
        <Isotipo size={56} />
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-2xl uppercase tracking-wide">Redacción</h1>
          <p className="text-sm text-muted">
            Acceso al panel de Musicales.com.ar
          </p>
        </div>
      </header>

      {enlaceVencido && (
        <p
          role="alert"
          className="border-l-2 border-telon bg-telon-soft px-4 py-3 text-sm text-ink-soft"
        >
          Ese enlace ya venció o se usó antes. Pedí uno nuevo abajo.
        </p>
      )}

      <FormularioIngreso volver={volver} />

      <p className="text-center text-xs leading-relaxed text-muted">
        El panel es solo para la redacción. Si llegaste acá por error, podés
        volver a{" "}
        <Link href="/" className="text-telon underline underline-offset-2">
          la portada
        </Link>
        .
      </p>
    </main>
  );
}
