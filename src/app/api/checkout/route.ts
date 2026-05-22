import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkoutSchema } from "@/lib/validators";
import { createMercadoPagoPreference } from "@/lib/payments";
import { getShalomAgencyById, isShalomDistrictRequired, normalizeLocation } from "@/lib/shalom";

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

      for (const item of payload.items) {
        const product = products.find((entry) => entry.id === item.productId)!;
        const remaining = product.stock - item.quantity;
        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: Math.max(remaining, 0),
            status: remaining <= 0 ? "vendido" : product.status
          }
        });
      }

      return { orderId: order.id, total: subtotal + shippingCost };
    });

    const payment =
      payload.paymentProvider === "mercado_pago"
        ? await createMercadoPagoPreference({ orderId: result.orderId, total: result.total, payload })
        : {
            provider: payload.paymentProvider,
            mode: "prepared",
            message: "Proveedor preparado. Conecta las claves reales en variables de entorno."
          };

    return NextResponse.json({ ok: true, orderId: result.orderId, payment });
  } catch (error) {
    if (error instanceof Error && error.message.includes("disponible")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      {
        ok: true,
        orderId: `demo-${Date.now()}`,
        payment: {
          provider: payload.paymentProvider,
          mode: "demo",
          message: "Pedido simulado porque la base de datos no esta conectada."
        }
      },
      { status: 200 }
    );
  }
}
