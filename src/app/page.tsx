import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { ProductGrid } from "@/components/product/product-grid";
import { getProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, newArrivals] = await Promise.all([
    getProducts({ featured: true }),
    getProducts({ newArrival: true })
  ]);

  return (
    <main>
      <section className="relative isolate overflow-hidden bg-porcelain text-ink">
        <Image
          src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1900&q=88"
          alt="Prendas seleccionadas en percheros claros"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[58%_center] sm:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/92 via-black/84 to-black lg:hidden md:from-white/95 md:via-white/88 md:to-white/95" />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-porcelain via-porcelain/90 to-porcelain/20 lg:block" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black to-transparent md:from-porcelain sm:h-40" />
        <div className="container-page relative flex min-h-[372px] items-center py-7 sm:min-h-[560px] sm:py-16 lg:min-h-[660px] lg:py-20">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/62 sm:px-4 sm:text-xs sm:tracking-[0.2em] md:border-ink/10 md:bg-white/75 md:text-ink/55">
              <Sparkles className="h-3.5 w-3.5 text-champagne sm:h-4 sm:w-4" />
              Danatto curated essentials
            </p>
            <h1 className="mt-5 max-w-2xl text-[34px] font-semibold leading-[1] text-white min-[380px]:text-[40px] sm:mt-7 sm:text-7xl sm:leading-[0.95] sm:text-ink">
              Ropa americana seleccionada
            </h1>
            <p className="mt-4 max-w-[22rem] text-[15px] leading-7 text-white/76 sm:mt-7 sm:max-w-xl sm:text-lg sm:leading-8 sm:text-ink/68">
              Prendas unicas de marcas reconocidas, listas para una nueva historia.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:mt-10 sm:flex-row">
              <Link href="/shop" className="focus-ring mobile-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-navy sm:py-4 md:bg-ink md:text-white">
                Comprar ahora <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/shop?sort=recent" className="focus-ring mobile-outline min-h-12 rounded-full border border-white/18 bg-white/5 px-7 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-white/10 sm:py-4 md:border-ink/20 md:bg-white/55 md:text-ink md:hover:bg-white">
                Ver novedades
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page section-pad">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-olive">Seleccion premium</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">Productos destacados</h2>
          </div>
          <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-navy">
            Ver todo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ProductGrid products={featured.slice(0, 4)} />
      </section>

      <section className="bg-porcelain">
        <div className="container-page section-pad">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-olive">Llegaron hoy</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">Nuevos ingresos</h2>
          </div>
          <ProductGrid products={newArrivals.slice(0, 4)} />
        </div>
      </section>
    </main>
  );
}
