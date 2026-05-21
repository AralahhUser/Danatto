import type { Metadata } from "next";
import { ProductGrid } from "@/components/product/product-grid";
import { getProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tienda",
  description: "Catalogo de ropa americana seleccionada con prendas unicas listas para comprar."
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const values = await searchParams;
  const products = await getProducts({ sort: asString(values.sort) });

  return (
    <main>
      <section className="border-b border-ink/10 bg-porcelain">
        <div className="container-page py-10 sm:py-20">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-olive sm:text-xs sm:tracking-[0.2em]">Catalogo curado</p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-6xl">Tienda Danatto</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/65 sm:mt-4 sm:text-base">
                Explora prendas seleccionadas, piezas unicas y nuevos ingresos listos para una nueva historia.
              </p>
            </div>
            <p className="w-fit rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-semibold text-ink/60 sm:text-sm">
              {products.length} prendas disponibles
            </p>
          </div>
        </div>
      </section>
      <section className="container-page py-8 sm:py-16 lg:py-24">
        <div className="grid gap-6">
          <ProductGrid products={products} />
        </div>
      </section>
    </main>
  );
}

function asString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
