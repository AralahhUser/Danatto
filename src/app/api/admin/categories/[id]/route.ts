import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/format";
import { categorySchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const parsed = categorySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Categoria invalida" }, { status: 400 });
  const data = parsed.data;
  try {
    const category = await prisma.category.update({
      where: { id },
      data: { name: data.name, slug: data.slug || slugify(data.name) }
    });
    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar la categoria." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar la categoria." }, { status: 500 });
  }
}
