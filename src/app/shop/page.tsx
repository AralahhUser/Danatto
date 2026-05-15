import type { Metadata } from "next";
import { ProductFilters } from "@/components/product/product-filters";
import { ProductGrid } from "@/components/product/product-grid";
import { getBrands, getCategories, getProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tienda",
  description: "Catalogo de ropa americana seleccionada por marca, talla, estado y precio."
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const values = await searchParams;
  const [products, brands, categories] = await Promise.all([
    getProducts({
      brand: asString(values.brand),
      category: asString(values.category),
      size: asString(values.size),
      condition: asString(values.condition),
      color: asString(values.color),
      gender: asString(values.gender),
      minPrice: asString(values.minPrice),
      maxPrice: asString(values.maxPrice),
      sort: asString(values.sort)
    }),
    getBrands(),
    getCategories()
  ]);

  return (
    <main>
      <section className="border-b border-ink/10 bg-porcelain">
        <div className="container-page py-14 sm:py-20">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-olive">Catalogo curado</p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-6xl">Tienda Danatto</h1>
              <p className="mt-4 max-w-2xl text-ink/65">
                Filtra piezas unicas por marca, categoria, talla, color, precio y estado de conservacion.
              </p>
            </div>
            <p className="w-fit rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink/60">
              {products.length} prendas disponibles
            </p>
          </div>
        </div>
      </section>
      <section className="container-page section-pad">
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <ProductFilters brands={brands} categories={categories} values={values} />
          <ProductGrid products={products} />
        </div>
      </section>
    </main>
  );
}

function asString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
