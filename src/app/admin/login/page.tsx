"use client";

import { useState } from "react";
import { Logo } from "@/components/site/logo";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password")
      })
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "No se pudo iniciar sesion.");
      setLoading(false);
      return;
    }

    const next = new URLSearchParams(window.location.search).get("next");
    window.location.href = next || "/admin/dashboard";
  }

  return (
    <main className="grid min-h-screen place-items-center bg-linen px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
        <Logo />
        <div className="mt-8">
          <p className="text-sm font-semibold uppercase text-olive">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold">Ingresar a Danatto</h1>
          <p className="mt-2 text-sm text-ink/60">
            Usa el administrador creado por seed. En demo: admin@danatto.com / danatto123.
          </p>
        </div>
        <form onSubmit={submit} className="mt-6 grid gap-4">
          <input name="email" type="email" required placeholder="Correo" className="rounded-md border border-ink/10 px-3 py-3" />
          <input name="password" type="password" required placeholder="Contraseña" className="rounded-md border border-ink/10 px-3 py-3" />
          {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          <button disabled={loading} className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white disabled:bg-ink/40">
            {loading ? "Validando..." : "Iniciar sesion"}
          </button>
        </form>
      </section>
    </main>
  );
}
