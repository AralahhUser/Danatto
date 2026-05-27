import { NextResponse } from "next/server";
import { releaseExpiredReservations } from "@/lib/orders";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (secret && authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const released = await releaseExpiredReservations();
  return NextResponse.json({ ok: true, released });
}
