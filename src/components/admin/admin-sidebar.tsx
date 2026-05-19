"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Boxes, Building2, Image, LayoutDashboard, LogOut, Package, Tags, Ticket, Users } from "lucide-react";
import { clsx } from "clsx";
import { Logo } from "@/components/site/logo";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Productos", icon: Package },
  { href: "/admin/orders", label: "Pedidos", icon: Boxes },
  { href: "/admin/customers", label: "Clientes", icon: Users },
  { href: "/admin/brands", label: "Marcas", icon: Building2 },
  { href: "/admin/categories", label: "Categorias", icon: Tags },
  { href: "/admin/banners", label: "Banners", icon: Image },
  { href: "/admin/coupons", label: "Cupones", icon: Ticket }
];

export function AdminSidebar() {
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <aside className="hidden min-h-screen w-72 border-r border-ink/10 bg-white p-5 lg:block">
      <Logo />
      <nav className="mt-8 grid gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition",
              pathname.startsWith(link.href) ? "bg-navy text-white" : "text-ink/65 hover:bg-linen hover:text-ink"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </nav>
      <button
        onClick={logout}
        className="mt-8 flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-ink/65 hover:bg-linen"
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesion
      </button>
      <div className="mt-8 rounded-lg bg-linen p-4 text-sm text-ink/65">
        <BarChart3 className="mb-3 h-5 w-5 text-navy" />
        Panel preparado para operaciones, stock unico y drops de temporada.
      </div>
    </aside>
  );
}

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-ink/10 bg-white lg:hidden">
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <Logo compact />
        <Link href="/" className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">
          Ver tienda
        </Link>
      </div>
      <nav className="flex gap-2 overflow-x-auto px-4 pb-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-3 text-sm font-medium transition",
              pathname.startsWith(link.href)
                ? "border-navy bg-navy text-white"
                : "border-ink/10 bg-linen text-ink/65 hover:text-ink"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
