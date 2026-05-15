import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { bannerSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const parsed = bannerSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Banner invalido" }, { status: 400 });
  try {
    const banner = await prisma.banner.update({ where: { id }, data: parsed.data });
    return NextResponse.json(banner);
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar el banner." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.banner.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar el banner." }, { status: 500 });
  }
}
