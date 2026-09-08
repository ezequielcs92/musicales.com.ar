import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Isotipo } from "@/components/Marquesina";
import { sesion } from "@/lib/auth";
import { ETIQUETA_ROL, esStaff, puedeRedactar } from "@/lib/editorial";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s — Panel" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const s = await sesion();
  if (!s) redirect("/ingresar?volver=/admin");

  // El middleware ya frena a quien no tiene sesion. Esto frena a quien la tiene
  // pero no pertenece a la redaccion: un suscriptor con cuenta valida.
  if (!puedeRedactar(s.rol)) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-5 px-6 py-20 text-center">
        <h1 className="font-display text-2xl">Esta cuenta no es de la redacción</h1>
        <p className="text-ink-soft">
          Tu usuario existe pero no tiene permisos para escribir. Si tendría que
          tenerlos, pedile a un administrador que te cambie el rol.
        </p>
        <Link href="/" className="text-telon underline underline-offset-4">
          Ir a la portada
        </Link>
      </main>
    );
  }

  const enlaces = [
    { href: "/admin", texto: "Inicio" },
    { href: "/admin/notas", texto: "Notas" },
  ];

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-rule bg-sala text-papel">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-8 gap-y-3 px-6 py-3">
          <Link href="/admin" className="flex items-center gap-3 text-papel">
            <Isotipo size={30} />
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#B9AFC8]">
              Redacción
            </span>
          </Link>

          <nav className="flex gap-5">
            {enlaces.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                className="font-display text-[0.8rem] uppercase tracking-wide text-[#CFC7DA] hover:text-papel"
              >
                {e.texto}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-[#8F849F]">
              {s.user.email} · {ETIQUETA_ROL[s.rol]}
              {esStaff(s.rol) && " ·"}
              {esStaff(s.rol) && (
                <span className="text-bombilla"> ve todo</span>
              )}
            </span>
            <form action="/admin/salir" method="post">
              <button
                type="submit"
                className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-[#CFC7DA] underline underline-offset-4 hover:text-papel"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</div>
    </div>
  );
}
