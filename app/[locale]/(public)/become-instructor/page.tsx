"use client";

export const dynamic = "force-dynamic";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  CheckCircle, ChevronRight, Users, BookOpen, TrendingUp,
  Star, Award, Loader2, AlertCircle, ArrowLeft, ArrowRight,
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/primitives/Button";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { applyAsInstructor, type ApplicationFormData } from "@/actions/instructor-application";

// ── Stats ─────────────────────────────────────────────────────────────────────

const STATS = [
  { icon: Users, value: "92,400+", label: "ผู้เรียนลงทะเบียน" },
  { icon: BookOpen, value: "340+", label: "คอร์สบนแพลตฟอร์ม" },
  { icon: TrendingUp, value: "฿45,000", label: "รายได้เฉลี่ย/เดือน (top instructor)" },
  { icon: Star, value: "4.8", label: "คะแนนความพึงพอใจ" },
];

const BENEFITS = [
  { icon: "💰", title: "รายได้ passive จากคอร์ส", desc: "รับรายได้ทุกครั้งที่มีผู้เรียนลงทะเบียน ทั้งเดือน ทุกปี" },
  { icon: "🎓", title: "สร้าง Personal Brand", desc: "เป็นที่รู้จักในฐานะผู้เชี่ยวชาญในสาขาของคุณ" },
  { icon: "🛠️", title: "เครื่องมือสร้างคอร์สครบ", desc: "แนบลิงก์ YouTube/Drive เขียนบทความ สร้างแบบทดสอบ — ทุกอย่างในที่เดียว" },
  { icon: "📊", title: "Dashboard & Analytics", desc: "ติดตามยอดผู้เรียน รายได้ และ feedback แบบ real-time" },
  { icon: "🤝", title: "ทีมงาน Support", desc: "ทีม VERDA ช่วยตรวจสอบและโปรโมทคอร์สให้กับผู้เรียนที่เหมาะสม" },
  { icon: "🏆", title: "Badge & Certification", desc: "ได้รับ badge ผู้สอนที่ผ่านการรับรองจาก VERDA" },
];

// ── Form steps ────────────────────────────────────────────────────────────────

type FormState = ApplicationFormData & { agreed: boolean };

const INITIAL: FormState = {
  fullName: "", email: "", headline: "", expertise: "",
  bio: "", experience: "", courseIdea: "",
  linkedIn: "", website: "", portfolio: "", agreed: false,
};

const EXPERTISE_OPTIONS = [
  "UX/UI Design", "Web Development", "Mobile App", "Data Science / AI",
  "Digital Marketing", "Business / Finance", "Language", "Photography / Video",
  "Music", "Fitness / Health", "อื่นๆ",
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BecomeInstructorPage() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<"landing" | "form" | "success">("landing");
  const [form, setForm] = useState<FormState>(INITIAL);
  const [formStep, setFormStep] = useState(1);
  const [error, setError] = useState("");

  function update(patch: Partial<FormState>) {
    setForm((f) => ({ ...f, ...patch }));
    setError("");
  }

  function validateStep1() {
    if (!form.fullName.trim()) return "กรุณากรอกชื่อ-นามสกุล";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "กรุณากรอกอีเมลที่ถูกต้อง";
    if (!form.headline.trim()) return "กรุณากรอกตำแหน่ง/สายงานของคุณ";
    if (!form.expertise) return "กรุณาเลือกหัวข้อความเชี่ยวชาญ";
    return "";
  }

  function validateStep2() {
    if (form.bio.trim().length < 50) return "กรุณาแนะนำตัวเองให้ครบถ้วน (อย่างน้อย 50 ตัวอักษร)";
    if (!form.experience.trim()) return "กรุณาระบุประสบการณ์ของคุณ";
    return "";
  }

  function validateStep3() {
    if (form.courseIdea.trim().length < 30) return "กรุณาอธิบายไอเดียคอร์สให้ละเอียดขึ้น (อย่างน้อย 30 ตัวอักษร)";
    if (!form.agreed) return "กรุณายอมรับข้อกำหนดและเงื่อนไข";
    return "";
  }

  function nextStep() {
    let err = "";
    if (formStep === 1) err = validateStep1();
    else if (formStep === 2) err = validateStep2();
    if (err) { setError(err); return; }
    setFormStep((s) => s + 1);
  }

  function handleSubmit() {
    const err = validateStep3();
    if (err) { setError(err); return; }

    startTransition(async () => {
      const payload: ApplicationFormData = {
        fullName: form.fullName,
        email: form.email,
        headline: form.headline,
        expertise: form.expertise,
        bio: form.bio,
        experience: form.experience,
        courseIdea: form.courseIdea,
        linkedIn: form.linkedIn,
        website: form.website,
        portfolio: form.portfolio,
      };
      const result = await applyAsInstructor(payload);
      if (result.success) {
        setStep("success");
      } else {
        setError(result.error ?? "เกิดข้อผิดพลาด กรุณาลองใหม่");
      }
    });
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="min-h-screen bg-paper">
        <TopBar />
        <main className="py-20">
          <Container className="max-w-[560px] text-center">
            <div className="w-20 h-20 rounded-full bg-ok/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={36} className="text-ok" />
            </div>
            <EyebrowLabel className="mb-3">ส่งใบสมัครสำเร็จ</EyebrowLabel>
            <h1 className="font-display text-[36px] text-ink tracking-[-0.02em] mb-4">
              ขอบคุณที่สนใจเป็นผู้สอน!
            </h1>
            <p className="text-[15px] text-ink-3 leading-relaxed mb-3">
              ทีมงาน VERDA จะตรวจสอบใบสมัครของ <strong className="text-ink">{form.fullName}</strong>{" "}
              และแจ้งผลทางอีเมล <strong className="text-ink">{form.email}</strong> ภายใน{" "}
              <strong className="text-ink">3–5 วันทำการ</strong>
            </p>
            <p className="text-[13px] text-ink-4 mb-8">
              ระหว่างรอ คุณสามารถเข้าเรียนคอร์สบน VERDA ได้ตามปกติ
            </p>
            <div className="flex flex-col gap-3 items-center">
              <Button variant="primary" onClick={() => router.push(`/${locale}/courses`)}>
                ดูคอร์สทั้งหมด →
              </Button>
              <Link href={`/${locale}`} className="text-[13px] text-ink-3 hover:text-ink transition-colors">
                กลับหน้าหลัก
              </Link>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Form screen ─────────────────────────────────────────────────────────────
  if (step === "form") {
    const STEP_LABELS = ["ข้อมูลส่วนตัว", "ประสบการณ์", "ไอเดียคอร์ส"];
    return (
      <div className="min-h-screen bg-paper">
        <TopBar />
        <main className="py-12">
          <Container className="max-w-[680px]">
            {/* Back */}
            <button
              onClick={() => { setStep("landing"); setFormStep(1); setError(""); }}
              className="flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-ink mb-8 transition-colors"
            >
              <ArrowLeft size={14} /> กลับ
            </button>

            <EyebrowLabel className="mb-2">BECOME AN INSTRUCTOR</EyebrowLabel>
            <h1 className="font-display text-[32px] text-ink tracking-[-0.015em] mb-8">
              ใบสมัครผู้สอน
            </h1>

            {/* Step indicator */}
            <div className="flex items-center gap-0 mb-10">
              {STEP_LABELS.map((label, i) => (
                <div key={i} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold transition-colors ${
                      formStep > i + 1 ? "bg-ok text-white" :
                      formStep === i + 1 ? "bg-viridian text-white" :
                      "bg-line text-ink-3"
                    }`}>
                      {formStep > i + 1 ? <CheckCircle size={16} /> : i + 1}
                    </div>
                    <span className={`text-[11px] font-mono uppercase tracking-wide ${formStep === i + 1 ? "text-viridian" : "text-ink-4"}`}>
                      {label}
                    </span>
                  </div>
                  {i < 2 && <div className={`h-[2px] w-full -mt-5 ${formStep > i + 1 ? "bg-ok" : "bg-line"}`} />}
                </div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-danger/5 border border-danger/20 text-danger text-[13px] rounded-r2 px-4 py-2.5 mb-5">
                <AlertCircle size={14} className="shrink-0" /> {error}
              </div>
            )}

            {/* ── Step 1: Basic info ── */}
            {formStep === 1 && (
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="ชื่อ-นามสกุล *">
                    <input className="input-base" placeholder="พิมพ์ชนก วัฒนากร" value={form.fullName}
                      onChange={(e) => update({ fullName: e.target.value })} />
                  </Field>
                  <Field label="อีเมลติดต่อ *">
                    <input className="input-base" type="email" placeholder="you@example.com" value={form.email}
                      onChange={(e) => update({ email: e.target.value })} />
                  </Field>
                </div>
                <Field label="ตำแหน่ง / สายงาน *" hint="เช่น Lead UX Designer @ SCB, Senior Developer @ Grab">
                  <input className="input-base" placeholder="ตำแหน่งงานปัจจุบันของคุณ" value={form.headline}
                    onChange={(e) => update({ headline: e.target.value })} />
                </Field>
                <Field label="หัวข้อความเชี่ยวชาญ *">
                  <select className="input-base" value={form.expertise}
                    onChange={(e) => update({ expertise: e.target.value })}>
                    <option value="">-- เลือกหัวข้อ --</option>
                    {EXPERTISE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>
                <div className="grid grid-cols-3 gap-4">
                  <Field label="LinkedIn (ไม่บังคับ)">
                    <input className="input-base" placeholder="linkedin.com/in/..." value={form.linkedIn ?? ""}
                      onChange={(e) => update({ linkedIn: e.target.value })} />
                  </Field>
                  <Field label="เว็บไซต์ (ไม่บังคับ)">
                    <input className="input-base" placeholder="https://..." value={form.website ?? ""}
                      onChange={(e) => update({ website: e.target.value })} />
                  </Field>
                  <Field label="Portfolio (ไม่บังคับ)">
                    <input className="input-base" placeholder="behance / dribbble / github" value={form.portfolio ?? ""}
                      onChange={(e) => update({ portfolio: e.target.value })} />
                  </Field>
                </div>
              </div>
            )}

            {/* ── Step 2: Experience ── */}
            {formStep === 2 && (
              <div className="flex flex-col gap-5">
                <Field label="แนะนำตัว / เกี่ยวกับคุณ *" hint="อธิบายว่าคุณเป็นใคร ทำงานอะไร และสิ่งที่ถนัด (อย่างน้อย 50 ตัวอักษร)">
                  <textarea rows={5} className="input-base resize-none font-thai leading-[1.8]"
                    placeholder="เล่าให้เราฟังเกี่ยวกับตัวคุณ ประสบการณ์ และความเชี่ยวชาญ..."
                    value={form.bio} onChange={(e) => update({ bio: e.target.value })} />
                  <p className="text-[11px] text-ink-4 font-mono mt-1">{form.bio.length} ตัวอักษร</p>
                </Field>
                <Field label="ประสบการณ์ที่เกี่ยวข้อง *" hint="ระยะเวลา ผลงาน โปรเจกต์ที่ภูมิใจ ฯลฯ">
                  <textarea rows={4} className="input-base resize-none font-thai leading-[1.8]"
                    placeholder="เช่น 8 ปีในวงการ UX Design, ออกแบบ app ให้ธนาคารชั้นนำ 3 แห่ง..."
                    value={form.experience} onChange={(e) => update({ experience: e.target.value })} />
                </Field>
              </div>
            )}

            {/* ── Step 3: Course idea + consent ── */}
            {formStep === 3 && (
              <div className="flex flex-col gap-5">
                <Field label="ไอเดียคอร์สแรกที่อยากสอน *" hint="ชื่อคอร์ส เนื้อหาหลัก กลุ่มเป้าหมาย และสิ่งที่ผู้เรียนจะได้รับ">
                  <textarea rows={6} className="input-base resize-none font-thai leading-[1.8]"
                    placeholder="เช่น 'UX Design สำหรับนักออกแบบมือใหม่' — ครอบคลุมตั้งแต่ User Research, Wireframing ไปจนถึง Handoff..."
                    value={form.courseIdea} onChange={(e) => update({ courseIdea: e.target.value })} />
                  <p className="text-[11px] text-ink-4 font-mono mt-1">{form.courseIdea.length} ตัวอักษร</p>
                </Field>

                <div className="bg-viridian-wash border border-viridian-3/30 rounded-r3 p-4 text-[13px] text-ink-2">
                  <p className="font-semibold text-ink mb-2">ขั้นตอนหลังยื่นใบสมัคร</p>
                  <ol className="list-decimal list-inside flex flex-col gap-1 text-ink-3">
                    <li>ทีม VERDA ตรวจสอบใบสมัครภายใน 3–5 วันทำการ</li>
                    <li>ได้รับอีเมลแจ้งผลการพิจารณา</li>
                    <li>หากผ่าน — เปิดใช้งาน Instructor Studio ทันที</li>
                    <li>สร้างคอร์สแรกและเผยแพร่ได้เลย</li>
                  </ol>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 rounded border-line"
                    checked={form.agreed} onChange={(e) => update({ agreed: e.target.checked })} />
                  <span className="text-[13px] text-ink-2 leading-relaxed">
                    ฉันยอมรับ{" "}
                    <Link href={`/${locale}/terms`} target="_blank" className="text-viridian hover:underline">
                      ข้อกำหนดการใช้งาน
                    </Link>{" "}
                    และ{" "}
                    <Link href={`/${locale}/privacy`} target="_blank" className="text-viridian hover:underline">
                      นโยบายความเป็นส่วนตัว
                    </Link>{" "}
                    ของ VERDA LMS รวมถึงยืนยันว่าข้อมูลที่กรอกเป็นความจริง
                  </span>
                </label>
              </div>
            )}

            {/* Nav buttons */}
            <div className="flex justify-between pt-8 border-t border-line mt-8">
              {formStep > 1 ? (
                <Button variant="ghost" onClick={() => { setFormStep((s) => s - 1); setError(""); }}>
                  <ArrowLeft size={14} className="mr-1" /> ย้อนกลับ
                </Button>
              ) : <div />}
              {formStep < 3 ? (
                <Button variant="primary" onClick={nextStep}>
                  ถัดไป <ArrowRight size={14} className="ml-1" />
                </Button>
              ) : (
                <Button variant="primary" onClick={handleSubmit} disabled={isPending}>
                  {isPending ? (
                    <><Loader2 size={15} className="animate-spin" /> กำลังส่งใบสมัคร…</>
                  ) : (
                    <>ส่งใบสมัคร <CheckCircle size={14} className="ml-1" /></>
                  )}
                </Button>
              )}
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Landing screen ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-paper">
      <TopBar />
      <main>
        {/* Hero */}
        <section className="py-20 border-b border-line">
          <Container className="max-w-[760px] text-center">
            <EyebrowLabel className="mb-4">INSTRUCTOR PROGRAM</EyebrowLabel>
            <h1 className="font-display text-[52px] leading-[1.1] text-ink tracking-[-0.025em] mb-6">
              แบ่งปันความรู้ของคุณ<br />
              <em className="text-viridian">สร้างรายได้ที่ยั่งยืน</em>
            </h1>
            <p className="text-[17px] text-ink-3 leading-[1.7] mb-10 max-w-[560px] mx-auto font-thai">
              ร่วมเป็นส่วนหนึ่งของชุมชนผู้สอนกว่า 87 คนบน VERDA LMS
              สอนในสิ่งที่คุณถนัด สร้าง passive income และสร้างแบรนด์ส่วนตัวในฐานะผู้เชี่ยวชาญ
            </p>
            <Button
              variant="primary"
              onClick={() => setStep("form")}
              className="text-[15px] px-7 py-4"
            >
              สมัครเป็นผู้สอน <ChevronRight size={16} className="ml-1" />
            </Button>
            <p className="text-[12px] text-ink-4 mt-3 font-mono">ฟรี · ไม่มีค่าใช้จ่าย · ผลตอบแทน 70%</p>
          </Container>
        </section>

        {/* Stats */}
        <section className="py-14 border-b border-line bg-paper-2">
          <Container>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {STATS.map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-viridian/10 flex items-center justify-center mx-auto mb-3">
                    <Icon size={18} className="text-viridian" />
                  </div>
                  <p className="font-display text-[28px] text-ink tracking-[-0.02em]">{value}</p>
                  <p className="text-[13px] text-ink-3 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Benefits */}
        <section className="py-16 border-b border-line">
          <Container>
            <div className="text-center mb-12">
              <EyebrowLabel className="mb-3">ทำไมต้องสอนกับ VERDA</EyebrowLabel>
              <h2 className="font-display text-[36px] text-ink tracking-[-0.015em]">
                สิทธิพิเศษสำหรับผู้สอน
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {BENEFITS.map(({ icon, title, desc }) => (
                <div key={title} className="bg-paper-3 border border-line rounded-r3 p-5 hover:border-viridian-3 transition-colors">
                  <div className="text-[28px] mb-3">{icon}</div>
                  <h3 className="font-semibold text-[15px] text-ink mb-1.5">{title}</h3>
                  <p className="text-[13px] text-ink-3 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Who qualifies */}
        <section className="py-16 border-b border-line bg-paper-2">
          <Container className="max-w-[680px]">
            <div className="text-center mb-10">
              <EyebrowLabel className="mb-3">เกณฑ์การคัดเลือก</EyebrowLabel>
              <h2 className="font-display text-[32px] text-ink tracking-[-0.015em]">
                ใครสามารถสมัครได้บ้าง?
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {[
                "มีประสบการณ์ในสาขาที่ต้องการสอนอย่างน้อย 2 ปี",
                "สามารถถ่ายทอดความรู้เป็นภาษาไทยได้ชัดเจน",
                "มีไอเดียคอร์สที่เป็นประโยชน์ต่อผู้เรียน",
                "พร้อมรับ feedback และปรับปรุงเนื้อหาอย่างต่อเนื่อง",
                "ไม่จำเป็นต้องมีประสบการณ์สอนมาก่อน",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle size={17} className="text-ok shrink-0 mt-0.5" />
                  <p className="text-[14px] text-ink-2 font-thai">{item}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* CTA bottom */}
        <section className="py-20">
          <Container className="text-center max-w-[540px]">
            <Award size={40} className="text-viridian mx-auto mb-5 opacity-80" />
            <h2 className="font-display text-[36px] text-ink tracking-[-0.015em] mb-4">
              พร้อมเริ่มต้นหรือยัง?
            </h2>
            <p className="text-[15px] text-ink-3 mb-8">
              ใบสมัครใช้เวลาไม่เกิน 5 นาที ทีมงานจะตอบกลับภายใน 3–5 วันทำการ
            </p>
            <Button
              variant="primary"
              onClick={() => setStep("form")}
              className="text-[15px] px-7 py-4"
            >
              สมัครเป็นผู้สอนเดี๋ยวนี้ →
            </Button>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-ink mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-ink-4 mt-1.5 font-thai leading-relaxed">{hint}</p>}
    </div>
  );
}
