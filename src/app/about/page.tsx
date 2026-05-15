import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "Historia y concepto de Danatto."
};

export default function AboutPage() {
  return (
    <main>
      <section className="container-page section-pad grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase text-olive">Nosotros</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-6xl">
            Prendas con historia, seleccionadas con criterio
          </h1>
          <p className="mt-6 text-lg leading-8 text-ink/70">
            En Danatto seleccionamos prendas americanas de segunda mano de marcas reconocidas,
            cuidando cada detalle para ofrecer piezas autenticas, versatiles y en buen estado.
          </p>
          <p className="mt-4 leading-7 text-ink/65">
            Creemos en darle una nueva oportunidad a prendas de calidad, manteniendo un estilo
            limpio, moderno y consciente. Cada ingreso se revisa por estado, medidas, material y
            potencial de uso.
          </p>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-white">
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
        <div className="container-page grid gap-5 py-14 sm:grid-cols-3">
          {[
            ["Calidad", "Revisamos costuras, botones, cierres, textura y detalles visibles."],
            ["Autenticidad", "Priorizamos marcas reconocidas, durabilidad y estilo atemporal."],
            ["Orden", "Publicamos medidas, estado y observaciones para comprar con seguridad."]
          ].map(([title, body]) => (
            <div key={title} className="rounded-lg border border-ink/10 p-6">
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-ink/65">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
