"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { useCart } from "@/components/cart/cart-provider";
import { Logo } from "@/components/site/logo";
import { clsx } from "clsx";

const nav = [
  { href: "/shop", label: "Tienda" },
  { href: "/shop?sort=recent", label: "Novedades" },
  { href: "/about", label: "Nosotros" },
  { href: "/contact", label: "Contacto" }
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { count } = useCart();

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  return (
    <>
      <div className="hidden border-b border-ink/10 bg-porcelain px-3 py-1.5 text-center text-[9px] font-semibold uppercase leading-4 tracking-[0.08em] text-ink/55 sm:block sm:px-4 sm:py-2 sm:text-[11px] sm:leading-5 sm:tracking-[0.18em]">
        <span>Ropa americana seleccionada</span>
      </div>
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-porcelain/90 backdrop-blur-xl">
        <div className="container-page flex h-16 items-center justify-between gap-2 sm:h-24 sm:gap-4">
          <button
            aria-label="Abrir menu"
            onClick={() => setMobileOpen(true)}
            className="focus-ring inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white shadow-sm md:border-ink/10 md:bg-ink lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <span className="md:hidden">
            <Logo tone="light" compact />
          </span>
          <span className="hidden md:inline-flex">
            <Logo compact />
          </span>

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

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/shop"
              aria-label="Buscar productos"
              className="focus-ring hidden h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-white text-ink transition hover:border-ink sm:inline-flex"
            >
              <Search className="h-5 w-5" />
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="focus-ring relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white transition hover:bg-navy sm:h-11 sm:w-11 md:border-transparent md:bg-ink"
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
      </header>
      {mobileOpen ? (
        <div className="fixed inset-0 z-[70] bg-black text-white lg:hidden" onClick={() => setMobileOpen(false)}>
          <div
            className="flex h-full w-full flex-col overflow-y-auto bg-black p-5 pt-[max(1.25rem,env(safe-area-inset-top))] shadow-soft"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-5 border-b border-white/10 pb-6">
              <Logo tone="light" compact />
              <button
                aria-label="Cerrar menu"
                onClick={() => setMobileOpen(false)}
                className="focus-ring grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-white/5 text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="grid gap-2 border-b border-white/10 py-6">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-2 py-4 text-2xl font-semibold leading-none text-white transition hover:bg-white/10"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="grid gap-3 py-6 text-sm text-white/58">
              <p>Ropa americana seleccionada.</p>
              <p>Prendas unicas, estilo autentico y calidad de marca.</p>
            </div>
            <Link
              href="/admin/login"
              onClick={() => setMobileOpen(false)}
              className="mt-auto inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/25 px-4 py-3 text-sm font-semibold text-white"
            >
              Admin
            </Link>
          </div>
        </div>
      ) : null}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
