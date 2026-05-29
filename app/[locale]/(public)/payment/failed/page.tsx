import Link from "next/link";
import { getLocale } from "next-intl/server";
import { XCircle, RefreshCw, MessageCircle, Home } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/primitives/Button";

export const dynamic = "force-dynamic";

export default async function PaymentFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; reason?: string }>;
}) {
  const locale = await getLocale();
  const { orderId, reason } = await searchParams;

  const REASONS: Record<string, string> = {
    cancelled: "คุณยกเลิกการชำระเงิน",
    insufficient_funds: "ยอดเงินในบัตรไม่เพียงพอ",
    card_declined: "บัตรถูกปฏิเสธ กรุณาลองบัตรอื่น",
    expired_qr: "QR Code หมดอายุ กรุณาสั่งซื้อใหม่",
    default: "การชำระเงินไม่สำเร็จ กรุณาลองอีกครั้ง",
  };

  const message = REASONS[reason ?? ""] ?? REASONS.default;

  return (
    <div className="min-h-screen bg-paper">
      <TopBar />
      <main className="py-16">
        <Container className="max-w-[520px]">
          {/* Failed icon */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-6">
              <XCircle size={40} className="text-danger" />
            </div>
            <h1 className="font-display text-[34px] text-ink tracking-[-0.015em] mb-2">
              การชำระเงินไม่สำเร็จ
            </h1>
            <p className="text-[15px] text-ink-3 font-thai">{message}</p>
            {orderId && (
              <p className="font-mono text-[11px] text-ink-4 mt-2">
                Order #{orderId}
              </p>
            )}
          </div>

          {/* What happened */}
          <div className="bg-paper-3 border border-line rounded-r3 p-5 mb-6">
            <h3 className="font-semibold text-[14px] text-ink mb-3">สาเหตุที่เป็นไปได้</h3>
            <ul className="flex flex-col gap-2 text-[13px] text-ink-2 font-thai">
              <li className="flex items-start gap-2.5">
                <span className="text-ink-4 mt-0.5">•</span>
                ข้อมูลบัตรไม่ถูกต้องหรือหมดอายุ
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-ink-4 mt-0.5">•</span>
                ยอดเงินในบัตรไม่เพียงพอ
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-ink-4 mt-0.5">•</span>
                QR Code หมดอายุก่อนสแกน (สำหรับ PromptPay)
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-ink-4 mt-0.5">•</span>
                ธนาคารปฏิเสธรายการ
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link href={`/${locale}/cart`}>
              <Button variant="primary" size="lg" className="w-full justify-center gap-2">
                <RefreshCw size={16} />
                ลองชำระเงินอีกครั้ง
              </Button>
            </Link>
            <Link href={`/${locale}/courses`}>
              <Button variant="ghost" size="lg" className="w-full justify-center gap-2">
                <Home size={16} />
                กลับหน้าหลัก
              </Button>
            </Link>
          </div>

          {/* Support */}
          <div className="mt-8 text-center">
            <p className="text-[13px] text-ink-3 mb-2">ยังมีปัญหาอยู่?</p>
            <a href="mailto:hello@verda.co.th">
              <Button variant="ghost" size="sm" className="gap-2">
                <MessageCircle size={14} />
                ติดต่อทีมงาน
              </Button>
            </a>
          </div>
        </Container>
      </main>
    </div>
  );
}
