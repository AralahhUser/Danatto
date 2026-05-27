import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { sessionCookieName, shouldUseSecureCookies, signAdminSession } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  try {
    const admin = await prisma.userAdmin.findUnique({ where: { email } });
    if (!admin) return NextResponse.json({ error: "Credenciales invalidas" }, { status: 401 });
    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) return NextResponse.json({ error: "Credenciales invalidas" }, { status: 401 });

    const token = await signAdminSession({ id: admin.id, email: admin.email, role: admin.role });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(sessionCookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: shouldUseSecureCookies(),
      path: "/",
      maxAge: 60 * 60 * 8
    });
    return response;
  } catch (error) {
    console.error("Admin login error", error);
    return NextResponse.json({ error: "Base de datos no disponible o credenciales invalidas" }, { status: 503 });
  }
}
