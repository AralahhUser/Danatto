import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/format";
import { productSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const parsed = productSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Producto invalido", issues: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  try {
    const product = await prisma.product.create({
      data: {
        ...data,
        slug: data.slug || slugify(data.name),
        salePrice: data.salePrice || null
      }
    });
    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json({ error: "No se pudo crear el producto. Revisa la base de datos y los IDs de marca/categoria." }, { status: 500 });
  }
}
