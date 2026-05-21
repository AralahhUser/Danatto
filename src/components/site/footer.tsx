import Link from "next/link";
import { Instagram } from "lucide-react";
import { Logo } from "@/components/site/logo";

const policyLinks = [
  { href: "/policies/shipping", label: "Envios" },
  { href: "/policies/returns", label: "Cambios y devoluciones" },
  { href: "/policies/product-condition", label: "Estado de prendas" },
  { href: "/policies/terms", label: "Terminos y condiciones" },
  { href: "/policies/privacy", label: "Privacidad" }
];

export function Footer() {
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/danatto.1/";

  return (
    <footer className="border-t border-white/10 bg-ink text-white">
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1.3fr_0.8fr_0.8fr_1fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/60">
            Ropa americana seleccionada para vestir con estilo, calidad y autenticidad. Piezas
            unicas con una seleccion limpia, moderna y atemporal.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/40">Comprar</h3>
          <div className="mt-4 grid gap-3 text-sm text-white/65">
            <Link href="/shop">Tienda</Link>
            <Link href="/shop?sort=recent">Nuevos ingresos</Link>
            <Link href="/cart">Carrito</Link>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/40">Politicas</h3>
          <div className="mt-4 grid gap-3 text-sm text-white/65">
            {policyLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/40">Contacto</h3>
          <div className="mt-4 grid gap-3 text-sm text-white/65">
            <a className="inline-flex items-center gap-2" href={instagram} target="_blank" rel="noreferrer">
              <Instagram className="h-4 w-4" /> @danatto.1
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">
        Danatto 2026. Boutique online preparada para pagos en Peru.
      </div>
    </footer>
  );
}
