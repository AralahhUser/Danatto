import { prisma } from "@/lib/db";

type OrderItemForStock = {
  quantity: number;
  product: {
    id: string;
    stock: number;
    status: string;
  };
};

export const orderReservationMinutes = Number(process.env.ORDER_RESERVATION_MINUTES || 30);
export const manualPaymentReservationMinutes = Number(process.env.MANUAL_PAYMENT_WINDOW_MINUTES || 1440);

export function getReservationExpiration(minutes = orderReservationMinutes) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export async function markOrderAsPaid(orderId: string, paymentReference?: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } }
    });

    if (!order) return false;
    if (order.paymentStatus === "pagado") return false;

    const updated = await tx.order.updateMany({
      where: { id: order.id, paymentStatus: { in: ["pendiente", "fallido"] } },
      data: {
        paymentStatus: "pagado",
        ...(paymentReference ? { paymentReference } : {}),
        reservationExpiresAt: null
      }
    });

    if (updated.count !== 1) return false;

    for (const item of order.items as unknown as OrderItemForStock[]) {
      if (item.product.status === "reservado") {
        await tx.product.update({
          where: { id: item.product.id },
          data: { status: "vendido", stock: 0 }
        });
      } else if (item.product.status === "disponible" && item.product.stock >= item.quantity) {
        const remaining = item.product.stock - item.quantity;
        await tx.product.update({
          where: { id: item.product.id },
          data: {
            stock: remaining,
            status: remaining <= 0 ? "vendido" : "disponible"
          }
        });
      } else {
        throw new Error("El pago fue confirmado, pero una prenda ya no esta disponible.");
      }
    }

    return true;
  });
}

export async function releaseOrderReservation(orderId: string, paymentReference?: string) {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } }
    });

    if (!order || order.paymentStatus !== "pendiente") return;

    const updated = await tx.order.updateMany({
      where: { id: order.id, paymentStatus: "pendiente" },
      data: {
        paymentStatus: "fallido",
        shippingStatus: "cancelado",
        ...(paymentReference ? { paymentReference } : {}),
        reservationExpiresAt: null
      }
    });

    if (updated.count !== 1) return;

    // El checkout actual no descuenta stock antes del pago confirmado.
    // Por eso un pedido fallido solo cambia de estado; no debe reabrir prendas vendidas.
  });
}

export async function releaseExpiredReservations() {
  const expiredOrders = await prisma.order.findMany({
    where: {
      paymentStatus: "pendiente",
      reservationExpiresAt: { lt: new Date() }
    },
    select: { id: true }
  });

  for (const order of expiredOrders) {
    await releaseOrderReservation(order.id);
  }

  return expiredOrders.length;
}
