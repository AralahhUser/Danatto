import type { Metadata } from "next";
import { notFound } from "next/navigation";

const policies = {
  shipping: {
    title: "Envios",
    body: [
      "Realizamos envios a domicilio dentro de Peru mediante operadores disponibles segun ciudad y distrito.",
      "El costo de envio se calcula en checkout o se confirma por WhatsApp cuando el pedido requiere coordinacion especial.",
      "Los pedidos se preparan despues de validar el pago y los datos de entrega."
    ]
  },
  returns: {
    title: "Cambios y devoluciones",
    body: [
      "Al tratarse de prendas unicas de segunda mano, los cambios se evaluan caso por caso.",
      "Se aceptan reclamos cuando la prenda no coincide con la descripcion publicada o presenta un detalle no informado.",
      "Las medidas aproximadas ayudan a reducir errores de talla; recomendamos revisarlas antes de comprar."
    ]
  },
  "product-condition": {
    title: "Estado de las prendas",
    body: [
      "Cada prenda se clasifica como nuevo sin etiqueta, excelente, muy bueno, bueno o con detalles.",
      "Las observaciones visibles se muestran en la ficha del producto para que la compra sea clara.",
      "La ropa americana seleccionada puede presentar señales naturales de uso, siempre informadas cuando son relevantes."
    ]
  },
  terms: {
    title: "Terminos y condiciones",
    body: [
      "El uso de la tienda implica aceptar las condiciones de compra, pago, envio y disponibilidad de stock.",
      "Cada producto puede ser pieza unica. Agregar al carrito no reserva definitivamente la prenda hasta confirmar el pedido.",
      "Danatto puede actualizar precios, promociones y disponibilidad cuando sea necesario para mantener el inventario correcto."
    ]
  },
  privacy: {
    title: "Politica de privacidad",
    body: [
      "Los datos del cliente se usan para gestionar pedidos, pagos, envios y atencion postventa.",
      "No se deben almacenar claves privadas ni datos sensibles de tarjetas dentro del sistema.",
      "Las integraciones de pagos se configuran mediante proveedores externos como Mercado Pago o Culqi."
    ]
  }
};

type PolicyKey = keyof typeof policies;
type PageProps = { params: Promise<{ policy: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { policy } = await params;
  const content = policies[policy as PolicyKey];
  return { title: content?.title ?? "Politica" };
}

export default async function PolicyPage({ params }: PageProps) {
  const { policy } = await params;
  const content = policies[policy as PolicyKey];
  if (!content) notFound();

  return (
    <main className="container-page section-pad">
      <div className="mx-auto max-w-3xl rounded-lg border border-ink/10 bg-white p-6 sm:p-10">
        <p className="text-sm font-semibold uppercase text-olive">Politicas Danatto</p>
        <h1 className="mt-3 text-4xl font-semibold">{content.title}</h1>
        <div className="mt-8 grid gap-5 text-ink/70">
          {content.body.map((paragraph) => (
            <p key={paragraph} className="leading-8">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </main>
  );
}
