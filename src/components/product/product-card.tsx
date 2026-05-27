import Image from "next/image";
import Link from "next/link";
import { formatCurrency, productPrice } from "@/lib/format";
import type { StoreProduct } from "@/lib/types";
import { ConditionBadge } from "@/components/product/condition-badge";

export function ProductCard({ product }: { product: StoreProduct }) {
  const price = productPrice(product.price, product.salePrice);

  return (
    <article className="mobile-card group min-w-0 overflow-hidden rounded-lg border border-ink/10 bg-porcelain shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lift sm:rounded-md md:bg-porcelain">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-950 md:bg-white">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute left-2 top-2 flex flex-col items-start gap-1 sm:left-3 sm:top-3 sm:flex-row sm:flex-wrap sm:gap-2">
            {product.isNewArrival ? (
              <span className="mobile-chip-light rounded-full bg-white/92 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.04em] text-ink shadow-sm sm:px-3 sm:text-[11px] sm:tracking-[0.08em] md:bg-white/92 md:text-ink">
                Nuevo ingreso
              </span>
            ) : null}
            {product.isUniquePiece ? (
              <span className="mobile-chip-dark rounded-full bg-ink px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.04em] text-white sm:px-3 sm:text-[11px] sm:tracking-[0.08em] md:bg-ink md:text-white">
                Unica pieza
              </span>
            ) : null}
          </div>
        </div>
      </Link>
      <div className="p-2.5 sm:p-5">
        <div className="mb-2 grid gap-2 sm:mb-3 sm:flex sm:items-start sm:justify-between sm:gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.12em] text-ink/40 sm:text-[11px] sm:tracking-[0.16em]">{product.brand.name}</p>
            <Link href={`/product/${product.slug}`} className="mt-1.5 block min-h-[2.2rem] text-[13px] font-semibold leading-snug text-ink sm:mt-2 sm:min-h-0 sm:text-base">
              {product.name}
            </Link>
          </div>
          <div className="sm:text-right">
            <p className="text-[13px] font-semibold text-ink sm:text-base">{formatCurrency(price)}</p>
            {product.salePrice ? (
              <p className="text-xs text-ink/40 line-through">{formatCurrency(product.price)}</p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-ink/55 sm:gap-2 sm:text-xs">
          <span className="mobile-chip-dark rounded-full border border-ink/10 bg-white px-2.5 py-1 sm:px-3 md:bg-white">Talla {product.size}</span>
          <ConditionBadge condition={product.condition} />
        </div>
      </div>
    </article>
  );
}
