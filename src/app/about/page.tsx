import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "Historia y concepto de Danatto."
};

export default function AboutPage() {
  return (
    <main>
      <section className="container-page grid gap-7 py-8 sm:gap-10 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-24">
        <div>
          <p className="text-sm font-semibold uppercase text-olive">Nosotros</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-6xl">
            Prendas con historia, seleccionadas con criterio
          </h1>
          <p className="mt-5 text-base leading-7 text-ink/70 sm:mt-6 sm:text-lg sm:leading-8">
            En Danatto seleccionamos prendas americanas de segunda mano de marcas reconocidas,
            cuidando cada detalle para ofrecer piezas autenticas, versatiles y en buen estado.
          </p>
          <p className="mt-4 leading-7 text-ink/65">
            Creemos en darle una nueva oportunidad a prendas de calidad, manteniendo un estilo
            limpio, moderno y consciente. Cada ingreso se revisa por estado, medidas, material y
            potencial de uso.
          </p>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-white sm:rounded-lg">
          <Image
            src="https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=1400&q=85"
            alt="Seleccion de prendas Danatto"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>
      <section className="bg-white">
        <div className="container-page grid gap-4 py-8 sm:grid-cols-3 sm:gap-5 sm:py-14">
          {[
            ["Calidad", "Revisamos costuras, botones, cierres, textura y detalles visibles."],
            ["Autenticidad", "Priorizamos marcas reconocidas, durabilidad y estilo atemporal."],
            ["Orden", "Publicamos medidas, estado y observaciones para comprar con seguridad."]
          ].map(([title, body]) => (
            <div key={title} className="rounded-lg border border-ink/10 p-4 sm:p-6">
              <h2 className="text-lg font-semibold sm:text-xl">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-ink/65">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
