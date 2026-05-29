import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

type WhatsAppConfig = {
  accessToken: string;
  phoneNumberId: string;
  recipient: string;
  apiVersion: string;
};

type WhatsAppPayload =
  | {
      messaging_product: "whatsapp";
      to: string;
      type: "text";
      text: { body: string; preview_url: boolean };
    }
  | {
      messaging_product: "whatsapp";
      to: string;
      type: "image";
      image: { link: string; caption: string };
    };

type PaidOrderForWhatsApp = Prisma.OrderGetPayload<{
  include: {
    customer: true;
    items: {
      include: {
        product: {
          include: {
            brand: true;
            category: true;
          };
        };
      };
    };
  };
}>;

export async function notifyDanattoPaidOrder(orderId: string) {
  const config = getWhatsAppConfig();

  if (!config) {
    console.warn("WhatsApp notification skipped: credentials are not configured.");
    return { ok: false, skipped: true, reason: "whatsapp_not_configured" };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      items: {
        include: {
          product: {
            include: {
              brand: true,
              category: true
            }
          }
        }
      }
    }
  });

  if (!order) {
    return { ok: false, skipped: true, reason: "order_not_found" };
  }

  const textResult = await sendWhatsAppPayload(config, {
    messaging_product: "whatsapp",
    to: config.recipient,
    type: "text",
    text: {
      body: buildPaidOrderMessage(order),
      preview_url: false
    }
  });

  if (!textResult.ok) return textResult;

  const imageMessages = order.items
    .map((item, index) => {
      const imageUrl = item.product.images[0];
      if (!imageUrl) return null;

      return {
        messaging_product: "whatsapp" as const,
        to: config.recipient,
        type: "image" as const,
        image: {
          link: toPublicUrl(imageUrl),
          caption: [
            `Prenda ${index + 1}: ${item.product.name}`,
            `${item.product.brand.name} | Talla ${item.product.size}`,
            `Pedido ${order.id}`
          ].join("\n")
        }
      };
    })
    .filter((message): message is Extract<WhatsAppPayload, { type: "image" }> => Boolean(message))
    .slice(0, 5);

  for (const message of imageMessages) {
    const imageResult = await sendWhatsAppPayload(config, message);
    if (!imageResult.ok) return imageResult;
  }

  return { ok: true, skipped: false };
}

function getWhatsAppConfig(): WhatsAppConfig | null {
  const accessToken = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const recipient = normalizePhone(
    process.env.DANATTO_WHATSAPP_NOTIFY_TO || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""
  );

  if (!accessToken || !phoneNumberId || !recipient) return null;

  return {
    accessToken,
    phoneNumberId,
    recipient,
    apiVersion: process.env.WHATSAPP_API_VERSION || "v22.0"
  };
}

async function sendWhatsAppPayload(config: WhatsAppConfig, payload: WhatsAppPayload) {
  const response = await fetch(`https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const detail = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("WhatsApp notification failed", {
      status: response.status,
      detail
    });

    return {
      ok: false,
      skipped: false,
      reason: "whatsapp_api_error",
      status: response.status,
      detail
    };
  }

  return { ok: true, skipped: false };
}

function buildPaidOrderMessage(order: PaidOrderForWhatsApp) {
  const siteUrl = getSiteUrl();
  const customer = order.customer;
  const agencyLines = [
    customer.shalomAgencyName,
    customer.shalomAgencyAddress,
    [customer.shalomAgencyDistrict, customer.shalomAgencyProvince, customer.shalomAgencyDepartment]
      .filter(Boolean)
      .join(", "),
    customer.shalomAgencyMapsUrl
  ].filter(Boolean);

  const productLines = order.items.map((item, index) => {
    const product = item.product;
    return [
      `${index + 1}. ${product.name}`,
      `Marca: ${product.brand.name}`,
      `Categoria: ${product.category.name}`,
      `Talla: ${product.size}`,
      `Color: ${product.color}`,
      `Cantidad: ${item.quantity}`,
      `Precio: ${formatMoney(Number(item.price))}`,
      `Link: ${siteUrl}/product/${product.slug}`
    ].join("\n");
  });

  return [
    "Nuevo pago confirmado en Danatto",
    "",
    `Pedido: ${order.id}`,
    `Referencia de pago: ${order.paymentReference || "Sin referencia"}`,
    `Total: ${formatMoney(Number(order.total))}`,
    `Envio: ${formatMoney(Number(order.shippingCost))}`,
    "",
    "Cliente",
    `Nombres: ${customer.name}`,
    `Telefono: ${customer.phone}`,
    `DNI: ${customer.dni || "No registrado"}`,
    `Correo: ${customer.email || "No registrado"}`,
    "",
    "Entrega Shalom",
    `Departamento: ${customer.department || "No registrado"}`,
    `Provincia: ${customer.province || customer.city || "No registrado"}`,
    `Distrito: ${customer.district || "No aplica"}`,
    agencyLines.join("\n"),
    "",
    "Prendas",
    productLines.join("\n\n")
  ]
    .filter((line) => line !== undefined)
    .join("\n");
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function formatMoney(value: number) {
  return `S/ ${value.toFixed(2)}`;
}

function toPublicUrl(value: string) {
  try {
    return new URL(value).toString();
  } catch {
    const path = value.startsWith("/") ? value : `/${value}`;
    return new URL(path, getSiteUrl()).toString();
  }
}

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://danatto.com").replace(/\/$/, "");
}
