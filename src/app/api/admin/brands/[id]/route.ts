import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/format";
import { brandSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const parsed = brandSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Marca invalida" }, { status: 400 });
  const data = parsed.data;
  try {
    const brand = await prisma.brand.update({
      where: { id },
      data: { name: data.name, slug: data.slug || slugify(data.name), logoUrl: data.logoUrl || null }
    });
    return NextResponse.json(brand);
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar la marca." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.brand.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar la marca." }, { status: 500 });
  }
}
