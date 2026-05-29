"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { CheckCircle, Clock, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { formatPrice } from "@/lib/utils";

interface Props {
  orderId: string;
  chargeId: string;
  qrCodeUrl: string;
  amount: number;
  courseId?: string;
}

type PollingStatus = "pending" | "successful" | "failed" | "expired";

export function PromptPayQR({ orderId, chargeId, qrCodeUrl, amount, courseId }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const [status, setStatus] = useState<PollingStatus>("pending");
  const [elapsed, setElapsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 นาที
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // countdown timer
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setElapsed((e) => e + 1);
      setTimeLeft((t) => {
        if (t <= 1) return 0;
        return t - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // poll payment status every 4s
  useEffect(() => {
    if (status !== "pending") return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/status?chargeId=${chargeId}&orderId=${orderId}`);
        const data = (await res.json()) as { status?: PollingStatus };
        if (data.status && data.status !== "pending") {
          setStatus(data.status);
          if (pollRef.current) clearInterval(pollRef.current);
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch { /* retry next tick */ }
    }, 4000);

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [chargeId, orderId, status]);

  // auto-redirect on success
  useEffect(() => {
    if (status === "successful") {
      setTimeout(() => {
        router.push(`/${locale}/payment/success?orderId=${orderId}&courseId=${courseId ?? ""}`);
      }, 1500);
    }
  }, [status, orderId, courseId, locale, router]);

  // expire when timer hits 0
  useEffect(() => {
    if (timeLeft === 0 && status === "pending") setStatus("expired");
  }, [timeLeft, status]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const pct = ((300 - timeLeft) / 300) * 100;

  if (status === "successful") {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 rounded-full bg-ok/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-ok" />
        </div>
        <p className="font-semibold text-[17px] text-ink mb-1">ชำระเงินสำเร็จ!</p>
        <p className="text-[13px] text-ink-3">กำลังพาไปหน้ายืนยัน...</p>
      </div>
    );
  }

  if (status === "failed" || status === "expired") {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4">
          <XCircle size={32} className="text-danger" />
        </div>
        <p className="font-semibold text-[17px] text-ink mb-1">
          {status === "expired" ? "QR Code หมดอายุ" : "การชำระเงินล้มเหลว"}
        </p>
        <p className="text-[13px] text-ink-3 mb-5">
          {status === "expired" ? "กรุณาสั่งซื้อใหม่อีกครั้ง" : "กรุณาลองใหม่อีกครั้ง"}
        </p>
        <Button variant="ghost" onClick={() => router.push(`/${locale}/cart`)}>
          กลับไปตะกร้า
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Amount */}
      <div className="text-center">
        <p className="text-[13px] text-ink-3 mb-1">ยอดชำระ</p>
        <p className="font-display text-[32px] text-viridian">{formatPrice(amount, "THB")}</p>
      </div>

      {/* QR Code */}
      <div className="relative">
        <div className="w-[200px] h-[200px] border-2 border-viridian rounded-r3 overflow-hidden bg-white flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrCodeUrl}
            alt="PromptPay QR Code"
            className="w-full h-full object-contain p-2"
            onError={(e) => {
              // fallback: show placeholder grid pattern
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
        {/* Spinning overlay when qr loading */}
        <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-viridian flex items-center justify-center">
          <RefreshCw size={12} className="text-white animate-spin" style={{ animationDuration: "3s" }} />
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center space-y-1">
        <p className="text-[13px] font-semibold text-ink">สแกนผ่านแอปธนาคาร</p>
        <p className="text-[12px] text-ink-3">K PLUS, SCB Easy, Krungthai NEXT, TTB Touch ฯลฯ</p>
      </div>

      {/* Timer */}
      <div className="w-full max-w-[240px]">
        <div className="flex items-center justify-between text-[12px] mb-1.5">
          <span className="flex items-center gap-1 text-ink-3">
            <Clock size={11} />
            หมดอายุใน
          </span>
          <span className={`font-mono font-semibold ${timeLeft < 60 ? "text-danger" : "text-ink"}`}>
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
        </div>
        <div className="w-full h-1.5 bg-paper-3 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${timeLeft < 60 ? "bg-danger" : "bg-viridian"}`}
            style={{ width: `${100 - pct}%` }}
          />
        </div>
      </div>

      {/* Polling status */}
      <div className="flex items-center gap-2 text-[12px] text-ink-3">
        <span className="w-2 h-2 rounded-full bg-ok animate-pulse" />
        กำลังตรวจสอบการชำระเงิน... ({elapsed}s)
      </div>
    </div>
  );
}
