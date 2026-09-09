"use client";

import Link from "next/link";
import { LogoMarca } from "@/components/LogoMarca";
import { usePathname } from "next/navigation";
import { useRef, type ReactNode } from "react";
import { ArrowUpRight, FileText, LayoutDashboard, LogOut, Menu, Plus, X } from "lucide-react";
import { ETIQUETA_ROL, esStaff, type Rol } from "@/lib/editorial";

export function AdminShell({ children, email, rol }: { children: ReactNode; email: string; rol: Rol }) {
  const pathname = usePathname();
  const drawer = useRef<HTMLDialogElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const closeMenu = () => { drawer.current?.close(); };

  function navigation() {
    return <>
      <div className="admin-sidebar-heading">Administración</div>
      <nav aria-label="Menú de administración" className="admin-navigation">
        <Link href="/admin" onClick={closeMenu} className={pathname === "/admin" ? "is-active" : ""} aria-current={pathname === "/admin" ? "page" : undefined}>
          <LayoutDashboard size={19} aria-hidden="true" /> Escritorio
        </Link>
        <Link href="/admin/notas" onClick={closeMenu} className={pathname.startsWith("/admin/notas") ? "is-active" : ""} aria-current={pathname === "/admin/notas" ? "page" : undefined}>
          <FileText size={19} aria-hidden="true" /> Notas
        </Link>
        <div className="admin-subnavigation">
          <Link href="/admin/notas" onClick={closeMenu}>Todas las notas</Link>
          <Link href="/admin/notas/nueva" onClick={closeMenu} aria-current={pathname === "/admin/notas/nueva" ? "page" : undefined}>Añadir nueva</Link>
          {esStaff(rol) && <Link href="/admin/notas?estado=en_revision" onClick={closeMenu}>En revisión</Link>}
        </div>
      </nav>
      <div className="admin-sidebar-bottom">
        <div className="admin-account"><span className="admin-avatar" aria-hidden="true">{email.slice(0, 1).toUpperCase()}</span><div><strong>{ETIQUETA_ROL[rol]}</strong><span title={email}>{email}</span></div></div>
        <form action="/admin/salir" method="post"><button className="admin-signout" type="submit"><LogOut size={17} aria-hidden="true" /> Cerrar sesión</button></form>
      </div>
    </>;
  }

  return <div className="admin-shell">
    <a className="admin-skip-link" href="#contenido-admin">Saltar al contenido</a>
    <header className="admin-topbar">
      <button ref={menuButton} className="admin-menu-toggle" type="button" aria-label="Abrir menú de administración" onClick={() => drawer.current?.showModal()}><Menu size={22} /></button>
      <Link href="/admin" className="admin-brand"><LogoMarca size={23} dark /><span>Redacción</span></Link>
      <div className="admin-topbar-actions">
        <Link href="/" target="_blank" rel="noopener noreferrer" className="admin-site-link">Ver sitio <ArrowUpRight size={15} aria-hidden="true" /></Link>
        <Link href="/admin/notas/nueva" className="admin-topbar-new"><Plus size={17} aria-hidden="true" /> <span>Nueva nota</span></Link>
      </div>
    </header>
    <aside className="admin-sidebar">{navigation()}</aside>
    <dialog ref={drawer} className="admin-mobile-menu" onClose={() => menuButton.current?.focus()} onClick={(event) => { if (event.target === event.currentTarget) closeMenu(); }}>
      <div className="admin-mobile-menu-inner"><button className="admin-drawer-close" type="button" onClick={closeMenu} aria-label="Cerrar menú"><X size={22} /></button>{navigation()}</div>
    </dialog>
    <main id="contenido-admin" className="admin-main" tabIndex={-1}>{children}</main>
  </div>;
}

