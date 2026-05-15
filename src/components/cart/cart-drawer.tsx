"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { formatCurrency } from "@/lib/format";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, subtotal, removeItem, setQuantity } = useCart();
  const shipping = items.length ? 12 : 0;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-ink/35" onClick={onClose}>
      <aside
        className="ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-soft"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink/10 p-5">
          <div>
            <h2 className="text-lg font-semibold">Carrito</h2>
            <p className="text-sm text-ink/55">Piezas seleccionadas para tu pedido.</p>
          </div>
          <button aria-label="Cerrar carrito" onClick={onClose} className="focus-ring grid h-10 w-10 place-items-center rounded-full border border-ink/10">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {items.length ? (
            <div className="grid gap-4">
              {items.map((item) => (
                <div key={item.productId} className="grid grid-cols-[84px_1fr] gap-4">
                  <div className="relative aspect-square overflow-hidden rounded-md bg-mist">
                    <Image src={item.image} alt={item.name} fill sizes="84px" className="object-cover" />
                  </div>
                  <div>
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-ink/55">
                          {item.brand} - Talla {item.size}
                        </p>
                      </div>
                      <button onClick={() => removeItem(item.productId)} className="text-xs font-semibold text-ink/45">
                        Quitar
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-full border border-ink/10">
                        <button className="px-3 py-1" onClick={() => setQuantity(item.productId, item.quantity - 1)}>
                          -
                        </button>
                        <span className="px-2 text-sm">{item.quantity}</span>
                        <button className="px-3 py-1" onClick={() => setQuantity(item.productId, item.quantity + 1)}>
                          +
                        </button>
                      </div>
                      <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-linen p-8 text-center">
              <h3 className="font-semibold">Tu carrito esta vacio</h3>
              <p className="mt-2 text-sm text-ink/60">Explora nuevos ingresos y piezas unicas.</p>
            </div>
          )}
        </div>
        <div className="border-t border-ink/10 p-5">
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Envio estimado</span>
              <span>{formatCurrency(shipping)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(subtotal + shipping)}</span>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            <Link onClick={onClose} href="/checkout" className="focus-ring rounded-full bg-ink px-5 py-3 text-center text-sm font-semibold text-white">
              Finalizar compra
            </Link>
            <Link onClick={onClose} href="/cart" className="focus-ring rounded-full border border-ink px-5 py-3 text-center text-sm font-semibold">
              Ver carrito
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
