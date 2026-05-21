import type { CheckoutPayload } from "@/lib/types";

export async function createMercadoPagoPreference({
  orderId,
  total,
  payload
}: {
  orderId: string;
  total: number;
  payload: CheckoutPayload;
}) {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (!accessToken) {
    return {
      provider: "mercado_pago",
      mode: "not_configured",
      message: "Mercado Pago esta preparado. Agrega MERCADO_PAGO_ACCESS_TOKEN para crear preferencias reales."
    };
  }

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      external_reference: orderId,
      items: [
        {
          title: `Pedido Danatto ${orderId}`,
          quantity: 1,
          currency_id: "PEN",
          unit_price: total
        }
      ],
      payer: {
        name: payload.customer.name,
        ...(payload.customer.email ? { email: payload.customer.email } : {}),
        phone: { number: payload.customer.phone }
      },
      back_urls: {
        success: `${siteUrl}/checkout?status=success`,
        failure: `${siteUrl}/checkout?status=failure`,
        pending: `${siteUrl}/checkout?status=pending`
      },
      auto_return: "approved"
    })
  });

  if (!response.ok) {
    return {
      provider: "mercado_pago",
      mode: "error",
      message: "No se pudo crear la preferencia de Mercado Pago.",
      status: response.status
    };
  }

  return response.json();
}
