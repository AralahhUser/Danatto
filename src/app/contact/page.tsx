import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Instagram, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Contacto"
};

export default function ContactPage() {
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/danatto.store/";
  const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "51912354180").replace(/\D/g, "");
  const whatsapp = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hola Danatto, quiero hacer una consulta."
  )}`;

  return (
    <main className="container-page py-8 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase text-olive">Contacto</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-5xl">Consultas por WhatsApp</h1>
        <p className="mt-3 text-sm leading-6 text-ink/65 sm:text-base">
          Para medidas, disponibilidad y coordinaciones de compra, escribenos directo por WhatsApp.
          Tambien puedes seguir los nuevos ingresos en Instagram.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <a
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-[220px] flex-col justify-between rounded-lg border border-ink/10 bg-ink p-5 text-white transition hover:-translate-y-1 hover:shadow-lift sm:p-8"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-ink">
              <MessageCircle className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-2xl font-semibold">+51 912 354 180</span>
              <span className="mt-2 block text-sm leading-6 text-white/60">
                Consultas por prendas, medidas, stock y coordinacion de pedido.
              </span>
            </span>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
              Abrir WhatsApp <ArrowUpRight className="h-4 w-4" />
            </span>
          </a>

          <a
            href={instagram}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-[220px] flex-col justify-between rounded-lg border border-ink/10 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lift sm:p-8"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-ink text-white">
              <Instagram className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-2xl font-semibold">@danatto.store</span>
              <span className="mt-2 block text-sm leading-6 text-ink/60">
                Nuevos ingresos, drops y novedades de marca.
              </span>
            </span>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-navy">
              Abrir Instagram <ArrowUpRight className="h-4 w-4" />
            </span>
          </a>
        </div>
        <div className="mt-8 rounded-lg border border-ink/10 bg-white p-5">
          <p className="text-sm font-semibold">Libro de reclamaciones</p>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            Para reclamos o quejas formales, registra tu solicitud en el formulario digital.
          </p>
          <Link href="/complaints" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white">
            Abrir libro
          </Link>
        </div>
      </div>
    </main>
  );
}
