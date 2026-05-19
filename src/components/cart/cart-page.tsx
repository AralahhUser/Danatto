"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-provider";
import { formatCurrency } from "@/lib/format";

export function CartPage() {
  const { items, subtotal, removeItem, setQuantity } = useCart();
  const shipping = items.length ? 12 : 0;

  return (
    <main className="container-page py-8 sm:py-16 lg:py-24">
      <div className="mb-6 sm:mb-8">
        <p className="text-sm font-semibold uppercase text-olive">Pedido</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-5xl">Tu carrito</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:gap-8">
        <div className="rounded-lg border border-ink/10 bg-white p-4 sm:p-6">
          {items.length ? (
            <div className="grid gap-5">
              {items.map((item) => (
                <div key={item.productId} className="grid grid-cols-[82px_1fr] gap-3 border-b border-ink/10 pb-5 last:border-b-0 last:pb-0 sm:grid-cols-[110px_1fr_auto] sm:gap-4">
                  <div className="relative aspect-square overflow-hidden rounded-md bg-mist">
                    <Image src={item.image} alt={item.name} fill sizes="110px" className="object-cover" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold leading-snug sm:text-base">{item.name}</h2>
                    <p className="mt-1 text-sm text-ink/55">
                      {item.brand} - Talla {item.size}
                    </p>
                    <div className="mt-4 inline-flex items-center rounded-full border border-ink/10">
                      <button className="min-h-8 px-3 py-1" onClick={() => setQuantity(item.productId, item.quantity - 1)}>
                        -
                      </button>
                      <span className="px-3 text-sm">{item.quantity}</span>
                      <button className="min-h-8 px-3 py-1" onClick={() => setQuantity(item.productId, item.quantity + 1)}>
                        +
                      </button>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center justify-between gap-5 sm:col-span-1 sm:block sm:text-right">
                    <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                    <button onClick={() => removeItem(item.productId)} className="mt-3 text-sm font-semibold text-ink/45">
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <h2 className="text-xl font-semibold">Aun no agregaste prendas</h2>
              <p className="mt-2 text-ink/60">Cada pieza es unica, asi que vale mirar los nuevos ingresos.</p>
              <Link href="/shop" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white">
                Ir a tienda
              </Link>
            </div>
          )}
        </div>
        <aside className="h-fit rounded-lg border border-ink/10 bg-white p-4 sm:p-6 lg:sticky lg:top-28">
          <h2 className="text-lg font-semibold">Resumen</h2>
          <div className="mt-5 grid gap-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Envio</span>
              <span>{formatCurrency(shipping)}</span>
            </div>
            <div className="border-t border-ink/10 pt-3">
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(subtotal + shipping)}</span>
              </div>
            </div>
          </div>
          <Link href="/checkout" className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-navy px-5 py-3.5 text-sm font-semibold text-white">
            Finalizar compra
          </Link>
        </aside>
      </div>
    </main>
  );
}
