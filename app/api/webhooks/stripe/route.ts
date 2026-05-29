import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

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
      const { userId, courseIds } = session.metadata ?? {};
      // TODO: db.order.update + db.enrollment.createMany
      console.log("Stripe checkout completed", { userId, courseIds });
      break;
    }
    case "charge.refunded": {
      // TODO: db.order.update({ status: "REFUNDED" })
      break;
    }
  }

  return NextResponse.json({ received: true });
}
