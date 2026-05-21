import type { Metadata } from "next";
import { ArrowUpRight, Instagram } from "lucide-react";

export const metadata: Metadata = {
  title: "Contacto"
};

export default function ContactPage() {
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/danatto.store/";

  return (
    <main className="container-page py-8 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase text-olive">Contacto</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-5xl">Siguenos en Instagram</h1>
        <p className="mt-3 text-sm leading-6 text-ink/65 sm:text-base">
          Todas las consultas, nuevos ingresos y coordinaciones de Danatto se atienden desde nuestro Instagram oficial.
        </p>

        <a
          href={instagram}
          target="_blank"
          rel="noreferrer"
          className="mt-8 flex min-h-[220px] flex-col justify-between rounded-lg border border-ink/10 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lift sm:p-8"
        >
          <span className="grid h-12 w-12 place-items-center rounded-full bg-ink text-white">
            <Instagram className="h-6 w-6" />
          </span>
          <span>
            <span className="block text-2xl font-semibold">@danatto.store</span>
            <span className="mt-2 block text-sm leading-6 text-ink/60">
              Ropa americana seleccionada, drops, consultas por medidas y novedades de marca.
            </span>
          </span>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-navy">
            Abrir Instagram <ArrowUpRight className="h-4 w-4" />
          </span>
        </a>
      </div>
    </main>
  );
}
