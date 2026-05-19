"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-provider";
import { formatCurrency } from "@/lib/format";

export function CheckoutForm() {
  const { items, subtotal, clear } = useCart();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const shipping = items.length ? 12 : 0;
  const fieldClass = "min-h-12 rounded-md border border-ink/10 px-3 py-3 text-base outline-none transition focus:border-navy";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    const form = new FormData(event.currentTarget);
    const payload = {
      customer: {
        name: String(form.get("name") || ""),
        email: String(form.get("email") || ""),
        phone: String(form.get("phone") || ""),
        address: String(form.get("address") || ""),
        district: String(form.get("district") || ""),
        city: String(form.get("city") || ""),
        reference: String(form.get("reference") || "")
      },
      shippingMethod: form.get("shippingMethod"),
      paymentProvider: form.get("paymentProvider"),
      items: items.map((item) => ({ productId: item.productId, quantity: item.quantity }))
    };

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (!response.ok) {
      setStatus("error");
      setMessage(data.error || "No se pudo registrar el pedido.");
      return;
    }

    setStatus("success");
    setMessage(
      data.payment?.init_point
        ? "Pedido creado. Puedes continuar con el enlace de pago."
        : "Pedido creado. La pasarela queda lista al configurar las variables de entorno."
    );
    clear();
  }

  if (!items.length && status !== "success") {
    return (
      <div className="rounded-lg border border-ink/10 bg-white p-10 text-center">
        <h1 className="text-2xl font-semibold">Tu carrito esta vacio</h1>
        <p className="mt-2 text-ink/60">Agrega una prenda unica antes de finalizar compra.</p>
        <Link href="/shop" className="mt-6 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white">
          Ir a tienda
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_380px] lg:gap-8">
      <div className="grid gap-6">
        <section className="rounded-lg border border-ink/10 bg-white p-4 sm:p-6">
          <h2 className="text-lg font-semibold">Datos del cliente</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <input name="name" required placeholder="Nombre completo" className={fieldClass} />
            <input name="email" required type="email" placeholder="Correo" className={fieldClass} />
            <input name="phone" required placeholder="Telefono" className={fieldClass} />
            <input name="district" required placeholder="Distrito" className={fieldClass} />
            <input name="city" required placeholder="Ciudad" className={fieldClass} />
            <input name="address" required placeholder="Direccion" className={fieldClass} />
            <textarea name="reference" placeholder="Referencia" className={`${fieldClass} min-h-24 sm:col-span-2`} />
          </div>
        </section>
        <section className="rounded-lg border border-ink/10 bg-white p-4 sm:p-6">
          <h2 className="text-lg font-semibold">Envio y pago</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="flex min-h-14 items-center rounded-lg border border-ink/10 p-4 text-sm sm:text-base">
              <input defaultChecked type="radio" name="shippingMethod" value="domicilio" className="mr-2" />
              Envio a domicilio
            </label>
            <label className="flex min-h-14 items-center rounded-lg border border-ink/10 p-4 text-sm sm:text-base">
              <input type="radio" name="shippingMethod" value="recojo" className="mr-2" />
              Recojo coordinado
            </label>
            <label className="flex min-h-14 items-center rounded-lg border border-ink/10 p-4 text-sm sm:text-base">
              <input defaultChecked type="radio" name="paymentProvider" value="mercado_pago" className="mr-2" />
              Mercado Pago
            </label>
            <label className="flex min-h-14 items-center rounded-lg border border-ink/10 p-4 text-sm sm:text-base">
              <input type="radio" name="paymentProvider" value="culqi" className="mr-2" />
              Culqi
            </label>
            <label className="flex min-h-14 items-center rounded-lg border border-ink/10 p-4 text-sm sm:col-span-2 sm:text-base">
              <input type="radio" name="paymentProvider" value="yape_plin" className="mr-2" />
              Yape/Plin manual
            </label>
          </div>
        </section>
      </div>
      <aside className="h-fit rounded-lg border border-ink/10 bg-white p-4 sm:p-6 lg:sticky lg:top-28">
        <h2 className="text-lg font-semibold">Resumen</h2>
        <div className="mt-5 grid gap-3 text-sm">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between gap-4">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-ink/10 pt-3">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span>Envio</span>
              <span>{formatCurrency(shipping)}</span>
            </div>
            <div className="mt-3 flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(subtotal + shipping)}</span>
            </div>
          </div>
        </div>
        <button disabled={status === "loading"} className="mt-6 min-h-12 w-full rounded-full bg-ink px-5 py-3.5 text-sm font-semibold text-white disabled:bg-ink/35">
          {status === "loading" ? "Procesando..." : "Confirmar pedido"}
        </button>
        {message ? (
          <p className={`mt-4 rounded-md p-3 text-sm ${status === "error" ? "bg-red-50 text-red-700" : "bg-olive/10 text-olive"}`}>
            {message}
          </p>
        ) : null}
      </aside>
    </form>
  );
}
