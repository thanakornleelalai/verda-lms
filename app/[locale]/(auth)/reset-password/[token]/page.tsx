"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { resetPassword } from "@/actions/auth";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = params.token as string;
  const email = searchParams.get("email") ?? "";
  const locale = (params.locale as string) ?? "th";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Password strength
  const strength = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
  };
  const strengthScore = Object.values(strength).filter(Boolean).length;
  const strengthLabel = ["", "อ่อนมาก", "อ่อน", "ปานกลาง", "แข็งแกร่ง"][strengthScore];
  const strengthColor = ["", "bg-danger", "bg-warn", "bg-warn", "bg-ok"][strengthScore];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await resetPassword(token, email, newPassword, confirmPassword);
      if (result.success) {
        setStatus("success");
        setTimeout(() => router.push(`/${locale}/login`), 3000);
      } else {
        setStatus("error");
        setError(result.error ?? "เกิดข้อผิดพลาด");
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
          {status === "success" ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-ok/10 flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={32} className="text-ok" />
              </div>
              <h1 className="font-display text-[26px] text-ink mb-3">รีเซ็ตสำเร็จ!</h1>
              <p className="text-[14px] text-ink-3 font-thai leading-[1.7] mb-4">
                รหัสผ่านของคุณถูกเปลี่ยนเรียบร้อยแล้ว
                <br />กำลังพาไปหน้าเข้าสู่ระบบ...
              </p>
              <Link href={`/${locale}/login`}>
                <Button variant="primary" className="w-full justify-center">
                  เข้าสู่ระบบ
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="font-display text-[28px] text-ink mb-2">ตั้งรหัสผ่านใหม่</h1>
                <p className="text-[14px] text-ink-3 font-thai leading-[1.6]">
                  กรอกรหัสผ่านใหม่ที่ต้องการใช้งาน
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 text-[13px] text-danger bg-danger/5 border border-danger/20 rounded-r2 px-3 py-2">
                    <AlertCircle size={14} className="shrink-0" />
                    {error}
                  </div>
                )}

                {/* New password */}
                <div>
                  <label className="block text-[13px] font-medium text-ink mb-1.5">
                    รหัสผ่านใหม่
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-4" />
                    <input
                      type={showPw ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="อย่างน้อย 8 ตัวอักษร"
                      className="w-full border border-line rounded-r2 pl-10 pr-10 h-[42px] text-[14px] bg-paper focus:outline-none focus:border-viridian transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 hover:text-ink"
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Strength meter */}
                  {newPassword && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              i <= strengthScore ? strengthColor : "bg-line"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-[11px] text-ink-3">
                        ความแข็งแกร่ง:{" "}
                        <span className={strengthScore >= 3 ? "text-ok" : strengthScore >= 2 ? "text-warn" : "text-danger"}>
                          {strengthLabel}
                        </span>
                      </p>
                      <div className="grid grid-cols-2 gap-1">
                        {[
                          { check: strength.length, label: "8 ตัวอักษรขึ้นไป" },
                          { check: strength.uppercase, label: "ตัวอักษรพิมพ์ใหญ่" },
                          { check: strength.number, label: "ตัวเลข" },
                          { check: strength.special, label: "อักขระพิเศษ" },
                        ].map(({ check, label }) => (
                          <div key={label} className={`flex items-center gap-1 text-[11px] ${check ? "text-ok" : "text-ink-4"}`}>
                            <CheckCircle size={10} />
                            {label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-[13px] font-medium text-ink mb-1.5">
                    ยืนยันรหัสผ่านใหม่
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-4" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="กรอกรหัสผ่านอีกครั้ง"
                      className={`w-full border rounded-r2 pl-10 pr-10 h-[42px] text-[14px] bg-paper focus:outline-none transition-colors ${
                        confirmPassword && confirmPassword !== newPassword
                          ? "border-danger focus:border-danger"
                          : "border-line focus:border-viridian"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 hover:text-ink"
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-[12px] text-danger mt-1">รหัสผ่านไม่ตรงกัน</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full justify-center mt-1"
                  disabled={isPending || !strength.length || newPassword !== confirmPassword}
                >
                  {isPending ? "กำลังบันทึก..." : "ตั้งรหัสผ่านใหม่"}
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
