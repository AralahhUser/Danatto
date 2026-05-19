"use client";

import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { clsx } from "clsx";
import { useState } from "react";
import type { Brand, Category } from "@/lib/types";
import { conditionLabels } from "@/lib/format";

type FilterValue = string | string[] | undefined;

export function ProductFilters({
  brands,
  categories,
  values
}: {
  brands: Brand[];
  categories: Category[];
  values: Record<string, FilterValue>;
}) {
  const [open, setOpen] = useState(false);
  const value = (key: string) => {
    const raw = values[key];
    return Array.isArray(raw) ? raw[0] : raw ?? "";
  };
  const activeCount =
    ["brand", "category", "size", "condition", "gender", "color", "minPrice", "maxPrice"].filter((key) => value(key)).length +
    (value("sort") && value("sort") !== "recent" ? 1 : 0);
  const fieldClass = "min-h-11 rounded-md border border-ink/10 bg-white px-3 py-2 text-base text-ink outline-none transition focus:border-navy sm:text-sm";

  return (
    <form className="rounded-lg border border-ink/10 bg-porcelain p-4 shadow-sm sm:p-5 lg:sticky lg:top-32" action="/shop">
      <div className="flex items-start justify-between gap-4 lg:block">
        <div>
          <h2 className="text-base font-semibold">Filtrar prendas</h2>
          <p className="mt-1 text-sm text-ink/55">Encuentra piezas por marca, talla y estado.</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="focus-ring inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-ink/10 bg-white px-4 text-sm font-semibold lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {open ? "Ocultar" : "Abrir"}
          {activeCount ? <span className="rounded-full bg-ink px-2 py-0.5 text-xs text-white">{activeCount}</span> : null}
        </button>
      </div>

      <div className={clsx("mt-5 grid gap-4", !open && "hidden lg:grid")}>
        <label className="grid gap-2 text-sm">
          Marca
          <select name="brand" defaultValue={value("brand")} className={fieldClass}>
            <option value="">Todas</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.slug}>
                {brand.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          Categoria
          <select name="category" defaultValue={value("category")} className={fieldClass}>
            <option value="">Todas</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          Talla
          <input name="size" defaultValue={value("size")} placeholder="S, M, L, 32" className={fieldClass} />
        </label>
        <label className="grid gap-2 text-sm">
          Estado
          <select name="condition" defaultValue={value("condition")} className={fieldClass}>
            <option value="">Todos</option>
            {Object.entries(conditionLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          Genero
          <select name="gender" defaultValue={value("gender")} className={fieldClass}>
            <option value="">Todos</option>
            <option value="hombre">Hombre</option>
            <option value="mujer">Mujer</option>
            <option value="unisex">Unisex</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          Color
          <input name="color" defaultValue={value("color")} placeholder="Azul, blanco, oliva" className={fieldClass} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-2 text-sm">
            Min.
            <input name="minPrice" defaultValue={value("minPrice")} type="number" className={fieldClass} />
          </label>
          <label className="grid gap-2 text-sm">
            Max.
            <input name="maxPrice" defaultValue={value("maxPrice")} type="number" className={fieldClass} />
          </label>
        </div>
        <label className="grid gap-2 text-sm">
          Ordenar
          <select name="sort" defaultValue={value("sort")} className={fieldClass}>
            <option value="recent">Mas recientes</option>
            <option value="price-asc">Menor precio</option>
            <option value="price-desc">Mayor precio</option>
            <option value="condition">Mejor estado</option>
          </select>
        </label>
        <button className="focus-ring min-h-12 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy">
          Aplicar filtros
        </button>
        {activeCount ? (
          <Link href="/shop" className="text-center text-sm font-semibold text-ink/55 transition hover:text-ink">
            Limpiar filtros
          </Link>
        ) : null}
      </div>
    </form>
  );
}
