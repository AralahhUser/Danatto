import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/format";
import { productSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const parsed = productSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Producto invalido", issues: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        slug: data.slug || slugify(data.name),
        salePrice: data.salePrice || null
      }
    });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar el producto." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar el producto." }, { status: 500 });
  }
}
