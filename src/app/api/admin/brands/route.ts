import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/format";
import { brandSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const parsed = brandSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Marca invalida" }, { status: 400 });
  const data = parsed.data;
  try {
    const brand = await prisma.brand.create({
      data: { name: data.name, slug: data.slug || slugify(data.name), logoUrl: data.logoUrl || null }
    });
    return NextResponse.json(brand, { status: 201 });
  } catch {
    return NextResponse.json({ error: "No se pudo crear la marca." }, { status: 500 });
  }
}
