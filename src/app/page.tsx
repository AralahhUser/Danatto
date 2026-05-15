import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, CreditCard, MessageCircle, PackageCheck, Sparkles } from "lucide-react";
import { BrandCarousel } from "@/components/brand/brand-carousel";
import { ProductGrid } from "@/components/product/product-grid";
import { getBrands, getProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, newArrivals, brands] = await Promise.all([
    getProducts({ featured: true }),
    getProducts({ newArrival: true }),
    getBrands()
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
          className="object-cover"
        />
        <div className="absolute inset-0 bg-porcelain/80 lg:hidden" />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-porcelain via-porcelain/90 to-porcelain/20 lg:block" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-porcelain to-transparent" />
        <div className="container-page relative flex min-h-[660px] items-center py-20">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/55">
              <Sparkles className="h-4 w-4 text-champagne" />
              Danatto curated essentials
            </p>
            <h1 className="mt-7 max-w-2xl text-[44px] font-semibold leading-[0.95] text-ink sm:text-7xl">
              Ropa americana seleccionada
            </h1>
            <p className="mt-7 max-w-[22rem] text-base leading-7 text-ink/68 sm:max-w-xl sm:text-lg sm:leading-8">
              Prendas unicas de marcas reconocidas, listas para una nueva historia.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/shop" className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-ink px-7 py-4 text-sm font-semibold text-white transition hover:bg-navy">
                Comprar ahora <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/shop?sort=recent" className="focus-ring rounded-full border border-ink/20 bg-white/45 px-7 py-4 text-center text-sm font-semibold text-ink transition hover:bg-white">
                Ver novedades
              </Link>
            </div>
            <div className="mt-12 grid max-w-xl grid-cols-3 gap-3 border-y border-ink/10 py-5 text-sm text-ink/62">
              <div>
                <p className="text-lg font-semibold text-ink">1/1</p>
                <p>Piezas unicas</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-ink">+9</p>
                <p>Marcas clave</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-ink">PE</p>
                <p>Envios Peru</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-porcelain py-5">
        <div className="container-page grid gap-4 text-sm text-ink/68 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: PackageCheck, label: "Prendas revisadas" },
            { icon: CreditCard, label: "Compra segura" },
            { icon: CheckCircle2, label: "Envíos disponibles" },
            { icon: MessageCircle, label: "Atención por WhatsApp" }
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-ink/10 bg-white text-navy">
                <item.icon className="h-5 w-5" />
              </span>
              <span className="font-semibold">{item.label}</span>
            </div>
          ))}
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

      <section className="container-page section-pad">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-olive">Marcas disponibles</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">Calidad de marca, nueva oportunidad</h2>
        </div>
        <BrandCarousel brands={brands} />
      </section>
    </main>
  );
}
