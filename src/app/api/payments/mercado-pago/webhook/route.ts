import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMercadoPagoPayment, mapMercadoPagoPaymentStatus } from "@/lib/payments";

export const runtime = "nodejs";

type MercadoPagoWebhookBody = {
  type?: string;
  topic?: string;
  action?: string;
  data?: {
    id?: string;
  };
};

export async function GET() {
  return NextResponse.json({
    ok: true,
    provider: "mercado_pago",
    accessTokenConfigured: Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN),
    webhookSecretConfigured: Boolean(process.env.MERCADO_PAGO_WEBHOOK_SECRET)
  });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const bodyText = await request.text();
  const body = parseWebhookBody(bodyText);

  if (!body) {
    return NextResponse.json({ ok: false, error: "Payload invalido" }, { status: 400 });
  }

  const topic = url.searchParams.get("type") || url.searchParams.get("topic") || body.type || body.topic || "";
  if (topic && topic !== "payment") {
    return NextResponse.json({ ok: true, ignored: true, topic });
  }

  const dataIdFromUrl = url.searchParams.get("data.id") || url.searchParams.get("id") || "";
  const paymentId = dataIdFromUrl || body.data?.id || "";

  if (!paymentId) {
    return NextResponse.json({ ok: false, error: "Payment id faltante" }, { status: 400 });
  }

  const signature = verifyMercadoPagoSignature({
    dataIdFromUrl,
    fallbackDataId: body.data?.id || "",
    requestId: request.headers.get("x-request-id") || "",
    signature: request.headers.get("x-signature") || ""
  });

  if (!signature.ok) {
    return NextResponse.json({ ok: false, error: signature.reason }, { status: 401 });
  }

  try {
    const payment = await getMercadoPagoPayment(paymentId);
    const orderId = payment.external_reference || payment.metadata?.order_id || payment.metadata?.orderId;

    if (!orderId) {
      return NextResponse.json({ ok: true, ignored: true, reason: "Pago sin referencia de pedido" });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: mapMercadoPagoPaymentStatus(payment.status),
        paymentReference: String(payment.id)
      }
    });

    return NextResponse.json({
      ok: true,
      orderId,
      paymentId: String(payment.id),
      paymentStatus: payment.status
    });
  } catch (error) {
    console.error("Mercado Pago webhook error", error);
    return NextResponse.json({ ok: false, error: "No se pudo procesar la notificacion" }, { status: 500 });
  }
}

function parseWebhookBody(bodyText: string) {
  if (!bodyText) return {};

  try {
    return JSON.parse(bodyText) as MercadoPagoWebhookBody;
  } catch {
    return null;
  }
}

function verifyMercadoPagoSignature({
  dataIdFromUrl,
  fallbackDataId,
  requestId,
  signature
}: {
  dataIdFromUrl: string;
  fallbackDataId: string;
  requestId: string;
  signature: string;
}) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      return { ok: false, reason: "MERCADO_PAGO_WEBHOOK_SECRET no configurado" };
    }

    return { ok: true, reason: "Firma omitida en desarrollo" };
  }

  const { ts, v1 } = parseSignature(signature);
  if (!ts || !v1) return { ok: false, reason: "Firma de Mercado Pago incompleta" };

  const manifestCandidates = buildManifestCandidates({
    dataIdFromUrl,
    fallbackDataId,
    requestId,
    ts
  });

  const valid = manifestCandidates.some((manifest) => {
    const expected = createHmac("sha256", secret).update(manifest).digest("hex");
    return safeEqual(expected, v1);
  });

  return valid ? { ok: true, reason: "Firma valida" } : { ok: false, reason: "Firma de Mercado Pago invalida" };
}

function parseSignature(signature: string) {
  return signature.split(",").reduce<{ ts?: string; v1?: string }>((acc, part) => {
    const [key, value] = part.split("=");
    if (key?.trim() === "ts") acc.ts = value?.trim();
    if (key?.trim() === "v1") acc.v1 = value?.trim();
    return acc;
  }, {});
}

function buildManifestCandidates({
  dataIdFromUrl,
  fallbackDataId,
  requestId,
  ts
}: {
  dataIdFromUrl: string;
  fallbackDataId: string;
  requestId: string;
  ts: string;
}) {
  const ids = Array.from(new Set([dataIdFromUrl, fallbackDataId, ""].filter((value) => value !== undefined)));

  return ids.map((id) =>
    [
      id ? `id:${id};` : "",
      requestId ? `request-id:${requestId};` : "",
      ts ? `ts:${ts};` : ""
    ].join("")
  );
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");

  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}
