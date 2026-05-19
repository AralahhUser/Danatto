import type { StoreProduct } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";

export function ProductGrid({ products }: { products: StoreProduct[] }) {
  if (!products.length) {
    return (
      <div className="rounded-lg border border-dashed border-ink/15 bg-white p-10 text-center">
        <h3 className="text-lg font-semibold">No encontramos prendas con esos filtros</h3>
        <p className="mt-2 text-sm text-ink/60">Prueba cambiando marca, categoria o rango de precio.</p>
      </div>
    );
  }

  return (
    <div className="grid min-w-0 grid-cols-[repeat(2,minmax(0,calc((100vw-2.5rem)/2)))] gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
