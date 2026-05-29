import { NextRequest, NextResponse } from "next/server";
import { getCharge } from "@/lib/omise";
import { completeOrder } from "@/actions/payment";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chargeId = searchParams.get("chargeId");
  const orderId = searchParams.get("orderId");

  if (!chargeId || !orderId) {
    return NextResponse.json({ error: "Missing chargeId or orderId" }, { status: 400 });
  }

  // Mock mode — simulate pending → successful after 15s
  if (!process.env.OMISE_SECRET_KEY || chargeId.startsWith("mock_")) {
    const createdAt = parseInt(chargeId.replace("mock_charge_", "") || "0");
    const elapsed = Date.now() - createdAt;
    const status = elapsed > 15_000 ? "successful" : "pending";

    if (status === "successful") {
      await completeOrder(orderId).catch(() => {});
    }
    return NextResponse.json({ status });
  }

  try {
    const charge = await getCharge(chargeId);

    if (charge.status === "successful") {
      await completeOrder(orderId);

      // Update order in DB
      try {
        await db.order.update({
          where: { id: orderId },
          data: { status: "PAID", gatewayRef: chargeId },
        });
      } catch { /* no DB */ }
    }

    return NextResponse.json({ status: charge.status });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
