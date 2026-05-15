import Image from "next/image";
import Link from "next/link";
import { formatCurrency, productPrice } from "@/lib/format";
import type { StoreProduct } from "@/lib/types";
import { ConditionBadge } from "@/components/product/condition-badge";

export function ProductCard({ product }: { product: StoreProduct }) {
  const price = productPrice(product.price, product.salePrice);

  return (
    <article className="group overflow-hidden rounded-md border border-ink/10 bg-porcelain shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-white">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {product.isNewArrival ? (
              <span className="rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink shadow-sm">
                Nuevo ingreso
              </span>
            ) : null}
            {product.isUniquePiece ? (
              <span className="rounded-full bg-ink px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white">
                Unica pieza
              </span>
            ) : null}
          </div>
        </div>
      </Link>
      <div className="p-4 sm:p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-ink/40">{product.brand.name}</p>
            <Link href={`/product/${product.slug}`} className="mt-2 block font-semibold leading-snug text-ink">
              {product.name}
            </Link>
          </div>
          <div className="text-right">
            <p className="font-semibold text-ink">{formatCurrency(price)}</p>
            {product.salePrice ? (
              <p className="text-xs text-ink/40 line-through">{formatCurrency(product.price)}</p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-ink/55">
          <span className="rounded-full border border-ink/10 bg-white px-3 py-1">Talla {product.size}</span>
          <ConditionBadge condition={product.condition} />
        </div>
      </div>
    </article>
  );
}
