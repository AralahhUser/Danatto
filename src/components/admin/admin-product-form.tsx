"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Brand, Category, StoreProduct } from "@/lib/types";
import { slugify } from "@/lib/format";

export function AdminProductForm({
  product,
  brands,
  categories
}: {
  product?: StoreProduct | null;
  brands: Brand[];
  categories: Category[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState<string[]>([]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setErrorDetails([]);
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const rawSlug = String(form.get("slug") || "").trim();
    if (rawSlug && rawSlug.length < 3) {
      setError("Revisa los datos del producto.");
      setErrorDetails(["Slug: usa minimo 3 caracteres o dejalo vacio para generarlo automaticamente."]);
      setSaving(false);
      return;
    }

    const typedImages = String(form.get("images") || "")
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
    const hasSelectedFiles = form.getAll("imageFiles").some((entry) => entry instanceof File && entry.size > 0);
    if (!typedImages.length && !hasSelectedFiles) {
      setError("Revisa los datos del producto.");
      setErrorDetails(["Imagenes: sube al menos una imagen o pega una URL valida."]);
      setSaving(false);
      return;
    }

    const uploadedImages = await uploadImages(form);
    if (!uploadedImages.ok) {
      setError(uploadedImages.error);
      setSaving(false);
      return;
    }

    const payload = {
      name,
      slug: rawSlug || slugify(name),
      description: String(form.get("description") || ""),
      price: Number(form.get("price")),
      salePrice: form.get("salePrice") ? Number(form.get("salePrice")) : null,
      brandId: String(form.get("brandId") || ""),
      categoryId: String(form.get("categoryId") || ""),
      images: [...typedImages, ...uploadedImages.urls],
      size: String(form.get("size") || ""),
      color: String(form.get("color") || ""),
      gender: String(form.get("gender") || "unisex"),
      condition: String(form.get("condition") || "muy_bueno"),
      measurements: {
        largo: String(form.get("largo") || ""),
        pecho: String(form.get("pecho") || ""),
        hombros: String(form.get("hombros") || ""),
        manga: String(form.get("manga") || ""),
        cintura: String(form.get("cintura") || "")
      },
      observations: String(form.get("observations") || ""),
      stock: Number(form.get("stock") || 1),
      status: String(form.get("status") || "disponible"),
      isFeatured: form.get("isFeatured") === "on",
      isNewArrival: form.get("isNewArrival") === "on",
      isUniquePiece: form.get("isUniquePiece") === "on"
    };

    const response = await fetch(product ? `/api/admin/products/${product.id}` : "/api/admin/products", {
      method: product ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "No se pudo guardar el producto.");
      setErrorDetails(formatProductIssues(data.issues));
      setSaving(false);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-6 rounded-lg border border-ink/10 bg-white p-5">
      {error ? (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          <p className="font-semibold">{error}</p>
          {errorDetails.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {errorDetails.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Nombre" name="name" defaultValue={product?.name} required />
        <Field label="Slug" name="slug" defaultValue={product?.slug} hint="Opcional. Si lo dejas vacio se genera automaticamente." />
        <Field label="Precio" name="price" type="number" defaultValue={product?.price} required />
        <Field label="Precio oferta" name="salePrice" type="number" defaultValue={product?.salePrice ?? ""} />
        <label className="grid gap-2 text-sm">
          Marca
          <select name="brandId" defaultValue={product?.brandId} className="rounded-md border border-ink/10 px-3 py-3">
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          Categoria
          <select name="categoryId" defaultValue={product?.categoryId} className="rounded-md border border-ink/10 px-3 py-3">
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <Field label="Talla" name="size" defaultValue={product?.size} required />
        <Field label="Color" name="color" defaultValue={product?.color} required />
        <label className="grid gap-2 text-sm">
          Genero
          <select name="gender" defaultValue={product?.gender ?? "unisex"} className="rounded-md border border-ink/10 px-3 py-3">
            <option value="hombre">Hombre</option>
            <option value="mujer">Mujer</option>
            <option value="unisex">Unisex</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          Estado de prenda
          <select name="condition" defaultValue={product?.condition ?? "muy_bueno"} className="rounded-md border border-ink/10 px-3 py-3">
            <option value="nuevo_sin_etiqueta">Nuevo sin etiqueta</option>
            <option value="excelente">Excelente</option>
            <option value="muy_bueno">Muy bueno</option>
            <option value="bueno">Bueno</option>
            <option value="con_detalles">Con detalles</option>
          </select>
        </label>
        <Field label="Stock" name="stock" type="number" defaultValue={product?.stock ?? 1} required />
        <label className="grid gap-2 text-sm">
          Publicacion
          <select name="status" defaultValue={product?.status ?? "disponible"} className="rounded-md border border-ink/10 px-3 py-3">
            <option value="disponible">Disponible</option>
            <option value="vendido">Vendido</option>
            <option value="reservado">Reservado</option>
            <option value="oculto">Oculto</option>
          </select>
        </label>
      </div>
      <label className="grid gap-2 text-sm">
        Imagenes URL, separadas por coma o linea
        <textarea name="images" rows={4} defaultValue={product?.images.join("\n")} className="rounded-md border border-ink/10 px-3 py-3" />
      </label>
      <label className="grid gap-2 text-sm">
        Subir imagenes
        <input name="imageFiles" type="file" multiple accept="image/*" className="rounded-md border border-ink/10 px-3 py-3" />
        <span className="text-xs text-ink/50">Puedes subir archivos desde tu equipo o pegar URLs arriba. Maximo 4.5 MB por imagen.</span>
      </label>
      <label className="grid gap-2 text-sm">
        Descripcion
        <textarea name="description" required rows={5} defaultValue={product?.description} className="rounded-md border border-ink/10 px-3 py-3" />
      </label>
      <div className="grid gap-4 lg:grid-cols-5">
        <Field label="Largo" name="largo" defaultValue={product?.measurements.largo} />
        <Field label="Pecho" name="pecho" defaultValue={product?.measurements.pecho} />
        <Field label="Hombros" name="hombros" defaultValue={product?.measurements.hombros} />
        <Field label="Manga" name="manga" defaultValue={product?.measurements.manga} />
        <Field label="Cintura" name="cintura" defaultValue={product?.measurements.cintura} />
      </div>
      <label className="grid gap-2 text-sm">
        Observaciones
        <textarea name="observations" rows={3} defaultValue={product?.observations ?? ""} className="rounded-md border border-ink/10 px-3 py-3" />
      </label>
      <div className="flex flex-wrap gap-4 text-sm">
        <label><input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured} className="mr-2" /> Destacado</label>
        <label><input type="checkbox" name="isNewArrival" defaultChecked={product?.isNewArrival} className="mr-2" /> Nuevo ingreso</label>
        <label><input type="checkbox" name="isUniquePiece" defaultChecked={product?.isUniquePiece ?? true} className="mr-2" /> Unica pieza</label>
      </div>
      <button disabled={saving} className="w-fit rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white disabled:bg-ink/40">
        {saving ? "Guardando..." : "Guardar producto"}
      </button>
    </form>
  );
}

async function uploadImages(form: FormData): Promise<{ ok: true; urls: string[] } | { ok: false; error: string }> {
  const files = form.getAll("imageFiles").filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (!files.length) return { ok: true, urls: [] };

  const uploadForm = new FormData();
  for (const file of files) uploadForm.append("files", file);

  const response = await fetch("/api/admin/uploads", {
    method: "POST",
    body: uploadForm
  });

  const data = await response.json();
  if (!response.ok) {
    return { ok: false, error: data.error || "No se pudieron subir las imagenes." };
  }

  return { ok: true, urls: data.urls || [] };
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  hint
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number | null;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="grid gap-2 text-sm">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        className="rounded-md border border-ink/10 px-3 py-3"
      />
      {hint ? <span className="text-xs text-ink/50">{hint}</span> : null}
    </label>
  );
}

const productFieldLabels: Record<string, string> = {
  name: "Nombre",
  slug: "Slug",
  description: "Descripcion",
  price: "Precio",
  salePrice: "Precio oferta",
  brandId: "Marca",
  categoryId: "Categoria",
  images: "Imagenes",
  size: "Talla",
  color: "Color",
  gender: "Genero",
  condition: "Estado de prenda",
  stock: "Stock",
  status: "Publicacion"
};

function formatProductIssues(issues: unknown) {
  if (!issues || typeof issues !== "object") return [];
  const details: string[] = [];
  const flattened = issues as { fieldErrors?: Record<string, string[]>; formErrors?: string[] };

  for (const message of flattened.formErrors || []) {
    details.push(message);
  }

  for (const [field, messages] of Object.entries(flattened.fieldErrors || {})) {
    for (const message of messages || []) {
      details.push(`${productFieldLabels[field] || field}: ${translateIssue(message)}`);
    }
  }

  return details;
}

function translateIssue(message: string) {
  if (message.includes("String must contain at least 3")) return "debe tener al menos 3 caracteres.";
  if (message.includes("String must contain at least 10")) return "debe tener al menos 10 caracteres.";
  if (message.includes("Array must contain at least 1")) return "agrega al menos una imagen.";
  if (message.includes("Invalid url")) return "usa una URL valida o sube una imagen desde tu equipo.";
  if (message.includes("Number must be greater than 0")) return "debe ser mayor que 0.";
  return message;
}
