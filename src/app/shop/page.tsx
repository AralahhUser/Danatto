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
        <div className="container-page py-10 sm:py-20">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-olive sm:text-xs sm:tracking-[0.2em]">Catalogo curado</p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-6xl">Tienda Danatto</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/65 sm:mt-4 sm:text-base">
                Filtra piezas unicas por marca, categoria, talla, color, precio y estado de conservacion.
              </p>
            </div>
            <p className="w-fit rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-semibold text-ink/60 sm:text-sm">
              {products.length} prendas disponibles
            </p>
          </div>
        </div>
      </section>
      <section className="container-page py-8 sm:py-16 lg:py-24">
        <div className="grid gap-6 lg:grid-cols-[300px_1fr] lg:gap-8">
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
