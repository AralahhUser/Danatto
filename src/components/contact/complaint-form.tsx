"use client";

import { useState } from "react";

export function ComplaintForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const payload = {
      type: form.get("type"),
      fullName: form.get("fullName"),
      document: form.get("document"),
      email: form.get("email"),
      phone: form.get("phone"),
      address: form.get("address"),
      orderNumber: form.get("orderNumber"),
      amount: form.get("amount"),
      product: form.get("product"),
      detail: form.get("detail"),
      request: form.get("request")
    };

    const response = await fetch("/api/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (!response.ok) {
      setStatus("error");
      setMessage(data.error || "No se pudo registrar tu solicitud.");
      return;
    }

    event.currentTarget.reset();
    setStatus("success");
    setMessage(`Solicitud registrada. Codigo: ${data.code}`);
  }

  const fieldClass =
    "min-h-12 w-full rounded-md border border-ink/10 bg-white px-3 py-3 text-base outline-none transition focus:border-navy";

  return (
    <form onSubmit={submit} className="grid gap-6 rounded-lg border border-ink/10 bg-white p-4 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm">
          Tipo de solicitud
          <select name="type" required className={fieldClass} defaultValue="reclamo">
            <option value="reclamo">Reclamo</option>
            <option value="queja">Queja</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          DNI / CE
          <input name="document" required minLength={8} maxLength={12} className={fieldClass} />
        </label>
        <label className="grid gap-2 text-sm sm:col-span-2">
          Nombres completos
          <input name="fullName" required className={fieldClass} />
        </label>
        <label className="grid gap-2 text-sm">
          Correo
          <input name="email" required type="email" className={fieldClass} />
        </label>
        <label className="grid gap-2 text-sm">
          Telefono
          <input name="phone" required inputMode="tel" className={fieldClass} />
        </label>
        <label className="grid gap-2 text-sm sm:col-span-2">
          Direccion
          <input name="address" className={fieldClass} />
        </label>
        <label className="grid gap-2 text-sm">
          Codigo de pedido
          <input name="orderNumber" className={fieldClass} />
        </label>
        <label className="grid gap-2 text-sm">
          Monto reclamado
          <input name="amount" type="number" min="0" step="0.01" className={fieldClass} />
        </label>
        <label className="grid gap-2 text-sm sm:col-span-2">
          Producto o servicio
          <input name="product" required placeholder="Ej. Polo Lacoste pique / atencion / envio" className={fieldClass} />
        </label>
        <label className="grid gap-2 text-sm sm:col-span-2">
          Detalle de la solicitud
          <textarea name="detail" required rows={5} className={fieldClass} />
        </label>
        <label className="grid gap-2 text-sm sm:col-span-2">
          Pedido del consumidor
          <textarea name="request" required rows={4} className={fieldClass} />
        </label>
      </div>

      {message ? (
        <p className={`rounded-md p-3 text-sm ${status === "error" ? "bg-red-50 text-red-700" : "bg-olive/10 text-olive"}`}>
          {message}
        </p>
      ) : null}

      <button disabled={status === "loading"} className="min-h-12 w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white disabled:bg-ink/40 sm:w-fit">
        {status === "loading" ? "Registrando..." : "Enviar solicitud"}
      </button>
    </form>
  );
}
