import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkoutSchema } from "@/lib/validators";
import { createMercadoPagoPreference } from "@/lib/payments";
import { getShalomAgencyById, isShalomDistrictRequired, normalizeLocation } from "@/lib/shalom";
import {
  getReservationExpiration,
  manualPaymentReservationMinutes,
  releaseExpiredReservations,
  releaseOrderReservation
} from "@/lib/orders";
import type { CheckoutPayload } from "@/lib/types";

export async function POST(request: Request) {
  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos de checkout invalidos", issues: parsed.error.flatten() }, { status: 400 });
  }
  const payload = parsed.data;
  const shippingCost = 12;
  const shalomAgency = getShalomAgencyById(payload.customer.shalomAgencyId);

  if (!shalomAgency || normalizeLocation(shalomAgency.department) !== normalizeLocation(payload.customer.department)) {
    return NextResponse.json({ error: "Agencia Shalom invalida para el departamento seleccionado." }, { status: 400 });
  }

  const district = payload.customer.district?.trim() ?? "";
  const districtRequired = isShalomDistrictRequired(payload.customer.department, payload.customer.province);

  if (districtRequired && !district) {
    return NextResponse.json({ error: "Selecciona un distrito para ver agencias Shalom cercanas." }, { status: 400 });
  }

  if (!district && normalizeLocation(shalomAgency.province) !== normalizeLocation(payload.customer.province)) {
    return NextResponse.json({ error: "Agencia Shalom invalida para la provincia seleccionada." }, { status: 400 });
  }

  const customerData = {
    name: payload.customer.name,
    email: payload.customer.email ?? "",
    phone: payload.customer.phone,
    dni: payload.customer.dni,
    address: shalomAgency.address,
    department: payload.customer.department,
    district,
    city: payload.customer.province,
    province: payload.customer.province,
    reference: `Recojo en agencia Shalom: ${shalomAgency.name}`,
    shalomAgencyId: shalomAgency.id,
    shalomAgencyName: shalomAgency.name,
    shalomAgencyAddress: shalomAgency.address,
    shalomAgencyDistrict: shalomAgency.district,
    shalomAgencyProvince: shalomAgency.province,
    shalomAgencyDepartment: shalomAgency.department,
    shalomAgencyMapsUrl: shalomAgency.mapsUrl
  };

  try {
    await releaseExpiredReservations();

    const result = await prisma.$transaction(async (tx) => {
      const ids = payload.items.map((item) => item.productId);
      const products = await tx.product.findMany({ where: { id: { in: ids } } });
      if (products.length !== payload.items.length) throw new Error("Uno o mas productos no existen.");
      const reservationExpiresAt = getReservationExpiration(
        isManualPaymentProvider(payload.paymentProvider) ? manualPaymentReservationMinutes : undefined
      );

      const activePendingItems = await tx.orderItem.findMany({
        where: {
          productId: { in: ids },
          order: {
            paymentStatus: "pendiente",
            reservationExpiresAt: { gt: new Date() }
          }
        },
        select: { productId: true }
      });

      if (activePendingItems.length > 0) {
        throw new Error("Esta prenda tiene un pedido pendiente de pago. Intentalo nuevamente mas tarde.");
      }

      let subtotal = 0;
      for (const item of payload.items) {
        const product = products.find((entry) => entry.id === item.productId);
        if (!product || product.status !== "disponible" || product.stock < item.quantity) {
          throw new Error("Una prenda ya no esta disponible.");
        }
        subtotal += Number(product.salePrice ?? product.price) * item.quantity;
      }

      const customer = await tx.customer.create({ data: customerData });
      const order = await tx.order.create({
        data: {
          customerId: customer.id,
          total: subtotal + shippingCost,
          shippingCost,
          paymentProvider: payload.paymentProvider,
          paymentStatus: "pendiente",
          shippingStatus: "pendiente",
          reservationExpiresAt,
          items: {
            create: payload.items.map((item) => {
              const product = products.find((entry) => entry.id === item.productId)!;
              return {
                productId: item.productId,
                quantity: item.quantity,
                price: product.salePrice ?? product.price
              };
            })
          }
        }
      });

      return { orderId: order.id, total: subtotal + shippingCost, reservationExpiresAt };
    });

    if (isManualPaymentProvider(payload.paymentProvider)) {
      return NextResponse.json({
        ok: true,
        orderId: result.orderId,
        payment: buildManualPaymentResponse({
          orderId: result.orderId,
          total: result.total,
          payload,
          expiresAt: result.reservationExpiresAt,
          shalomAgencyName: shalomAgency.name
        })
      });
    }

    const payment = await createMercadoPagoPreference({
      orderId: result.orderId,
      total: result.total,
      payload,
      expiresAt: result.reservationExpiresAt
    });

    if (!("initPoint" in payment) || !payment.initPoint || !payment.preferenceId) {
      await releaseOrderReservation(result.orderId);
      return NextResponse.json(
        { error: payment.message || "No se pudo crear el pago con Mercado Pago.", payment },
        { status: 502 }
      );
    }

    await prisma.order.update({
      where: { id: result.orderId },
      data: { paymentReference: payment.preferenceId }
    });

    return NextResponse.json({ ok: true, orderId: result.orderId, payment });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("disponible") || error.message.includes("pendiente de pago"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    console.error("Checkout error", error);
    return NextResponse.json({ error: "No se pudo registrar el pedido. Intentalo nuevamente." }, { status: 500 });
  }
}

type ManualPaymentProvider = Extract<CheckoutPayload["paymentProvider"], "manual_yape" | "manual_plin" | "bank_transfer">;

function isManualPaymentProvider(provider: CheckoutPayload["paymentProvider"]): provider is ManualPaymentProvider {
  return provider === "manual_yape" || provider === "manual_plin" || provider === "bank_transfer";
}

function buildManualPaymentResponse({
  orderId,
  total,
  payload,
  expiresAt,
  shalomAgencyName
}: {
  orderId: string;
  total: number;
  payload: CheckoutPayload;
  expiresAt: Date;
  shalomAgencyName: string;
}) {
  const method = getManualPaymentMethod(payload.paymentProvider as ManualPaymentProvider);
  const whatsappNumber = getPublicPhone(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "51912354180");
  const message = [
    "Hola Danatto, deseo confirmar mi pedido.",
    "",
    `Pedido: ${orderId}`,
    `Metodo de pago: ${method.label}`,
    `Total: ${formatMoney(total)}`,
    `Cliente: ${payload.customer.name}`,
    `DNI: ${payload.customer.dni}`,
    `Telefono: ${payload.customer.phone}`,
    `Destino: ${payload.customer.department} / ${payload.customer.province}${payload.customer.district ? ` / ${payload.customer.district}` : ""}`,
    `Agencia Shalom: ${shalomAgencyName}`,
    "",
    "Adjunto mi comprobante de pago."
  ].join("\n");

  return {
    provider: payload.paymentProvider,
    mode: "manual",
    label: method.label,
    title: method.title,
    total,
    expiresAt: expiresAt.toISOString(),
    instructions: method.instructions,
    qrUrl: method.qrUrl,
    whatsappUrl: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
  };
}

function getManualPaymentMethod(provider: ManualPaymentProvider) {
  if (provider === "manual_plin") {
    const number = getPublicPhone(process.env.NEXT_PUBLIC_PLIN_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "51912354180");
    return {
      label: "Plin manual",
      title: "Paga por Plin sin comision de pasarela",
      qrUrl: process.env.NEXT_PUBLIC_PLIN_QR_URL || "",
      instructions: [
        { label: "Numero Plin", value: formatPeruPhone(number) },
        { label: "Titular", value: process.env.NEXT_PUBLIC_PLIN_HOLDER || "Danatto" }
      ]
    };
  }

  if (provider === "bank_transfer") {
    return {
      label: "Transferencia bancaria",
      title: "Transfiere directamente a Danatto",
      qrUrl: "",
      instructions: [
        { label: "Banco", value: process.env.NEXT_PUBLIC_BANK_NAME || "Por confirmar" },
        { label: "Cuenta", value: process.env.NEXT_PUBLIC_BANK_ACCOUNT || "Coordinar por WhatsApp" },
        { label: "CCI", value: process.env.NEXT_PUBLIC_BANK_CCI || "Coordinar por WhatsApp" },
        { label: "Titular", value: process.env.NEXT_PUBLIC_BANK_HOLDER || "Danatto" }
      ]
    };
  }

  const number = getPublicPhone(process.env.NEXT_PUBLIC_YAPE_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "51912354180");
  return {
    label: "Yape manual",
    title: "Paga por Yape sin comision de pasarela",
    qrUrl: process.env.NEXT_PUBLIC_YAPE_QR_URL || "",
    instructions: [
      { label: "Numero Yape", value: formatPeruPhone(number) },
      { label: "Titular", value: process.env.NEXT_PUBLIC_YAPE_HOLDER || "Danatto" }
    ]
  };
}

function getPublicPhone(value: string) {
  return value.replace(/\D/g, "");
}

function formatPeruPhone(value: string) {
  const digits = getPublicPhone(value);
  if (digits.startsWith("51") && digits.length === 11) {
    return `+51 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }

  return digits;
}

function formatMoney(value: number) {
  return `S/ ${value.toFixed(2)}`;
}
