import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { couponSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const parsed = couponSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Cupon invalido" }, { status: 400 });
  const data = parsed.data;
  try {
    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: data.code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        active: data.active
      }
    });
    return NextResponse.json(coupon);
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar el cupon." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar el cupon." }, { status: 500 });
  }
}
