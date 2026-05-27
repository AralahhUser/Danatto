import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { markOrderAsPaid, releaseOrderReservation } from "@/lib/orders";

const orderUpdateSchema = z.object({
  paymentStatus: z.enum(["pendiente", "pagado", "fallido", "reembolsado"]).optional(),
  shippingStatus: z.enum(["pendiente", "en_preparacion", "enviado", "entregado", "cancelado"]).optional()
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const parsed = orderUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Estado invalido" }, { status: 400 });
  try {
    const { paymentStatus, shippingStatus } = parsed.data;

    if (paymentStatus === "pagado") {
      await markOrderAsPaid(id);
    } else if (paymentStatus === "fallido") {
      await releaseOrderReservation(id);
    } else if (paymentStatus) {
      await prisma.order.update({
        where: { id },
        data: { paymentStatus, ...(paymentStatus === "pendiente" ? {} : { reservationExpiresAt: null }) }
      });
    }

    if (shippingStatus) {
      await prisma.order.update({ where: { id }, data: { shippingStatus } });
    }

    const order = await prisma.order.findUnique({ where: { id } });
    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar el pedido." }, { status: 500 });
  }
}
