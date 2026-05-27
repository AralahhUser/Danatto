import type { Metadata } from "next";
import { ComplaintForm } from "@/components/contact/complaint-form";

export const metadata: Metadata = {
  title: "Libro de reclamaciones",
  description: "Registra un reclamo o queja sobre tu compra en Danatto."
};

export default function ComplaintsPage() {
  return (
    <main className="container-page py-8 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase text-olive">Atencion al cliente</p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">Libro de reclamaciones</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-ink/65 sm:text-base">
          Registra aqui un reclamo o queja vinculado a tu compra. Revisaremos la solicitud y nos comunicaremos por los datos indicados.
        </p>
        <div className="mt-8">
          <ComplaintForm />
        </div>
      </div>
    </main>
  );
}
