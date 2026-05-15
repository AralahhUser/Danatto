import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/format";
import { categorySchema } from "@/lib/validators";

export async function POST(request: Request) {
  const parsed = categorySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Categoria invalida" }, { status: 400 });
  const data = parsed.data;
  try {
    const category = await prisma.category.create({
      data: { name: data.name, slug: data.slug || slugify(data.name) }
    });
    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json({ error: "No se pudo crear la categoria." }, { status: 500 });
  }
}
