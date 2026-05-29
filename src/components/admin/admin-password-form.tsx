"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";

export function AdminPasswordForm({ email }: { email: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/security/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: form.get("currentPassword"),
        newPassword: form.get("newPassword"),
        confirmPassword: form.get("confirmPassword")
      })
    });
    const data = await response.json();

    if (!response.ok) {
      setStatus("error");
      setMessage(data.error || "No se pudo cambiar la contrasena.");
      return;
    }

    event.currentTarget.reset();
    setStatus("success");
    setMessage("Contrasena actualizada correctamente.");
  }

  const fieldType = showPasswords ? "text" : "password";
  const inputClass = "min-h-12 rounded-md border border-ink/10 px-3 py-3 outline-none transition focus:border-navy";

  return (
    <section className="max-w-2xl rounded-lg border border-ink/10 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-linen text-navy">
          <KeyRound className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold">Cambiar contrasena</h2>
          <p className="mt-1 text-sm leading-6 text-ink/60">
            Esta accion cambia el acceso del usuario <span className="font-semibold text-ink">{email}</span>.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm font-medium text-ink/70">
          Contrasena actual
          <input name="currentPassword" type={fieldType} required autoComplete="current-password" className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink/70">
          Nueva contrasena
          <input name="newPassword" type={fieldType} required minLength={10} autoComplete="new-password" className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink/70">
          Confirmar nueva contrasena
          <input name="confirmPassword" type={fieldType} required minLength={10} autoComplete="new-password" className={inputClass} />
        </label>

        <button
          type="button"
          onClick={() => setShowPasswords((value) => !value)}
          className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink/65 transition hover:border-ink/30 hover:text-ink"
        >
          {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showPasswords ? "Ocultar contrasenas" : "Mostrar contrasenas"}
        </button>

        <div className="rounded-lg bg-linen p-4 text-sm leading-6 text-ink/65">
          <div className="mb-2 flex items-center gap-2 font-semibold text-ink">
            <ShieldCheck className="h-4 w-4" />
            Requisitos
          </div>
          Usa al menos 10 caracteres con mayuscula, minuscula, numero y simbolo.
        </div>

        {message ? (
          <p className={`rounded-md p-3 text-sm ${status === "error" ? "bg-red-50 text-red-700" : "bg-olive/10 text-olive"}`}>
            {message}
          </p>
        ) : null}

        <button disabled={status === "loading"} className="min-h-12 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white disabled:bg-ink/40 sm:w-fit">
          {status === "loading" ? "Actualizando..." : "Actualizar contrasena"}
        </button>
      </form>
    </section>
  );
}
