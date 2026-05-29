import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { completeOrder } from "@/actions/payment";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const { orderId, userId, courseIds } = session.metadata ?? {};

      if (orderId) {
        // Complete order: PAID + Enrollments + Certificates
        await completeOrder(orderId);

        // Store gateway reference
        try {
          await db.order.update({
            where: { id: orderId },
            data: { gatewayRef: session.id, status: "PAID" },
          });
        } catch { /* no DB */ }

        console.log("[Stripe] checkout.session.completed", { orderId, userId, courseIds });
      }
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object;
      const orderId = (charge.metadata as Record<string, string>)?.orderId;
      if (orderId) {
        try {
          await db.order.update({ where: { id: orderId }, data: { status: "REFUNDED" } });
        } catch { /* no DB */ }
        console.log("[Stripe] charge.refunded", { orderId });
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object;
      const orderId = (intent.metadata as Record<string, string>)?.orderId;
      if (orderId) {
        try {
          await db.order.update({ where: { id: orderId }, data: { status: "FAILED" } });
        } catch { /* no DB */ }
        console.log("[Stripe] payment_intent.payment_failed", { orderId });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
