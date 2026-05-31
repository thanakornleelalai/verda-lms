"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ChevronDown, ChevronUp, Phone, Mail, Loader2, ArrowLeft, GraduationCap, ShieldCheck, BookOpen, ChevronRight, Sparkles } from "lucide-react";
import { signIn } from "next-auth/react";
import { registerUser, sendOTP, verifyOTP, registerWithPhone, sendLoginOTP, loginWithPhone, loginWithPhonePassword } from "@/actions/auth";
import { Button } from "@/components/primitives/Button";

type Mode = "login" | "student" | "instructor";

// Production test accounts — Supabase DB (seeded)
const DEV_ACCOUNTS = [
  { role: "Admin",      email: "admin@verda.dev",      password: "admin1234",      dest: "Admin Panel → /admin" },
  { role: "Instructor", email: "instructor@verda.dev", password: "instructor1234", dest: "Instructor Studio → /studio" },
  { role: "Student",    email: "student@verda.dev",    password: "student1234",    dest: "Dashboard → /dashboard" },
  { role: "Demo",       email: "demo@verda.dev",        password: "demo1234",       dest: "Dashboard → /dashboard" },
];

function DevHint() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4 border border-amber-200 bg-amber-50 rounded-r3 text-[12px] overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 font-mono text-amber-700 hover:bg-amber-100 transition-colors"
      >
        <span>🔑 Test Accounts (Supabase)</span>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {open && (
        <div className="border-t border-amber-200">
          <table className="w-full text-amber-800">
            <thead>
              <tr className="bg-amber-100 text-[10px] font-mono uppercase">
                <th className="px-3 py-1.5 text-left">Role</th>
                <th className="px-3 py-1.5 text-left">Email</th>
                <th className="px-3 py-1.5 text-left">Password</th>
                <th className="px-3 py-1.5 text-left">Redirects to</th>
              </tr>
            </thead>
            <tbody>
              {DEV_ACCOUNTS.map((a) => (
                <tr key={a.email} className="border-t border-amber-100">
                  <td className="px-3 py-1.5 font-semibold">{a.role}</td>
                  <td className="px-3 py-1.5 font-mono">{a.email}</td>
                  <td className="px-3 py-1.5 font-mono">{a.password}</td>
                  <td className="px-3 py-1.5 text-[10px] text-amber-600">{a.dest}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-3 py-2 text-[10px] text-amber-600 border-t border-amber-100">
            บัญชีเหล่านี้ใช้งานได้จริงบน Supabase — ทั้ง Local และ Production
          </p>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const initialMode: Mode =
    tab === "instructor" ? "instructor" :
    tab === "signup" || tab === "student" ? "student" :
    "login";
  const [mode, setMode] = useState<Mode>(initialMode);
  const locale = useLocale();
  const t = useTranslations("auth");

  const TABS: { id: Mode; label: string }[] = [
    { id: "login", label: "เข้าสู่ระบบ" },
    { id: "student", label: "สมัครเรียน" },
    { id: "instructor", label: "สมัครเป็นผู้สอน" },
  ];

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      <div className="w-full max-w-[440px]">
        {/* Back to home */}
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-viridian transition-colors mb-6 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          กลับหน้าหลัก
        </Link>

        {/* Brand */}
        <Link href={`/${locale}`} className="flex items-baseline gap-2 mb-10 justify-center">
          <span className="font-display text-[32px] tracking-[-0.02em] text-ink">VERDA</span>
          <span className="w-[10px] h-[10px] rounded-full bg-viridian inline-block translate-y-[-2px]" />
        </Link>

        {/* Card */}
        <div className="bg-paper-3 border border-line rounded-r4 p-[40px]">
          {/* Tabs — 3 ช่อง: เข้าสู่ระบบ / สมัครเรียน / สมัครเป็นผู้สอน */}
          <div className="flex border border-line rounded-pill p-1 mb-8 gap-0.5">
            {TABS.map((tabItem) => (
              <button
                key={tabItem.id}
                onClick={() => setMode(tabItem.id)}
                className={`flex-1 py-2 rounded-pill text-[12.5px] font-medium transition-all whitespace-nowrap ${
                  mode === tabItem.id
                    ? "bg-viridian text-[#F5F0E1]"
                    : "text-ink-3 hover:text-ink"
                }`}
              >
                {tabItem.label}
              </button>
            ))}
          </div>

          {mode === "login" && <LoginForm locale={locale} />}
          {mode === "student" && <SignupForm locale={locale} />}
          {mode === "instructor" && <InstructorSignupPanel locale={locale} />}

          {/* OAuth — แสดงเฉพาะ login + สมัครเรียน (ผู้สอนต้องผ่านใบสมัคร) */}
          {mode !== "instructor" && (
            <>
              <div className="relative my-6">
                <hr className="border-line" />
                <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-paper-3 px-3 text-[12px] text-ink-3 font-mono uppercase tracking-wider">
                  {mode === "login" ? t("login.orWith") : "หรือ"}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => signIn("google", { callbackUrl: `/${locale}/redirect` })}
                  className="w-full flex items-center justify-center gap-3 border border-line rounded-pill py-[10px] text-[14px] text-ink hover:bg-paper-2 transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {t("google")}
                </button>
                <button
                  onClick={() => signIn("line", { callbackUrl: `/${locale}/redirect` })}
                  className="w-full flex items-center justify-center gap-3 border border-line rounded-pill py-[10px] text-[14px] text-ink hover:bg-paper-2 transition-colors"
                >
                  <span className="text-[#06C755] font-bold text-[18px]">L</span>
                  {t("line")}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Bottom link */}
        <p className="text-center text-[13px] text-ink-3 mt-6">
          {mode === "login" ? (
            <>ยังไม่มีบัญชี?{" "}
              <button onClick={() => setMode("student")} className="text-viridian hover:underline">สมัครเรียน</button>
              {" · "}
              <button onClick={() => setMode("instructor")} className="text-viridian hover:underline">สมัครเป็นผู้สอน</button>
            </>
          ) : (
            <>มีบัญชีแล้ว?{" "}
              <button onClick={() => setMode("login")} className="text-viridian hover:underline">เข้าสู่ระบบ</button>
            </>
          )}
        </p>

        {/* Dev mode test accounts hint */}
        <DevHint />
      </div>
    </div>
  );
}

// ── Instructor signup panel — routes to the full application flow ──────────────

function InstructorSignupPanel({ locale }: { locale: string }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-viridian/10 flex items-center justify-center mx-auto mb-3">
          <GraduationCap size={26} className="text-viridian" />
        </div>
        <h3 className="font-display text-[22px] text-ink tracking-[-0.01em] mb-1.5">
          สมัครเป็นผู้สอน
        </h3>
        <p className="text-[13px] text-ink-3 leading-relaxed">
          แบ่งปันความรู้ สร้างรายได้ และสร้างแบรนด์ส่วนตัวบน VERDA
          การสมัครผู้สอนต้องกรอกประวัติและผ่านการอนุมัติจากทีมงาน
        </p>
      </div>

      {/* Steps */}
      <div className="bg-viridian-wash border border-viridian-3/30 rounded-r3 p-4 flex flex-col gap-2.5">
        {[
          "กรอกประวัติ ประสบการณ์ และไอเดียคอร์ส",
          "ทีม VERDA ตรวจสอบภายใน 3–5 วันทำการ",
          "เมื่ออนุมัติ — เปิด Instructor Studio ทันที",
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-viridian text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span className="text-[13px] text-ink-2 font-thai">{step}</span>
          </div>
        ))}
      </div>

      <Link href={`/${locale}/become-instructor`}>
        <Button variant="primary" size="lg" className="w-full justify-center gap-2">
          <Sparkles size={16} /> เริ่มกรอกใบสมัครผู้สอน
          <ChevronRight size={16} />
        </Button>
      </Link>

      <p className="text-center text-[12px] text-ink-4">
        ต้องการเรียนอย่างเดียว?{" "}
        <span className="text-viridian">เลือกแท็บ &ldquo;สมัครเรียน&rdquo; ด้านบน</span>
      </p>
    </div>
  );
}

// ── Email Login ────────────────────────────────────────────────────────────────

function EmailLoginForm({ locale }: { locale: string }) {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      } else {
        router.push(`/${locale}/redirect`);
        router.refresh();
      }
    });
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {error && (
        <p className="text-[13px] text-danger bg-danger/10 border border-danger/20 rounded-r2 px-3 py-2">
          {error}
        </p>
      )}
      <div>
        <label className="block text-[13px] font-medium text-ink mb-1.5">{t("email")}</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-line rounded-r2 px-3.5 h-[42px] text-[14px] font-thai bg-paper-3 focus:outline-none focus:border-viridian transition-colors"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <div className="flex justify-between mb-1.5">
          <label className="text-[13px] font-medium text-ink">{t("password")}</label>
          <Link href={`/${locale}/forgot-password`} className="text-[12px] text-viridian hover:underline">
            {t("forgot")}
          </Link>
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-line rounded-r2 px-3.5 h-[42px] text-[14px] font-thai bg-paper-3 focus:outline-none focus:border-viridian transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 hover:text-ink"
            aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      <label className="flex items-center gap-2 text-[13px] text-ink-3 cursor-pointer">
        <input type="checkbox" className="rounded border-line" />
        {t("remember")}
      </label>
      <Button type="submit" variant="primary" size="lg" className="w-full mt-2 justify-center" disabled={isPending}>
        {isPending ? "กำลังเข้าสู่ระบบ…" : t("submit")}
      </Button>
    </form>
  );
}

// ── Phone + Password Login ─────────────────────────────────────────────────────

function PhonePasswordLoginForm({ locale, onSwitchToOtp }: { locale: string; onSwitchToOtp: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await loginWithPhonePassword(phone, password);
      if (result.error) { setError(result.error); return; }
      router.push(`/${locale}/redirect`);
      router.refresh();
    });
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {error && (
        <p className="text-[13px] text-danger bg-danger/10 border border-danger/20 rounded-r2 px-3 py-2">
          {error}
        </p>
      )}

      {/* Phone field */}
      <div>
        <label className="block text-[13px] font-medium text-ink mb-1.5">เบอร์โทรศัพท์</label>
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 border border-line rounded-r2 px-3 h-[42px] bg-paper-3 shrink-0">
            <span className="text-[13px]">🇹🇭</span>
            <span className="text-[13px] font-mono text-ink-3">+66</span>
          </div>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-1 border border-line rounded-r2 px-3.5 h-[42px] text-[14px] font-thai bg-paper-3 focus:outline-none focus:border-viridian transition-colors"
            placeholder="081-234-5678"
            inputMode="tel"
            autoComplete="tel"
          />
        </div>
      </div>

      {/* Password field */}
      <div>
        <div className="flex justify-between mb-1.5">
          <label className="text-[13px] font-medium text-ink">รหัสผ่าน</label>
          <Link href={`/${locale}/forgot-password`} className="text-[12px] text-viridian hover:underline">
            ลืมรหัสผ่าน?
          </Link>
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-line rounded-r2 px-3.5 h-[42px] text-[14px] font-thai bg-paper-3 focus:outline-none focus:border-viridian transition-colors pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 hover:text-ink"
            aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full justify-center"
        disabled={isPending || phone.replace(/[\s\-\(\)]/g, "").length < 9 || password.length < 1}
      >
        {isPending
          ? <span className="flex items-center gap-2"><Loader2 size={15} className="animate-spin" />กำลังเข้าสู่ระบบ…</span>
          : "เข้าสู่ระบบ →"}
      </Button>

      <div className="text-center">
        <button type="button" onClick={onSwitchToOtp} className="text-[12px] text-viridian hover:underline">
          ใช้ OTP แทนรหัสผ่าน →
        </button>
      </div>
    </form>
  );
}

// ── Phone OTP Login ────────────────────────────────────────────────────────────

type PhoneLoginStep = "phone" | "otp";

function PhoneLoginForm({ locale, onSwitchToPassword }: { locale: string; onSwitchToPassword: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState<PhoneLoginStep>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function startCountdown() {
    setCountdown(60);
    const id = setInterval(() => setCountdown((c) => { if (c <= 1) { clearInterval(id); return 0; } return c - 1; }), 1000);
  }

  function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await sendLoginOTP(phone);
      if (result.error) { setError(result.error); return; }
      setStep("otp");
      startCountdown();
    });
  }

  function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await loginWithPhone(phone, otp);
      if (result.error) { setError(result.error); return; }
      router.push(`/${locale}/redirect`);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="text-[13px] text-danger bg-danger/10 border border-danger/20 rounded-r2 px-3 py-2">
          {error}
        </p>
      )}

      {/* Step 1 — Phone number */}
      {step === "phone" && (
        <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
          <div>
            <label className="block text-[13px] font-medium text-ink mb-1.5">เบอร์โทรศัพท์</label>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 border border-line rounded-r2 px-3 h-[42px] bg-paper-3 shrink-0">
                <span className="text-[13px]">🇹🇭</span>
                <span className="text-[13px] font-mono text-ink-3">+66</span>
              </div>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 border border-line rounded-r2 px-3.5 h-[42px] text-[14px] font-thai bg-paper-3 focus:outline-none focus:border-viridian transition-colors"
                placeholder="081-234-5678"
                inputMode="tel"
                autoComplete="tel"
              />
            </div>
            <p className="mt-1 text-[11px] text-ink-4">ระบบจะส่ง OTP ไปยังเบอร์นี้</p>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full justify-center"
            disabled={isPending || phone.replace(/[\s\-\(\)]/g, "").length < 9}
          >
            {isPending
              ? <span className="flex items-center gap-2"><Loader2 size={15} className="animate-spin" />กำลังส่ง OTP…</span>
              : "ขอ OTP →"}
          </Button>
          <div className="text-center">
            <button type="button" onClick={onSwitchToPassword} className="text-[12px] text-ink-3 hover:text-ink">
              ← ใช้รหัสผ่านแทน
            </button>
          </div>
        </form>
      )}

      {/* Step 2 — OTP input */}
      {step === "otp" && (
        <form onSubmit={handleVerifyOTP} className="flex flex-col gap-5">
          <div className="text-center">
            <p className="text-[13px] text-ink-3 mb-1">
              ส่ง OTP ไปยัง <span className="font-medium text-ink">{phone}</span>
            </p>
            <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-r2 px-3 py-1.5 text-[11px] text-amber-700 font-mono mt-1">
              🔑 Dev mode — OTP คือ <strong>123456</strong>
            </div>
          </div>

          <OtpInput value={otp} onChange={setOtp} />

          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-[12px] text-ink-4">
                ส่งใหม่ได้ใน <span className="font-mono text-ink">{countdown}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setOtp("");
                  startTransition(async () => {
                    const r = await sendLoginOTP(phone);
                    if (!r.error) startCountdown();
                    else setError(r.error);
                  });
                }}
                className="text-[12px] text-viridian hover:underline"
              >
                ส่ง OTP ใหม่
              </button>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full justify-center"
            disabled={isPending || otp.length < 6}
          >
            {isPending
              ? <span className="flex items-center gap-2"><Loader2 size={15} className="animate-spin" />กำลังตรวจสอบ…</span>
              : "เข้าสู่ระบบ →"}
          </Button>

          <button
            type="button"
            onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
            className="text-[12px] text-ink-3 hover:text-ink transition-colors text-center"
          >
            ← เปลี่ยนเบอร์โทร
          </button>
        </form>
      )}
    </div>
  );
}

// ── LoginForm wrapper — toggles Email / Phone ──────────────────────────────────

type LoginRole = "student" | "instructor" | "admin";

const LOGIN_ROLES: { id: LoginRole; label: string; icon: typeof BookOpen; dest: string }[] = [
  { id: "student",    label: "นักเรียน",  icon: BookOpen,      dest: "แดชบอร์ดผู้เรียน" },
  { id: "instructor", label: "ผู้สอน",     icon: GraduationCap, dest: "Instructor Studio" },
  { id: "admin",      label: "ผู้ดูแล",    icon: ShieldCheck,   dest: "Admin Panel" },
];

function LoginForm({ locale }: { locale: string }) {
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [phoneMode, setPhoneMode] = useState<"password" | "otp">("password");
  const [role, setRole] = useState<LoginRole>("student");

  const activeRole = LOGIN_ROLES.find((r) => r.id === role)!;

  return (
    <div className="flex flex-col gap-5">
      {/* Role selector — เลือกบทบาทที่จะเข้าสู่ระบบ */}
      <div>
        <p className="text-[12px] font-medium text-ink-3 mb-2">เข้าสู่ระบบในฐานะ</p>
        <div className="grid grid-cols-3 gap-2">
          {LOGIN_ROLES.map((r) => {
            const Icon = r.icon;
            const active = role === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-r2 border transition-all ${
                  active
                    ? "border-viridian bg-viridian-wash text-viridian"
                    : "border-line text-ink-3 hover:border-ink-4"
                }`}
              >
                <Icon size={18} className={active ? "text-viridian" : "text-ink-4"} />
                <span className="text-[12px] font-medium">{r.label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-ink-4 mt-2 flex items-center gap-1">
          <ChevronRight size={11} className="text-viridian shrink-0" />
          หลังเข้าสู่ระบบจะนำคุณไปยัง <strong className="text-ink-3 mx-0.5">{activeRole.dest}</strong> โดยอัตโนมัติ
        </p>
      </div>

      {/* Method toggle */}
      <div className="flex border border-line rounded-pill p-1 gap-1">
        <button
          type="button"
          onClick={() => setMethod("email")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-pill text-[13px] font-medium transition-all ${
            method === "email" ? "bg-ink text-paper" : "text-ink-3 hover:text-ink"
          }`}
        >
          <Mail size={13} />อีเมล
        </button>
        <button
          type="button"
          onClick={() => setMethod("phone")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-pill text-[13px] font-medium transition-all ${
            method === "phone" ? "bg-ink text-paper" : "text-ink-3 hover:text-ink"
          }`}
        >
          <Phone size={13} />เบอร์โทร
        </button>
      </div>

      {method === "email" ? (
        <EmailLoginForm locale={locale} />
      ) : phoneMode === "password" ? (
        <PhonePasswordLoginForm locale={locale} onSwitchToOtp={() => setPhoneMode("otp")} />
      ) : (
        <PhoneLoginForm locale={locale} onSwitchToPassword={() => setPhoneMode("password")} />
      )}
    </div>
  );
}

// Password validation rules
function usePasswordRules(password: string, confirmPassword: string) {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  const passedCount = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;
  const strength: "weak" | "medium" | "strong" =
    passedCount <= 2 ? "weak" : passedCount <= 4 ? "medium" : "strong";

  const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && passwordsMatch;

  return { hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial, passwordsMatch, strength, isValid };
}

function RuleItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-1.5 text-[12px] transition-colors ${ok ? "text-ok" : "text-ink-4"}`}>
      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${ok ? "bg-ok text-white" : "bg-line text-ink-4"}`}>
        {ok ? "✓" : "·"}
      </span>
      {label}
    </li>
  );
}

function StrengthBar({ strength }: { strength: "weak" | "medium" | "strong" }) {
  const configs = {
    weak:   { bars: 1, color: "bg-danger",  label: "อ่อนแอ" },
    medium: { bars: 2, color: "bg-warn",    label: "ปานกลาง" },
    strong: { bars: 3, color: "bg-ok",      label: "แข็งแกร่ง" },
  };
  const { bars, color, label } = configs[strength];
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= bars ? color : "bg-line"}`} />
        ))}
      </div>
      <span className={`text-[11px] font-mono ${color.replace("bg-", "text-")}`}>{label}</span>
    </div>
  );
}

// ── OTP Input — 6 digit boxes ─────────────────────────────────────────────────

function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const digits = value.padEnd(6, "").split("").slice(0, 6);

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    const target = e.currentTarget;
    if (e.key === "Backspace" && !target.value && i > 0) {
      (target.previousSibling as HTMLInputElement)?.focus();
    }
  }

  function handleChange(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const char = e.target.value.replace(/\D/g, "").slice(-1);
    const arr = digits.map((d) => (d === " " ? "" : d));
    arr[i] = char;
    const next = arr.join("").slice(0, 6);
    onChange(next);
    if (char && i < 5) {
      (e.target.nextSibling as HTMLInputElement)?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
  }

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input
          key={i}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] === " " ? "" : digits[i]}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          className="w-10 h-12 text-center text-[20px] font-mono border border-line rounded-r2 bg-paper-3 focus:outline-none focus:border-viridian transition-colors"
          aria-label={`OTP digit ${i + 1}`}
        />
      ))}
    </div>
  );
}

// ── Shared password fields block ───────────────────────────────────────────────

function PasswordFields({
  password, setPassword,
  confirmPassword, setConfirmPassword,
}: {
  password: string; setPassword: (v: string) => void;
  confirmPassword: string; setConfirmPassword: (v: string) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState({ password: false, confirm: false });
  const rules = usePasswordRules(password, confirmPassword);
  const showRules = touched.password || password.length > 0;
  const showConfirmError = touched.confirm && confirmPassword.length > 0 && !rules.passwordsMatch;

  return (
    <>
      {/* Password */}
      <div>
        <label className="block text-[13px] font-medium text-ink mb-1.5">รหัสผ่าน</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((v) => ({ ...v, password: true }))}
            className={`w-full border rounded-r2 px-3.5 h-[42px] text-[14px] font-thai bg-paper-3 focus:outline-none transition-colors pr-10 ${
              showRules && !rules.hasMinLength && touched.password ? "border-danger focus:border-danger" : "border-line focus:border-viridian"
            }`}
          />
          <button type="button" onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 hover:text-ink"
            aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}>
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {password.length > 0 && <StrengthBar strength={rules.strength} />}
        {showRules && (
          <ul className="mt-2 flex flex-col gap-1 pl-0.5">
            <RuleItem ok={rules.hasMinLength} label="อย่างน้อย 8 ตัวอักษร" />
            <RuleItem ok={rules.hasUppercase} label="ตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว (A-Z)" />
            <RuleItem ok={rules.hasLowercase} label="ตัวพิมพ์เล็กอย่างน้อย 1 ตัว (a-z)" />
            <RuleItem ok={rules.hasNumber}    label="ตัวเลขอย่างน้อย 1 ตัว (0-9)" />
            <RuleItem ok={rules.hasSpecial}   label="อักขระพิเศษอย่างน้อย 1 ตัว (!@#…)" />
          </ul>
        )}
      </div>

      {/* Confirm password */}
      <div>
        <label className="block text-[13px] font-medium text-ink mb-1.5">ยืนยันรหัสผ่าน</label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => setTouched((v) => ({ ...v, confirm: true }))}
            className={`w-full border rounded-r2 px-3.5 h-[42px] text-[14px] font-thai bg-paper-3 focus:outline-none transition-colors pr-10 ${
              showConfirmError ? "border-danger focus:border-danger"
              : rules.passwordsMatch ? "border-ok focus:border-ok"
              : "border-line focus:border-viridian"
            }`}
            placeholder="กรอกรหัสผ่านอีกครั้ง"
          />
          <button type="button" onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 hover:text-ink"
            aria-label={showConfirm ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}>
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {showConfirmError && <p className="mt-1 text-[12px] text-danger">รหัสผ่านไม่ตรงกัน</p>}
        {rules.passwordsMatch && <p className="mt-1 text-[12px] text-ok">รหัสผ่านตรงกัน ✓</p>}
      </div>
    </>
  );
}

// ── Email Signup ───────────────────────────────────────────────────────────────

function EmailSignupForm({ locale, t }: { locale: string; t: ReturnType<typeof useTranslations> }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const rules = usePasswordRules(password, confirmPassword);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rules.isValid) return;
    setError("");
    startTransition(async () => {
      const result = await registerUser({ name, email, password });
      if (result.error) { setError(result.error); return; }
      router.push(`/${locale}/redirect`);
      router.refresh();
    });
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {error && <p className="text-[13px] text-danger bg-danger/10 border border-danger/20 rounded-r2 px-3 py-2">{error}</p>}
      <div>
        <label className="block text-[13px] font-medium text-ink mb-1.5">{t("name")}</label>
        <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
          className="w-full border border-line rounded-r2 px-3.5 h-[42px] text-[14px] font-thai bg-paper-3 focus:outline-none focus:border-viridian transition-colors" placeholder="ชื่อ นามสกุล" />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-ink mb-1.5">{t("email")}</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-line rounded-r2 px-3.5 h-[42px] text-[14px] font-thai bg-paper-3 focus:outline-none focus:border-viridian transition-colors" placeholder="you@example.com" />
      </div>
      <PasswordFields password={password} setPassword={setPassword} confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword} />
      <label className="flex items-start gap-2 text-[13px] text-ink-3 cursor-pointer">
        <input type="checkbox" required className="rounded border-line mt-0.5 shrink-0" />
        <span>{t("terms")}{" "}<Link href={`/${locale}/terms`} className="text-viridian hover:underline">{t("termsLink")}</Link></span>
      </label>
      <Button type="submit" variant="primary" size="lg" className="w-full mt-2 justify-center" disabled={isPending || !rules.isValid}>
        {isPending ? <span className="flex items-center gap-2"><Loader2 size={15} className="animate-spin" />กำลังสมัครสมาชิก…</span> : t("submit")}
      </Button>
    </form>
  );
}

// ── Phone Signup (3-step OTP flow) ────────────────────────────────────────────

type PhoneStep = "phone" | "otp" | "details";

function PhoneSignupForm({ locale, t }: { locale: string; t: ReturnType<typeof useTranslations> }) {
  const router = useRouter();
  const [step, setStep] = useState<PhoneStep>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const rules = usePasswordRules(password, confirmPassword);

  // Countdown timer for resend OTP
  function startCountdown() {
    setCountdown(60);
    const id = setInterval(() => setCountdown((c) => { if (c <= 1) { clearInterval(id); return 0; } return c - 1; }), 1000);
  }

  function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await sendOTP(phone);
      if (result.error) { setError(result.error); return; }
      setStep("otp");
      startCountdown();
    });
  }

  function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await verifyOTP(phone, otp);
      if (!result.valid) { setError(result.error ?? "OTP ไม่ถูกต้อง"); return; }
      setStep("details");
    });
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!rules.isValid) return;
    setError("");
    startTransition(async () => {
      const result = await registerWithPhone({ phone, name, password, otp });
      if (result.error) { setError(result.error); return; }
      router.push(`/${locale}/redirect`);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-2">
        {(["phone", "otp", "details"] as PhoneStep[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-bold transition-colors ${
              step === s ? "bg-viridian text-[#F5F0E1]" : (["phone","otp","details"].indexOf(step) > i) ? "bg-ok text-white" : "bg-line text-ink-4"
            }`}>{(["phone","otp","details"].indexOf(step) > i) ? "✓" : i + 1}</div>
            {i < 2 && <div className={`w-8 h-0.5 rounded-full transition-colors ${(["phone","otp","details"].indexOf(step) > i) ? "bg-ok" : "bg-line"}`} />}
          </div>
        ))}
      </div>
      <p className="text-center text-[12px] text-ink-4 font-mono -mt-2">
        {step === "phone" ? "กรอกเบอร์โทรศัพท์" : step === "otp" ? "ยืนยัน OTP" : "ตั้งรหัสผ่าน"}
      </p>

      {error && <p className="text-[13px] text-danger bg-danger/10 border border-danger/20 rounded-r2 px-3 py-2">{error}</p>}

      {/* Step 1 — Phone number */}
      {step === "phone" && (
        <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
          <div>
            <label className="block text-[13px] font-medium text-ink mb-1.5">เบอร์โทรศัพท์</label>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 border border-line rounded-r2 px-3 h-[42px] bg-paper-3 shrink-0">
                <span className="text-[13px]">🇹🇭</span>
                <span className="text-[13px] font-mono text-ink-3">+66</span>
              </div>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 border border-line rounded-r2 px-3.5 h-[42px] text-[14px] font-thai bg-paper-3 focus:outline-none focus:border-viridian transition-colors"
                placeholder="081-234-5678"
                inputMode="tel"
              />
            </div>
            <p className="mt-1 text-[11px] text-ink-4">ระบบจะส่ง OTP ไปยังเบอร์นี้</p>
          </div>
          <Button type="submit" variant="primary" size="lg" className="w-full justify-center" disabled={isPending || phone.length < 9}>
            {isPending ? <span className="flex items-center gap-2"><Loader2 size={15} className="animate-spin" />กำลังส่ง OTP…</span> : "ขอ OTP →"}
          </Button>
        </form>
      )}

      {/* Step 2 — OTP verification */}
      {step === "otp" && (
        <form onSubmit={handleVerifyOTP} className="flex flex-col gap-5">
          <div className="text-center">
            <p className="text-[13px] text-ink-3 mb-1">ส่ง OTP ไปยัง <span className="font-medium text-ink">{phone}</span></p>
            {/* Dev mode hint */}
            <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-r2 px-3 py-1.5 text-[11px] text-amber-700 font-mono mt-1">
              🔑 Dev mode — OTP คือ <strong>123456</strong>
            </div>
          </div>
          <OtpInput value={otp} onChange={setOtp} />
          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-[12px] text-ink-4">ส่งใหม่ได้ใน <span className="font-mono text-ink">{countdown}s</span></p>
            ) : (
              <button type="button" onClick={() => { setOtp(""); startTransition(async () => { const r = await sendOTP(phone); if (!r.error) startCountdown(); }); }}
                className="text-[12px] text-viridian hover:underline">ส่ง OTP ใหม่</button>
            )}
          </div>
          <Button type="submit" variant="primary" size="lg" className="w-full justify-center" disabled={isPending || otp.length < 6}>
            {isPending ? <span className="flex items-center gap-2"><Loader2 size={15} className="animate-spin" />กำลังตรวจสอบ…</span> : "ยืนยัน OTP →"}
          </Button>
          <button type="button" onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
            className="text-[12px] text-ink-3 hover:text-ink transition-colors text-center">← เปลี่ยนเบอร์โทร</button>
        </form>
      )}

      {/* Step 3 — Name + Password */}
      {step === "details" && (
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-ok/10 border border-ok/30 rounded-r2 text-[12px] text-ok">
            ✓ ยืนยันเบอร์ <span className="font-mono font-medium">{phone}</span> สำเร็จแล้ว
          </div>
          <div>
            <label className="block text-[13px] font-medium text-ink mb-1.5">ชื่อ-นามสกุล</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full border border-line rounded-r2 px-3.5 h-[42px] text-[14px] font-thai bg-paper-3 focus:outline-none focus:border-viridian transition-colors" placeholder="ชื่อ นามสกุล" />
          </div>
          <PasswordFields password={password} setPassword={setPassword} confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword} />
          <label className="flex items-start gap-2 text-[13px] text-ink-3 cursor-pointer">
            <input type="checkbox" required className="rounded border-line mt-0.5 shrink-0" />
            <span>{t("terms")}{" "}<Link href={`/${locale}/terms`} className="text-viridian hover:underline">{t("termsLink")}</Link></span>
          </label>
          <Button type="submit" variant="primary" size="lg" className="w-full justify-center" disabled={isPending || !rules.isValid || !name}>
            {isPending ? <span className="flex items-center gap-2"><Loader2 size={15} className="animate-spin" />กำลังสมัครสมาชิก…</span> : "สมัครสมาชิก →"}
          </Button>
        </form>
      )}
    </div>
  );
}

// ── SignupForm wrapper — toggles between Email and Phone ───────────────────────

function SignupForm({ locale }: { locale: string }) {
  const t = useTranslations("auth.signup");
  const [method, setMethod] = useState<"email" | "phone">("email");

  return (
    <div className="flex flex-col gap-5">
      {/* Student signup header */}
      <div className="flex items-center gap-3 bg-viridian-wash border border-viridian-3/30 rounded-r2 px-4 py-3">
        <div className="w-9 h-9 rounded-full bg-viridian/10 flex items-center justify-center shrink-0">
          <BookOpen size={16} className="text-viridian" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-ink">สมัครเป็นนักเรียน</p>
          <p className="text-[11px] text-ink-3">เข้าเรียนคอร์ส ทำแบบทดสอบ และรับใบประกาศนียบัตร</p>
        </div>
      </div>

      {/* Method toggle */}
      <div className="flex border border-line rounded-pill p-1 gap-1">
        <button
          type="button"
          onClick={() => setMethod("email")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-pill text-[13px] font-medium transition-all ${
            method === "email" ? "bg-ink text-paper" : "text-ink-3 hover:text-ink"
          }`}
        >
          <Mail size={13} />อีเมล
        </button>
        <button
          type="button"
          onClick={() => setMethod("phone")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-pill text-[13px] font-medium transition-all ${
            method === "phone" ? "bg-ink text-paper" : "text-ink-3 hover:text-ink"
          }`}
        >
          <Phone size={13} />เบอร์โทร
        </button>
      </div>

      {method === "email"
        ? <EmailSignupForm locale={locale} t={t} />
        : <PhoneSignupForm locale={locale} t={t} />
      }
    </div>
  );
}
