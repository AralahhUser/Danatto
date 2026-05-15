import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { couponSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const parsed = couponSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Cupon invalido" }, { status: 400 });
  const data = parsed.data;
  try {
    const coupon = await prisma.coupon.create({
      data: {
        code: data.code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        active: data.active
      }
    });
    return NextResponse.json(coupon, { status: 201 });
  } catch {
    return NextResponse.json({ error: "No se pudo crear el cupon." }, { status: 500 });
  }
}
