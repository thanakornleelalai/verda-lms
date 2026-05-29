"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/primitives/Button";

export default function ForgotPasswordPage() {
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setError("");
    startTransition(async () => {
      try {
        // In production: call resetPassword() Server Action → Resend email
        // For now, simulate success after 800ms
        await new Promise((r) => setTimeout(r, 800));
        setSent(true);
      } catch {
        setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      }
    });
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">
        {/* Brand */}
        <Link href={`/${locale}`} className="flex items-baseline gap-2 mb-10 justify-center">
          <span className="font-display text-[32px] tracking-[-0.02em] text-ink">VERDA</span>
          <span className="w-[10px] h-[10px] rounded-full bg-viridian inline-block translate-y-[-2px]" />
        </Link>

        <div className="bg-paper-3 border border-line rounded-r4 p-[40px]">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-ok/10 flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={32} className="text-ok" />
              </div>
              <h1 className="font-display text-[26px] text-ink mb-3">ตรวจสอบอีเมลของคุณ</h1>
              <p className="text-[14px] text-ink-3 leading-[1.7] font-thai mb-6">
                เราส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยัง{" "}
                <span className="font-medium text-ink">{email}</span> แล้ว
                กรุณาตรวจสอบกล่องข้อความ (รวมถึงโฟลเดอร์ spam)
              </p>
              <Link href={`/${locale}/login`}>
                <Button variant="primary" className="w-full justify-center">
                  กลับสู่หน้าเข้าสู่ระบบ
                </Button>
              </Link>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="mt-4 text-[13px] text-viridian hover:underline block w-full text-center"
              >
                ลองด้วยอีเมลอื่น
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="font-display text-[28px] text-ink mb-2">ลืมรหัสผ่าน?</h1>
                <p className="text-[14px] text-ink-3 font-thai leading-[1.6]">
                  กรอกอีเมลที่ใช้สมัครสมาชิก เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านให้คุณ
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && (
                  <p className="text-[13px] text-danger bg-danger/10 border border-danger/20 rounded-r2 px-3 py-2">
                    {error}
                  </p>
                )}
                <div>
                  <label className="block text-[13px] font-medium text-ink mb-1.5">
                    อีเมล
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-4" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full border border-line rounded-r2 pl-10 pr-3.5 h-[42px] text-[14px] font-thai bg-paper-3 focus:outline-none focus:border-viridian transition-colors"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full justify-center"
                  disabled={isPending || !email.trim()}
                >
                  {isPending ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
                </Button>
              </form>
            </>
          )}
        </div>

        <Link
          href={`/${locale}/login`}
          className="flex items-center justify-center gap-2 mt-6 text-[13px] text-ink-3 hover:text-ink transition-colors"
        >
          <ArrowLeft size={14} />
          กลับสู่หน้าเข้าสู่ระบบ
        </Link>
      </div>
    </div>
  );
}
