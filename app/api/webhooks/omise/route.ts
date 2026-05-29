import { NextRequest, NextResponse } from "next/server";
import { verifyOmiseWebhook } from "@/lib/omise";
import { completeOrder } from "@/actions/payment";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("x-omise-signature") ?? "";

  if (!verifyOmiseWebhook(payload, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { key: string; data?: { id?: string; status?: string; metadata?: Record<string, string> } };
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { key, data } = event;
  const metadata = data?.metadata ?? {};
  const { orderId } = metadata;

  switch (key) {
    case "charge.complete": {
      if (data?.status === "successful" && orderId) {
        await completeOrder(orderId);
        try {
          await db.order.update({
            where: { id: orderId },
            data: { gatewayRef: data.id, status: "PAID" },
          });
        } catch { /* no DB */ }
        console.log("[Omise] charge.complete — PAID", { orderId, chargeId: data.id });
      }
      break;
    }

    case "charge.create": {
      console.log("[Omise] charge.create", { orderId, chargeId: data?.id });
      break;
    }

    case "charge.expired": {
      if (orderId) {
        try {
          await db.order.update({ where: { id: orderId }, data: { status: "FAILED" } });
        } catch { /* no DB */ }
        console.log("[Omise] charge.expired", { orderId });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
