import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const complaintUpdateSchema = z.object({
  status: z.enum(["pendiente", "en_revision", "respondido", "cerrado"])
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const parsed = complaintUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Estado invalido" }, { status: 400 });

  try {
    const complaint = await prisma.complaint.update({ where: { id }, data: parsed.data });
    return NextResponse.json(complaint);
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar la solicitud." }, { status: 500 });
  }
}
