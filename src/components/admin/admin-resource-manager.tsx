"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Field = { name: string; label: string; type?: string; required?: boolean };
type Resource = { id: string } & Record<string, unknown>;

export function AdminResourceManager({
  title,
  endpoint,
  fields,
  items
}: {
  title: string;
  endpoint: string;
  fields: Field[];
  items: Resource[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Resource | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(fields.map((field) => [field.name, readValue(form, field)]));
    const response = await fetch(editing ? `${endpoint}/${editing.id}` : endpoint, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "No se pudo guardar.");
      return;
    }
    event.currentTarget.reset();
    setEditing(null);
    setError("");
    router.refresh();
  }

  async function remove(id: string) {
    if (!window.confirm("Eliminar registro?")) return;
    await fetch(`${endpoint}/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <form key={editing ? String(editing.id) : "new"} onSubmit={submit} className="h-fit rounded-lg border border-ink/10 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{editing ? `Editar ${title.toLowerCase()}` : `Crear ${title.toLowerCase()}`}</h2>
          {editing ? (
            <button type="button" onClick={() => setEditing(null)} className="text-xs font-semibold text-ink/50">
              Cancelar
            </button>
          ) : null}
        </div>
        {error ? <p className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        <div className="mt-5 grid gap-4">
          {fields.map((field) => (
            <label key={field.name} className="grid gap-2 text-sm">
              {field.label}
              {field.type === "checkbox" ? (
                <input name={field.name} type="checkbox" className="h-5 w-5" defaultChecked={editing ? Boolean(editing[field.name]) : true} />
              ) : (
                <input
                  name={field.name}
                  required={field.required}
                  type={field.type ?? "text"}
                  defaultValue={editing ? formatValue(editing[field.name]) : ""}
                  className="rounded-md border border-ink/10 px-3 py-3"
                />
              )}
            </label>
          ))}
          <button className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
            {editing ? "Guardar cambios" : "Guardar"}
          </button>
        </div>
      </form>
      <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-linen text-xs uppercase text-ink/50">
              <tr>
                {fields.slice(0, 4).map((field) => (
                  <th key={field.name} className="px-4 py-3">{field.label}</th>
                ))}
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {items.map((item) => (
                <tr key={String(item.id)}>
                  {fields.slice(0, 4).map((field) => (
                    <td key={field.name} className="px-4 py-3">{String(item[field.name] ?? "")}</td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => setEditing(item)} className="font-semibold text-navy">
                        Editar
                      </button>
                      <button onClick={() => remove(String(item.id))} className="font-semibold text-red-600">
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!items.length ? (
                <tr>
                  <td colSpan={fields.slice(0, 4).length + 1} className="px-4 py-8 text-center text-ink/50">
                    Sin registros todavia.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function readValue(form: FormData, field: Field) {
  if (field.type === "checkbox") return form.get(field.name) === "on";
  if (field.type === "number") return Number(form.get(field.name));
  return String(form.get(field.name) || "");
}

function formatValue(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "boolean") return value ? "true" : "false";
  return value == null ? "" : String(value);
}
