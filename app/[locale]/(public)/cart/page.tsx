"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/primitives/Button";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { CourseThumbnail } from "@/components/course/CourseThumbnail";
import { MOCK_COURSES } from "@/mock";
import { formatPrice } from "@/lib/utils";
import { Trash2, Tag, CheckCircle } from "lucide-react";

const CART_ITEMS = MOCK_COURSES.slice(0, 2);

const PAYMENT_METHODS = [
  { id: "card", label: "บัตรเครดิต / เดบิต", icon: "💳" },
  { id: "promptpay", label: "PromptPay", icon: "📱" },
] as const;

export default function CartPage() {
  const locale = useLocale();
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "promptpay">("card");
  const [items, setItems] = useState(CART_ITEMS);

  const subtotal = items.reduce((s, c) => s + c.price, 0);
  const discount = couponApplied ? Math.round(subtotal * 0.15) : 0;
  const total = subtotal - discount;

  return (
    <div className="min-h-screen bg-paper">
      <TopBar />
      <main className="py-12">
        <Container>
          <EyebrowLabel className="mb-2">CHECKOUT</EyebrowLabel>
          <h1 className="font-display text-[36px] text-ink tracking-[-0.015em] mb-8">ตะกร้าสินค้า</h1>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-ink-3 text-[15px] mb-4">ตะกร้าของคุณว่างเปล่า</p>
              <Link href={`/${locale}/courses`}>
                <Button variant="primary">ดูคอร์สทั้งหมด</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-[1fr_360px] gap-10 items-start">
              {/* Cart items */}
              <div className="flex flex-col gap-4">
                {items.map((course) => (
                  <div
                    key={course.id}
                    className="bg-paper-3 border border-line rounded-r3 p-5 flex gap-4"
                  >
                    <div className="w-[120px] shrink-0 rounded-r2 overflow-hidden">
                      <CourseThumbnail title={course.title} monogram={course.monogram} art={course.art} aspectRatio="16/9" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/${locale}/courses/${course.slug}`}
                        className="font-semibold text-[15px] text-ink hover:text-viridian transition-colors line-clamp-2"
                      >
                        {course.title}
                      </Link>
                      <p className="text-[13px] text-ink-3 mt-1">{course.instructor.name}</p>
                      <div className="mt-3 font-display text-[22px] text-viridian">
                        {formatPrice(course.price, course.currency)}
                      </div>
                    </div>
                    <button
                      onClick={() => setItems((prev) => prev.filter((c) => c.id !== course.id))}
                      className="text-ink-4 hover:text-danger transition-colors self-start mt-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Order summary */}
              <div className="bg-paper-3 border border-line rounded-r3 p-6 sticky top-24">
                <h2 className="font-semibold text-[17px] text-ink mb-5">สรุปคำสั่งซื้อ</h2>

                {/* Coupon */}
                <div className="flex gap-2 mb-5">
                  <div className="relative flex-1">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
                    <input
                      type="text"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                      placeholder="โค้ดส่วนลด"
                      className="w-full border border-line rounded-r2 pl-9 pr-3 h-[38px] text-[13px] font-mono bg-paper focus:outline-none focus:border-viridian"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { if (coupon) setCouponApplied(true); }}
                  >
                    ใช้โค้ด
                  </Button>
                </div>

                {couponApplied && (
                  <div className="flex items-center gap-2 text-[13px] text-ok bg-ok/10 rounded-r2 px-3 py-2 mb-4">
                    <CheckCircle size={14} />
                    ลด 15% แล้ว!
                  </div>
                )}

                {/* Price breakdown */}
                <div className="flex flex-col gap-2 text-[14px] mb-4 pb-4 border-b border-line">
                  <div className="flex justify-between text-ink-2">
                    <span>ราคารวม</span>
                    <span>{formatPrice(subtotal, "THB")}</span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between text-ok">
                      <span>ส่วนลด (15%)</span>
                      <span>-{formatPrice(discount, "THB")}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-ink font-semibold text-[16px] mb-5">
                  <span>ยอดชำระ</span>
                  <span className="font-display text-[22px] text-viridian">{formatPrice(total, "THB")}</span>
                </div>

                {/* Payment method */}
                <div className="flex flex-col gap-2 mb-5">
                  {PAYMENT_METHODS.map((m) => (
                    <label
                      key={m.id}
                      className={`flex items-center gap-3 p-3 border rounded-r2 cursor-pointer transition-colors ${
                        paymentMethod === m.id
                          ? "border-viridian bg-viridian/5"
                          : "border-line hover:border-viridian-3"
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
                      <span className="text-[18px]">{m.icon}</span>
                      <span className="text-[14px] text-ink">{m.label}</span>
                    </label>
                  ))}
                </div>

                {paymentMethod === "promptpay" && (
                  <div className="mb-4 p-4 bg-paper-2 rounded-r2 text-center">
                    <div className="w-[140px] h-[140px] bg-white border border-line rounded-r2 mx-auto mb-2 flex items-center justify-center text-ink-3 text-[12px]">
                      QR Code
                    </div>
                    <p className="font-mono text-[11px] text-ink-3 tracking-wide">สแกนจ่าย PromptPay</p>
                  </div>
                )}

                <Button variant="primary" size="lg" className="w-full justify-center">
                  {paymentMethod === "card" ? "ชำระด้วยบัตร" : "ยืนยันการชำระ"}
                </Button>

                <p className="text-[11px] text-ink-4 text-center mt-3">
                  🔒 ชำระเงินปลอดภัย · คืนเงินได้ใน 7 วัน
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
