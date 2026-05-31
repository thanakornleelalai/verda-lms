import { redirect } from "next/navigation";
import Link from "next/link";
import { Clock, XCircle, Send, Eye, ShieldCheck, ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { StudioSidebar } from "@/components/layout/StudioSidebar";
import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/primitives/Button";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";

export default async function StudioLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const role = (session.user as { role?: string }).role;

  // ── Approved instructors & admins → full Studio ─────────────────────────────
  if (role === "INSTRUCTOR" || role === "ADMIN") {
    return (
      <div className="min-h-screen bg-paper flex">
        <StudioSidebar />
        <div className="flex-1 overflow-auto">
          <PageTransition>{children}</PageTransition>
        </div>
      </div>
    );
  }

  // ── Non-instructors: gate by instructor-application status ──────────────────
  // ผู้สมัครต้องได้รับ "อนุมัติ" จากแอดมินก่อน จึงจะทำกิจกรรมในบทบาทผู้สอนได้
  let appStatus: "PENDING" | "REJECTED" | "APPROVED" | null = null;
  let reviewNote: string | null = null;
  try {
    const app = await db.instructorApplication.findUnique({
      where: { userId: session.user.id },
      select: { status: true, reviewNote: true },
    });
    if (app) {
      appStatus = app.status as "PENDING" | "REJECTED" | "APPROVED";
      reviewNote = app.reviewNote;
    }
  } catch {
    // DB unavailable — fall through to default redirect
  }

  // ไม่เคยสมัคร → ไปหน้าสมัครเป็นผู้สอน
  if (!appStatus) {
    redirect(`/${locale}/become-instructor`);
  }

  // APPROVED แต่ session ยังเป็น role เดิม (JWT ยังไม่รีเฟรช) → ให้ login ใหม่
  if (appStatus === "APPROVED") {
    return (
      <GateScreen
        icon={<ShieldCheck size={32} className="text-ok" />}
        accent="ok"
        eyebrow="อนุมัติแล้ว"
        title="บัญชีของคุณได้รับการอนุมัติเป็นผู้สอนแล้ว"
        message="กรุณาออกจากระบบแล้วเข้าสู่ระบบใหม่อีกครั้ง เพื่อเปิดใช้งานสิทธิ์ผู้สอนและเข้าถึง Instructor Studio"
        action={{ href: `/${locale}/login`, label: "เข้าสู่ระบบใหม่" }}
        locale={locale}
      />
    );
  }

  // REJECTED → แสดงเหตุผล + สมัครใหม่ได้
  if (appStatus === "REJECTED") {
    return (
      <GateScreen
        icon={<XCircle size={32} className="text-danger" />}
        accent="danger"
        eyebrow="ไม่ผ่านการพิจารณา"
        title="ใบสมัครผู้สอนของคุณยังไม่ได้รับการอนุมัติ"
        message={reviewNote ?? "ทีมงานพิจารณาแล้วเห็นว่ายังไม่ผ่านเกณฑ์ — คุณสามารถปรับปรุงข้อมูลและยื่นใบสมัครใหม่ได้"}
        action={{ href: `/${locale}/become-instructor`, label: "แก้ไขและสมัครใหม่" }}
        locale={locale}
      />
    );
  }

  // PENDING → รออนุมัติ (กันการทำกิจกรรมผู้สอนทุกอย่าง)
  return (
    <PendingScreen locale={locale} />
  );
}

// ── Pending approval screen ─────────────────────────────────────────────────

function PendingScreen({ locale }: { locale: string }) {
  const steps = [
    { icon: Send, label: "ส่งใบสมัครแล้ว", done: true },
    { icon: Eye, label: "แอดมินกำลังตรวจสอบ", active: true },
    { icon: ShieldCheck, label: "อนุมัติ & เปิด Studio", done: false },
  ];
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6">
      <div className="max-w-[560px] w-full text-center">
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
          <Clock size={34} className="text-amber-500" />
        </div>
        <EyebrowLabel className="mb-2">รอการอนุมัติ</EyebrowLabel>
        <h1 className="font-display text-[32px] text-ink tracking-[-0.015em] mb-3">
          ใบสมัครผู้สอนกำลังรอตรวจสอบ
        </h1>
        <p className="text-[15px] text-ink-3 leading-relaxed mb-8">
          คุณยังไม่สามารถเข้าใช้งาน Instructor Studio หรือสร้างคอร์สได้
          จนกว่าทีมแอดมินจะอนุมัติใบสมัคร — โดยทั่วไปใช้เวลา <strong className="text-ink">1–3 วันทำการ</strong>
          และจะแจ้งผลทางอีเมล
        </p>

        {/* Timeline */}
        <div className="bg-amber-50 border border-amber-200 rounded-r3 px-6 py-5 mb-8">
          <div className="flex items-start gap-0">
            {steps.map((step, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 relative">
                {i < steps.length - 1 && (
                  <div className={`absolute top-[18px] left-1/2 w-full h-[2px] ${step.done ? "bg-amber-400" : "bg-amber-200"}`} />
                )}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center z-10 ${
                  step.done ? "bg-amber-400 text-white"
                  : step.active ? "bg-white border-2 border-amber-400 text-amber-500"
                  : "bg-white border-2 border-amber-200 text-amber-300"
                }`}>
                  <step.icon size={15} />
                </div>
                <span className={`text-[11px] text-center font-thai leading-tight ${
                  step.done ? "text-amber-700 font-medium" : step.active ? "text-amber-600 font-semibold" : "text-amber-400"
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 items-center">
          <Link href={`/${locale}/dashboard`}>
            <Button variant="primary">ไปที่แดชบอร์ดผู้เรียน <ArrowRight size={15} className="ml-1" /></Button>
          </Link>
          <Link href={`/${locale}/courses`} className="text-[13px] text-ink-3 hover:text-ink transition-colors">
            เรียนคอร์สอื่นระหว่างรอ
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Generic gate screen (approved-relogin / rejected) ────────────────────────

function GateScreen({
  icon, accent, eyebrow, title, message, action, locale,
}: {
  icon: React.ReactNode;
  accent: "ok" | "danger";
  eyebrow: string;
  title: string;
  message: string;
  action: { href: string; label: string };
  locale: string;
}) {
  const bg = accent === "ok" ? "bg-ok/10" : "bg-danger/10";
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6">
      <div className="max-w-[520px] w-full text-center">
        <div className={`w-20 h-20 rounded-full ${bg} flex items-center justify-center mx-auto mb-6`}>
          {icon}
        </div>
        <EyebrowLabel className="mb-2">{eyebrow}</EyebrowLabel>
        <h1 className="font-display text-[30px] text-ink tracking-[-0.015em] mb-3">{title}</h1>
        <p className="text-[15px] text-ink-3 leading-relaxed mb-8">{message}</p>
        <div className="flex flex-col gap-3 items-center">
          <Link href={action.href}>
            <Button variant="primary">{action.label} <ArrowRight size={15} className="ml-1" /></Button>
          </Link>
          <Link href={`/${locale}/dashboard`} className="text-[13px] text-ink-3 hover:text-ink transition-colors">
            กลับแดชบอร์ด
          </Link>
        </div>
      </div>
    </div>
  );
}
