import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { bannerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const parsed = bannerSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Banner invalido" }, { status: 400 });
  try {
    const banner = await prisma.banner.create({ data: parsed.data });
    return NextResponse.json(banner, { status: 201 });
  } catch {
    return NextResponse.json({ error: "No se pudo crear el banner." }, { status: 500 });
  }
}
