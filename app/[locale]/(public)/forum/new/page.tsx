"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { Button } from "@/components/primitives/Button";
import { cn } from "@/lib/utils";

const COURSE_OPTIONS = [
  "UX Design & Figma Masterclass",
  "Next.js 15 Fullstack Bootcamp",
  "Python Data Science Bootcamp",
  "Meta Ads Masterclass 2026",
  "English for Tech Professionals",
  "Financial Planning for Freelancers",
  "Machine Learning Specialization",
  "คำถามทั่วไป",
];

export default function NewThreadPage() {
  const locale = useLocale();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [course, setCourse] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 5) e.title = "กรุณากรอกหัวข้อ (อย่างน้อย 5 ตัวอักษร)";
    if (!body.trim() || body.trim().length < 10) e.body = "กรุณากรอกรายละเอียด (อย่างน้อย 10 ตัวอักษร)";
    if (!course) e.course = "กรุณาเลือกคอร์ส";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    // Mock submit — in production this would call a server action
    setTimeout(() => {
      setDone(true);
      setTimeout(() => router.push(`/${locale}/forum`), 1800);
    }, 800);
  }

  if (done) {
    return (
      <div className="min-h-screen bg-paper">
        <TopBar />
        <main className="py-24">
          <Container className="max-w-[560px] text-center">
            <div className="w-14 h-14 rounded-full bg-ok/10 flex items-center justify-center mx-auto mb-5">
              <Send size={22} className="text-ok" />
            </div>
            <h2 className="font-display text-[28px] text-ink mb-2">ตั้งกระทู้สำเร็จ!</h2>
            <p className="text-ink-3 text-[14px]">กำลังพากลับไปหน้าฟอรัม...</p>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <TopBar />
      <main className="py-12">
        <Container className="max-w-[680px]">
          <div className="mb-8">
            <Link
              href={`/${locale}/forum`}
              className="inline-flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-ink mb-4"
            >
              <ArrowLeft size={14} /> กลับหน้าฟอรัม
            </Link>
            <EyebrowLabel className="mb-2">COMMUNITY FORUM</EyebrowLabel>
            <h1 className="font-display text-[32px] text-ink tracking-[-0.015em]">ตั้งกระทู้ใหม่</h1>
            <p className="text-ink-3 mt-1 text-[14px]">แบ่งปันคำถามหรือข้อมูลที่เป็นประโยชน์กับชุมชน</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Course */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-ink-2">
                คอร์ส <span className="text-danger">*</span>
              </label>
              <select
                value={course}
                onChange={(e) => { setCourse(e.target.value); setErrors((p) => ({ ...p, course: "" })); }}
                className={cn("input-base", errors.course && "border-danger")}
              >
                <option value="">— เลือกคอร์สที่เกี่ยวข้อง —</option>
                {COURSE_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              {errors.course && <p className="text-[12px] text-danger">{errors.course}</p>}
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-ink-2">
                หัวข้อกระทู้ <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                placeholder="เช่น วิธีสร้าง User Persona ที่มีประสิทธิภาพ"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: "" })); }}
                className={cn("input-base", errors.title && "border-danger")}
              />
              {errors.title && <p className="text-[12px] text-danger">{errors.title}</p>}
            </div>

            {/* Body */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-ink-2">
                รายละเอียด <span className="text-danger">*</span>
              </label>
              <textarea
                placeholder="อธิบายคำถามหรือหัวข้อที่ต้องการแบ่งปัน..."
                value={body}
                rows={6}
                onChange={(e) => { setBody(e.target.value); setErrors((p) => ({ ...p, body: "" })); }}
                className={cn("input-base resize-none", errors.body && "border-danger")}
              />
              <div className="flex items-center justify-between">
                {errors.body
                  ? <p className="text-[12px] text-danger">{errors.body}</p>
                  : <span />}
                <p className="text-[11px] text-ink-4 font-mono">{body.length} ตัวอักษร</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                size="default"
                className="flex items-center gap-2"
                disabled={submitting}
              >
                <Send size={15} />
                {submitting ? "กำลังส่ง..." : "ตั้งกระทู้"}
              </Button>
              <Link
                href={`/${locale}/forum`}
                className="text-[13px] text-ink-3 hover:text-ink transition-colors"
              >
                ยกเลิก
              </Link>
            </div>
          </form>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
