import Link from "next/link";
import type { Brand } from "@/lib/types";

export function BrandCarousel({ brands }: { brands: Brand[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {brands.map((brand) => (
        <Link
          key={brand.id}
          href={`/shop?brand=${brand.slug}`}
          className="focus-ring rounded-md border border-ink/10 bg-porcelain px-4 py-6 text-center text-sm font-semibold uppercase tracking-[0.12em] text-ink/70 shadow-sm transition hover:-translate-y-1 hover:border-ink/30 hover:text-ink"
        >
          {brand.name}
        </Link>
      ))}
    </div>
  );
}
