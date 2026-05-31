"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/primitives/Button";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { CourseThumbnail } from "@/components/course/CourseThumbnail";
import { PromptPayQR } from "@/components/payment/PromptPayQR";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { applyCoupon, checkoutWithStripe, checkoutWithPromptPay, type CartItem, type CheckoutResult } from "@/actions/payment";
import { Trash2, Tag, CheckCircle, AlertCircle, CreditCard, QrCode, ShoppingBag, Lock, Loader2 } from "lucide-react";

type Step = "cart" | "processing" | "qr";

type CartCourse = {
  id: string;
  slug: string;
  title: string;
  price: number;
  currency: string;
  monogram: string | null;
  art: string | null;
  instructorName: string;
};

export default function CartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <CartPageInner />
    </Suspense>
  );
}

function CartPageInner() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items: cartSlugs, add, remove, clear } = useCart();

  const [coupon, setCoupon] = useState("");
  const [couponStatus, setCouponStatus] = useState<"idle" | "ok" | "error">("idle");
  const [couponMsg, setCouponMsg] = useState("");
  const [discountPct, setDiscountPct] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "promptpay">("card");
  const [step, setStep] = useState<Step>("cart");
  const [error, setError] = useState("");
  const [qrData, setQrData] = useState<CheckoutResult | null>(null);

  const [items, setItems] = useState<CartCourse[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  // Add course from ?course=slug (from "เพิ่มลงตะกร้า" / wishlist), then clean the URL.
  // No mock guard — any slug is accepted; resolution happens via the DB-backed API.
  useEffect(() => {
    const slug = searchParams.get("course");
    if (slug) {
      add(slug);
      router.replace(`/${locale}/cart`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Resolve cart slugs → full course objects via DB-backed API (works for all courses)
  useEffect(() => {
    if (cartSlugs.length === 0) { setItems([]); setLoadingItems(false); return; }
    let cancelled = false;
    setLoadingItems(true);
    fetch(`/api/courses/by-slugs?slugs=${encodeURIComponent(cartSlugs.join(","))}`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setItems(Array.isArray(data.courses) ? data.courses : []); })
      .catch(() => { if (!cancelled) setItems([]); })
      .finally(() => { if (!cancelled) setLoadingItems(false); });
    return () => { cancelled = true; };
  }, [cartSlugs]);

  const subtotal = items.reduce((s, c) => s + c.price, 0);
  const discount = discountPct > 0 ? Math.round(subtotal * discountPct / 100) : 0;
  const total = subtotal - discount;

  // ── Coupon ──────────────────────────────────────────────────────────────────

  async function handleApplyCoupon() {
    if (!coupon.trim()) return;
    const result = await applyCoupon(coupon.trim());
    if (result.valid) {
      setDiscountPct(result.discountPct);
      setCouponStatus("ok");
      setCouponMsg(`ลด ${result.discountPct}% แล้ว! (${result.code})`);
    } else {
      setDiscountPct(0);
      setCouponStatus("error");
      setCouponMsg(result.error ?? "โค้ดไม่ถูกต้อง");
    }
  }

  function removeCoupon() {
    setCoupon("");
    setDiscountPct(0);
    setCouponStatus("idle");
    setCouponMsg("");
  }

  // ── Checkout ────────────────────────────────────────────────────────────────

  async function handleCheckout() {
    if (items.length === 0) return;
    setError("");
    setStep("processing");

    const cartItems: CartItem[] = items.map((c) => ({
      courseId: c.id,
      title: c.title,
      price: c.price,
      currency: c.currency,
    }));

    const couponCode = couponStatus === "ok" ? coupon.toUpperCase() : undefined;

    if (paymentMethod === "card") {
      const result = await checkoutWithStripe(cartItems, couponCode, discountPct);
      if (result.success && result.redirectUrl) {
        clear(); // empty cart on successful checkout
        router.push(result.redirectUrl);
      } else {
        setError(result.error ?? "เกิดข้อผิดพลาด กรุณาลองใหม่");
        setStep("cart");
      }
    } else {
      const result = await checkoutWithPromptPay(cartItems, couponCode, discountPct);
      if (result.success) {
        setQrData(result);
        setStep("qr");
        clear(); // cart emptied; PromptPay status polled on QR screen
      } else {
        setError(result.error ?? "ไม่สามารถสร้าง QR Code ได้");
        setStep("cart");
      }
    }
  }

  // ── QR Screen ───────────────────────────────────────────────────────────────

  if (step === "qr" && qrData) {
    return (
      <div className="min-h-screen bg-paper">
        <TopBar />
        <main className="py-12">
          <Container className="max-w-[420px]">
            <div className="text-center mb-6">
              <EyebrowLabel className="mb-2">PROMPTPAY</EyebrowLabel>
              <h1 className="font-display text-[28px] text-ink tracking-[-0.015em]">
                สแกนจ่าย
              </h1>
            </div>
            <div className="bg-paper-3 border border-line rounded-r3 p-6">
              <PromptPayQR
                orderId={qrData.orderId ?? ""}
                chargeId={qrData.chargeId ?? ""}
                qrCodeUrl={qrData.qrCodeUrl ?? ""}
                amount={qrData.amount ?? total}
                courseId={items[0]?.id}
              />
            </div>
            <button
              onClick={() => setStep("cart")}
              className="mt-4 text-[13px] text-ink-3 hover:text-ink w-full text-center transition-colors"
            >
              ← กลับเปลี่ยนวิธีชำระเงิน
            </button>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Processing Screen ────────────────────────────────────────────────────────

  if (step === "processing") {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-viridian border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-[15px] text-ink font-semibold">กำลังดำเนินการ...</p>
          <p className="text-[13px] text-ink-3 mt-1">กรุณารอสักครู่</p>
        </div>
      </div>
    );
  }

  // ── Cart Screen ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-paper">
      <TopBar />
      <main className="py-12">
        <Container>
          <EyebrowLabel className="mb-2">— CHECKOUT</EyebrowLabel>
          <h1 className="font-display text-[36px] text-ink tracking-[-0.015em] mb-8">
            ตะกร้าสินค้า
          </h1>

          {loadingItems && cartSlugs.length > 0 ? (
            <div className="text-center py-16">
              <Loader2 size={32} className="text-viridian mx-auto mb-3 animate-spin" />
              <p className="text-ink-3 text-[14px]">กำลังโหลดตะกร้า...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag size={48} className="text-ink-4 mx-auto mb-4" />
              <p className="text-ink-3 text-[15px] mb-4">ตะกร้าของคุณว่างเปล่า</p>
              <Link href={`/${locale}/courses`}>
                <Button variant="primary">ดูคอร์สทั้งหมด</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">

              {/* ── Cart Items ── */}
              <div className="flex flex-col gap-4">
                {items.map((course) => (
                  <div
                    key={course.id}
                    className="bg-paper-3 border border-line rounded-r3 p-5 flex gap-4"
                  >
                    <div className="w-[110px] shrink-0 rounded-r2 overflow-hidden">
                      <CourseThumbnail
                        title={course.title}
                        monogram={course.monogram ?? undefined}
                        art={course.art ?? undefined}
                        aspectRatio="16/9"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/${locale}/courses/${course.slug}`}
                        className="font-semibold text-[15px] text-ink hover:text-viridian transition-colors line-clamp-2"
                      >
                        {course.title}
                      </Link>
                      <p className="text-[12px] text-ink-3 mt-1">{course.instructorName}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="font-display text-[20px] text-viridian">
                          {formatPrice(course.price, course.currency)}
                        </span>
                        {discountPct > 0 && (
                          <span className="font-mono text-[11px] bg-ok/10 text-ok px-2 py-0.5 rounded-pill">
                            -{discountPct}%
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => remove(course.slug)}
                      className="text-ink-4 hover:text-danger transition-colors self-start mt-1"
                      title="ลบออก"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                {/* Coupon — large screen inline */}
                <div className="hidden lg:block bg-paper-3 border border-line rounded-r3 p-5">
                  <p className="text-[13px] font-semibold text-ink mb-3 flex items-center gap-2">
                    <Tag size={14} className="text-viridian" />
                    โค้ดส่วนลด
                  </p>
                  <CouponRow
                    coupon={coupon}
                    onChangeCoupon={setCoupon}
                    status={couponStatus}
                    msg={couponMsg}
                    onApply={handleApplyCoupon}
                    onRemove={removeCoupon}
                  />
                </div>
              </div>

              {/* ── Order Summary ── */}
              <div className="bg-paper-3 border border-line rounded-r3 p-6 sticky top-24">
                <h2 className="font-semibold text-[16px] text-ink mb-5">สรุปคำสั่งซื้อ</h2>

                {/* Coupon — mobile */}
                <div className="lg:hidden mb-5">
                  <CouponRow
                    coupon={coupon}
                    onChangeCoupon={setCoupon}
                    status={couponStatus}
                    msg={couponMsg}
                    onApply={handleApplyCoupon}
                    onRemove={removeCoupon}
                  />
                </div>

                {/* Price breakdown */}
                <div className="flex flex-col gap-2 text-[14px] pb-4 border-b border-line mb-4">
                  {items.map((c) => (
                    <div key={c.id} className="flex justify-between text-ink-2">
                      <span className="truncate max-w-[180px] text-[13px]">{c.title}</span>
                      <span className="shrink-0">{formatPrice(c.price, c.currency)}</span>
                    </div>
                  ))}
                  {discount > 0 && (
                    <div className="flex justify-between text-ok font-medium">
                      <span>ส่วนลด ({discountPct}%)</span>
                      <span>-{formatPrice(discount, "THB")}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-ink font-semibold mb-5">
                  <span>ยอดชำระทั้งหมด</span>
                  <span className="font-display text-[22px] text-viridian">
                    {formatPrice(total, "THB")}
                  </span>
                </div>

                {/* Payment method */}
                <p className="text-[12px] text-ink-3 font-semibold uppercase tracking-[0.08em] mb-2">
                  วิธีชำระเงิน
                </p>
                <div className="flex flex-col gap-2 mb-5">
                  {([
                    { id: "card", label: "บัตรเครดิต / เดบิต", sub: "Visa, Mastercard", Icon: CreditCard },
                    { id: "promptpay", label: "PromptPay", sub: "สแกน QR ทุกธนาคาร", Icon: QrCode },
                  ] as const).map((m) => (
                    <label
                      key={m.id}
                      className={`flex items-center gap-3 p-3 border rounded-r2 cursor-pointer transition-colors ${
                        paymentMethod === m.id
                          ? "border-viridian bg-viridian/5"
                          : "border-line hover:border-viridian/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={m.id}
                        checked={paymentMethod === m.id}
                        onChange={() => setPaymentMethod(m.id)}
                        className="accent-viridian"
                      />
                      <m.Icon size={17} className={paymentMethod === m.id ? "text-viridian" : "text-ink-3"} />
                      <div className="flex-1">
                        <p className="text-[14px] text-ink">{m.label}</p>
                        <p className="text-[11px] text-ink-4">{m.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 text-[13px] text-danger bg-danger/5 rounded-r2 px-3 py-2 mb-4">
                    <AlertCircle size={14} className="shrink-0" />
                    {error}
                  </div>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-center gap-2"
                  onClick={handleCheckout}
                >
                  {paymentMethod === "card" ? (
                    <><CreditCard size={16} />ชำระด้วยบัตร</>
                  ) : (
                    <><QrCode size={16} />รับ QR Code</>
                  )}
                </Button>

                <p className="text-[11px] text-ink-4 text-center mt-3 flex items-center justify-center gap-1">
                  <Lock size={10} />
                  ชำระเงินปลอดภัย · คืนเงินได้ใน 7 วัน
                </p>
              </div>
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}

// ── Coupon Sub-Component ─────────────────────────────────────────────────────

function CouponRow({
  coupon, onChangeCoupon, status, msg, onApply, onRemove,
}: {
  coupon: string;
  onChangeCoupon: (v: string) => void;
  status: "idle" | "ok" | "error";
  msg: string;
  onApply: () => void;
  onRemove: () => void;
}) {
  return (
    <div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            type="text"
            value={coupon}
            onChange={(e) => onChangeCoupon(e.target.value.toUpperCase())}
            placeholder="กรอกโค้ดส่วนลด (เช่น VERDA15)"
            disabled={status === "ok"}
            className="w-full border border-line rounded-r2 pl-8 pr-3 h-[38px] text-[13px] font-mono bg-paper focus:outline-none focus:border-viridian disabled:opacity-50 disabled:bg-paper-2"
          />
        </div>
        {status === "ok" ? (
          <Button variant="ghost" size="sm" onClick={onRemove}>ลบ</Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={onApply} disabled={!coupon.trim()}>
            ใช้โค้ด
          </Button>
        )}
      </div>
      {msg && (
        <div className={`flex items-center gap-1.5 text-[12px] mt-1.5 ${
          status === "ok" ? "text-ok" : "text-danger"
        }`}>
          {status === "ok" ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
          {msg}
        </div>
      )}
      {status === "idle" && (
        <p className="text-[11px] text-ink-4 mt-1">ลองใช้: VERDA15, VERDA20, WELCOME10</p>
      )}
    </div>
  );
}
