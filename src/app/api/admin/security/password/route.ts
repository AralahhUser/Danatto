import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { adminPasswordChangeSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const parsed = adminPasswordChangeSchema.safeParse(await request.json());
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message || "Datos invalidos";
    return NextResponse.json({ error: firstIssue, issues: parsed.error.flatten() }, { status: 400 });
  }

  const admin = await prisma.userAdmin.findUnique({ where: { id: session.id } });
  if (!admin) return NextResponse.json({ error: "Usuario admin no encontrado" }, { status: 404 });

  const currentPasswordValid = await bcrypt.compare(parsed.data.currentPassword, admin.passwordHash);
  if (!currentPasswordValid) {
    return NextResponse.json({ error: "La contrasena actual no es correcta" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.userAdmin.update({
    where: { id: admin.id },
    data: { passwordHash }
  });

  return NextResponse.json({ ok: true });
}
