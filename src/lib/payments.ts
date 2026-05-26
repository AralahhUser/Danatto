import type { CheckoutPayload } from "@/lib/types";

type MercadoPagoPreferenceResponse = {
  id?: string;
  init_point?: string;
  sandbox_init_point?: string;
  message?: string;
  error?: string;
};

export type MercadoPagoPayment = {
  id: number | string;
  status?: string;
  status_detail?: string;
  external_reference?: string | null;
  metadata?: {
    order_id?: string;
    orderId?: string;
  } | null;
};

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
  const siteUrl = getSiteUrl();
  const environment = process.env.MERCADO_PAGO_ENVIRONMENT === "production" ? "production" : "sandbox";

  if (!accessToken) {
    return {
      provider: "mercado_pago",
      mode: "not_configured",
      message: "Mercado Pago esta preparado. Agrega MERCADO_PAGO_ACCESS_TOKEN para crear preferencias reales."
    };
  }

  const notificationUrl =
    process.env.MERCADO_PAGO_NOTIFICATION_URL || `${siteUrl}/api/payments/mercado-pago/webhook`;

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
          unit_price: Number(total.toFixed(2))
        }
      ],
      payer: {
        name: payload.customer.name,
        ...(payload.customer.email ? { email: payload.customer.email } : {}),
        phone: { number: payload.customer.phone },
        identification: {
          type: "DNI",
          number: payload.customer.dni
        }
      },
      back_urls: {
        success: `${siteUrl}/checkout/status?result=success&order=${orderId}`,
        failure: `${siteUrl}/checkout/status?result=failure&order=${orderId}`,
        pending: `${siteUrl}/checkout/status?result=pending&order=${orderId}`
      },
      auto_return: "approved",
      notification_url: notificationUrl,
      statement_descriptor: process.env.MERCADO_PAGO_STATEMENT_DESCRIPTOR || "DANATTO",
      metadata: {
        order_id: orderId,
        shalom_agency_id: payload.customer.shalomAgencyId
      }
    })
  });

  const data = (await response.json().catch(() => ({}))) as MercadoPagoPreferenceResponse;

  if (!response.ok) {
    return {
      provider: "mercado_pago",
      mode: "error",
      message: "No se pudo crear la preferencia de Mercado Pago.",
      status: response.status,
      detail: data.message || data.error
    };
  }

  return {
    provider: "mercado_pago",
    mode: "configured",
    preferenceId: data.id,
    initPoint: environment === "production" ? data.init_point : data.sandbox_init_point || data.init_point,
    productionInitPoint: data.init_point,
    sandboxInitPoint: data.sandbox_init_point
  };
}

export async function getMercadoPagoPayment(paymentId: string) {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) throw new Error("MERCADO_PAGO_ACCESS_TOKEN no configurado.");

  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`No se pudo consultar el pago de Mercado Pago: ${response.status}`);
  }

  return (await response.json()) as MercadoPagoPayment;
}

export function mapMercadoPagoPaymentStatus(status?: string): "pendiente" | "pagado" | "fallido" | "reembolsado" {
  if (status === "approved") return "pagado";
  if (status === "refunded" || status === "charged_back") return "reembolsado";
  if (status === "rejected" || status === "cancelled") return "fallido";
  return "pendiente";
}

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}
