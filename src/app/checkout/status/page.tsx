import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Estado del pago"
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const statusCopy = {
  success: {
    icon: CheckCircle2,
    eyebrow: "Pago aprobado",
    title: "Gracias por tu compra",
    body: "Recibimos la confirmacion de Mercado Pago. Prepararemos tu pedido para enviarlo a la agencia Shalom seleccionada.",
    className: "bg-olive/10 text-olive"
  },
  pending: {
    icon: Clock3,
    eyebrow: "Pago pendiente",
    title: "Tu pedido esta en revision",
    body: "Mercado Pago aun esta procesando la operacion. Actualizaremos el pedido cuando llegue la confirmacion.",
    className: "bg-champagne/15 text-ink"
  },
  failure: {
    icon: XCircle,
    eyebrow: "Pago no completado",
    title: "No se pudo confirmar el pago",
    body: "Puedes intentar nuevamente desde la tienda o escribirnos por WhatsApp para ayudarte con el pedido.",
    className: "bg-red-50 text-red-700"
  }
};

export default async function CheckoutStatusPage({ searchParams }: { searchParams: SearchParams }) {
  const values = await searchParams;
  const result = asString(values.result) || asString(values.status) || "pending";
  const copy = result === "success" ? statusCopy.success : result === "failure" ? statusCopy.failure : statusCopy.pending;
  const Icon = copy.icon;
  const order = asString(values.order) || asString(values.external_reference);
  const paymentId = asString(values.payment_id);

  return (
    <main className="container-page py-10 sm:py-20">
      <section className="mx-auto max-w-2xl rounded-lg border border-ink/10 bg-white p-6 text-center shadow-sm sm:p-10">
        <span className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${copy.className}`}>
          <Icon className="h-7 w-7" />
        </span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-olive">{copy.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">{copy.title}</h1>
        <p className="mt-4 text-sm leading-6 text-ink/65 sm:text-base">{copy.body}</p>

        {order || paymentId ? (
          <div className="mt-6 rounded-lg bg-linen/60 p-4 text-left text-sm text-ink/65">
            {order ? (
              <p>
                <span className="font-semibold text-ink">Pedido:</span> {order}
              </p>
            ) : null}
            {paymentId ? (
              <p className="mt-1">
                <span className="font-semibold text-ink">Pago:</span> {paymentId}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link href="/shop" className="inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
            Volver a tienda
          </Link>
          <a
            href="https://wa.me/51912354180"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-ink/10 px-5 py-3 text-sm font-semibold text-ink"
          >
            Consultar por WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}

function asString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
