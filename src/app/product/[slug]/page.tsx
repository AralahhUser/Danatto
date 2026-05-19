import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, Ruler, ShieldCheck } from "lucide-react";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { ConditionBadge } from "@/components/product/condition-badge";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductGrid } from "@/components/product/product-grid";
import { formatCurrency, productPrice } from "@/lib/format";
import { getProductBySlug, getProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.name,
    description: `${product.brand.name}, talla ${product.size}, estado ${product.condition}. Cada prenda es unica.`
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const related = (await getProducts({ category: product.category.slug })).filter((item) => item.id !== product.id).slice(0, 4);
  const price = productPrice(product.price, product.salePrice);
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "51999999999";

  return (
    <main className="container-page py-8 sm:py-16 lg:py-24">
      <div className="grid gap-7 sm:gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <ProductGallery images={product.images} name={product.name} />
        <section>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <ConditionBadge condition={product.condition} />
            {product.isUniquePiece ? (
              <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">Unica pieza</span>
            ) : null}
            {product.isNewArrival ? (
              <span className="rounded-full bg-champagne/20 px-3 py-1 text-xs font-semibold text-navy">Nuevo ingreso</span>
            ) : null}
          </div>
          <p className="text-sm font-semibold uppercase text-ink/45">{product.brand.name}</p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-5xl">{product.name}</h1>
          <div className="mt-4 flex items-baseline gap-3 sm:mt-5">
            <p className="text-2xl font-semibold text-navy sm:text-3xl">{formatCurrency(price)}</p>
            {product.salePrice ? <p className="text-lg text-ink/35 line-through">{formatCurrency(product.price)}</p> : null}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-2 sm:mt-8 sm:gap-3">
            {[
              ["Marca", product.brand.name],
              ["Talla", product.size],
              ["Color", product.color],
              ["Genero", product.gender],
              ["Categoria", product.category.name],
              ["Stock", product.stock === 1 ? "1 unidad" : `${product.stock} unidades`]
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-ink/10 bg-white p-3 sm:p-4">
                <p className="text-[10px] uppercase tracking-[0.08em] text-ink/40 sm:text-xs sm:tracking-normal">{label}</p>
                <p className="mt-1 text-sm font-semibold capitalize sm:text-base">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-lg border border-olive/20 bg-olive/10 p-4 text-sm text-olive">
            Cada prenda es unica. Solo hay una unidad disponible, salvo que el administrador indique stock adicional.
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <AddToCartButton product={product} />
            <a
              href={`https://wa.me/${whatsapp}?text=Hola%20Danatto,%20quiero%20consultar%20por%20${encodeURIComponent(product.name)}`}
              className="focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-ink px-6 py-3.5 text-sm font-semibold sm:py-4"
            >
              <MessageCircle className="h-5 w-5" />
              Consultar por WhatsApp
            </a>
          </div>
          <div className="mt-8 divide-y divide-ink/10 rounded-lg border border-ink/10 bg-white">
            <InfoBlock icon={<Ruler className="h-5 w-5" />} title="Medidas aproximadas">
              <dl className="grid gap-2 text-sm text-ink/65 sm:grid-cols-2">
                {Object.entries(product.measurements).map(([key, value]) =>
                  value ? (
                    <div key={key} className="flex justify-between gap-4 rounded-md bg-mist px-3 py-2">
                      <dt className="capitalize">{key}</dt>
                      <dd className="font-semibold text-ink">{value}</dd>
                    </div>
                  ) : null
                )}
              </dl>
            </InfoBlock>
            <InfoBlock icon={<ShieldCheck className="h-5 w-5" />} title="Descripcion y observaciones">
              <p className="text-sm leading-7 text-ink/70">{product.description}</p>
              <p className="mt-4 text-sm font-semibold text-ink">{product.observations || "Sin detalles visibles."}</p>
            </InfoBlock>
            <InfoBlock title="Recomendaciones de cuidado">
              <p className="text-sm leading-7 text-ink/70">
                Lavar con colores similares, evitar secadora en prendas delicadas y revisar siempre la etiqueta interna.
              </p>
            </InfoBlock>
          </div>
        </section>
      </div>

      <section className="py-10 sm:py-16 lg:py-24">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <p className="text-sm font-semibold uppercase text-olive">Completa tu estilo</p>
            <h2 className="mt-2 text-3xl font-semibold">Tambien podria gustarte</h2>
          </div>
          <Link href="/shop" className="text-sm font-semibold text-navy">
            Ver tienda
          </Link>
        </div>
        <ProductGrid products={related} />
      </section>
    </main>
  );
}

function InfoBlock({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="p-4 sm:p-5">
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold sm:text-lg">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
}
