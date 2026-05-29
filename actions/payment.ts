"use server";

import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { createPromptPaySource, createCharge } from "@/lib/omise";
import { MOCK_COURSES } from "@/mock";
import { auth } from "@/lib/auth";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CartItem {
  courseId: string;
  title: string;
  price: number; // THB satang
  currency: string;
}

export interface CouponResult {
  valid: boolean;
  discountPct: number;
  code: string;
  error?: string;
}

export interface CheckoutResult {
  success: boolean;
  method: "stripe" | "promptpay";
  // Stripe
  redirectUrl?: string;
  // PromptPay
  orderId?: string;
  chargeId?: string;
  qrCodeUrl?: string;
  amount?: number;
  // Error
  error?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getCoursePrice(courseId: string): number {
  const course = MOCK_COURSES.find((c) => c.id === courseId);
  return course?.price ?? 0;
}

function getCourseTitle(courseId: string): string {
  const course = MOCK_COURSES.find((c) => c.id === courseId);
  return course?.title ?? courseId;
}

/** หา user ที่ login อยู่ */
async function getCurrentUser() {
  try {
    const session = await auth();
    return session?.user ?? null;
  } catch {
    return null;
  }
}

// ── Apply Coupon ───────────────────────────────────────────────────────────────

export async function applyCoupon(code: string): Promise<CouponResult> {
  if (!code.trim()) return { valid: false, discountPct: 0, code, error: "กรุณากรอกโค้ด" };

  try {
    const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon) return { valid: false, discountPct: 0, code, error: "โค้ดไม่ถูกต้อง" };
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return { valid: false, discountPct: 0, code, error: "โค้ดหมดอายุแล้ว" };
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return { valid: false, discountPct: 0, code, error: "โค้ดถูกใช้ครบจำนวนแล้ว" };
    }
    return { valid: true, discountPct: coupon.discountPct, code: coupon.code };
  } catch {
    // Mock fallback — demo coupon codes
    const DEMO_COUPONS: Record<string, number> = {
      VERDA15: 15,
      VERDA20: 20,
      WELCOME10: 10,
    };
    const pct = DEMO_COUPONS[code.toUpperCase()];
    if (!pct) return { valid: false, discountPct: 0, code, error: "โค้ดไม่ถูกต้อง" };
    return { valid: true, discountPct: pct, code: code.toUpperCase() };
  }
}

// ── Create Order in DB ─────────────────────────────────────────────────────────

async function createOrder(
  userId: string,
  items: CartItem[],
  total: number,
  gateway: "STRIPE" | "OMISE" | "FREE",
  couponCode?: string,
) {
  let couponId: string | undefined;
  if (couponCode) {
    try {
      const c = await db.coupon.findUnique({ where: { code: couponCode } });
      if (c) {
        couponId = c.id;
        await db.coupon.update({ where: { id: c.id }, data: { usedCount: { increment: 1 } } });
      }
    } catch { /* no DB — skip */ }
  }

  try {
    const order = await db.order.create({
      data: {
        userId,
        total,
        currency: "THB",
        status: "PENDING",
        gateway,
        couponId,
        items: {
          create: items.map((item) => ({
            courseId: item.courseId,
            price: item.price,
          })),
        },
      },
    });
    return order;
  } catch {
    // Mock fallback — return fake order
    return { id: `mock_order_${Date.now()}`, userId, total, status: "PENDING", gateway };
  }
}

// ── Stripe Checkout ────────────────────────────────────────────────────────────

export async function checkoutWithStripe(
  items: CartItem[],
  couponCode?: string,
  discountPct = 0,
): Promise<CheckoutResult> {
  const user = await getCurrentUser();
  const userId = (user as { id?: string } | null)?.id ?? "guest";

  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const discount = discountPct > 0 ? Math.round(subtotal * discountPct / 100) : 0;
  const total = subtotal - discount;

  // Create order
  const order = await createOrder(userId, items, total, "STRIPE", couponCode);

  // Mock mode — no real Stripe key
  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      success: true,
      method: "stripe",
      redirectUrl: `/th/payment/success?orderId=${order.id}&courseId=${items[0]?.courseId}`,
    };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: items.map((item) => ({
        price_data: {
          currency: "thb",
          unit_amount: item.price,
          product_data: { name: item.title },
        },
        quantity: 1,
      })),
      discounts: couponCode ? [] : [],
      metadata: {
        orderId: order.id,
        userId,
        courseIds: items.map((i) => i.courseId).join(","),
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/th/payment/success?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/th/payment/failed?orderId=${order.id}`,
    });

    return { success: true, method: "stripe", redirectUrl: session.url ?? "" };
  } catch (err) {
    return { success: false, method: "stripe", error: String(err) };
  }
}

// ── Omise PromptPay ────────────────────────────────────────────────────────────

export async function checkoutWithPromptPay(
  items: CartItem[],
  couponCode?: string,
  discountPct = 0,
): Promise<CheckoutResult> {
  const user = await getCurrentUser();
  const userId = (user as { id?: string } | null)?.id ?? "guest";

  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const discount = discountPct > 0 ? Math.round(subtotal * discountPct / 100) : 0;
  const total = subtotal - discount;

  // Create order
  const order = await createOrder(userId, items, total, "OMISE", couponCode);

  // Mock mode — no real Omise key
  if (!process.env.OMISE_SECRET_KEY) {
    return {
      success: true,
      method: "promptpay",
      orderId: order.id,
      chargeId: `mock_charge_${Date.now()}`,
      // Use a static demo QR image (placeholder)
      qrCodeUrl: "https://promptpay.io/0812345678/" + total,
      amount: total,
    };
  }

  try {
    const source = await createPromptPaySource(total);
    const charge = await createCharge(source.id, total, {
      orderId: order.id,
      userId,
      courseIds: items.map((i) => i.courseId).join(","),
    });

    const qrCodeUrl =
      charge.source?.scannable_code?.image?.download_uri ??
      source.scannable_code?.image?.download_uri ??
      "";

    return {
      success: true,
      method: "promptpay",
      orderId: order.id,
      chargeId: charge.id,
      qrCodeUrl,
      amount: total,
    };
  } catch (err) {
    return { success: false, method: "promptpay", error: String(err) };
  }
}

// ── Complete Order (after payment confirmed) ───────────────────────────────────

export async function completeOrder(orderId: string): Promise<void> {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order || order.status === "PAID") return;

    await db.$transaction([
      db.order.update({ where: { id: orderId }, data: { status: "PAID" } }),
      ...order.items.map((item) =>
        db.enrollment.upsert({
          where: { userId_courseId: { userId: order.userId, courseId: item.courseId } },
          create: { userId: order.userId, courseId: item.courseId },
          update: {},
        }),
      ),
      ...order.items.map((item) =>
        db.certificate.upsert({
          where: { userId_courseId: { userId: order.userId, courseId: item.courseId } },
          create: { userId: order.userId, courseId: item.courseId },
          update: {},
        }),
      ),
    ]);
  } catch { /* no DB — skip */ }
}
