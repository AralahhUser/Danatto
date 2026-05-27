import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = {
  title: "Checkout"
};

export default function CheckoutPage() {
  return (
    <main className="container-page py-6 sm:py-16 lg:py-24">
      <div className="mb-5 sm:mb-8">
        <p className="text-sm font-semibold uppercase text-olive">Pago seguro</p>
        <h1 className="mt-2 text-[32px] font-semibold leading-tight sm:text-5xl">Finalizar compra</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/65 sm:text-base">
          Completa tus datos, indica departamento, provincia y distrito, y elige la agencia Shalom mas conveniente.
        </p>
      </div>
      <CheckoutForm />
    </main>
  );
}
