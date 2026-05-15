"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { useCart } from "@/components/cart/cart-provider";
import { Logo } from "@/components/site/logo";
import { clsx } from "clsx";

const nav = [
  { href: "/shop", label: "Tienda" },
  { href: "/shop?sort=recent", label: "Novedades" },
  { href: "/shop?brand=ralph-lauren", label: "Marcas" },
  { href: "/about", label: "Nosotros" },
  { href: "/contact", label: "Contacto" }
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { count } = useCart();

  return (
    <>
      <div className="border-b border-ink/10 bg-porcelain px-4 py-2 text-center text-[10px] font-semibold uppercase leading-5 tracking-[0.1em] text-ink/55 sm:text-[11px] sm:tracking-[0.18em]">
        <span className="sm:hidden">Piezas unicas revisadas una por una</span>
        <span className="hidden sm:inline">Ropa americana seleccionada - piezas unicas revisadas una por una</span>
      </div>
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-porcelain/90 backdrop-blur-xl">
        <div className="container-page flex h-24 items-center justify-between gap-4">
          <button
            aria-label="Abrir menu"
            onClick={() => setMobileOpen(true)}
            className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-white lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Logo />

          <nav className="hidden items-center gap-8 text-[13px] font-semibold uppercase tracking-[0.14em] text-ink/55 lg:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "focus-ring rounded-full transition hover:text-ink",
                  pathname === item.href && "text-ink"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/shop"
              aria-label="Buscar productos"
              className="focus-ring hidden h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-white text-ink transition hover:border-ink sm:inline-flex"
            >
              <Search className="h-5 w-5" />
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="focus-ring relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white transition hover:bg-navy"
              aria-label="Abrir carrito"
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 ? (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-champagne px-1 text-[11px] font-semibold text-ink">
                  {count}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 bg-ink/30 lg:hidden" onClick={() => setMobileOpen(false)}>
            <div
              className="h-full w-[min(84vw,360px)] bg-porcelain p-5 shadow-soft"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-8 flex items-center justify-between">
                <Logo />
                <button
                  aria-label="Cerrar menu"
                  onClick={() => setMobileOpen(false)}
                  className="focus-ring grid h-10 w-10 place-items-center rounded-full border border-ink/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="grid gap-2">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-3 text-base font-semibold text-ink hover:bg-linen"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <Link
                href="/admin/login"
                onClick={() => setMobileOpen(false)}
                className="mt-8 inline-flex w-full items-center justify-center rounded-full border border-ink px-4 py-3 text-sm font-semibold"
              >
                Admin
              </Link>
            </div>
          </div>
        ) : null}
      </header>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
