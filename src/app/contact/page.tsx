import type { Metadata } from "next";
import { Instagram, Mail, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Contacto"
};

export default function ContactPage() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "51999999999";
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/danatto";

  return (
    <main className="container-page section-pad">
      <div className="mb-10 max-w-2xl">
        <p className="text-sm font-semibold uppercase text-olive">Contacto</p>
        <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">Hablemos de tu pedido</h1>
        <p className="mt-3 text-ink/65">Escribenos para dudas de medidas, estado de prendas, envios o coordinacion de recojo.</p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="grid gap-4">
          <a href={`https://wa.me/${whatsapp}`} className="rounded-lg border border-ink/10 bg-white p-5">
            <MessageCircle className="h-6 w-6 text-navy" />
            <h2 className="mt-4 font-semibold">WhatsApp</h2>
            <p className="text-sm text-ink/60">Atencion para consultas y confirmacion manual.</p>
          </a>
          <a href={instagram} className="rounded-lg border border-ink/10 bg-white p-5">
            <Instagram className="h-6 w-6 text-navy" />
            <h2 className="mt-4 font-semibold">Instagram</h2>
            <p className="text-sm text-ink/60">Nuevos ingresos, drops y contenido de marca.</p>
          </a>
          <a href="mailto:hola@danatto.com" className="rounded-lg border border-ink/10 bg-white p-5">
            <Mail className="h-6 w-6 text-navy" />
            <h2 className="mt-4 font-semibold">Correo</h2>
            <p className="text-sm text-ink/60">hola@danatto.com</p>
          </a>
        </section>
        <section className="rounded-lg border border-ink/10 bg-white p-5 sm:p-6">
          <h2 className="text-xl font-semibold">Formulario de contacto</h2>
          <form className="mt-5 grid gap-4">
            <input placeholder="Nombre" className="rounded-md border border-ink/10 px-3 py-3" />
            <input placeholder="Correo" type="email" className="rounded-md border border-ink/10 px-3 py-3" />
            <textarea placeholder="Mensaje" rows={6} className="rounded-md border border-ink/10 px-3 py-3" />
            <button className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">Enviar mensaje</button>
          </form>
        </section>
      </div>
      <section className="mt-12 rounded-lg bg-white p-6">
        <h2 className="text-xl font-semibold">Preguntas frecuentes</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {[
            ["¿Las prendas son originales?", "Danatto trabaja con prendas americanas seleccionadas de marcas reconocidas."],
            ["¿Cada prenda es unica?", "Si. La mayoria tiene una sola unidad y se marca como vendida al comprar."],
            ["¿Puedo pedir medidas?", "Si. Cada ficha incluye medidas y tambien puedes pedir confirmacion por WhatsApp."]
          ].map(([title, body]) => (
            <div key={title} className="rounded-lg border border-ink/10 p-4">
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-ink/60">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
