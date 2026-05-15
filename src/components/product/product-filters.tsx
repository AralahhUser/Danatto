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
  const value = (key: string) => {
    const raw = values[key];
    return Array.isArray(raw) ? raw[0] : raw ?? "";
  };

  return (
    <form className="rounded-md border border-ink/10 bg-porcelain p-5 shadow-sm lg:sticky lg:top-32" action="/shop">
      <div className="mb-5">
        <h2 className="text-base font-semibold">Filtrar prendas</h2>
        <p className="mt-1 text-sm text-ink/55">Encuentra piezas por marca, talla y estado.</p>
      </div>
      <div className="grid gap-4">
        <label className="grid gap-2 text-sm">
          Marca
          <select name="brand" defaultValue={value("brand")} className="rounded-md border border-ink/10 bg-white px-3 py-2">
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
          <select name="category" defaultValue={value("category")} className="rounded-md border border-ink/10 bg-white px-3 py-2">
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
          <input name="size" defaultValue={value("size")} placeholder="S, M, L, 32" className="rounded-md border border-ink/10 bg-white px-3 py-2" />
        </label>
        <label className="grid gap-2 text-sm">
          Estado
          <select name="condition" defaultValue={value("condition")} className="rounded-md border border-ink/10 bg-white px-3 py-2">
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
          <select name="gender" defaultValue={value("gender")} className="rounded-md border border-ink/10 bg-white px-3 py-2">
            <option value="">Todos</option>
            <option value="hombre">Hombre</option>
            <option value="mujer">Mujer</option>
            <option value="unisex">Unisex</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          Color
          <input name="color" defaultValue={value("color")} placeholder="Azul, blanco, oliva" className="rounded-md border border-ink/10 bg-white px-3 py-2" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-2 text-sm">
            Min.
            <input name="minPrice" defaultValue={value("minPrice")} type="number" className="rounded-md border border-ink/10 bg-white px-3 py-2" />
          </label>
          <label className="grid gap-2 text-sm">
            Max.
            <input name="maxPrice" defaultValue={value("maxPrice")} type="number" className="rounded-md border border-ink/10 bg-white px-3 py-2" />
          </label>
        </div>
        <label className="grid gap-2 text-sm">
          Ordenar
          <select name="sort" defaultValue={value("sort")} className="rounded-md border border-ink/10 bg-white px-3 py-2">
            <option value="recent">Mas recientes</option>
            <option value="price-asc">Menor precio</option>
            <option value="price-desc">Mayor precio</option>
            <option value="condition">Mejor estado</option>
          </select>
        </label>
        <button className="focus-ring rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy">
          Aplicar filtros
        </button>
      </div>
    </form>
  );
}
