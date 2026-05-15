import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

export const sessionCookieName = "danatto_admin_session";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-only-change-this-secret");

export function shouldUseSecureCookies() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  return process.env.NODE_ENV === "production" && (configuredUrl.startsWith("https://") || process.env.VERCEL === "1");
}

export async function signAdminSession(payload: { id: string; email: string; role: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
}

export async function verifyAdminToken(token?: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { id: string; email: string; role: string };
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return verifyAdminToken(cookieStore.get(sessionCookieName)?.value);
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
