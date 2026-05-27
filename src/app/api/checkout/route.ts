import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkoutSchema } from "@/lib/validators";
import { createMercadoPagoPreference } from "@/lib/payments";
import { getShalomAgencyById, isShalomDistrictRequired, normalizeLocation } from "@/lib/shalom";
import { getReservationExpiration, releaseOrderReservation } from "@/lib/orders";

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
    const result = await prisma.$transaction(async (tx) => {
      const ids = payload.items.map((item) => item.productId);
      const products = await tx.product.findMany({ where: { id: { in: ids } } });
      if (products.length !== payload.items.length) throw new Error("Uno o mas productos no existen.");
      const reservationExpiresAt = getReservationExpiration();

      let subtotal = 0;
      for (const item of payload.items) {
        const product = products.find((entry) => entry.id === item.productId);
        if (!product || product.status !== "disponible" || product.stock < item.quantity) {
          throw new Error("Una prenda ya no esta disponible.");
        }
        subtotal += Number(product.salePrice ?? product.price) * item.quantity;
      }

      for (const item of payload.items) {
        const product = products.find((entry) => entry.id === item.productId)!;
        const remaining = product.stock - item.quantity;
        const reserved = await tx.product.updateMany({
          where: {
            id: product.id,
            status: "disponible",
            stock: { gte: item.quantity }
          },
          data: {
            stock: { decrement: item.quantity },
            status: remaining <= 0 ? "reservado" : product.status
          }
        });

        if (reserved.count !== 1) throw new Error("Una prenda ya no esta disponible.");
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
    if (error instanceof Error && error.message.includes("disponible")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    console.error("Checkout error", error);
    return NextResponse.json({ error: "No se pudo registrar el pedido. Intentalo nuevamente." }, { status: 500 });
  }
}
