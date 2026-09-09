import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { sesion } from "@/lib/auth";
import { puedeRedactar } from "@/lib/editorial";
import "./admin.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap", variable: "--font-admin" });

export const metadata: Metadata = {
  title: { default: "Escritorio", template: "%s — Redacción" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const s = await sesion();
  if (!s) redirect("/ingresar?volver=/admin");
  if (!puedeRedactar(s.rol)) {
    return <main className="mx-auto flex max-w-md flex-col gap-5 px-6 py-20 text-center">
      <h1 className="text-2xl font-semibold">Esta cuenta no es de la redacción</h1>
      <p>Tu usuario existe pero no tiene permisos para escribir. Si tendría que tenerlos, pedile a un administrador que te cambie el rol.</p>
      <Link href="/" className="text-telon underline">Ir a la portada</Link>
    </main>;
  }
  return <div className={poppins.variable}><AdminShell email={s.user.email ?? "Redacción"} rol={s.rol}>{children}</AdminShell></div>;
}
