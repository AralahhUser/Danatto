import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { complaintSchema } from "@/lib/validators";

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Base de datos no disponible." }, { status: 503 });
  }

  const parsed = complaintSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos invalidos", issues: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const complaint = await prisma.complaint.create({
      data: {
        ...parsed.data,
        address: parsed.data.address || null,
        orderNumber: parsed.data.orderNumber || null,
        amount: parsed.data.amount ?? null
      }
    });

    return NextResponse.json({ ok: true, id: complaint.id, code: complaint.id.slice(0, 8).toUpperCase() }, { status: 201 });
  } catch (error) {
    console.error("Complaint create error", error);
    return NextResponse.json({ error: "No se pudo registrar la solicitud." }, { status: 500 });
  }
}
