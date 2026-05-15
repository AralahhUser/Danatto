import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = {
  title: "Checkout"
};

export default function CheckoutPage() {
  return (
    <main className="container-page section-pad">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase text-olive">Pago seguro</p>
        <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">Finalizar compra</h1>
        <p className="mt-3 max-w-2xl text-ink/65">
          Completa tus datos para registrar el pedido. Mercado Pago, Culqi y Yape/Plin quedan preparados por variables de entorno.
        </p>
      </div>
      <CheckoutForm />
    </main>
  );
}
